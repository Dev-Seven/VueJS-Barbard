import * as functions from "firebase-functions";
import { app } from "./app.js";
import { getConfig, isProd } from "./config.js";
import {
  registerService,
  service,
  notificationService,
  adminService,
  orderService,
  eventService,
  otpService,
} from "./init.js";
import type { Admin } from "./modules/admin/AdminRepository.js";
import type { Session } from "./modules/register/RegisterService.js";
import { migrationsApp } from "./commands/migrations.js";

import { defineSecret } from "firebase-functions/params";

export const slackAPISecret = defineSecret("SLACK_API_KEY");
export const affilateChannel = defineSecret("AFFILIATE_CHANNEL");
import type {
  User,
  Event,
  Order,
  Agreement,
  LocationId,
  BarbaardUser,
} from "@barbaard/types";

import {
  ImportNhanhItems,
  NhanhAccessToken,
  NhanhAppId,
  NhanhBusinessId,
} from "./commands/importNhanhItems.js";

import * as firestore from "firebase-admin/firestore";
import { affiliate, initialization } from "data";
import { brevoAPISecret } from "./sys/brevo/brevo.js";
import {
  MarketManApiKey,
  MarketManApiPassword,
  MarketManBuyerGuid,
  auxPullMarketManItems,
} from "./commands/pullMarketManItems.js";
const config = getConfig();

export const onUserCreate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`users/{uid}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onUserCreate", context.params, {
      uid: context.params.uid,
    });
    await service.onCreateUser(snap.id, snap.data() as User);
  });

export const createBrevoProfile = functions
  .region("asia-east2")
  .runWith({
    maxInstances: config.max_function_instances,
    secrets: [brevoAPISecret],
  })
  .firestore.document(`users/{uid}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("addBrevoUser", context.params, {
      uid: context.params.uid,
    });
    await service.createBrevoProfileAndUpdateDb(
      snap.id,
      snap.data() as BarbaardUser,
    );
  });

export const updateBrevoProfile = functions
  .region("asia-east2")
  .runWith({
    maxInstances: config.max_function_instances,
    secrets: [brevoAPISecret],
  })
  .firestore.document(`users/{uid}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("updateBrevoProfile", context.params, {
        uid: context.params.uid,
      });

      (await service.updateBrevoProfile(
        context.params.uid,
        change.after.data() as BarbaardUser,
      ))
        ? null
        : await service.createBrevoProfileAndUpdateDb(
            change.before.id,
            change.after.data() as BarbaardUser,
          );
    },
  );

export const addTrengoUser = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`users/{uid}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("addTrengoUser", context.params, {
      uid: context.params.uid,
    });
    if (isProd()) {
      await service.addTrengoUser(snap.id, snap.data() as BarbaardUser);
    }
  });

export const onUserUpdate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`users/{uid}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onUserUpdate", context.params, {
        uid: context.params.uid,
      });
      await service.onUpdateUser(
        change.after.id,
        change.after.data() as BarbaardUser,
        change.before.data() as BarbaardUser,
      );
    },
  );

export const updateTrengoUser = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`users/{uid}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("updateTrengoUser", context.params, {
        uid: context.params.uid,
      });
      if (isProd()) {
        await service.updateTrengoUser(
          change.after.data() as User,
          change.before.data() as User,
        );
      }
    },
  );

export const onAppointmentCreate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`locations/{locationId}/events/{eventId}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onAppointmentCreate", context.params);
    await eventService.onCreateAppointment(
      context.params.locationId as LocationId,
      snap.id,
      snap.data() as Event,
    );
  });

export const onAppointmentUpdate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`locations/{locationId}/events/{eventId}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onAppointmentUpdate", context.params);
      await eventService.onUpdateAppointment(
        context.params.locationId as LocationId,
        change.after.id,
        change.after.data() as Event,
        change.before.data() as Event,
      );
    },
  );

