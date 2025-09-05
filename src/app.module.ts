import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthUsersModule } from './auth-users/auth-users.module';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthAdminModule } from './auth-admin/auth-admin.module';

@Module({
  imports: [PrismaModule, AuthUsersModule,
    ThrottlerModule.forRoot({
      throttlers:[
        {
          ttl:6000,
          limit:5
        }
      ]
    }),
    AuthAdminModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide:APP_GUARD,
      useClass:ThrottlerGuard
    }
  ],
})
export class AppModule {}
