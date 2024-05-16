import { NextFunction, Response } from "express";
import { AuthService } from "../domains/auth/auth-service";
import {
  AuthenticatedRequest,
  TokenExpiry,
  TokenType
} from "../domains/auth/auth-types";
import { UserService } from "../domains/user/user-service";
import { IUser, Roles } from "../domains/user/user-types";
import { Unauthorized } from "./error-middleware";

export class AuthMiddleware {
  static checkRole(roles: Roles[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const authUser = req.authUser;
        if (authUser == null) {
          throw new Unauthorized("Access denied, unauthorized user");
        }
        const existingUser = await UserService.getUserById(authUser.id);
        if (existingUser == null) {
          throw new Unauthorized("invalid credentials");
        }

        if (!roles.includes(existingUser.role)) {
          throw new Unauthorized("You are not authorized to access this route");
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static async authorizeUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const accessToken = req.cookies["at"];
      if (accessToken == null || accessToken == "") {
        throw new Unauthorized("Access denied");
      }

      const decoded = await AuthService.verifyJWT(
        accessToken,
        TokenExpiry.ACCESS_TOKEN,
        TokenType.ACCESS
      );

      const existingUser = (await UserService.getUserById(
        decoded.sub as string
      )) as IUser;
      if (existingUser == null) {
        throw new Unauthorized("Access denied, unauthorized user");
      }

      if (existingUser.reauth) {
        throw new Unauthorized("Access denied, please re-authenticate");
      }

      req.authUser = existingUser;
      next();
    } catch (error) {
      next(error);
    }
  }
}
