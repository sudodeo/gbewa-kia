import { NextFunction, Request, Response } from "express";
import { Unauthorized } from "../../middlewares/error-middleware";
import { AuthService } from "./auth-service";
import { TokenExpiry } from "./auth-types";

export class AuthController {
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newUser, accessToken, refreshToken } = await AuthService.signup(
        req.body
      );

      res.cookie("at", accessToken, {
        httpOnly: true,
        maxAge: TokenExpiry.ACCESS_TOKEN
      });

      res.cookie("rt", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: TokenExpiry.REFRESH_TOKEN
      });

      res.status(201).json({
        success: true,
        user: newUser,
        message: "User created successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, refreshTokenExpiry } =
        await AuthService.signin(req.body);

      res.cookie("at", accessToken, {
        httpOnly: true,
        maxAge: TokenExpiry.ACCESS_TOKEN
      });

      res.cookie("rt", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: refreshTokenExpiry
      });

      res.status(200).json({ success: true, message: "Signin successful" });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { email } = req.body;
      // Response is sent before the password is reset to prevent timing attacks
      res.status(200).json({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password."
      });

      await AuthService.forgotPassword(email);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthService.resetPassword(req.body);

      res
        .status(200)
        .json({
          success: true,
          message: "Password reset successfully. Proceed to signin"
        });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.cookies.rt) {
        throw new Unauthorized("You are not authorized to access this route");
      }

      const accessToken = await AuthService.refreshToken(req.cookies.rt);
      res.cookie("at", accessToken, {
        httpOnly: true,
        maxAge: TokenExpiry.ACCESS_TOKEN
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
