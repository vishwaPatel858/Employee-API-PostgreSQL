import { Pool } from "pg";
export const pool = new Pool({
  user: "postgres",
  password: "root",
  host: process.env.PG_HOST,
  port: 5432,
  max: 50,
});

pool.on("connect", () => {
  console.log("Connected to database");
});

pool.on("error", (err, client) => {
  console.log("Error while connecting to database : " + err.message);
});
