import { PrismaClient, user } from "@prisma/client"
import { redis } from "src/utils/others/redis";
import { cacheUser } from "src/utils/redis/cache-user";

export const GetUserById = async(prisma:PrismaClient,id:string)=>{
    const cache:user|null = await redis.get(id)
    if(cache){
        return cache
    }

    const exiting_user =  await prisma.user.findUnique({
        where:{
             id,
            status:{not:'BANNED'},
            is_deleted:false
        }
    });
    if(exiting_user){
        await cacheUser(exiting_user)
        return exiting_user
    }
    return null

}