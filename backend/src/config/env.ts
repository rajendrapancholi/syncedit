import dotenv from "dotenv";
dotenv.config();

export const JWT_EXPIRY = "7d";
export const JWT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const ENV = {
  PORT: process.env.BASE_PORT || 5000,
  // CLIENT
  CLIENT_ORIGINS: process.env.CLIENT_ORIGINS,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,

  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // SERVER
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  NODE_ENV: process.env.NODE_ENV || "development",

  // DATABASE
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,
  DATABASE_SSL: process.env.DATABASE_SSL === "true",
  // SECRETS
  JWT_SECRET: process.env.JWT_SECRET!,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
};
