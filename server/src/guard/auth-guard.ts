import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessJwtService } from '../common/jwt/access-jwt.service';

// Define a UserPayload interface that includes _id, email, and phoneNumber
interface UserPayload {
  _id: string; // Optional, as it may not be used in all cases
  email: string;
  phoneNumber: string;
}

// Extend Express Request interface to include 'user'
declare module 'express' {
  interface Request {
    user: UserPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: AccessJwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = request.headers['authorization'];

    if (accessToken?.split(' ')[0] !== 'Bearer') {
      throw new UnauthorizedException('jwt expired', {
        cause: new Error()['message'],
        description: 'Invalid token',
      });
    }

    if (accessToken) {
      const payload = await this.jwtService.verifyToken(
        accessToken.split(' ')[1],
      );

      request.user = {
        _id: payload._id, // Assuming sub is the user ID
        email: payload.email,
        phoneNumber: payload.sub,
      }; // Assign the user data to the request object

      return true;
    } else {
      return false;
    }
  }
}
