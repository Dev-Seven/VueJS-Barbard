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
import { EventImportor } from "./helpers/event-importor";

export const importEventsFromDate = new Command("import-events-from-date");

importEventsFromDate
  .description("import missing events from date")
  .addOption(serviceKeyOption)
  .addOption(dryRunOption)
  .addOption(wordpressHost)
  .addOption(wordpressPort)
  .addOption(wordpressUsername)
  .addOption(wordpressPassword)
  .addOption(wordpressDatabase)
  .option("--from-date <date>", "start from this date")
  .action(
    runWithWordpressAndFirestore(async (fbApp, conn, knex, options) => {
      const firestoreRepo = new FirestoreRepository(fbApp.firestore());
      const wordressRepo = new WordpressRepository(conn, knex);

      const eventImportor = new EventImportor(
        options.dryRun,
        wordressRepo,
        firestoreRepo,
      );

      const events = await eventImportor.getEventsFromDate(options.fromDate);

      for (const event of events) {
        const user = await firestoreRepo.getUserByWpId(event.wp_user_id);
        if (!user) {
          console.log(`User ${event.wp_user_id} not found. Skipping event`);
          continue;
        }
        await eventImportor.importEvent(event, user);
      }

      console.log("Import completed.");
    }),
  );
