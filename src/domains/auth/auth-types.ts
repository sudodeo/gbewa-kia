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
  ACCESS_TOKEN = 900000, // 15 minutes in milliseconds
  REFRESH_TOKEN = 604800000, // 7 days in milliseconds
  REMEMBER_ME = 2592000000 // 30 days in milliseconds
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
