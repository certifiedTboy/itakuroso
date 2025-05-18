import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users-service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    passCode: string,
    email: string,
  ): Promise<{ authToken: string }> {
    const user = await this.usersService.checkIfUserExist({ email });

    if (!user) {
      throw new UnauthorizedException('', {
        cause: `Invalid login credentials`,
        description: 'User with this email does not exist',
      });
    }

    const payload = {
      email: user.email,
      sub: user.phoneNumber,
    };

    return { authToken: await this.jwtService.signAsync(payload) };
  }
}
