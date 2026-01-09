import Redis from 'ioredis';

export const redis = new Redis("rediss://default:AVtHAAIncDIzMzIxYjIyMmU0NGM0MTdiYmEzZTVjMjRhMzNiYWI4N3AyMjMzNjc@thankful-man-23367.upstash.io:6379");

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error", err);
});

