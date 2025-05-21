import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authToken = request.headers['authorization'];

    if (authToken?.split(' ')[0] !== 'Bearer') {
      throw new BadRequestException('', {
        cause: `Invalid token`,
        description: 'Invalid token',
      });
    }

    if (!authToken) {
      throw new UnauthorizedException('', {
        cause: `No token provided`,
        description: 'No token provided',
      });
      //   return false; // No token provided
    }

    request.authToken = authToken.split(' ')[1]; // Mock user data for demonstration

    // You can now add your custom auth logic
    // return Boolean(request.user); // Example: only allow if user exists

    return true;
  }
}
