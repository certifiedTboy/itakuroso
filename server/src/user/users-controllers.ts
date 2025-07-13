import { Controller, Post, Patch, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth-guard';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ResponseHandler } from '../common/response-handler/response-handler';

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
        console.log(error);
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
        console.log(error);
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
}
