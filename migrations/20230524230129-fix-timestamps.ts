import firebase from "firebase-admin";
import { LocationId, Order } from "@barbaard/types";
import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { FirestoreRepository } from "./helpers/firestore.repository";
import { isPlainObject } from "lodash";

export const updateTimestamps = async (
  firebaseApp: firebase.app.App,
  dryRun: boolean,
) => {
  const store = firebaseApp.firestore();
  const batchSize = 100;
  const repostory = new FirestoreRepository(store);
  await updateOpenedAtOfSessions(repostory, batchSize, dryRun);
  await updateOrderDates(repostory, batchSize, dryRun);
  console.log("Done");
};

const isConversionRequired = (date: any) =>
  !(date instanceof firebase.firestore.Timestamp) &&
  isPlainObject(date) &&
  date.seconds >= 0 &&
  date.nanoseconds >= 0;

const convertToTimestamp = (date: any) =>
  new firebase.firestore.Timestamp(date.seconds, date.nanoseconds);

export async function updateOpenedAtOfSessions(
  repository: FirestoreRepository,
  batchSize: number,
  dryRun: boolean,
) {
  for await (const locations of repository.fetchAllLocations(batchSize)) {
    for (const location of locations) {
      for await (const registers of repository.fetchAllRegisters(
        location.id,
        batchSize,
      )) {
        for (const register of registers) {
          for await (const sessions of repository.fetchAllSessions(
            location.id,
            register.id,
            batchSize,
          )) {
            for (const session of sessions) {
              if (session.doc.openedAt) {
                if (isConversionRequired(session.doc.openedAt)) {
                  if (!dryRun) {
                    console.log(
                      `Update ${location.id}/registers/${register.id}/sessions/${session.id}`,
                    );
                    await repository.updateSession(
                      location.id,
                      register.id,
                      session.id,
                      {
                        openedAt: convertToTimestamp(session.doc.openedAt),
                      },
                    );
                  } else {
                    console.log(
                      `Will Update ${location.id}/registers/${register.id}/sessions/${session.id}`,
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export async function updateOrderDates(
  repository: FirestoreRepository,
  batchSize: number,
  dryRun: boolean,
) {
  for await (const locations of repository.fetchAllLocations(batchSize)) {
    for (const location of locations) {
      let processed = 0;
      for await (const orders of repository.fetchAllOrders(
        location.id,
        batchSize,
      )) {
        console.log(
          `Location ${location.id}, Completed  ${(processed += orders.length)}`,
        );
        for (const order of orders) {
          const orderUpdates: Partial<Order> = {};
          if (isConversionRequired(order.doc.createdAt)) {
            orderUpdates.createdAt = convertToTimestamp(order.doc.createdAt);
          }
          if (isConversionRequired(order.doc.updatedAt)) {
            orderUpdates.updatedAt = convertToTimestamp(order.doc.updatedAt);
          }
          if (order.doc.eventItem) {
            const eventItem = order.doc.eventItem;
            if (isConversionRequired(eventItem.createdAt)) {
              orderUpdates["eventItem.createdAt"] = convertToTimestamp(
                eventItem.createdAt,
              );
            }
            if (isConversionRequired(eventItem.updatedAt)) {
              orderUpdates["eventItem.updatedAt"] = convertToTimestamp(
                eventItem.updatedAt,
              );
            }
            if (isConversionRequired(eventItem.startDate)) {
              orderUpdates["eventItem.startDate"] = convertToTimestamp(
                eventItem.startDate,
              );
            }
            if (isConversionRequired(eventItem.endDate)) {
              orderUpdates["eventItem.endDate"] = convertToTimestamp(
                eventItem.endDate,
              );
            }
            if (isConversionRequired(eventItem.reminderDate)) {
              orderUpdates["eventItem.reminderDate"] = convertToTimestamp(
                eventItem.reminderDate,
              );
            }
          }
          if (Object.keys(orderUpdates).length > 0) {
            if (!dryRun) {
              console.log(`Update ${location.id}/orders/${order.id}`);
              await repository.updateOrder(location.id, order.id, orderUpdates);
            } else {
              console.log(`Will update ${location.id}/orders/${order.id}`);
            }
          }
        }
      }
    }
  }
}

export const fixTimestampsV2 = new Command("fix-timestamps-v2");

fixTimestampsV2
  .description("Command to fix timestamps")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .action(
    runWithFirebase((fbApp, options) =>
      updateTimestamps(fbApp, options.dryRun),
    ),
  );
