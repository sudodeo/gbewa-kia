import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.db.query(
    `CREATE TYPE package_status AS ENUM ('Pending', 'In Transit', 'Delivered')`
  );
  
  pgm.createTable("packages", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      unique: true
    },
    name: {
      type: "VARCHAR(100)",
      notNull: true
    },
    weight: {
      type: "DECIMAL",
      notNull: true
    },
    status: {
      type: "package_status",
      notNull: true,
      default: "Pending"
    },
    sender_id: {
      type: "UUID",
      notNull: true,
      references: "users"
    },
    pickup_address: {
      type: "VARCHAR(100)",
      notNull: true
    },
    destination_address: {
      type: "VARCHAR(100)",
      notNull: true
    },
    pickup_date: {
      type: "DATE",
      notNull: true
    },
    timestamp: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createIndex("packages", "id");
  pgm.createIndex("packages", "name");
  pgm.createIndex("packages", "weight");
  pgm.createIndex("packages", "status");
  pgm.createIndex("packages", "sender_id");
  pgm.createIndex("packages", "timestamp");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("packages", "id");
  pgm.dropIndex("packages", "name");
  pgm.dropIndex("packages", "weight");
  pgm.dropIndex("packages", "status");
  pgm.dropIndex("packages", "sender_id");
  pgm.dropIndex("packages", "timestamp");

  pgm.dropTable("packages");
}
