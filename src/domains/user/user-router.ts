import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth-middleware";
import { UserController } from "./user-controller";
import { Roles } from "./user-types";

const userController = new UserController();

const userRouter = Router();

userRouter.use(AuthMiddleware.checkRole([Roles.ADMIN]));

userRouter.get("/email/:email", userController.getUserByEmail);

userRouter.get("/:id", userController.getUserById);

userRouter.get("/", userController.listUsers);

userRouter.post("/", userController.createUser);

userRouter.put("/:userId", userController.updateUser);

userRouter.delete("/:userId", userController.deleteUser);

export default userRouter;
