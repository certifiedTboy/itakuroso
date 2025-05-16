import { Controller, Post, Patch, Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ResponseHandler } from 'src/common/response-handler/response-handler';

@Controller({
  path: 'users/create',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);

      return ResponseHandler.ok(201, 'User created successfully', result || {});
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.message,
          description: 'Some error description',
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
        throw new BadRequestException('', {
          cause: error.message,
          description: 'Some error description',
        });
      }
    }
  }
}
