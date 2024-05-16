import { NextFunction, Request, Response } from "express";
import { UserService } from "./user-service";

export class UserController {

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { metadata, users } = await UserService.listUsers(req.query);
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        users,
        metadata
      });
    } catch (error) {
      next(error);
    }
  };

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;

      const user = await UserService.getUserById(userId);
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const email = req.params.email;

      const user = await UserService.getUserByEmail(email);
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.body.user;

      const createdUser = await UserService.createUser(user);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: createdUser
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const user = req.body.user;

      const updatedUser = await UserService.updateUser(userId, user);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;

      await UserService.deleteUser(userId);
      res.status(200).json({
        message: "User deleted successfully",
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
}
