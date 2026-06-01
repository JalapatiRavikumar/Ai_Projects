import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;

if (!redisUrl) {
	console.warn("UPSTASH_REDIS_URL is not set. Redis features will be unavailable.");
}

export const redis = new Redis(redisUrl, {
	// Upstash requires TLS. If the URL uses rediss:// ioredis enables TLS
	// automatically; this is a safety net when a redis:// URL is provided.
	tls: redisUrl?.startsWith("rediss://") ? {} : undefined,
	// Keep retrying connections instead of throwing on the very first failures.
	maxRetriesPerRequest: null,
	// Exponential backoff capped at 2s so we don't hammer the server.
	retryStrategy(times) {
		const delay = Math.min(times * 200, 2000);
		return delay;
	},
});

// Without a listener, ioredis "error" events are thrown as unhandled
// exceptions and can crash the process. Log them instead.
redis.on("error", (err) => {
	console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
	console.log("Redis connected");
});
