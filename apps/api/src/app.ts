import express, { type Response } from "express";
import { lockerBoxService, wordpressService } from "./init.js";
import morgan from "morgan";
import { configureLockerBoxRoutes } from "./modules/lockerbox/routes.js";
import Cors from "cors";

process.env.TZ = "Asia/Ho_Chi_Minh";

const cors = Cors({ origin: true });

// App corresponds to cloud function named server.
// It houses webhooks for wordpress events, connecta events and sendinblue events.
export const app = express();

app.use(cors);
app.use(morgan("tiny"));

app.use((error: unknown, _: object, res: Response, __: object) => {
  __;
  console.log("error", error);
  res.status(500).json({
    error: "something went wrong",
    details: error instanceof Error ? error.message : "",
  });
});

app.get("/health", (_, res) => {
  res.status(200).json({ status: "running" });
});

// webhook receiver endpoint for new user events from wordpress
app.post("/WPcustomerCreate", async (req, res) => {
  await wordpressService.createCustomer(req.body);
  res.status(200).json({ status: "done" });
});

// webhook receiver endpoint for update user events from wordpress
app.post("/WPcustomerUpdate", async (req, res) => {
  await wordpressService.updateCustomer(req.body);
  res.status(200).json({ status: "done" });
});

// webhook receiver endpoint for new appointment events from wordpress
app.post("/WPappointmentCreate", async (req, res) => {
  await wordpressService.createEvent(req.body);
  res.status(200).json({ status: "done" });
});

// webhook receiver endpoint for update appointment events from wordpress
app.post("/WPappointmentUpdate", async (req, res) => {
  await wordpressService.updateEvent(req.body);
  res.status(200).json({ status: "done" });
});

// webhook receiver endpoint for notification events from wordpress
app.post("/WPnotification", async (req, res) => {
  await wordpressService.notifyUser(req.body);
  res.status(200).json({ status: "done" });
});

// handler to update connecta membership for a user.
app.post("/membercheck", async (req, res) => {
  console.log({ membercheck: req.query });
  const userId = req.query.userId as string;
  console.warn(`request: called membercheck handler: userId (${userId})  `);
  res.status(200).json({ status: "done" });
});

// handler to receive sendinblue email events
//app.post("/handleSendinblue", async (req, res) => {
//  console.log("handleSendinblue", req.body);
//  await notificationService.handleSendInblueEvent(req.body as SendinblueEvent);
//  res.status(200).json({ status: "done" });
//});

// webhook to receive connecta reward redemption events
app.post("/connectaRewardRedemption", async (req, res) => {
  console.log("connectaRewardRedemption", req.body);
  console.warn("/connectaRewardRedemption", req.body);
  res.status(200).json({ status: "done" });
});

// webhook to receive connecta user update events
app.post("/connectaUserUpdate", async (req, res) => {
  console.log("connectaTrigger", req.body);
  console.warn("/connectaUserUpdate", req.body);
  res.status(200).json({ status: "done" });
});

configureLockerBoxRoutes(app, lockerBoxService);
