import express from "express";
import { LockerBoxService } from "./LockerBoxService.js";

export const configureLockerBoxRoutes = (
  app: express.Application,
  lockerBoxService: LockerBoxService,
) => {
  app.post(`/get-locker-box`, async (req, res) => {
    console.log(req.body);
    const activeLockerBoxes = await lockerBoxService.getActiveLockerBox(
      req.body,
    );
    if (activeLockerBoxes.length == 0) {
      res.status(404).json({ error: "No active lockerbox found" });
      return;
    }
    res.json({ lockerbox: activeLockerBoxes[0]?.doc.number });
  });
};
