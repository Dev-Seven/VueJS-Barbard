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

// https://barbaard.atlassian.net/browse/BF-108
export const importMissingAgreements = new Command("import-missing-agreements");

importMissingAgreements
  .description("Import Missing Agreements")
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
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);
      // import agreements
      await new AgreementImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).importMissing(Number(options.batchSize) || 1);
      console.log("Import completed.");
    }),
  );
