import firebase from "firebase-admin";
import { LocationId } from "@barbaard/types";
import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";

export const backfillOrderIds = async (
  firebaseApp: firebase.app.App,
  dryRun: boolean,
) => {
  const store = firebaseApp.firestore();
  const batchSize = 100;
  await backfillIds(LocationId.hanoi, "HN", store, batchSize, dryRun);
  await backfillIds(LocationId.hcmc, "HCMC", store, batchSize, dryRun);
  console.log("Done");
};

export async function backfillIds(
  location: LocationId,
  prefix: string,
  store: firebase.firestore.Firestore,
  batchSize: number,
  dryRun: boolean,
) {
  console.log(`Processing orders from ${location}`);
  let currentId = 0;
  for await (const orders of fetchOrders(location, store, batchSize)) {
    const promises = orders.map(async (order) => {
      currentId++;
      console.log(
        `Will update ${location}/${order.id} to ${prefix}-${currentId}`,
      );
      if (!dryRun) {
        console.log(`Update ${location}/${order.id}`);
        await store
          .collection("locations")
          .doc(location)
          .collection("orders")
          .doc(order.id)
          .update({
            orderId: `${prefix}-${currentId}`,
          });
      }
    });
    await Promise.all(promises);
  }
  // save current id at location.OrderIdSequence
  if (!dryRun) {
    console.log(`Update ${location} to ${currentId}`);
    await store.collection("locations").doc(location).update({
      OrderIdSequence: currentId,
    });
  }
}

async function* fetchOrders(
  location: LocationId,
  store: firebase.firestore.Firestore,
  batchSize: number,
) {
  const limit = batchSize;
  let lastDocumentClosedAt: string | undefined = undefined;
  let query = store
    .collection("locations")
    .doc(location)
    .collection("orders")
    .orderBy("closedAt", "asc")
    .limit(limit);
  if (lastDocumentClosedAt) {
    query = query.startAfter(lastDocumentClosedAt);
  }
  let docs = await query.get();
  while (docs.docs.length > 0) {
    yield docs.docs;
    lastDocumentClosedAt = docs.docs[docs.docs.length - 1].data().closedAt;
    let query = store
      .collection("locations")
      .doc(location)
      .collection("orders")
      .orderBy("closedAt", "asc")
      .limit(limit);
    if (lastDocumentClosedAt) {
      query = query.startAfter(lastDocumentClosedAt);
    }
    docs = await query.get();
  }
}

export const backfillOrderIdCmd = new Command("backfill-order-id");

backfillOrderIdCmd
  .description("Command to backfill order ids")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .action(
    runWithFirebase((fbApp, options) =>
      backfillOrderIds(fbApp, options.dryRun),
    ),
  );
