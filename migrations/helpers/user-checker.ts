import { FirestoreRepository } from "./firestore.repository";
import { createWriteStream } from "fs";

import admin from "firebase-admin";
const firestore = admin.firestore

function generateRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString();
}

function reformat(phoneNumber) {
  const prefixes = {
    "+84162": "+8432",
    "+84163": "+8433",
    "+84164": "+8434",
    "+84165": "+8435",
    "+84166": "+8436",
    "+84167": "+8437",
    "+84168": "+8438",
    "+84169": "+8439",
    "+84120": "+8470",
    "+84121": "+8479",
    "+84122": "+8477",
    "+84123": "+8483",
    "+84124": "+8484",
    "+84125": "+8485",
    "+84126": "+8476",
    "+84127": "+8481",
    "+84128": "+8478",
    "+84129": "+8482",
    "+84188": "+8458",
    "+84186": "+8456",
    "+84199": "+8459",
  };
  const formattedPhoneNumber = phoneNumber.replace(/\s/g, "");
  const prefix = formattedPhoneNumber.slice(0, 6);
  if (prefixes[prefix]) {
    return formattedPhoneNumber.replace(prefix, prefixes[prefix]);
  }
  return formattedPhoneNumber;
}

export class UserChecker {
  constructor(
    private dryRun: boolean,
    private firestoreRepo: FirestoreRepository,
  ) {}

  async reformatPhoneNumber(batchSize: number) {
    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsers(batchSize)) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        const phone = user.doc.phone;
        if (!phone) {
          continue;
        }
        if (!phone.startsWith("+84")) {
          continue;
        }

        if (phone.length > 15) {
          continue;
        }

        if (phone == reformat(phone)) {
          continue;
        }

        // const usersWithPhone = await this.firestoreRepo.getUsersByPhone(reformat(phone))
        // if (usersWithPhone.length > 0) {
        //     console.log(`users/${user.id} : skipping phone number already exists: ${reformat(phone)}`);
        //     continue;
        // }

