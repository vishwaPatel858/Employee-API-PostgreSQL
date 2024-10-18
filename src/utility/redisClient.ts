import * as redis from "redis";

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("Connected to redis server");
});

redisClient.on("error", (err) => {
  console.log("Error While connecting to redis server " + err.message);
});
