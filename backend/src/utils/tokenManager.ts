import jwt, { type JwtPayload } from "jsonwebtoken";
import type { User } from "../models/User";
import { ENV, JWT_EXPIRY } from "../config/env";
import redis from "../lib/redis"; 

export interface JwtUserPayload extends JwtPayload {
  id: string;
  email: string;
}

export function generateToken(user: User) {
  return jwt.sign({ id: user.id, email: user.email }, ENV.JWT_SECRET as string, {
    issuer: "rajendrapancholi",
    audience: "rajendrapancholi-client",
    expiresIn: JWT_EXPIRY,
  });
}

export async function verifyToken(token: string): Promise<JwtUserPayload> {
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    throw new Error("Token is blacklisted");
  }

  return jwt.verify(token, ENV.JWT_SECRET) as JwtUserPayload;
}

export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as JwtUserPayload;
    if (!decoded || !decoded.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;

    if (timeLeft > 0) {
      // Store in Redis with TTL equal to remaining token life
      await redis.setex(`blacklist:${token}`, timeLeft, "true");
    }
  } catch (error) {
    console.error("Error blacklisting token:", error);
  }
}
