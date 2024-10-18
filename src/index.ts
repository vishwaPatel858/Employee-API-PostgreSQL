console.log("Starting");
import { router } from "./routes/employee.routes.ts";
import { redisClient } from "./utility/redisClient.ts";
redisClient.connect();
const express = require("express");
const dotenv = require("dotenv");
const app = express();
app.use(express.json());
app.use("/employee", router);
dotenv.config();
const PORT = process.env.port || 3000;
app.listen(PORT, () => {
  console.log("App listening on port " + PORT);
});
