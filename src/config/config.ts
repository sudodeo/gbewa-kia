import dotenv from "dotenv";

dotenv.config();

const configErrors: string[] = [];

const validateEmptyString = (
  value: string | undefined,
  name: string
): string => {
  if (!value || value.trim() === "") {
    configErrors.push(`Missing ${name} in .env file`);
    return "";
  }

  return value;
};

const Config = {
  PORT: validateEmptyString(process.env.PORT, "PORT"),

  DATABASE_URL: validateEmptyString(process.env.DATABASE_URL, "DATABASE_URL"),

  JWT: {
    ACCESS_TOKEN_SECRET: validateEmptyString(
      process.env.ACCESS_TOKEN_SECRET,
      "ACCESS_TOKEN_SECRET"
    ),
    REFRESH_TOKEN_SECRET: validateEmptyString(
      process.env.REFRESH_TOKEN_SECRET,
      "REFRESH_TOKEN_SECRET"
    ),
    ISSUER: validateEmptyString(process.env.JWT_ISSUER, "JWT_ISSUER"),
    AUDIENCE: validateEmptyString(process.env.JWT_AUDIENCE, "JWT_AUDIENCE")
  },

  Mail: {
    USER: validateEmptyString(process.env.MAIL_USER, "MAIL_USER"),
    PASSWORD: validateEmptyString(process.env.MAIL_PASSWORD, "MAIL_PASSWORD"),
    HOST: validateEmptyString(process.env.MAIL_HOST, "MAIL_HOST"),
    PORT: parseInt(validateEmptyString(process.env.MAIL_PORT, "MAIL_PORT")),
    SERVICE: validateEmptyString(process.env.MAIL_SERVICE, "MAIL_SERVICE")
  },

  BCRYPT_SALT: parseInt(
    validateEmptyString(process.env.BCRYPT_SALT, "BCRYPT_SALT")
  ),
  FRONTEND_BASE_URL: validateEmptyString(
    process.env.FRONTEND_BASE_URL,
    "FRONTEND_BASE_URL"
  )
};

if (configErrors.length > 0) {
  throw new Error(configErrors.join("\n"));
}

export default Config;
