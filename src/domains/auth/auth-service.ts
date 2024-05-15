import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import Config from "../../config/config";
import {
  BadRequest,
  Forbidden,
  InvalidInput,
  ServerError,
  Unauthorized
} from "../../middlewares/error-middleware";
import {
  generateRandomHexString,
  hashValue,
  isHashMatch
} from "../../utils/helpers";
import { EmailService, TemplateFileNames } from "../../utils/mail-service";
import { validatePayload } from "../../utils/validator";
import { UserService } from "../user/user-service";
import { TokenModel } from "./auth-model";
import { ISignin, ISignup, TokenExpiry, TokenType } from "./auth-types";
import {
  ResetPasswordValidationSchema,
  SigninValidationSchema,
  SignupValidationSchema
} from "./auth-validator";

export class AuthService {
  private static JWToptions: SignOptions = {
    issuer: Config.JWT.ISSUER,
    audience: Config.JWT.AUDIENCE,
    algorithm: "HS256"
  };

  static async signin(reqBody: ISignin) {
    const payload = (await validatePayload(
      reqBody,
      SigninValidationSchema
    )) as unknown as ISignin;

    const existingUser = await UserService.getUserByEmail(payload.email);
    if (existingUser == null) {
      throw new Unauthorized("invalid credentials");
    }

    const isValidPassword = await isHashMatch(
      payload.password,
      existingUser.password
    );
    if (!isValidPassword) {
      throw new Unauthorized("invalid credentials");
    }

    const accessToken = await this.generateJWT(
      existingUser.id.toString(),
      existingUser.role as string,
      TokenExpiry.ACCESS_TOKEN
    );

    const refreshTokenExpiry = payload.rememberMe
      ? TokenExpiry.REMEMBER_ME
      : TokenExpiry.REFRESH_TOKEN;

    const refreshToken = await this.generateJWT(
      existingUser.id.toString(),
      existingUser.role as string,
      refreshTokenExpiry,
      TokenType.REFRESH
    );

    await UserService.updateUser(existingUser.id, { reauth: false });

    return { accessToken, refreshToken, refreshTokenExpiry };
  }

  static async signup(reqBody: ISignup) {
    const payload = (await validatePayload(
      reqBody,
      SignupValidationSchema
    )) as unknown as ISignup;

    const existingUser = await UserService.getUserByEmail(payload.email);
    if (existingUser) {
      throw new BadRequest("email already exists");
    }

    const hashedPassword = await hashValue(payload.password);
    payload.password = hashedPassword;

    const newUser = await UserService.createUser(payload);

    const accessToken = await this.generateJWT(
      newUser.id,
      newUser.role as string,
      TokenExpiry.ACCESS_TOKEN
    );

    const refreshToken = await this.generateJWT(
      newUser.id,
      newUser.role as string,
      TokenExpiry.REFRESH_TOKEN
    );

    return { newUser, accessToken, refreshToken };
  }

  static async forgotPassword(email: string) {
    if (!email) {
      throw new InvalidInput("email is required");
    }

    const existingUser = await UserService.getUserByEmail(email);
    if (!existingUser) {
      return;
    }

    const existingToken = await TokenModel.findByUserId(existingUser.id);
    if (existingToken) {
      await TokenModel.deleteOne(existingToken.id);
    }

    const resetToken = generateRandomHexString(32);

    const hashedToken = await hashValue(resetToken);

    const token = await TokenModel.create({
      userId: existingUser.id,
      tokenHash: hashedToken
    });

    const resetURL = `${Config.FRONTEND_BASE_URL}/resetpassword?id=${token.id}?token=${resetToken}`;

    await EmailService.sendPasswordResetEmail(existingUser.email, resetURL);

    return;
  }

  static async resetPassword(reqBody: {
    token: string;
    password: string;
    id: string;
  }): Promise<void> {
    const payload = (await validatePayload(
      reqBody,
      ResetPasswordValidationSchema
    )) as unknown as { token: string; password: string; id: string };

    const existingToken = await TokenModel.findById(payload.id);
    if (!existingToken || this.isExpiredToken(existingToken.createdAt)) {
      existingToken ? await TokenModel.deleteOne(existingToken.id) : "";
      throw new BadRequest("Invalid or expired token");
    }

    const tokenMatch = await isHashMatch(
      payload.token,
      existingToken.tokenHash
    );
    if (!tokenMatch) {
      throw new BadRequest("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(
      payload.password,
      Config.BCRYPT_SALT
    );

    const user = await UserService.updateUser(existingToken.userId, {
      passwordHash: hashedPassword,
      reauth: true
    });

    await TokenModel.deleteOne(existingToken.id);

    const subject = "Password Reset Successful";
    await EmailService.sendMail(
      user.email,
      subject,
      TemplateFileNames.RESET_SUCCESSFUL
    );
    return;
  }

  private static async generateJWT(
    userId: string,
    role: string,
    expiry: number,
    type: TokenType = TokenType.ACCESS
  ): Promise<string> {
    const payload = { sub: userId, role };
    let secret = Config.JWT.ACCESS_TOKEN_SECRET;

    this.JWToptions.expiresIn = expiry;

    if (type === TokenType.REFRESH) {
      secret = Config.JWT.REFRESH_TOKEN_SECRET;
    }
    
    const token = jwt.sign(payload, secret, this.JWToptions);

    return token;
  }

  static async verifyJWT(
    token: string,
    expiry: number,
    type: TokenType
  ): Promise<JwtPayload> {
    try {
      if (!token) {
        throw new Forbidden("Invalid or expired token");
      }
      let secret = Config.JWT.ACCESS_TOKEN_SECRET;
      if (type === TokenType.REFRESH) {
        secret = Config.JWT.REFRESH_TOKEN_SECRET;
      }
      this.JWToptions.expiresIn = expiry;
      
      const decoded = jwt.verify(token, secret, this.JWToptions) as JwtPayload;
      if (decoded == null) {
        throw new Forbidden("Invalid or expired token");
      }
      if (!decoded.sub || !decoded.role) {
        throw new Forbidden("Invalid or expired token");
      }

      return decoded;
    } catch (error) {
      throw new Forbidden("Invalid or expired token");
    }
  }

  static async refreshToken(token: string): Promise<string> {
    try {
      const decoded = await this.verifyJWT(
        token,
        TokenExpiry.REFRESH_TOKEN,
        TokenType.REFRESH
      );

      const accessToken = await this.generateJWT(
        decoded.sub!,
        decoded.role,
        TokenExpiry.ACCESS_TOKEN
      );

      return accessToken;
    } catch (error) {
      throw new Forbidden("Invalid or expired token");
    }
  }

  private static isExpiredToken(createdAt: Date): boolean {
    const expiry = new Date(createdAt);
    expiry.setHours(expiry.getHours() + 1);
    return new Date() > expiry;
  }
}
