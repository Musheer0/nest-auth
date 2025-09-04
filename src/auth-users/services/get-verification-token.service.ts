import { PrismaClient, verification_token } from "@prisma/client";
export const GetVerificationTokenByUserId =async(prisma:PrismaClient,tokenId:string,usedId:string)=>{
    const verification_token =await prisma.verification_token.findFirst({
        where:{
            id:tokenId,
            user_id:usedId
        }
    });
    if(verification_token){
        if(verification_token?.expires_at<new Date()){
            await prisma.verification_token.delete({where:{id:tokenId}})
            return null
        }
        return verification_token
        
    }
    return null
}