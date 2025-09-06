import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PrivateOnlyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return false;
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return false;
    }
    try {
      this.jwtService.verify(token);

      return true;
    } catch (err) {
      return false;
    }
  }
}
