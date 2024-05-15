import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth-middleware";
import { AuthController } from "./auth-controller";

const authController = new AuthController();
const authRouter = Router();

authRouter.post("/signup", authController.signup);

authRouter.post("/signin", authController.signin);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.get(
  "/refresh",
  AuthMiddleware.authorizeUser,
  authController.refreshToken
);

export default authRouter;
