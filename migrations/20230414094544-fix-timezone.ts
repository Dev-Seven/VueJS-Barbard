import { Command } from "commander";
import { AgreementImportor } from "./helpers/agreement-importor";
import { mapMissingUserIds, parseScenarioSheet } from "./helpers/csv-parser";
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
import { UserImportor } from "./helpers/user-importor";
import { WordpressRepository } from "./helpers/worpress.repository";

// https://github.com/Barbaard-com/barbaard/issues/41
export const fixTimezone = new Command("fix-timezone");

process.env.TZ = "Asia/Ho_Chi_Minh";

fixTimezone
  .description("Fix timezone")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .addOption(wordpressHost)
  .addOption(wordpressPort)
  .addOption(wordpressUsername)
  .addOption(wordpressPassword)
  .addOption(wordpressDatabase)
  .option(
    "--batch-size <batchSize>",
    "number of users to process at the same time",
  )
  .requiredOption("--start-date <startDate>", "start date")
  .requiredOption("--end-date <startDate>", "end date")
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);
      // import agreements
      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);
      await new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).fixTimeZones(
        "hcmc",
        startDate,
        endDate,
        Number(options.batchSize) || 1,
      );
      await new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).fixTimeZones(
        "hanoi",
        startDate,
        endDate,
        Number(options.batchSize) || 1,
      );
      console.log("Import completed.");
    }),
  );
