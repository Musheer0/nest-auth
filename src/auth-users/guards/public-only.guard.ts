import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PublicOnlyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return true;
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return true;
    }
    try {
      this.jwtService.verify(token);

      return false;
    } catch (err) {
      return true;
    }
  }
}
