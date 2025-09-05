import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTGuard } from 'src/auth-users/guards/jwt-auth.guard';

@UseGuards(JWTGuard)
@Controller('/api/admin')
export class AuthAdminController {
    @Get('/test')
    async Test(){
        console.log(1)
        return {hello:"world"}
    }
}
