import { PrismaClient, user } from "@prisma/client"
import { redis } from "src/utils/others/redis";

export const GetUserByEmail = async(prisma:PrismaClient,email:string)=>{
    const cache:user|null = await redis.get(email)
    if(cache){
        return cache
    }

    const exiting_user =  await prisma.user.findUnique({
        where:{
            email
        }
    });
    if(exiting_user){
        await redis.set(email,exiting_user,{ex:24*60*60})
        await redis.set(exiting_user?.id,exiting_user,{ex:24*60*60})
        return exiting_user
    }
    return null

}