export const onAppointmentUpdateNotifications = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`locations/{locationId}/events/{eventId}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onAppointmentUpdateNotifications", context.params);
      await notificationService.sendNotificationsOnAppointmentUpdate(
        context.params.locationId as LocationId,
        change.after.id,
        change.after.data() as Event,
        change.before.data() as Event,
      );
    },
  );

export const onOrderUpdate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`locations/{locationId}/orders/{orderId}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onOrderCreate", context.params);
      await orderService.onUpdateOrder(
        context.params.locationId as LocationId,
        change.after.id,
        change.after.data() as Order,
      );
    },
  );

export const onOrderCompleteAsia = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`locations/{locationId}/orders/{orderId}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onOrderComplete", context.params);
    await orderService.onCompleteOrder(
      context.params.locationId as LocationId,
      snap.id,
      snap.data() as Order,
    );
  });

export const onAdminCreate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`admin/{uid}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onAdminCreate", context.params, {
      uid: context.params.uid,
    });
    await adminService.onCreateAdmin(snap.id, snap.data() as Admin);
  });

export const onAdminUpdate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`admin/{uid}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onAdminUpdate", context.params);
      await adminService.onUpdateAdmin(
        change.after.id,
        change.after.data() as Admin,
        change.before.data() as Admin,
      );
    },
  );

export const onAdminDelete = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`admin/{uid}`)
  .onDelete(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onAdminDelete", context.params, {
      uid: context.params.uid,
    });
    await adminService.onDeleteAdmin(snap.id);
  });

// At 00:00 on day-of-month 1.
export const scheduledKingsAgreementRedemption = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .pubsub.schedule("0 0 1 * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    console.log("scheduledKingsAgreementRedemtption", context.params);
    await service.runKingsAgreementRedemption();
    // At the end of the month, run cloudfunction to create sales and ledger documents
  });

// At 04:00 on day-of-month 1 in January. // runs after scheduledKingsAgreementRedemtption
export const scheduledGentlemenAgreementDeactivation = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .pubsub.schedule("0 4 1 1 *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    console.log("scheduledGentlemenAgreementDeactivation", context.params);
    await service.runAgreementsDeactivation();
    // At the end of the month, run cloudfunction to create sales and ledger documents
  });

// At 00:00 on day-of-month 1.
export const scheduledLockerboxRedemption = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .pubsub.schedule("0 0 1 * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    console.log("scheduledLockerboxRedemtption", context.params);
    await service.runLockerboxRedemption();
    // At the end of the month, run cloudfunction to create sales and ledger documents
  });

// At 12 am every day. // runs after scheduledKingsAgreementRedemtption
// At the end of the month, run cloudfunction to create sales and ledger documents
export const scheduledGiftChequeDeactivation = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .pubsub.schedule("0 0 * * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    console.log("scheduledGiftChequeDeactivation", context.params);
    await service.runGiftChequeDeactivation();
  });

// https://barbaard.atlassian.net/browse/BF-49
// At the end of the day run a script to go trough all users.
export const addCustomerLostTags = functions
  .region("asia-east2")
  .runWith({ maxInstances: 1, timeoutSeconds: 300 })
  .pubsub.schedule("0 1 * * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    console.log("addCustomerLostTag", context.params);
    await service.addCustomerLostTags();
  });

export const pullItemsMarketManCronJob = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 1,
    timeoutSeconds: 300,
    secrets: [MarketManApiKey, MarketManApiPassword, MarketManBuyerGuid],
  })
  .pubsub.schedule("0 4 * * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (ctx) => {
    console.log("Pulling new data from MarketMan", ctx.params);
    const [skuPatched, total] = await auxPullMarketManItems();
    console.log("Pulling MarketMan Result", skuPatched, total);
  });
// export const sendEventReminders = functions.runWith({ maxInstances: config.max_function_instances }).pubsub.schedule('*/15 * * * *').timeZone('Asia/Ho_Chi_Minh').onRun(async (context) => {
//     console.log("sendEventReminders", context.params);
//     await service.runGiftChequeDeactivation();
//     // At the end of the month, run cloudfunction to create sales and ledger documents
// });

// export const onAgreementCreate = functions.runWith({ maxInstances: config.max_function_instances }).firestore.document(`agreements/{agreementId}`).onCreate(async (snap: firestore.DocumentSnapshot, context) => {
//     console.log("onCreateAgreement", context.params);
//     await service.onCreateAgreement(snap.id, snap.data() as Agreement);
// });

// export const onAgreementUpdate = functions.runWith({ maxInstances: config.max_function_instances }).firestore.document(`agreements/{agreementId}`).onUpdate(async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
//     console.log("onAgreementUpdate", context.params);
//     await service.onUpdateAgreement(change.after.id, change.after.data() as Agreement, change.before.data() as Agreement);
// });

export const sendAgreementConfirmationEmail = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`agreements/{agreementId}`)
  .onCreate(async (snap: firestore.DocumentSnapshot, context) => {
    console.log("onCreateAgreement", context.params);
    await notificationService.sendAgreementConfirmationEmail(
      snap.data() as Agreement,
    );
  });

export const notifyMembershipUpdate = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(`users/{uid}`)
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("sendMembershipUpgradeEmail", context.params, {
        uid: context.params.uid,
      });
      await notificationService.sendMembershipUpgradeEmail(
        change.after.id,
        change.after.data() as User,
        change.before.data() as User,
      );
    },
  );

export const serverAsia = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 25,
    timeoutSeconds: 300,
  })
  .https.onRequest(app);

export const onRegisterCloseAsia = functions
  .region("asia-east2")
  .runWith({ maxInstances: config.max_function_instances })
  .firestore.document(
    `locations/{locationId}/registers/{registerId}/sessions/{sessionId}`,
  )
  .onUpdate(
    async (change: functions.Change<firestore.DocumentSnapshot>, context) => {
      console.log("onRegisterClose", context.params);
      await registerService.onRegisterClose(
        context.params.locationId as LocationId,
        context.params.registerId,
        change.after.id,
        change.after.data() as Session,
      );
    },
  );

export const sendOtp = functions
  .region("asia-east2")
  .runWith({
    enforceAppCheck: true,
    maxInstances: 3,
    timeoutSeconds: 300,
  })
  .https.onCall(async (data) => {
    return otpService.sendOtp(data.phoneNumber).catch((err) => {
      throw new functions.https.HttpsError("internal", err.message);
    });
  });

export const checkOtp = functions
  .region("asia-east2")
  .runWith({
    enforceAppCheck: true,
    maxInstances: 3,
    timeoutSeconds: 300,
  })
  .https.onCall(async (data) => {
    return otpService.checkOtp(data.phoneNumber, data.code).catch((err) => {
      throw new functions.https.HttpsError("internal", err.message);
    });
  });

// Migrations:
export const serverMigrations = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 3,
    timeoutSeconds: 540,
  })
  .https.onRequest(migrationsApp);

export const PullNhanhItems = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 3,
    timeoutSeconds: 300,
    secrets: [NhanhAppId, NhanhBusinessId, NhanhAccessToken],
  })
  .https.onRequest(ImportNhanhItems);

export { getBookedTimeSlots } from "./modules/booking/index.js";

export const CreateAffiliate = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 3,
    timeoutSeconds: 300,
    secrets: [slackAPISecret, affilateChannel],
  })
  .https.onCall(async (payload) => {
    try {
      initialization.slack(slackAPISecret.value());
      return affiliate
        .create(affilateChannel.value())
        .execute(payload.uid, payload.code);
    } catch (e) {
      console.warn(e);
      return ["Invalid request"];
    }
  });

export const CheckAffiliate = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 3,
    timeoutSeconds: 300,
  })
  .https.onCall(async (payload) => {
    try {
      return affiliate.check.execute(payload.uid, payload.code);
    } catch (e) {
      console.error(e);
      return ["Invalid request"];
    }
  });

export const DeleteAffiliate = functions
  .region("asia-east2")
  .runWith({
    maxInstances: 3,
    timeoutSeconds: 300,
    secrets: [slackAPISecret, affilateChannel],
  })
  .https.onCall(async (payload) => {
    try {
      initialization.slack(slackAPISecret.value());
      return affiliate
        .delete(affilateChannel.value())
        .execute(payload.uid, payload.code);
    } catch (e) {
      console.warn(e);
      return ["Invalid request"];
    }
  });
