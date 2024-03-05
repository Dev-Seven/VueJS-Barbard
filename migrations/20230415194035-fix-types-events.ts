import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { EventChecker } from "./helpers/event-checker";
import { createWriteStream } from "fs";

export const fixTypesEvents = new Command("fix-types-events");

process.env.TZ = "Asia/Ho_Chi_Minh";

fixTypesEvents
  .description("Fix booklyId type for Event doc")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .option(
    "--batch-size <batchSize>",
    "number of events to process at the same time",
  )
  .action(
    runWithFirebase(async (fbApp, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const unCertainCasesFile = createWriteStream(
        "./uncertain-fix-types-events.csv",
      );
      unCertainCasesFile.write(`eventRef,userId,userName\n`);

      const eventChecker = new EventChecker(
        options.dryRun,
        firestoreRepo,
        unCertainCasesFile,
      );

      console.log("Processing hcmc events");
      await eventChecker.fixEventTypes("hcmc", Number(options.batchSize) || 1);

      console.log("Processing hanoi events");
      await eventChecker.fixEventTypes("hanoi", Number(options.batchSize) || 1);

      console.log("Completed.");
    }),
  );
