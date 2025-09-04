import { PrismaClient } from "@prisma/client"

export const GetUserByEmail = async(prisma:PrismaClient,email:string)=>{
    return prisma.user.findUnique({
        where:{
            email
        }
    })
}