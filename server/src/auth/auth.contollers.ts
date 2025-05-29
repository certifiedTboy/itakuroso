import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth-services';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from '../guard/auth-guard';
import { ResponseHandler } from '../common/response-handler/response-handler';

/**
 * @class AuthControllers
 * @description Handles all authentication-related HTTP requests.
 * This includes user login.
 * @version 1.0
 * @path /api/v1/auth
 */
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthControllers {
  constructor(private readonly authService: AuthService) {}

  /**
   * @method login
   * @description Handles user login requests.
   * Validates the input data and checks if the user exists.
   * If valid, generates a JWT token for the user.
   * @param {AuthDto} authDto - The data transfer object containing user credentials.
   */
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    try {
      const { passcode, email } = authDto;

      const result = await this.authService.signIn(passcode, email);

      return ResponseHandler.ok(200, 'login successful', result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method getCurrentUser
   * @description Handles requests to get the current user's information.
   */
  @Get('current-user')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: Request) {
    try {
      const currentUser = req.user;

      return ResponseHandler.ok(
        200,
        'User retrieved successfully',
        currentUser,
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
   * @method getNewToken
   * @description Handles requests to generate a new token for the user.
   * Validates the input data and checks if the user exists.
   * If valid, generates a new JWT token for the user.
   * @param {AuthDto} authDto - The data transfer object containing user credentials.
   * @param {Request} req - The HTTP request object.
   */
  @Get('new-token')
  @UseGuards(AuthGuard)
  async getNewtoken(@Req() req: Request) {
    try {
      const currentUser = req.user;

      if (currentUser) {
        const token = await this.authService.generateNewToken(
          currentUser?.email,
          currentUser?.phoneNumber,
        );

        return ResponseHandler.ok(
          200,
          'new token generated successfully',
          token,
        );
      }
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
