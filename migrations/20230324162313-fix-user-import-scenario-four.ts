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

export const fixUserImportScenarioFour = new Command(
  "fix-user-import-scenario-four",
);

fixUserImportScenarioFour
  .description("Fix scenario 4")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .addOption(wordpressHost)
  .addOption(wordpressPort)
  .addOption(wordpressUsername)
  .addOption(wordpressPassword)
  .addOption(wordpressDatabase)
  .requiredOption(
    "--csv-file <csvFile>",
    "path to csv file that contains scenario 4 sheet",
  )
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);

      // parse scenario 4 sheet
      const users = parseScenarioSheet(options.csvFile);
      const userIds = mapMissingUserIds(users);

      // run user import for scenario 4
      await new UserImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).runScenarioFour(userIds);

      // update linked events
      await new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      ).importEvents(userIds);

      // import agreements
      //await new AgreementImportor(options.dryRun, wordressRepo, firestoreRepo).importAgreements(userIds);
      console.log("Import completed.");
    }),
  );
