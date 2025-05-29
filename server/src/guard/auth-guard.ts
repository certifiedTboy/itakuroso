import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth-services';

// Define a UserPayload interface that includes _id, email, and phoneNumber
interface UserPayload {
  _id: string;
  email: string;
  phoneNumber: string;
}

// Extend Express Request interface to include 'user'
declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authToken = request.headers['authorization'];

    if (authToken?.split(' ')[0] !== 'Bearer') {
      throw new BadRequestException('', {
        cause: `Invalid token`,
        description: 'Invalid token',
      });
    }

    if (authToken) {
      const payload = (await this.authService.verifyToken(
        authToken.split(' ')[1],
      )) as UserPayload | null;

      if (!payload) {
        return false;
      }

      request.user = {
        _id: payload._id,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
      }; // Assign the user data to the request object

      return true;
    } else {
      return false;
    }
  }
}
