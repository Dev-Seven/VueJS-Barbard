import { Command } from "commander";
import { UserChecker } from "./helpers/user-checker";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";

export const fixTypesUsers = new Command("fix-types-users");

process.env.TZ = "Asia/Ho_Chi_Minh";

fixTypesUsers
  .description("Fix wpId, booklyId types for User doc")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .option(
    "--batch-size <batchSize>",
    "number of users to process at the same time",
  )
  .action(
    runWithFirebase(async (fbApp, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      await new UserChecker(options.dryRun, firestoreRepo).fixUserTypes(
        Number(options.batchSize) || 1,
      );
      console.log("Completed.");
    }),
  );
