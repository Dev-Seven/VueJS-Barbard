import firebase from "firebase-admin";
import { Order } from "@barbaard/types";
import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { FirestoreRepository } from "./helpers/firestore.repository";

export const fixAllSalesPersons = async (
  firebaseApp: firebase.app.App,
  dryRun: boolean,
) => {
  const store = firebaseApp.firestore();
  const batchSize = 100;
  const repostory = new FirestoreRepository(store);
  await updateSalesPerson(repostory, batchSize, dryRun);
  console.log("Done");
};
export async function updateSalesPerson(
  repository: FirestoreRepository,
  batchSize: number,
  dryRun: boolean,
) {
  for await (const locations of repository.fetchAllLocations(batchSize)) {
    for (const location of locations) {
      for await (const orders of repository.fetchAllOrders(
        location.id,
        batchSize,
      )) {
        for (const order of orders) {
          if (!order.doc.eventItem) {
            continue;
          }
          const service = order.doc.eventItem.services?.[0];
          if (!service) {
            continue;
          }
          if (!dryRun) {
            console.log(`Update ${location.id}/orders/${order.id}`);
            const update: Partial<Order> = {
              staffId: service.staffId,
              staffName: service.staff,
              products: (order.doc.products || []).map((product) => ({
                ...product,
                salesPerson: {
                  ...product.salesPerson,
                  staffId: service.staffId,
                  staffName: service.staff,
                },
              })),
            };
            await repository.updateOrder(location.id, order.id, update);
          } else {
            console.log(`Will Update ${location.id}/orders/${order.id}`);
          }
        }
      }
    }
  }
}

export const fixSalesPerson = new Command("fix-sales-person");

fixSalesPerson
  .description("Fix sales persons")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .action(
    runWithFirebase((fbApp, options) =>
      fixAllSalesPersons(fbApp, options.dryRun),
    ),
  );
