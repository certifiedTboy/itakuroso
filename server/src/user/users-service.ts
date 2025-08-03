import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueService } from '../queue/queue-service';
import { PasscodeHashing } from '../helpers/passcode-hashing';
import { User } from './schemas/user-schema';
import { UserDocument } from './schemas/user-schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasscodeDto } from './dto/update-passcode.dto';
import { CodeGenerator } from '../helpers/code-generator';
import { Time } from '../helpers/time';

/**
 * @class UsersService
 * @description Manages all user-related operations.
 * This includes creating users, verifying them, and finding users by their ID or verification code.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly queueService: QueueService,
  ) {}

  /**
   * @method create
   * @description Creates a new user and sends a verification email.
   * @param {CreateUserDto} createUserDto - The data transfer object containing user details.
   * @returns {Promise<UserDocument>} - The created user object.
   * @throws {Error} - Throws an error if the user creation fails.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // check if user with the same email or phone number already exists
    const userWithEmailExist = await this.checkIfUserExist({
      email: createUserDto.email,
    });

    if (userWithEmailExist) {
      if (userWithEmailExist.phoneNumber !== createUserDto.phoneNumber) {
        throw new BadRequestException('', {
          cause: 'The phone number and email belong to different users',
          description: 'invalid credentials',
        });
      }

      const otp = CodeGenerator.generateOtp();
      const verificationCodeExpiresIn = Time.getTimeInOneHour();

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: userWithEmailExist.email },
        { verificationCode: otp, isVerified: false, verificationCodeExpiresIn },
        { new: true },
      );

      if (!updatedUser) {
        throw new BadRequestException('', {
          cause: 'Something went wrong',
          description: 'Something went wrong',
        });
      }

      await this.queueService.addJob(
        'email',
        {
          email: updatedUser.email,
          verificationCode: updatedUser.verificationCode,
          type: 'Verification Token',
        },
        10000,
      );

      return updatedUser;
    }

    const otp = CodeGenerator.generateOtp();
    const verificationCodeExpiresIn = Time.getTimeInOneHour();
    const createdUser = new this.userModel({
      ...createUserDto,
      verificationCode: otp,
      verificationCodeExpiresIn,
    });
    const user = await createdUser.save();
    await this.queueService.addJob(
      'email',
      {
        email: user?.email,
        verificationCode: user?.verificationCode,
        subject: 'Verification Token',
      },
      10000,
    );
    return user;
  }

  /**
   * @method verifyUser
   * @description Verifies a user using the provided verification code.
   * @param {string} verificationCode - The verification code sent to the user.
   * @returns {Promise<UserDocument | null>} - The verified user object or null if verification fails.
   * @throws {Error} - Throws an error if the verification process fails.
   */
  async verifyUser(verificationCode: string): Promise<UserDocument | null> {
    const user = await this.findUserByVerificationCode(verificationCode);

    if (!user) {
      // User not found or verification code is invalid
      throw new BadRequestException('', {
        cause: 'invalid verification code',
        description: 'Some error description',
      });
    }

    // Check if the verification code has expired
    if (Time.checkIfTimeIsExpired(user.verificationCodeExpiresIn)) {
      const otp = CodeGenerator.generateOtp();
      const verificationCodeExpiresIn = Time.getTimeInOneHour();

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: user.email },
        { verificationCode: otp, isVerified: false, verificationCodeExpiresIn },
        { new: true },
      );

      await this.queueService.addJob(
        'email',
        {
          email: updatedUser?.email,
          verificationCode: updatedUser?.verificationCode,
          subject: 'Verification Token',
        },
        10000,
      );

      return updatedUser;
    }

    // Update user verification status and clear verification code
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user?._id },
      {
        isVerified: true,
        isActive: true,
        verificationCode: null,
        verificationCodeExpiresIn: null,
      },
      { new: true },
    );

    return updatedUser;
  }

  /**
   * @method newVerificationCode
   * @description Generates a new verification code for the user.
   * @param {string} email - The email of the user to generate a new verification code for.
   * @returns {Promise<UserDocument | null>} - The user object with the new verification code or null if not found.
   * @throws {Error} - Throws an error if the code generation process fails.
   */
  async newVerificationCode(email: string): Promise<UserDocument | null> {
    const userExist = await this.checkIfUserExist({ email });

    if (!userExist) {
      throw new BadRequestException('', {
        cause: 'User not found',
        description: 'User does not exist',
      });
    }

    const otp = CodeGenerator.generateOtp();
    const verificationCodeExpiresIn = Time.getTimeInOneHour();

    const updatedUser = await this.userModel.findOneAndUpdate(
      { email },
      { verificationCode: otp, verificationCodeExpiresIn },
      { new: true },
    );

    await this.queueService.addJob(
      'email',
      {
        email: updatedUser?.email,
        verificationCode: updatedUser?.verificationCode,
        subject: 'Verification Token',
      },
      10000,
    );

    return updatedUser;
  }

  /**
   * @method checkIfUserExist
   * @description Checks if a user exists in the database based on the provided query.
   * @param {object} query - The query object to search for the user.
   */
  async checkIfUserExist(query: object): Promise<User | null> {
    return this.userModel.findOne(query);
  }

  /**
   * @method checkUserExistById
   * @description Checks if a user exists in the database by their ID.
   * @param {string} userId - The ID of the user to check.
   * @returns {Promise<UserDocument | null>} - The user object or null if not
   */
  async checkUserExistById(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(userId)
      .select('-passcode -verificationCode -verificationCodeExpiresIn -__v');
  }

  /**
   * @method findUserByVerificationCode
   * @description Finds a user by their verification code.
   * @param {string} verificationCode - The verification code to search for.
   * @returns {Promise<UserDocument | null>} - The user object or null if not found.
   * @throws {Error} - Throws an error if the search process fails.
   * @private
   */
  private async findUserByVerificationCode(
    verificationCode: string,
  ): Promise<UserDocument | null> {
    return await this.userModel.findOne({ verificationCode });
  }

  /**
   * @method updateUserPasscode
   * @description Updates the user's passcode.
   * @param {UpdatePasscodeDto} updatePasscodeDto - The data transfer object containing the new passcode and email.
   * @returns {Promise<UserDocument | null>} - The updated user object or null if not found.
   * @throws {Error} - Throws an error if the update process fails.
   */
  async updateUserPasscode(
    updatePasscodeDto: UpdatePasscodeDto,
  ): Promise<UserDocument | null> {
    const { passcode, email } = updatePasscodeDto;

    // hash the passcode and save it to the database
    const hashedPasscode = await PasscodeHashing.hashPassword(passcode);

    const updatedUser = await this.userModel.findOneAndUpdate(
      { email },
      { passcode: hashedPasscode },
      { new: true },
    );

    return updatedUser;
  }

  /**
   * @method findAllUsers
   * @description Retrieves all users from the database.
   */
  async findAllUsers() {
    return this.userModel
      .find()
      .select('-passcode -verificationCode -verificationCodeExpiresIn -__v')
      .exec();
  }

  /**
   * @method updateUserOnlineStatus
   * @description Updates the online status of a user.
   * @param {string} userId - The ID of the user to update.
   * @returns {Promise<UserDocument>} - The updated user object or null if not found.
   */
  async updateUserOnlineStatus(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isOnline: true },
      { new: true },
    );
  }

  /**
   * @method updateUserOfflineStatus
   * @description Updates the offline status of a user.
   * @param {string} userId - The ID of the user to update.
   * @returns {Promise<UserDocument>} - The updated user object or null if not found.
   */
  async updateUserOfflineStatus(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isOnline: false, lastSeen: new Date() },
      { new: true },
    );
  }
}
