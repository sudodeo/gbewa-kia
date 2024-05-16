import pool from "../../db/connection";
import { ServerError } from "../../middlewares/error-middleware";
import { CreatePackage, IPackage, IPackageQueryResult } from "./package-types";

export class PackageModel {
  readonly packageFields = `id, name, weight, sender_id AS "senderId", pickup_address AS "pickupAddress", destination_address AS "destinationAddress", pickup_date AS "pickupDate", status, tracking_number AS "trackingNumber", timestamp AS "createdAt", updated_at AS "updatedAt"`;

  async create(data: CreatePackage): Promise<IPackage> {
    const client = await pool.connect();
    const query = `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date, tracking_number) VALUES ('${data.name}', ${data.weight}, '${data.senderId}', '${data.pickupAddress}', '${data.destinationAddress}', '${data.pickupDate}', '${data.trackingNumber}') RETURNING ${this.packageFields}`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findAll(limit: number, offset: number): Promise<IPackageQueryResult> {
    const client = await pool.connect();
    const query = `SELECT ${this.packageFields} FROM packages LIMIT ${limit} OFFSET ${offset}`;
    try {
      const result = await client.query(query);
      const totalCountQuery = await pool.query("SELECT COUNT(*) FROM packages");
      const totalCount = parseInt(totalCountQuery.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      const metadata = {
        totalItems: totalCount,
        itemsPerPage: limit,
        itemCount: result.rowCount as number,
        currentPage,
        hasNextPage,
        hasPrevPage,
        totalPages
      };

      const packages = result.rows;
      return { metadata, packages };
    } catch {
      throw new ServerError("Error fetching packages");
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<IPackage> {
    const client = await pool.connect();
    const query = `SELECT ${this.packageFields} FROM packages WHERE id = '${id}'`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findByTrackingNumber(trackingNumber: string): Promise<IPackage> {
    const client = await pool.connect();
    const query = `SELECT ${this.packageFields} FROM packages WHERE tracking_number = '${trackingNumber}'`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updatePackageStatus(
    packageId: string,
    status: string,
    nextStatus: string
  ): Promise<IPackage> {
    const client = await pool.connect();
    const query = `UPDATE packages SET status = '${nextStatus}' WHERE id = '${packageId}' AND status = '${status}' RETURNING ${this.packageFields}`;
    try {
      const result = await client.query(query);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
