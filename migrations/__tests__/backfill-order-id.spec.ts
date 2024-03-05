import { backfillIds } from "../20230316141021-backfill-order-id";
import firebase from "firebase-admin";
import { LocationId } from "@barbaard/types";
import { faker } from "@faker-js/faker";

describe("backfillOrderIds()", () => {
  const firebaseApp = firebase.initializeApp({ projectId: "test" });
  const store = firebaseApp.firestore();

  beforeEach(async () => {
    // clean orders
    await store
      .collection("locations")
      .doc(LocationId.hcmc)
      .collection("orders")
      .get()
      .then(async (docs) => {
        console.log("Cleaning up orders: ", docs.docs.length);
        const promises = docs.docs.map((d) =>
          store
            .collection("locations")
            .doc(LocationId.hcmc)
            .collection("orders")
            .doc(d.id)
            .delete(),
        );
        await Promise.all(promises);
      });
  });

  it("should backfill orderIds sequentially", async () => {
    // create mock location
    await store.collection("locations").doc(LocationId.hcmc).set(
      {
        name: "Hanoi",
      },
      { merge: true },
    );

    // add orders
    for (let i = 0; i < 10; i++) {
      const doc = await store
        .collection("locations")
        .doc(LocationId.hcmc)
        .collection("orders")
        .add({
          closedAt: faker.date.between("2020-01-01T00:00:00.000Z", new Date()),
        });
    }

    const done = await backfillIds(LocationId.hcmc, "HCMC", store, 3, false);

    // expectations
    const updatedLocation: any = await store
      .collection("locations")
      .doc(LocationId.hcmc)
      .get();
    expect(updatedLocation.data().OrderIdSequence).toBe(10);

    const orders = await store
      .collection("locations")
      .doc(LocationId.hcmc)
      .collection("orders")
      .get();
    const orderDocs = orders.docs
      .map((order) => order.data())
      .sort(
        (a: any, b: any) =>
          a.closedAt.toDate().getTime() - b.closedAt.toDate().getTime(),
      );
    expect(orderDocs.map((o) => o.orderId)).toEqual([
      "HCMC-1",
      "HCMC-2",
      "HCMC-3",
      "HCMC-4",
      "HCMC-5",
      "HCMC-6",
      "HCMC-7",
      "HCMC-8",
      "HCMC-9",
      "HCMC-10",
    ]);
  });
});
