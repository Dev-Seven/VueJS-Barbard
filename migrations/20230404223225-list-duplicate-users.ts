import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  runWithWordpressAndFirestore,
  serviceKeyOption,
  wordpressDatabase,
  wordpressHost,
  wordpressPassword,
  wordpressPort,
  wordpressUsername,
} from "./helpers/init";
import { UserChecker } from "./helpers/user-checker";

export const listDuplicateUsers = new Command("list-duplicate-users");

listDuplicateUsers
  .description("List duplicate users")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .option(
    "--batch-size <batchSize>",
    "number of users to process at the same time",
  )
  .action(
    runWithFirebase(async (fbApp, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      // import agreements
      await new UserChecker(options.dryRun, firestoreRepo).listDuplicates(
        Number(options.batchSize) || 1,
      );
      console.log("Completed.");
    }),
  );
