import firebase from "firebase-admin";
import { LocationId } from "@barbaard/types";
import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";

export const fixLedgerDate = async (app: firebase.app.App, dryRun: boolean) => {
  const store = app.firestore();
  const batchSize = 100;
  await fixLedger(LocationId.hanoi, store, batchSize, dryRun);
  await fixLedger(LocationId.hcmc, store, batchSize, dryRun);
  console.log("Ledger entries date timestamps fixed");
};

export const fixLedger = async (
  location: LocationId,
  store: firebase.firestore.Firestore,
  batchSize: number,
  dryRun: boolean,
) => {
  console.log(`Processing ledgers from ${location}`);
  const malformedObject = JSON.stringify({ ".sv": "timestamp" });
  for await (const ledgers of fetchLedgers(location, store, batchSize)) {
    const promises = ledgers.map(async (ledger) => {
      const _data = ledger.data();

      // case where RTDB timestamp was written to Firestore
      if (JSON.stringify(_data.date) === malformedObject) {
        const doc = await store
          .collection(`locations/${location}/orders`)
          .doc(_data.orderId)
          .get();
        if (!doc.exists) {
          console.log(
            `skipping ${location}/ledger/${ledger.id} as no order matched`,
          );
        }
        const _doc = doc.data();

        if (!dryRun) {
          await store
            .collection(`locations/${location}/ledger`)
            .doc(ledger.id)
            .update({
              date: _doc.closedAt,
            });
          console.log(
            `Ledger ${location}/ledger/${
              ledger.id
            } updated to date: ${_doc.closedAt.toDate()}`,
          );
        } else {
          console.log(
            `Ledger ${location}/ledger/${
              ledger.id
            } will update to date: ${_doc.closedAt.toDate()}`,
          );
        }

        const giftcheque = await store
          .collection("giftcheques")
          .where("orderId", "==", doc.id)
          .get();
        if (!giftcheque.empty) {
          const giftchequeUpdates = giftcheque.docs.map(async (cheque) => {
            const chequeDoc = cheque.data();

            if (JSON.stringify(chequeDoc.purchasedAt) === malformedObject) {
              if (!dryRun) {
                await store.collection(`giftcheques`).doc(cheque.id).update({
                  purchasedAt: _doc.closedAt,
                });
                console.log(
                  `GiftCheque giftcheques/${
                    cheque.id
                  } updated to date: ${_doc.closedAt.toDate()}`,
                );
              } else {
                console.log(
                  `GiftCheque giftcheques/${
                    cheque.id
                  } will update to date: ${_doc.closedAt.toDate()}`,
                );
              }
            }
          });

          await Promise.all(giftchequeUpdates);
        }

        const agreements = await store
          .collection("agreements")
          .where("orderId", "==", doc.id)
          .get();
        if (!agreements.empty) {
          const agreementUpdates = agreements.docs.map(async (agreement) => {
            const _agreement = agreement.data();

            const updates: Record<string, unknown> = {};
            if (JSON.stringify(_agreement.purchasedAt) === malformedObject) {
              updates.purchasedAt = _doc.closedAt;
            }

            if (JSON.stringify(_agreement.createdAt) === malformedObject) {
              updates.createdAt = _doc.closedAt;
            }

            if (!dryRun) {
              await store
                .collection(`agreements`)
                .doc(agreement.id)
                .update(updates);
              console.log(
                `Agreement agreements/${
                  agreement.id
                } updated to createdAt/purchasedAt: ${_doc.closedAt.toDate()}`,
              );
            } else {
              console.log(
                `Agreement agreements/${
                  agreement.id
                } will update to createdAt/purchasedAt: ${_doc.closedAt.toDate()}`,
              );
            }
          });

          await Promise.all(agreementUpdates);
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

export const fixLedgerDateCmd = new Command("fix-timestamps");

fixLedgerDateCmd
  .description(
    "Command to fix ledger, giftcheque, agreements date/timestamp issue",
  )
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .action(
    runWithFirebase((fbApp, options) => fixLedgerDate(fbApp, options.dryRun)),
  );
