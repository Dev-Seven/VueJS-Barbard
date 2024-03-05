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

export const importUsersFromWPtoFirestore = new Command(
  "import-users-from-wp-to-firestore",
);

importUsersFromWPtoFirestore
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

      // import users
      const usersToBeImported = await userImportor.getToBeImportedUsers();

      await userImportor.runScenarioFour(usersToBeImported);
      await eventImportor.importEvents(usersToBeImported);
      await agreementImportor.importAgreements(usersToBeImported);

      console.log("Import completed.");
    }),
  );
