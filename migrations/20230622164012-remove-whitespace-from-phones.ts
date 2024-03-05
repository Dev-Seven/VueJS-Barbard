import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { UserChecker } from "./helpers/user-checker";

export const removeWhitespaceFromPhones = new Command(
  "remove-whitespace-from-phones",
);

removeWhitespaceFromPhones
  .description("remove whitespaces from phone numbers")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .option(
    "--batch-size <batchSize>",
    "number of users to process at the same time",
  )
  .action(
    runWithFirebase(async (fbApp, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());

      const userChecker = new UserChecker(options.dryRun, firestoreRepo);

      userChecker.removeWhitespaceFromPhones(Number(options.batchSize) || 1);

      console.log("Import completed.");
    }),
  );
