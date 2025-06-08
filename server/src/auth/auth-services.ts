import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasscodeHashing } from '../helpers/passcode-hashing';
import { UsersService } from '../user/users-service';

/**
 * @class AuthService
 * @description Handles authentication-related operations.
 * This includes signing in users and verifying JWT tokens.
 * @version 1.0
 * @path /api/v1/auth
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * @method signIn
   * @description Handles user sign-in operations.
   * Validates the input data and checks if the user exists.
   * If valid, generates a JWT token for the user.
   * @param {string} passcode - The user's passcode.
   * @param {string} email - The user's email address.
   */
  async signIn(
    passcode: string,
    email: string,
  ): Promise<{ authToken: string; updatedUser?: any; user?: any }> {
    const user = await this.usersService.checkIfUserExist({ email });

    if (!user) {
      throw new UnauthorizedException('', {
        cause: `Invalid login credentials`,
        description: 'User with this email does not exist',
      });
    }

    if (user && user.passcode && user.isVerified) {
      const passcodeMatch = await PasscodeHashing.verifyPassword(
        passcode,
        user.passcode,
      );

      if (!passcodeMatch) {
        throw new UnauthorizedException('', {
          cause: `Invalid passcode`,
          description: 'Invalid passcode',
        });
      }

      const payload = {
        email: user.email,
        sub: user.phoneNumber,
      };

      return { authToken: await this.jwtService.signAsync(payload), user };
    } else {
      // update user passcode
      const updatedUser = await this.usersService.updateUserPasscode({
        passcode,
        email: user?.email,
      });

      const payload = {
        email: updatedUser!.email,
        sub: updatedUser!.phoneNumber,
      };

      return {
        authToken: await this.jwtService.signAsync(payload),
        updatedUser,
      };
    }
  }

  /**
   * @method verifyToken
   * @description Verifies the provided JWT token.
   * If valid, returns the decoded token data.
   * @param {string} token - The JWT token to verify.
   */
  async verifyToken(token: string) {
    try {
      const decoded: { email: string; iat: string; sub: string; exp: string } =
        await this.jwtService.verifyAsync(token);

      const currentUser = await this.usersService.checkIfUserExist({
        email: decoded.email,
      });

      return currentUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException('', {
          cause: error.message,
          description: error.message,
        });
      }
    }
  }

  /**
   * @method generateNewToken
   * @description Generates a new JWT token for the user.
   * @param {string} email - The user's email address.
   */
  async generateNewToken(email: string, phoneNumber: string) {
    const payload = {
      email,
      sub: phoneNumber,
    };

    return { authToken: await this.jwtService.signAsync(payload) };
  }
}
