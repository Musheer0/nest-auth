import { Module } from '@nestjs/common';
import { AuthUsersService } from './auth-users.service';
import { AuthUsersController } from './auth-users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt-strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthUsersService],
  controllers: [AuthUsersController],
  imports:[PrismaModule,
    JwtModule.registerAsync({
      useFactory:async()=>({
        secret:process.env.AUTH_SECRET||'JWT_SECRET',
        signOptions:{
          expiresIn:'14d'
        }
      })
    })

  ],
  exports:[
    JwtStrategy,
    PassportModule,
    
  ]
})
export class AuthUsersModule {}
