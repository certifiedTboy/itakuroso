import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasscodeHashing } from '../helpers/passcode-hashing';
import { UsersService } from '../user/users-service';
import { AccessJwtService } from '../common/jwt/access-jwt.service';
import { RefreshJwtService } from 'src/common/jwt/refresh-jwt-service';

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
    private readonly usersService: UsersService,
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
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
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    updatedUser?: any;
    user?: any;
  }> {
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
        _id: user._id.toString(),
        sub: user.phoneNumber,
      };

      return {
        accessToken: await this.accessJwtService.signToken(payload),
        refreshToken: await this.refreshJwtService.signToken(payload),
        user,
      };
    } else {
      // update user passcode
      const updatedUser = await this.usersService.updateUserPasscode({
        passcode,
        email: user?.email,
      });

      const payload = {
        email: updatedUser!.email,
        _id: updatedUser!._id.toString(),
        sub: updatedUser!.phoneNumber,
      };

      return {
        accessToken: await this.accessJwtService.signToken(payload),
        refreshToken: await this.refreshJwtService.signToken(payload),
        updatedUser,
      };
    }
  }

  /**
   * @method generateNewToken
   * @description Generates a new access JWT token for the user.
   * @param {string} refreshToken - The user's refresh token.
   */
  async generateNewToken(refreshToken: string) {
    const { email } = await this.refreshJwtService.verifyToken(refreshToken);

    const userData = await this.usersService.checkIfUserExist({ email });

    if (!userData) {
      throw new UnauthorizedException('', {
        cause: `Invalid token`,
        description: 'User with this email does not exist',
      });
    }

    const payload = {
      email: userData.email,
      _id: userData._id.toString(),
      sub: userData.phoneNumber,
    };

    return {
      accessToken: await this.accessJwtService.signToken(payload),
      user: userData,
    };
  }
}
