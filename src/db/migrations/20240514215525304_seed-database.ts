import bcrypt from "bcrypt";
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";
import Config from "../../config/config";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const adminPasswordHash = await bcrypt.hash(
    "VeryseCuRePa$$w0rd",
    Config.BCRYPT_SALT
  );
  const userPasswordHash = await bcrypt.hash(
    "VeryseCuRePa$$w0rd4users",
    Config.BCRYPT_SALT
  );
  await pgm.db.query(
    `INSERT INTO users (name, email, password, role) VALUES ('John Doe', 'jdoe@email.com', '${adminPasswordHash}', 'admin')`
  );
  await pgm.db.query(
    `INSERT INTO users (name, email, password) VALUES ('Sarah Doe', 'sdoe@email.com', '${userPasswordHash}')`
  );
  await pgm.db.query(
    `INSERT INTO users (name, email, password) VALUES ('Clinton Doe', 'cdoe@email.com', '${userPasswordHash}')`
  );

  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date) VALUES ('Package 1', 10, (SELECT id FROM users WHERE email = 'sdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-14')`
  );
  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date) VALUES ('Package 2', 20, (SELECT id FROM users WHERE email = 'cdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-14')`
  );
  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date) VALUES ('Package 3', 30, (SELECT id FROM users WHERE email = 'cdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-14')`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `DELETE FROM packages WHERE name IN ('Package 1', 'Package 2', 'Package 3')`
  );

  await pgm.db.query(
    `DELETE FROM users WHERE email IN ('jdoe@email.com', 'sdoe@email.com', 'cdoe@email.com')`
  );
}
