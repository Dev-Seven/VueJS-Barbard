import { Command } from "commander";
import { runWithFirebase, serviceKeyOption } from "./helpers/init";

import * as firebase from "firebase-admin";

export default new Command("unify_affiliate_data")
  .description("change schema")
  .addOption(serviceKeyOption)
  .action(
    runWithFirebase(async (fbApp) => {
      console.log("Getting user data");
      const userCollection = fbApp.firestore().collection("users");

      (
        await userCollection
          .orderBy(firebase.firestore.FieldPath.documentId())
          .get()
      ).docs
        .map<[id: string, user: any]>((d) => [d.id, d.data()])
        .filter(
          ([, user]) =>
            user.referrals ||
            user.referredById ||
            user.referredByName ||
            user.refferedRedeemed ||
            user.referreds ||
            (user.referreds?.length ?? 1) == 0 ||
            user.referrer,
        )
        .map<[id: string, payload: object]>(([id, u]) => [
          id,
          {
            referrals:
              u.referrals && u.referrals.length
                ? u.referrals.map((r: any) => ({
                    ...(r.id ? { id: r.id } : {}),
                    ...(r.date ? { date: r.date } : {}),
                    ...(r.userName ? { userName: r.userName } : {}),
                  }))
                : firebase.firestore.FieldValue.delete(),
            referrer:
              u.referredById || u.referredByName
                ? {
                    userName:
                      u.referredByName ??
                      firebase.firestore.FieldValue.delete(),
                    id:
                      u.referredById ?? firebase.firestore.FieldValue.delete(),
                  }
                : firebase.firestore.FieldValue.delete(),
            referreds: firebase.firestore.FieldValue.delete(),
            referredById: firebase.firestore.FieldValue.delete(),
            referredByName: firebase.firestore.FieldValue.delete(),
            refferedRedeemed: firebase.firestore.FieldValue.delete(),
          },
        ])
        .forEach(async ([id, p], i, arr) => {
          setTimeout(
            () =>
              userCollection
                .doc(id)
                .update(p)
                .then(
                  () => console.log("applied", id),
                  (e) => console.error("failed", id, e),
                )
                .finally(() => console.log(`status ${i}/${arr.length}`)),
            500 * i,
          );
        });
    }),
  );
