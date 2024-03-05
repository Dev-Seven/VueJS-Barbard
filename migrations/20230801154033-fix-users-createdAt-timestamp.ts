import { Command } from "commander";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithFirebase,
  serviceKeyOption,
} from "./helpers/init";
import { UserChecker } from "./helpers/user-checker";

export const fixUsersCreatedAtTimestamp = new Command(
  "fix-users-createdAt-timestamp",
);

fixUsersCreatedAtTimestamp
  .description("fix createdAt timestamp for users")
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

      const ids = await userChecker.getWrongCreatedAtTimestampUsers(
        Number(options.batchSize) || 1,
      );

      console.log(`Found ${ids.length} users with wrong createdAt timestamp`);

      await userChecker.fixCreatedAtTimestamp(ids);

      console.log("Import completed.");
    }),
  );
