import { ParsedQs } from "qs";
import { UserModel } from "./user-model";
import { CreateUser, IUserQueryResult } from "./user-types";

export class UserService {
  private static userModel: UserModel = new UserModel();

  static async listUsers(
    query: ParsedQs | Record<string, any>
  ): Promise<IUserQueryResult> {
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const offset = query.offset ? parseInt(query.offset as string) : 0;

    return this.userModel.findAll(limit, offset);
  }

  static async getUserById(userId: string) {
    if (!userId || userId === "") {
      throw new Error("User Id is required");
    }

    return this.userModel.findById(userId);
  }

  static async getUserByEmail(email: string) {
    if (!email || email === "") {
      throw new Error("Email is required");
    }

    return this.userModel.findByEmail(email);
  }

  static async createUser(user: CreateUser) {
    return this.userModel.create(user);
  }

  static async updateUser(userId: string, user: any) {
    if (!userId || userId === "") {
      throw new Error("User Id is required");
    }

    return this.userModel.update(userId, user);
  }

  static async deleteUser(userId: string) {
    if (!userId || userId === "") {
      throw new Error("User Id is required");
    }
    return this.userModel.deleteById(userId);
  }

  static async deleteByEmail(email: string) {
    if (!email || email === "") {
      throw new Error("Email is required");
    }
    return this.userModel.deleteByEmail(email);
  }
}
