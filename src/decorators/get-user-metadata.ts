import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserMetaData } from "src/utils/types/user-metadata";

export const GetUserMetaData = createParamDecorator((data:unknown,ctx:ExecutionContext)=>{
    const req =ctx.switchToHttp().getRequest<Request>()
     const forwarded = req.headers['x-forwarded-for'];
     const ip =
     typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress;
    const user_agent =req.headers['user-agent']

    return {
        ip,
        user_agent
    } as UserMetaData

})