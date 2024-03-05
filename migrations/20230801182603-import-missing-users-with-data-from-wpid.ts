import { Command } from "commander";
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
import { UserImportor } from "./helpers/user-importor";
import { EventImportor } from "./helpers/event-importor";
import { AgreementImportor } from "./helpers/agreement-importor";

export const importMissingUsersFromWpId = new Command(
  "import-missing-users-from-wp-id",
);

importMissingUsersFromWpId
  .description("import missing users")
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
  .option("--from-id <wpId>", "start from this wordpress id")
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);

      const userImportor = new UserImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      );
      const eventImportor = new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      );
      const agreementImportor = new AgreementImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      );

      const usersToBeImported = await userImportor.getMissingUsers(
        options.fromId,
        Number(options.batchSize) || 1,
      );

      await userImportor.runScenarioFour(usersToBeImported);
      await eventImportor.importEvents(usersToBeImported);
      await agreementImportor.importAgreements(usersToBeImported);

      console.log("Import completed.");
    }),
  );
