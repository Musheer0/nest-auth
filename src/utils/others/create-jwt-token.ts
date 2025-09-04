import { JwtService } from "@nestjs/jwt";

export const CreateCredentialsJwtToken= async(jwtService:JwtService,jwt_payload:any)=>{
 const jwtToken = jwtService.sign(jwt_payload)
        return {
            success:true,
            token:jwtToken
        }
}  