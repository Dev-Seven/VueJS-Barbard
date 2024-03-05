import firebase from "firebase-admin";
import {
  updateOrderDates,
  updateOpenedAtOfSessions,
} from "../20230524230129-fix-timestamps";
import { updateSalesPerson } from "../20230606194955-fix-sales-person";
import { FirestoreRepository } from "../helpers/firestore.repository";

describe("fix-sales-persons", () => {
  const firebaseApp = firebase.initializeApp({ projectId: "test" });
  const store = firebaseApp.firestore();
  const repository = new FirestoreRepository(store);

  const testLocation = "test-location";
  const testOrder = "test-order";

  beforeEach(async () => {
    // clean database
    await store.doc(`locations/${testLocation}`).delete();
    await store.doc(`locations/${testLocation}/orders/${testOrder}`).delete();
  });

  it("updateSalesPerson() should update orders", async () => {
    // create mock location
    await store.doc(`locations/${testLocation}`).set({});
    await store.doc(`locations/${testLocation}/orders/${testOrder}`).set({
      eventItem: {
        services: [
          {
            staffId: "test-id",
            staff: "Test Guy",
          },
        ],
      },
      products: [
        {
          id: "test-product-id-1",
          name: "Test Product 1",
        },
        {
          id: "test-product-id-2",
          name: "Test Product 2",
        },
      ],
    });

    await updateSalesPerson(repository, 1, false);
    const updated = await store
      .doc(`locations/${testLocation}/orders/${testOrder}`)
      .get();
    expect(updated.data()).toEqual(
      expect.objectContaining({
        staffId: "test-id",
        staffName: "Test Guy",
        products: expect.arrayContaining([
          expect.objectContaining({
            id: "test-product-id-1",
            name: "Test Product 1",
            salesPerson: {
              staffId: "test-id",
              staffName: "Test Guy",
            },
          }),
          ,
          expect.objectContaining({
            id: "test-product-id-2",
            name: "Test Product 2",
            salesPerson: {
              staffId: "test-id",
              staffName: "Test Guy",
            },
          }),
        ]),
      }),
    );
  });
});
