import { Router } from "express";
import authRouter from "../domains/auth/auth-router";
import packageRouter from "../domains/package/package-router";
import userRouter from "../domains/user/user-router";
import { AuthMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.all("/", (req, res) => {
  res.json({
    message: "Gbewa Kia API is live",
    documentation: "https://documenter.getpostman.com/view/19461169/2sA3JRYK8c"
  });
});

router.use("/auth", authRouter);

router.use(AuthMiddleware.authorizeUser);

router.use("/users", userRouter);

router.use("/packages", packageRouter);

export default router;
