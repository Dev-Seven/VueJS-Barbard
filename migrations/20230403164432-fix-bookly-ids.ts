import { Command } from "commander";
import { EventImportor } from "./helpers/event-importor";
import { FirestoreRepository } from "./helpers/firestore.repository";
import {
  dryRunOption,
  runWithWordpressAndFirestore,
  serviceKeyOption,
  wordpressDatabase,
  wordpressHost,
  wordpressPassword,
  wordpressPort,
  wordpressUsername,
} from "./helpers/init";
import { WordpressRepository } from "./helpers/worpress.repository";

export const fixBooklyIds = new Command("fix-bookly-ids");

fixBooklyIds
  .description("Fix bookly ids")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .addOption(wordpressHost)
  .addOption(wordpressPort)
  .addOption(wordpressUsername)
  .addOption(wordpressPassword)
  .addOption(wordpressDatabase)
  .option(
    "--batch-size <batchSize>",
    "number of events to process at the same time",
  )
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);
      // import agreements
      await new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).fixBooklyIds(Number(options.batchSize) || 1);
      console.log("Completed.");
    }),
  );
