import { Command } from "commander";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { FirestoreRepository } from "./helpers/firestore.repository";
import { capitalize } from "lodash";

export const cap = (val: string = "") =>
  val
    .split(" ")
    .map((v) => capitalize(v))
    .join(" ");

export async function fixUserNames(
  firestoreRepo: FirestoreRepository,
  batchSize: number,
  dryRun: boolean,
) {
  let batchIndex = 0;
  for await (const users of firestoreRepo.fetchAllUsers(batchSize)) {
    console.log(`Processing batch ${batchIndex++}`);
    const promises = users.map(async (doc) => {
      const user = doc.doc;
      const firstName = cap(user.firstName || "");
      const lastName = cap(user.lastName || "");
      const fullName = `${firstName} ${lastName}`;
      if (
        user.firstName !== firstName ||
        user.lastName !== lastName ||
        user.fullName !== fullName
      ) {
        if (!dryRun) {
          console.log(
            `Update ${doc.id}: (${user.firstName},${user.lastName},${user.fullName}) -> (${firstName},${lastName},${fullName})`,
          );
          await firestoreRepo.updateUser(doc.id, {
            firstName,
            lastName,
            fullName,
          });
        } else {
          console.log(
            `Will update ${doc.id}: (${user.firstName},${user.lastName},${user.fullName}) -> (${firstName},${lastName},${fullName})`,
          );
        }
      }
    });
    await Promise.all(promises);
  }
}

export const fixUsernameCase = new Command("fix-username-case");

fixUsernameCase
  .description("Command to fix username case. eg. 'john doe' -> 'John Doe'")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .option(
    "--batch-size <batchSize>",
    "number of users to process at the same time",
  )
  .action(
    runWithFirebase((fbApp, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      return fixUserNames(
        firestoreRepo,
        Number(options.batchSize) || 1,
        options.dryRun,
      );
    }),
  );
