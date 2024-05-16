import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("tokens", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()")
    },
    token_hash: {
      type: "VARCHAR(255)",
      notNull: true
    },
    user_id: {
      type: "UUID",
      notNull: true,
      references: "users"
    },
    expires_at: {
      type: "TIMESTAMP",
      notNull: true
    }
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("token");
}
