import { session } from "@prisma/client";

export const GetJwtPayloadFromSession =async(session:session)=>{
    return{
        session_id:session.id,
        user_id:session.user_id,
        expires_at:session.expires_at
    }
}