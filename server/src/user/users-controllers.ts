import { Controller, Post, Patch, Body } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ResponseHandler } from '../common/response-handler/response-handler';

@Controller({
  path: 'users/create',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const userWithEmailExist = await this.usersService.checkIfUserExist({
        email: createUserDto.email,
      });

      const userWithPhoneExist = await this.usersService.checkIfUserExist({
        phoneNumber: createUserDto.phoneNumber,
      });

      if (userWithEmailExist) {
        throw new BadRequestException('', {
          cause: `User with this email already exists`,
          description: 'User with this email already exists',
        });
      }

      if (userWithPhoneExist) {
        throw new BadRequestException('', {
          cause: `User with this phone already exists`,
          description: 'User with this email already exists',
        });
      }
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

  @Patch()
  async verifyUser(@Body() verifyUserDto: VerifyUserDto) {
    try {
      const result = await this.usersService.verifyUser(
        verifyUserDto.verificationCode,
      );

      if (!result) {
        throw new BadRequestException('', {
          cause: 'invalid verification code',
          description: 'Some error description',
        });
      }

      return ResponseHandler.ok(
        200,
        'User verified successfully',
        result || {},
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
}
