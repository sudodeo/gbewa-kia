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
    `INSERT INTO users (name, email, password_hash, role) VALUES ('John Doe', 'jdoe@email.com', '${adminPasswordHash}', 'admin')`
  );
  await pgm.db.query(
    `INSERT INTO users (name, email, password_hash) VALUES ('Sarah Doe', 'sdoe@email.com', '${userPasswordHash}')`
  );
  await pgm.db.query(
    `INSERT INTO users (name, email, password_hash) VALUES ('Clinton Doe', 'cdoe@email.com', '${userPasswordHash}')`
  );

  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date, status, tracking_number) VALUES ('Package 1', 10, (SELECT id FROM users WHERE email = 'sdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-24', 'in transit', 'Mv3qPz2rTl0xNw8gJh4sF6dC9')`
  );
  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date, status, tracking_number) VALUES ('Package 2', 20, (SELECT id FROM users WHERE email = 'cdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-28', 'pending', 'Bc6Yn9Uv1Gm5Zl2Xp3Rw7Qa4K')`
  );
  await pgm.db.query(
    `INSERT INTO packages (name, weight, sender_id, pickup_address, destination_address, pickup_date, status, tracking_number) VALUES ('Package 3', 30, (SELECT id FROM users WHERE email = 'sdoe@email.com'), '123 Main St', '456 Elm St', '2024-05-30', 'available for pickup', 'Df8Ns2Gh4Rt1Wc6Yx3Jv9Lb0P')`
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