        if (this.dryRun) {
          console.log(
            `will update user: ${user.id}}: ${phone} -> ${reformat(phone)}`,
          );
        } else {
          await this.firestoreRepo.updateUser(user.id, {
            phone: reformat(phone),
          });
        }
      }
    }
  }

  async removeZerosFromPhones(batchSize: number) {
    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsers(batchSize)) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        const phone = user.doc.phone;
        if (!phone) {
          continue;
        }
        if (!phone.startsWith("0")) {
          continue;
        }
        if (phone.length > 15 || phone.length < 10) {
          continue;
        }
        // if (phone == phone.replace(/^00/, '+')) {
        //     continue;
        // }
        // const updatedPhone = phone.replace(/^00/, '+');
        const updatedPhone = phone.replace(/^0/, "+84");
        if (phone == updatedPhone) {
          continue;
        }
        if (this.dryRun) {
          console.log(
            `will update user: ${user.id}}: ${phone} -> ${updatedPhone}`,
          );
        } else {
          await this.firestoreRepo.updateUser(user.id, { phone: updatedPhone });
        }
      }
    }
  }

  async removeWhitespaceFromPhones(batchSize: number) {
    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsers(batchSize)) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        const phone = user.doc.phone;
        if (!phone) {
          continue;
        }
        const updatedPhone = phone.replace(/[\s()\\/-]+/g, "");
        if (phone == updatedPhone) {
          continue;
        }
        if (this.dryRun) {
          console.log(
            `will update user: ${user.id}}: ${phone} -> ${updatedPhone}`,
          );
        } else {
          await this.firestoreRepo.updateUser(user.id, { phone: updatedPhone });
        }
      }
    }
  }

  async listDuplicates(batchSize: number) {
    // users with duplicate wpId

    const wordpressIdUserMap: {
      [wpId: string]: string[];
    } = {};
    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsersWithWpId(
      batchSize,
    )) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        if (!wordpressIdUserMap[user.doc.wpId]) {
          wordpressIdUserMap[user.doc.wpId] = [];
        }
        wordpressIdUserMap[user.doc.wpId].push(user.id);
      }
    }

    Object.keys(wordpressIdUserMap).forEach((wpId) => {
      if (wordpressIdUserMap[wpId].length > 1) {
        console.log(
          `Duplicate wordpress id: ${wpId} - ${wordpressIdUserMap[wpId].join(
            ", ",
          )}`,
        );
      }
    });

    // events with booklyId but aren't linked to a user with wpId
    await this.checkEventsWithDuplicateLinked("hanoi", batchSize);
    await this.checkEventsWithDuplicateLinked("hcmc", batchSize);
  }

  async checkEventsWithDuplicateLinked(
    location: "hcmc" | "hanoi",
    batchSize: number,
  ) {
    let index = 0;
    for await (const events of this.firestoreRepo.fetchAllEventsWithBooklyId(
      location,
      batchSize,
    )) {
      console.log(`Processing ${location} events batch ${index++}`);
      const promises = events.map(async (event) => {
        if (!event.doc.userId) {
          console.log(
            `Event ${event.id} with booklyId: ${event.doc.booklyId} is not linked to a user`,
          );
          return;
        }
        const user = await this.firestoreRepo.getUser(event.doc.userId);
        if (user && !user.doc.wpId) {
          console.log(
            `Event ${event.id} with booklyId: ${event.doc.booklyId} has a user ${user.id} without a wpId`,
          );
        }
      });
      await Promise.all(promises);
    }
  }

  async fixUserTypes(batchSize: number) {
    const unCertainCasesFile = createWriteStream(
      "./uncertain-fix-types-users.csv",
    );
    unCertainCasesFile.write(`userId,fullName\n`);

    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsers(batchSize)) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        if (typeof user.doc.wpId == "string") {
          console.log(`users/${user.id} : converting wpId(string -> int)`);
          if (!this.dryRun) {
            this.firestoreRepo.setUser(user.id, {
              wpId: parseInt(user.doc.wpId),
            });
          }
        }
        if (typeof user.doc.booklyUserId == "string") {
          console.log(
            `users/${user.id} : converting booklyUserId(string -> int)`,
          );
          if (!this.dryRun) {
            this.firestoreRepo.setUser(user.id, {
              booklyUserId: parseInt(user.doc.booklyUserId),
            });
          }
        }
        if (!user.doc.booklyUserId && !user.doc.booklyUserId) {
          console.log(`users/${user.id} : skipping no wpId, no booklyUserId`);
          unCertainCasesFile.write(`${user.id},${user.doc.fullName}\n`);
        }
      }
    }
  }

  async addConnectaId(batchSize: number) {
    let index = 0;
    for await (const users of this.firestoreRepo.fetchAllUsers(batchSize)) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        if (user.doc.connectaId) {
          continue;
        }
        const phone = user.doc.phone;
        if (!phone) {
          continue;
        }
        if (!phone.startsWith("+84")) {
          continue;
        }

    async fixCreatedAtTimestamp(ids: string[]) {
        for (const id of ids) {
            const user = await this.firestoreRepo.getUserAnyType(id);
            if (!user) {
                console.log(`users/${id} : user not found`);
                continue;
            }
            try {
                const createdAt = FirebaseFirestore.Timestamp.fromDate(new Date(user.data().createdAt));
                console.log(`users/${id} : string -> timestamp : ${user.data().createdAt} -> ${createdAt}`);
            } catch (e) {
                //todo fix other cases
                // console.log(`users/${id} : skipping createdAt is not a valid date`);
                continue;
            }
            const createdAt = FirebaseFirestore.Timestamp.fromDate(new Date(user.data().createdAt));
            if (!this.dryRun) {
                await this.firestoreRepo.setUser(id, { createdAt: createdAt });
            }
        }
    }
  }

  async getWrongCreatedAtTimestampUsers(batchSize: number) {
    let index = 0;
    let ids = [];
    for await (const users of this.firestoreRepo.fetchAllUsersNoType(
      batchSize,
    )) {
      console.log(`Processing batch ${index++}`);
      for (const user of users) {
        const createdAtType = typeof user.doc.createdAt;
        if (
          createdAtType == "object" &&
          typeof user.doc.createdAt.toDate === "function"
        ) {
          continue;
        }
        ids.push(user.id);
      }
    }
    return ids;
  }

  async fixCreatedAtTimestamp(ids: string[]) {
    for (const id of ids) {
      const user = await this.firestoreRepo.getUserAnyType(id);
      if (!user) {
        console.log(`users/${id} : user not found`);
        continue;
      }
      try {
        const createdAt = firestore.Timestamp.fromDate(
          new Date(user.data().createdAt),
        );
        console.log(
          `users/${id} : string -> timestamp : ${
            user.data().createdAt
          } -> ${createdAt}`,
        );
      } catch (e) {
        //todo fix other cases
        // console.log(`users/${id} : skipping createdAt is not a valid date`);
        continue;
      }
      const createdAt = firestore.Timestamp.fromDate(
        new Date(user.data().createdAt),
      );
      if (!this.dryRun) {
        await this.firestoreRepo.setUser(id, { createdAt: createdAt });
      }
    }
  }
}
