import Redis from "ioredis";
import { ENV } from "../config/env";

const redis = new Redis(ENV.REDIS_URL);

export default redis;
