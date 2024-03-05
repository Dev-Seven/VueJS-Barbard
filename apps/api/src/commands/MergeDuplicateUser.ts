import admin from "firebase-admin";
import functions from "firebase-functions";
import {
  MigrateUserData,
  UpdateLinkedDocuments,
} from "../modules/user/DuplicateUser.js";

export async function MergeDuplicateUser(
  req: functions.https.Request,
  res: functions.Response,
): Promise<void> {
  try {
    if (req.method !== "POST") {
      throw Error("Method not supported");
    }

    const { primaryUserId, secondaryUserIds } = req.body;
    if (
      !primaryUserId ||
      !secondaryUserIds ||
      !Array.isArray(secondaryUserIds) ||
      secondaryUserIds.length === 0
    ) {
      throw Error(
        "invalid payload, use schema { primaryUserId: string, secondaryUserIds: string[] }",
      );
    }

    let chunkSize = req.body?.chunkSize ? Number(req.body?.chunkSize) : 3000;
    if (Number.isNaN(chunkSize) || chunkSize < 1 || chunkSize > 10000) {
      chunkSize = 3000;
    }

    const db = admin.firestore();

    let primaryUser = await db.collection("users").doc(primaryUserId).get();
    if (!primaryUser.exists) {
      throw Error(`Primary user ${primaryUser.id} does not exist`);
    }

    const secondaryUsers = await Promise.all(
      secondaryUserIds.map((u) => db.collection("users").doc(u).get()),
    );

    secondaryUsers.forEach((u) => {
      if (!u.exists) {
        throw Error(`Secondary user ${u.id} does not exist`);
      }
    });

    if (secondaryUsers.length === 0) {
      throw Error("Please provide at least one secondary user");
    }

    await MigrateUserData({ primaryUser, secondaryUsers });
    primaryUser = await primaryUser.ref.get();

    await UpdateLinkedDocuments({
      db,
      primaryUser,
      secondaryUsers,
      chunkSize,
    });

    // Delete secondary users
    const isDeleteFalse = req.body?.delete === false;
    if (!isDeleteFalse) {
      await Promise.all(
        secondaryUsers.map(async (u) => {
          await u.ref.delete();
        }),
      );
    }

    res.status(200).json({
      message: "user migrated successfully",
      deletedSecondaryUsers: !isDeleteFalse,
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error?.message ?? "something went wrong" });
  }
}
