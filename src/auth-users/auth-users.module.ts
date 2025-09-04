import { Module } from '@nestjs/common';
import { AuthUsersService } from './auth-users.service';
import { AuthUsersController } from './auth-users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AuthUsersService],
  controllers: [AuthUsersController],
  imports:[PrismaModule]
})
export class AuthUsersModule {}
