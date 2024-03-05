import firebase from "firebase-admin";
import { LocationId } from "@barbaard/types";
import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";

export const fixLedgeOrderIds = async (
  app: firebase.app.App,
  dryRun: boolean,
) => {
  const store = app.firestore();
  const batchSize = 100;
  await fixLedger(LocationId.hanoi, store, batchSize, dryRun);
  await fixLedger(LocationId.hcmc, store, batchSize, dryRun);
  console.log("Ledger entries fixed");
};

export const fixLedger = async (
  location: LocationId,
  store: firebase.firestore.Firestore,
  batchSize: number,
  dryRun: boolean,
) => {
  console.log(`Processing ledgers from ${location}`);
  for await (const ledgers of fetchLedgers(location, store, batchSize)) {
    const promises = ledgers.map(async (ledger) => {
      const _data = ledger.data();

      // [orderId] document id will be VdzSCQSCbpghM4pc6CtG formed &
      // [order] order id will be XX-NN formatted, if not corret it.
      if (_data.orderId && _data.orderId.toString().includes("-")) {
        console.log(`Will update ${location}/ledger/${ledger.id}`);
        if (!dryRun) {
          console.log(`Updated ${location}/ledger/${ledger.id}`);
          const orderId = _data.order;
          const order = _data.orderId;
          await store
            .collection(`locations/${location}/ledger`)
            .doc(ledger.id)
            .update({
              orderId,
              order,
            });
        }
      } else if (typeof _data.orderId === "number") {
        // get the order and fix both ids
        const doc = await store
          .collection(`locations/${location}/orders`)
          .doc(_data.order)
          .get();
        if (!doc.exists) {
          console.log(
            `skipping ${location}/ledger/${ledger.id} as no order matched`,
          );
        }
        const _doc = doc.data();

        if (!dryRun) {
          console.log(
            `Ledger entry ${location}/ledger/${ledger.id} updated to orderId: ${doc.id} & order: ${_doc.orderId}`,
          );

          await store
            .collection(`locations/${location}/ledger`)
            .doc(ledger.id)
            .update({
              orderId: doc.id,
              order: _doc.orderId,
            });
        } else {
          console.log(
            `Ledger entry ${location}/ledger/${ledger.id} will update to orderId: ${doc.id} & order: ${_doc.orderId}`,
          );
        }
      }
    });
    await Promise.all(promises);
  }
};

async function* fetchLedgers(
  location: LocationId,
  store: firebase.firestore.Firestore,
  batchSize: number,
) {
  let pointer: string | undefined = undefined;
  let query = store
    .collection(`locations/${location}/ledger`)
    .orderBy("date", "asc")
    .limit(batchSize);
  if (pointer) {
    query = query.startAfter(pointer);
  }
  let docs = await query.get();
  while (docs.docs.length > 0) {
    yield docs.docs;
    pointer = docs.docs[docs.docs.length - 1].data().date;
    let query = store
      .collection(`locations/${location}/ledger`)
      .orderBy("date", "asc")
      .limit(batchSize);
    if (pointer) {
      query = query.startAfter(pointer);
    }
    docs = await query.get();
  }
}

export const fixLedgerOrderIdCmd = new Command("fix-ledger-order-id");

fixLedgerOrderIdCmd
  .description("Command to fix ledger order/orderId inconsistancy")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .action(
    runWithFirebase((fbApp, options) =>
      fixLedgeOrderIds(fbApp, options.dryRun),
    ),
  );
