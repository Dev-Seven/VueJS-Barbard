import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { UserChecker } from "./helpers/user-checker";

export const reformatPhoneNumbers = new Command("reformat-phone-numbers");

reformatPhoneNumbers
  .description("reformat phone numbers")
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

      userChecker.reformatPhoneNumber(Number(options.batchSize) || 1);

      console.log("Import completed.");
    }),
  );
