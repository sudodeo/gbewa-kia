import { IQueryResult } from "../../common/common-types";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Roles;
  reauth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserwithPassword extends IUser {
  password: string;
}
export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  password?: string;
}

export interface IUserQueryResult extends IQueryResult {
  users: IUser[];
}

export enum Roles {
  ADMIN = "admin",
  USER = "user"
}
