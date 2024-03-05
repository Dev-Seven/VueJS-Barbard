import { FirestoreRepository } from "./firestore.repository";
import { WriteStream } from "fs";

export class EventChecker {
  constructor(
    private dryRun: boolean,
    private firestoreRepo: FirestoreRepository,
    private unCertainCasesFile: WriteStream,
  ) {}

  async fixEventTypes(location: "hcmc" | "hanoi", batchSize: number) {
    let index = 0;
    for await (const events of this.firestoreRepo.fetchAllEvents(
      location,
      batchSize,
    )) {
      console.log(`Processing batch ${index++}`);
      for (const event of events) {
        if (typeof event.doc.booklyId == "string") {
          console.log(
            `locations/${location}/events/${event.id} : converting booklyId(string -> int)`,
          );
          if (!this.dryRun) {
            this.firestoreRepo.setEvent(location, event.id, {
              booklyId: parseInt(event.doc.booklyId),
            });
          }
        }
        if (!event.doc.booklyId) {
          console.log(
            `locations/${location}/events/${event.id} : skipping - booklyId is not present`,
          );
          this.unCertainCasesFile.write(
            `locations/${location}/events/${event.id},${event.doc.userId},${event.doc.userName}\n`,
          );
        }
      }
    }
  }
}
