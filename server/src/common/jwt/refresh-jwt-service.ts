import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshJwtService {
  constructor(private readonly jwtService: JwtService) {}
  async signToken(payload: { email: string; sub: string; token?: string }) {
    const jwtToken = await this.jwtService.signAsync(payload);
    return jwtToken;
  }

  async verifyToken(token: string) {
    const decoded: {
      email: string;
      iat: string;
      sub: string;
      exp: string;
      token: string;
      _id: string;
    } = await this.jwtService.verifyAsync(token);

    return decoded;
  }
}
