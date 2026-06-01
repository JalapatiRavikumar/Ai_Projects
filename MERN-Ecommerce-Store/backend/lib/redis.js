import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;

let redisClient;

if (!redisUrl) {
	console.warn("UPSTASH_REDIS_URL is not set. Using an in-memory fallback mock for Redis features.");
	
	const store = new Map();
	redisClient = {
		async set(key, value, ...args) {
			store.set(key, value);
			return "OK";
		},
		async get(key) {
			return store.get(key) || null;
		},
		async del(key) {
			store.delete(key);
			return 1;
		},
		async quit() {
			return "OK";
		},
		on(event, handler) {
			if (event === "connect") {
				setTimeout(() => handler(), 0);
			}
			return this;
		}
	};
} else {
	redisClient = new Redis(redisUrl, {
		tls: redisUrl?.startsWith("rediss://") ? {} : undefined,
		maxRetriesPerRequest: null,
		retryStrategy(times) {
			const delay = Math.min(times * 200, 2000);
			return delay;
		},
	});

	redisClient.on("error", (err) => {
		console.error("Redis connection error:", err.message);
	});

	redisClient.on("connect", () => {
		console.log("Redis connected");
	});
}

export const redis = redisClient;

