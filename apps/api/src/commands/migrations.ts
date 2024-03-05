import express, { type Response as EResponse } from "express";
import morgan from "morgan";
import { orderMigrationService } from "../init.js";
import Cors from "cors";

export const migrationsApp = express();

const cors = Cors({ origin: true });

migrationsApp.use(cors);
migrationsApp.use(morgan("tiny"));

// noinspection JSUnusedLocalSymbols
migrationsApp.use((error: unknown, _: object, res: EResponse, __: object) => {
  __;
  console.log("error", error);
  res.status(500).json({
    error: "something went wrong",
    details: error instanceof Error ? error.message : "",
  });
});

migrationsApp.get("/health", (_, res) => {
  res.status(200).json({ status: "running" });
});

migrationsApp.post("/migrate", async (req, res) => {
  console.log("payload", req.body);
  await orderMigrationService.migrate(req.body);
  res.status(200).json({ status: "done" });
});

migrationsApp.post("/linkEvent", async (req, res) => {
  console.log("payload", req.body);
  await orderMigrationService.linkEvent(req.body);
  res.status(200).json({ status: "done" });
});
