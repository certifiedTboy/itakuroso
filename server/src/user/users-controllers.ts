import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../guard/auth-guard';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { GenerateNewTokenDto } from './dto/generate-token.dto';
import { PasscodeResetDto } from './dto/passcode-reset.dto';
import { ResponseHandler } from '../common/response-handler/response-handler';
import { UpdatePasscodeDto } from './dto/update-passcode.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';

/**
 * @class UsersController
 * @description Handles all user-related HTTP requests.
 * This includes creating users and verifying them.
 * @version 1.0
 * @path /api/v1/users
 */
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @method getAllUsers
   * @description Retrieves all users from the database.
   */
  @Get('')
  // @UseGuards(AuthGuard)
  async getAllUsers() {
    try {
      const result = await this.usersService.findAllUsers();

      return ResponseHandler.ok(
        200,
        'Users retrieved successfully',
        result || [],
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method createUser
   * @description Handles user creation requests.
   * Validates the input data and checks if the user already exists.
   * If not, creates a new user and sends a verification email.
   * @param {CreateUserDto} createUserDto - The data transfer object containing user details.
  
   */
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);

      return ResponseHandler.ok(201, 'User created successfully', result || {});
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method verifyUser
   * @description Handles user verification requests.
   * Validates the input data and verifies the user using the provided verification code.
   * @param {VerifyUserDto} verifyUserDto - The data transfer object containing the verification code.
   */
  @Patch('verify')
  async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    try {
      const result = await this.usersService.verifyUser(
        verifyUserDto.verificationCode,
      );

      /**
       * we check if the result still contains the verification code
       * which indicates that the initial verification has exceeded one hour before usage
       * if the verification code is expired, a new one is generated and returned with result and also sent to the user as an email
       */
      if (result?.verificationCode) {
        return ResponseHandler.ok(200, `verification code updated`, result);
      }

      return ResponseHandler.ok(200, 'User verified successfully', result!);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method generateNewVerificationCode
   * @description Handles requests to generate a new verification code for the user.
   * Validates the input data and checks if the user exists.
   * If valid, generates a new verification code and sends it to the user.
   * @param {GenerateNewTokenDto} GenerateNewTokenDto - The email of the user for whom the verification code is to be generated.
   * @throws {Error} - Throws an error if the code generation process fails.
   */
  @Post('new-verification-code')
  async generateNewVerificationCode(
    @Body() generateNewTokenDto: GenerateNewTokenDto,
  ) {
    try {
      const { email } = generateNewTokenDto;

      if (!email) {
        throw new BadRequestException('', {
          cause: 'Email is required',
          description: 'Please provide a valid email address',
        });
      }

      const updatedUser = await this.usersService.newVerificationCode(email);

      if (!updatedUser) {
        throw new BadRequestException('', {
          cause: 'User not found',
          description: 'No user found with the provided email address',
        });
      }

      // Send the verification code via email
      return ResponseHandler.ok(
        201,
        'New verification code generated successfully',
        updatedUser,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method requestPassCodeReset
   * @description Handles requests to generate a passcode reset link for the user.
   * Validates the input data and checks if the user exists.
   * If valid, generates a passcode reset link and sends it to the user's email.
   * @param {GenerateNewTokenDto} passcodeResetDto - The data transfer object containing user credentials.
   * @throws {Error} - Throws an error if the passcode reset link generation process fails.
   */
  @Post('passcode/reset')
  async requestPasscodeReset(@Body() passcodeResetDto: GenerateNewTokenDto) {
    try {
      const { email } = passcodeResetDto;

      if (!email) {
        throw new BadRequestException('', {
          cause: 'Email is required',
          description: 'Please provide a valid email address',
        });
      }

      const user = await this.usersService.getResetPasscodeLink(email);

      return ResponseHandler.ok(200, 'Passcode reset link sent successfully', {
        email: user?.email,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method verifyPasswordResetToken
   * @description Handles requests to verify the passcode reset token.
   * Validates the input data and checks if the token is valid.
   * @param {resetToken} string - The passcode reset token to verify.
   * @throws {Error} - Throws an error if the token verification process fails.
   */
  @Post('passcode/reset/verify')
  async verifyPasscodeResetToken(@Body() passcodeResetDto: PasscodeResetDto) {
    try {
      const { resetToken } = passcodeResetDto;

      const result = await this.usersService.verifyResetToken(resetToken);

      if (!result) {
        throw new BadRequestException('', {
          cause: 'Invalid token',
          description: 'The provided passcode reset token is invalid',
        });
      }

      return ResponseHandler.ok(
        200,
        'Password reset token verified successfully',
        result,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method updatePasscode
   * @description Handles requests to update the user's passcode.
   * Validates the input data and checks if the user exists.
   * If valid, updates the user's passcode and returns the updated user object.
   * @param {UpdatePasscodeDto} passcodeResetDto - The data transfer object containing the new passcode and reset token.
   * @throws {Error} - Throws an error if the passcode update process fails.
   */
  @Patch('passcode/reset/update')
  async updatePasscode(@Body() updatePasscodeDto: UpdatePasscodeDto) {
    try {
      const { passcode, email } = updatePasscodeDto;

      if (!passcode || !email) {
        throw new BadRequestException('', {
          cause: 'Passcode and email are required',
          description: 'Please provide a valid passcode and email address',
        });
      }

      const updatedUser =
        await this.usersService.updateUserPasscode(updatePasscodeDto);

      if (!updatedUser) {
        throw new BadRequestException('', {
          cause: 'User not found',
          description: 'No user found with the provided email address',
        });
      }

      return ResponseHandler.ok(
        200,
        'Passcode updated successfully',
        updatedUser,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  @Patch('profile/upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Req() req: Request,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    try {
      const currentUser = req.user;

      const result = await this.usersService.uploadProfileImage(
        profileImage,
        currentUser?._id,
      );

      if (result) {
        return ResponseHandler.ok(
          200,
          'Profile image uploaded successfully',
          result,
        );
      }
    } catch (error: unknown) {
      console.error('Error uploading profile image:', error);
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
