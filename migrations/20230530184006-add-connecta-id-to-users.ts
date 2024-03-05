import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { UserChecker } from "./helpers/user-checker";

export const addConnectaIdToUsers = new Command("add-connecta-id-to-users");

addConnectaIdToUsers
  .description("add connecta id to users who dont have it yet")
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

      userChecker.addConnectaId(Number(options.batchSize) || 1);

      console.log("Import completed.");
    }),
  );
