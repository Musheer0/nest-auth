import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './services/create-user.service';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { VerifyUserEmailAndLogin } from './services/verifiy-user-email.service';
import { JwtService } from '@nestjs/jwt';
import { GetJwtPayloadFromSession } from 'src/utils/others/get-jwt-payload-from-session';
import { CredentialsSignInDto } from './dto/sign-in/credentials-sign-in.dto';
import { CrendentialsSignIn } from './services/credentials-signin.service';
import { CreateCredentialsJwtToken } from 'src/utils/others/create-jwt-token';
import { UserSessionToken } from 'src/utils/types/user-session-token';
import { EnabledMfa } from './services/enable-mfa.service';
import { DisableMfaDto } from './dto/disable-mfa/disable-mfa.token';
import { DisableMfa } from './services/disable-mfa.service';
import { ResendEmailVerificationToken } from './services/resend-verification-token.service';
import { ResendTokenDto } from './dto/verify-token/resend-token.dto';
import { EditUserBasicInfoDto } from './dto/edit-user/edit-user-basic-info.dto';
import { editUserBasicInfo } from './services/edit-user-baisc-info.service';
import { EditUserEmail } from './services/edit-user-email.service';
import { EditUserEmailDto } from './dto/edit-user/edit-email.dto';
import {
  LogoutAllSessions,
  LogoutCurrentSession,
} from './services/logout-session.service';
import { GetUserInfoBySession } from './services/get-user-info.service';
import { GetSessionById } from 'src/utils/others/get-session';
import { RefreshSession } from './services/refresh-token.service';
import { ResetUserPassword } from './services/reset-user-password.service';
import { EditUserPasswordDto } from './dto/edit-user/edit-user-password.dto';
import { ResetUserPasswordUnauth } from './services/reset-password-unauth.service';

@Injectable()
export class AuthUsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async SignUpWithEmail(metadata: UserMetaData, data: SignUpEmailDto) {
    if (!metadata.ip || !metadata.user_agent)
      throw new BadRequestException('invalid request');
    return CreateUser(this.prisma, data, metadata);
  }
  async VerifyUserEmail(metadata: UserMetaData, data: VerifyTokenDto) {
    const session = await VerifyUserEmailAndLogin(
      this.prisma,
      data.userId,
      data.tokenId,
      data.code,
      metadata,
    );
    const jwt_payload = await GetJwtPayloadFromSession(session);
    return CreateCredentialsJwtToken(this.jwtService, jwt_payload);
  }
  async CredentialsUserSign(
    metadata: UserMetaData,
    data: CredentialsSignInDto,
  ) {
    const response = await CrendentialsSignIn(this.prisma, data, metadata);
    if (response.mfa_enabled || !response.session) {
      return {
        mfa_enabled: true,
        success: true,
        mfa_token: response.mfa_token,
      };
    }
    const jwt_payload = await GetJwtPayloadFromSession(response.session);
    return CreateCredentialsJwtToken(this.jwtService, jwt_payload);
  }
  async EnableUserMfa(session: UserSessionToken) {
    return EnabledMfa(this.prisma, session.session_id, session.user_id);
  }
  async DisableUserMfa(
    session: UserSessionToken,
    metadata: UserMetaData,
    data: DisableMfaDto,
  ) {
    const isValidSession = await GetSessionById(
      this.prisma,
      session.session_id,
      session.user_id,
    );
    if (!isValidSession) throw new UnauthorizedException();
    return DisableMfa(this.prisma, session.user_id, metadata, data);
  }
  async ResendEmailVerificationMail(
    metadata: UserMetaData,
    data: ResendTokenDto,
  ) {
    return ResendEmailVerificationToken(
      this.prisma,
      metadata,
      data.tokenId,
      data.userId,
      data.email,
    );
  }
  async EditUserBasicInfo(
    usedId: string,
    data: EditUserBasicInfoDto,
    session: UserSessionToken,
  ) {
    const isValidSession = await GetSessionById(
      this.prisma,
      session.session_id,
      session.user_id,
    );
    if (!isValidSession) throw new UnauthorizedException();
    return editUserBasicInfo(this.prisma, usedId, data);
  }
  async EditUserEmailInfo(
    metadata: UserMetaData,
    data: EditUserEmailDto,
    session: UserSessionToken,
  ) {
    return EditUserEmail(this.prisma, metadata, data, session);
  }
  async LogoutUser(session: UserSessionToken) {
    return LogoutCurrentSession(this.prisma, session);
  }
  async LogoutAll(session: UserSessionToken) {
    return LogoutAllSessions(this.prisma, session);
  }
  async GetSessionInfo(session: UserSessionToken) {
    return GetUserInfoBySession(this.prisma, session.session_id);
  }
  async RefreshToken(session: UserSessionToken) {
    const updated_session = await RefreshSession(this.prisma, session);
    const jwt_payload = await GetJwtPayloadFromSession(updated_session);
    return CreateCredentialsJwtToken(this.jwtService, jwt_payload);
  }
  async ResetPassword(
    session: UserSessionToken,
    metadata: UserMetaData,
    data: EditUserPasswordDto,
  ) {
    return ResetUserPassword(this.prisma, metadata, data, session);
  }
  async ResetPasswordUnauth(metadata: UserMetaData, data: EditUserPasswordDto) {
    return ResetUserPasswordUnauth(this.prisma, metadata, data);
  }
}
