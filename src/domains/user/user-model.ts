import pool from "../../db/connection";
import { updateParser } from "../../db/query-builder";
import {
  CreateUser,
  IUser,
  IUserQueryResult,
  IUserwithPassword
} from "./user-types";

export class UserModel {
  readonly userFields = `id, name, email, role, created_at, updated_at`;

  async findById(id: string): Promise<IUserwithPassword> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT ${this.userFields}, password_hash AS password FROM users WHERE id = $1`,
        [id]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  async findByEmail(email: string): Promise<IUserwithPassword | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT ${this.userFields}, password_hash AS password FROM users WHERE email = $1`,
        [email]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  async findAll(limit: number, offset: number): Promise<IUserQueryResult> {
    const client = await pool.connect();
    try {
      const totalCountQuery = await pool.query(
        "SELECT COUNT(*) FROM users"
      );
      const totalCount = parseInt(totalCountQuery.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      const result = await client.query(
        `SELECT ${this.userFields} FROM users ORDER BY id ASC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      const metadata = {
        totalItems: totalCount,
        itemsPerPage: limit,
        itemCount: result.rowCount as number,
        currentPage,
        hasNextPage,
        hasPrevPage,
        totalPages
      };
      const users = result.rows;

      return { metadata, users };
    } finally {
      client.release();
    }
  }

  async create(data: CreateUser): Promise<IUser> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING ${this.userFields}`,
        [data.name, data.email, data.password]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(id: string, data: IUser): Promise<IUser> {
    const client = await pool.connect();
    try {
      const { setClause, values } = updateParser(data as Record<string, any>);

      const result = await client.query(
        `UPDATE users SET ${setClause} WHERE id = '${id}' RETURNING ${this.userFields}`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteById(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    } finally {
      client.release();
    }
  }

  async deleteByEmail(email: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM users WHERE email = $1`, [email]);
    } finally {
      client.release();
    }
  }
}
