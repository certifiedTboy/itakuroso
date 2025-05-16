import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from 'src/common/mailer/mailer.service';
import { User } from './schemas/user-schema';
import { UserDocument } from './schemas/user-schema';
import { CreateUserDto } from './dto/create-user.dto';
import { CodeGenerator } from 'src/helpers/code-generator';

/**
 * @class UsersService
 * @description Manages all user-related operations.
 * This includes creating users, verifying them, and finding users by their ID or verification code.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * @method create
   * @description Creates a new user and sends a verification email.
   * @param {CreateUserDto} createUserDto - The data transfer object containing user details.
   * @returns {Promise<UserDocument>} - The created user object.
   * @throws {Error} - Throws an error if the user creation fails.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const otp = CodeGenerator.generateOtp();
    const createdUser = new this.userModel({
      ...createUserDto,
      verificationCode: otp,
    });
    const user = await createdUser.save();
    await this.mailerService.sendMail(
      user.email,
      'Verification Token',
      user.verificationCode!,
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
      return null; // User not found or verification code is invalid
    }
    // Clear the verification code after successful verification
    user.verificationCode = null;
    await user.save();
    return user;
  }

  async findUser(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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
}
