import { Module } from '@nestjs/common';
import { AuthAdminService } from './auth-admin.service';
import { AuthAdminController } from './auth-admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthAdminService],
  controllers: [AuthAdminController],
  imports:[JwtModule,PrismaModule,PassportModule]
})
export class AuthAdminModule {}
