import * as functions from "firebase-functions";
import { bookingService } from "../../init.js";

export const getBookedTimeSlots = functions
  .region("asia-east2")
  .runWith({
    enforceAppCheck: true,
    timeoutSeconds: 300,
  })
  .https.onCall(async (data) => {
    console.log({ data });
    return bookingService
      .getBookedTimeSlots(
        data.location,
        new Date(data.startDate),
        new Date(data.endDate),
      )
      .catch((err) => {
        throw new functions.https.HttpsError("internal", err.message);
      });
  });
