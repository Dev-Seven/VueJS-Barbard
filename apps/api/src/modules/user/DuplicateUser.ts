import type { User } from "@barbaard/types";
import admin from "firebase-admin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import lodash from "lodash";
import type { AgreementUser } from "../../types.js";

export async function* getAllDocumentsInChunks(
  query: admin.firestore.Query<admin.firestore.DocumentData>,
  chunkSize: number,
) {
  let lastDocument: QueryDocumentSnapshot | null | undefined = null;

  while (true) {
    let currentQuery = query;

    if (lastDocument) {
      currentQuery = query.startAfter(lastDocument);
    }

    const snapshot = await currentQuery.limit(chunkSize).get();

    if (snapshot.size === 0) {
      // No more documents to fetch, break the loop
      break;
    }

    lastDocument = snapshot.docs[snapshot.docs.length - 1];

    // Yield the chunk of documents to the loop
    yield snapshot;
  }
}

interface MigrateUserDataArgs {
  primaryUser: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
  secondaryUsers: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>[];
}

export async function MigrateUserData({
  primaryUser,
  secondaryUsers,
}: MigrateUserDataArgs) {
  const primaryUserData = primaryUser.data() as User;
  const secondaryUsersData = secondaryUsers.map((u) => u.data() as User);
  const tags: string[] = primaryUserData?.tags ?? [];
  secondaryUsersData.forEach((u) => {
    if (u.tags) {
      tags.push(...u.tags);
    }
  });

  const merge = {
    ...secondaryUsersData.reduce(
      (previousValue, currentValue) => ({
        ...previousValue,
        ...currentValue,
      }),
      {},
    ),
    ...primaryUserData,
    tags: lodash.uniq(tags),
    mergeUserIds: secondaryUsers.map((u) => u.id),
  };

  await primaryUser.ref.update(merge);
}

interface UpdateLinkedDocumentsArgs {
  db: admin.firestore.Firestore;
  primaryUser: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
  secondaryUsers: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>[];
  chunkSize: number;
}

export async function UpdateLinkedDocuments({
  db,
  primaryUser,
  secondaryUsers,
  chunkSize,
}: UpdateLinkedDocumentsArgs) {
  const primaryUserData = primaryUser.data() as User;

  for await (const secondaryUser of secondaryUsers) {
    // agreements
    for await (const { docs } of getAllDocumentsInChunks(
      db
        .collection("agreements")
        .orderBy("__name__")
        .where("users", "array-contains", {
          userId: secondaryUser.id,
          userName: secondaryUser.data()?.fullName,
        }),
      chunkSize,
    )) {
      const batch = db.batch();

      docs.forEach((doc) => {
        const data = doc.data();

        data.users.forEach((u: AgreementUser, index: number) => {
          if (u.userId === secondaryUser.id) {
            // Update userMap
            delete data.userMap[secondaryUser.id];
            data.userMap[primaryUser.id] = true;

            // update users
            data.users[index].userId = primaryUser.id;
            data.users[index].userName = primaryUserData.fullName ?? "";
          }
        });

        batch.set(doc.ref, data);
      });

      await batch.commit();
    }

    // communications
    for await (const { docs } of getAllDocumentsInChunks(
      db
        .collection("communications")
        .orderBy("__name__")
        .where("userId", "==", secondaryUser.id),
      chunkSize,
    )) {
      const batch = db.batch();

      docs.forEach((doc) => {
        const data = doc.data();
        data.userId = primaryUser.id;
        data.userName = primaryUserData.fullName;

        batch.set(doc.ref, data);
      });

      await batch.commit();
    }

    // giftcheques
    for await (const { docs } of getAllDocumentsInChunks(
      db
        .collection("giftcheques")
        .orderBy("__name__")
        .where("userId", "==", secondaryUser.id),
      chunkSize,
    )) {
      const batch = db.batch();

      docs.forEach((doc) => {
        const data = doc.data();
        data.userId = primaryUser.id;
        data.userName = primaryUserData.fullName ?? "";

        batch.set(doc.ref, data);
      });

      await batch.commit();
    }

    const { docs: LocationDocs } = await db.collection("locations").get();
    await Promise.all(
      LocationDocs.map(async (location) => {
        // events
        for await (const { docs } of getAllDocumentsInChunks(
          location.ref
            .collection("events")
            .orderBy("__name__")
            .where("userId", "==", secondaryUser.id),
          chunkSize,
        )) {
          const batch = db.batch();

          docs.forEach((doc) => {
            const data = doc.data();
            data.userId = primaryUser.id;
            data.userName = primaryUserData.fullName;
            data.userTags = primaryUserData.tags;

            batch.set(doc.ref, data);
          });

          await batch.commit();
        }

        // orders
        for await (const { docs } of getAllDocumentsInChunks(
          location.ref
            .collection("orders")
            .orderBy("__name__")
            .where("userId", "==", secondaryUser.id),
          chunkSize,
        )) {
          const batch = db.batch();

          docs.forEach((doc) => {
            const data = doc.data();
            data.userId = primaryUser.id;
            data.userName = primaryUserData.fullName;
            data.userTags = primaryUserData.tags;

            batch.set(doc.ref, data);
          });

          await batch.commit();
        }

        // ledger
        for await (const { docs } of getAllDocumentsInChunks(
          location.ref
            .collection("ledger")
            .orderBy("__name__")
            .where("userId", "==", secondaryUser.id),
          chunkSize,
        )) {
          const batch = db.batch();

          docs.forEach((doc) => {
            const data = doc.data();
            data.userId = primaryUser.id;
            data.userName = primaryUserData.fullName;

            batch.set(doc.ref, data);
          });

          await batch.commit();
        }

        // lockerbox
        for await (const { docs } of getAllDocumentsInChunks(
          location.ref
            .collection("lockerbox")
            .orderBy("__name__")
            .where("userId", "==", secondaryUser.id),
          chunkSize,
        )) {
          const batch = db.batch();

          docs.forEach((doc) => {
            const data = doc.data();
            data.userId = primaryUser.id;
            data.userName = primaryUserData.fullName;

            batch.set(doc.ref, data);
          });

          await batch.commit();
        }
      }),
    );
  }
}
