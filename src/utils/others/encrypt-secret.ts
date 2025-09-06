import { hash, verify } from 'argon2';
import { authenticator } from 'otplib';

export const GenerateOtpSecret = async () => {
  const secret = authenticator.generateSecret();
  const token = authenticator.generate(secret);
  const hash_secret = await hash(token);
  return {
    secret: hash_secret,
    token,
  };
};
export const Verify = (token: string, secret: string) => {
  return verify(secret, token);
};
