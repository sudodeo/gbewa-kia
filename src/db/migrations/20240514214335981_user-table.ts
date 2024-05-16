import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("users", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()")
    },
    name: {
      type: "VARCHAR(100)",
      notNull: true
    },
    email: {
      type: "VARCHAR(100)",
      notNull: true,
      unique: true
    },
    password_hash: {
      type: "VARCHAR(100)",
      notNull: true
    },
    role: {
      type: "VARCHAR(100)",
      notNull: true,
      default: "'user'"
    },
    reauth: {
      type: "BOOLEAN",
      notNull: true,
      default: false
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createIndex("users", "email");
  pgm.createIndex("users", "name");
  pgm.createIndex("users", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("users", "email");
  pgm.dropIndex("users", "name");
  pgm.dropIndex("users", "id");

  pgm.dropTable("users");
}
