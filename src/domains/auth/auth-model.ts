import pool from "../../db/connection";
import { CreateToken, IToken } from "./auth-types";

export class TokenModel {
  userId: string;
  token: string;
  createdAt: Date;
  private static tableName = "tokens";
  private static tokenFields = `id, user_id AS "userId", token_hash AS "tokenHash", created_at AS "createdAt"`;

  constructor(userId: string, token: string, createdAt: Date) {
    this.userId = userId;
    this.token = token;
    this.createdAt = createdAt;
  }

  static async findByUserId(userId: string):Promise<IToken> {
    const client = await pool.connect();
    const query = `SELECT ${this.tokenFields} FROM ${this.tableName} WHERE user_id = '${userId}'`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findById(tokenId: string): Promise<IToken> {
    const client = await pool.connect();
    const query = `SELECT ${this.tokenFields} FROM ${this.tableName} WHERE id = '${tokenId}'`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async create(tokenStruct: CreateToken): Promise<IToken> {
    const client = await pool.connect();
    const query = `INSERT INTO ${this.tableName} (user_id, token_hash) VALUES ('${tokenStruct.userId}', '${tokenStruct.tokenHash}') RETURNING ${this.tokenFields}`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async deleteOne(tokenId: string) {
    const client = await pool.connect();
    const query = `DELETE FROM ${this.tableName} WHERE id = '${tokenId}'`;
    try {
      await client.query(query);
    } finally {
      client.release();
    }
  }
}
