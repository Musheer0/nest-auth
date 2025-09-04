import { authenticator } from 'otplib';

export const GenerateOtpSecret = ()=>{
    const secret = authenticator.generateSecret()
    const token = authenticator.generate(secret)
    return {token,secret}
}
export const Verify = (token:string,secret:string)=>{
    return authenticator.verify({token,secret})
}
