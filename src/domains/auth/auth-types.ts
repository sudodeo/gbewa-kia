import { Request } from "express";
import { IUser } from "../user/user-types";

export interface AuthenticatedRequest extends Request {
  authUser?: IUser;
}

export interface ISignin {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ISignup {
  name: string;
  email: string;
  password: string;
}

export enum TokenExpiry {
  ACCESS_TOKEN = 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN = 7 * 24 * 60 * 60 * 1000, // 7 days
  REMEMBER_ME = 30 * 24 * 60 * 60 * 1000 // 30 days
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh"
}

export interface IToken {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
}

export interface CreateToken {
  userId: string;
  tokenHash: string;
}
