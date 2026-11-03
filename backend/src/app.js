import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(["8.8.8.8"]);

import express from "express";
import { createServer } from "node:http";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
  return res.json({ hello: "world" });
});

const start = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MONGO connected DB host: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), "0.0.0.0", () => {
      console.log(`App listening on port ${app.get("port")}`);
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
};

start();
