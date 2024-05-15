import bcrypt from "bcrypt";
import crypto from "crypto";
import Config from "../config/config";

export function generateRandomHexString(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

export async function hashValue(value: string): Promise<string> {
  return await bcrypt.hash(value, Config.BCRYPT_SALT);
}

export async function isHashMatch(
  value: string,
  hashedValue: string
): Promise<boolean> {
  return await bcrypt.compare(value, hashedValue);
}

export function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter, index) =>
    index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
  );
}
