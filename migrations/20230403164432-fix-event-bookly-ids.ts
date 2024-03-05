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
import { createWriteStream } from "fs";

export const fixEventBooklyIds = new Command("fix-event-bookly-ids");

process.env.TZ = "Asia/Ho_Chi_Minh";

fixEventBooklyIds
  .description("Fix bookly ids: (wordpress)id -> appointment_id")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .addOption(wordpressHost)
  .addOption(wordpressPort)
  .addOption(wordpressUsername)
  .addOption(wordpressPassword)
  .addOption(wordpressDatabase)
  .requiredOption("--start-date <startDate>", "start date")
  .requiredOption("--end-date <startDate>", "end date")
  .option(
    "--batch-size <batchSize>",
    "number of events to process at the same time",
  )
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);

      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);

      const unCertainCasesFile = createWriteStream(
        "./uncertain-cases-fix-bookly-ids.csv",
      );
      // unCertainCasesFile.write(`Location,EventId,WordpressUserId,FirestoreUserId,WpIdLinkedToFsUser\n`);
      unCertainCasesFile.write(
        `status,eventRef,event.booklyId,is_in_wordpress,userId\n`,
      );
      const duplicateBooklyId = createWriteStream(
        "./uncertain-cases-duplicate-bookly-id.csv",
      );
      const duplicateWpId = createWriteStream(
        "./uncertain-cases-duplicate-wp-id.csv",
      );

      await new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
        duplicateBooklyId,
        duplicateWpId,
        unCertainCasesFile,
      ).fixBooklyIds(Number(options.batchSize) || 1, startDate, endDate);

      console.log("Completed.");
    }),
  );
