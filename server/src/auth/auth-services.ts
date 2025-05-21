import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasscodeHashing } from '../helpers/passcode-hashing';
import { UsersService } from '../user/users-service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    passcode: string,
    email: string,
  ): Promise<{ authToken: string; updatedUser?: any }> {
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

      return { authToken: await this.jwtService.signAsync(payload) };
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

  async verifyToken(token: string) {
    try {
      const decoded: { [key: string]: any } =
        await this.jwtService.verifyAsync(token);
      console.log(decoded);
      return decoded;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        throw new UnauthorizedException('', {
          cause: error.cause,
          description: error.message,
        });
      }
    }
  }
}
