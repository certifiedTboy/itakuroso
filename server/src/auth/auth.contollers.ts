import { Controller, Post, Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth-services';
import { AuthDto } from './dto/auth.dto';
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
      const { passCode, email } = authDto;

      const result = await this.authService.signIn(passCode, email);

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
}
