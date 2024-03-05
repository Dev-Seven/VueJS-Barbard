import { MetaRow, UserRow } from "./wordpress.types";
import { capitalize, dateToFsTimestamp, parseDate } from "./utils";
import { User, Event } from "@barbaard/types";
import { WordpressRepository } from "./worpress.repository";
import { groupBy } from "lodash";
import { FirestoreRepository } from "./firestore.repository";
import { CsvRow } from "./csv-parser";

export class UserImportor {
  constructor(
    private dryRun: boolean,
    private wordpressRepo: WordpressRepository,
    private firestoreRepo: FirestoreRepository,
  ) {}

  async runScenarioFour(userIds: number[]) {
    // query the missing user data and create
    const batchSize = 10;
    for await (const batch of this.wordpressRepo.fetchInBatches(
      userIds,
      batchSize,
    )) {
      const batchUserIds = batch.map((row) => row.ID);
      const userMeta = await this.wordpressRepo.fetchUsersMeta(batchUserIds);
      const metaMap = groupBy(userMeta, (user) => user.user_id);
      const promises = batch.map(async (row) => {
        const meta = metaMap[row.ID] || [];
        await this.importWordpressUser(row, meta);
      });
      await Promise.all(promises);
    }
  }

  // Scenario: Rewrite the existing user with missing wpId
  async runScenarioSix(rows: CsvRow[]) {
    for await (const row of rows) {
      const existingId = Number(
        row["Wordpress ID\n with same phone in firestore"],
      );
      const missingId = Number(row["Missing Wordpress User ID"]);
      const existing = await this.firestoreRepo.getUserByWpId(existingId);
      if (!existing) {
        console.error(
          `Skipping existing user: ${existingId}, not found in firestore`,
        );
        continue;
      }
      if (!this.dryRun) {
        await this.firestoreRepo.updateUser(existing.id, {
          wpId: missingId,
        });
        console.log(
          `Updated user:${existing.id} from ${existingId} to ${missingId}`,
        );
      } else {
        console.log(
          `Will Update user:${existing.id} from ${existingId} to ${missingId}`,
        );
      }
    }
  }

  async getMissingUsers(fromId: number, batchSize: number) {
    let batchIndex = 0;
    const missing = [];
    for await (const users of this.wordpressRepo.fetchAllHobUsersFromId(
      fromId,
      batchSize,
    )) {
      batchIndex++;
      console.log(`Processing ${batchIndex}`);
      const promises = users.map(async (user) => {
        const users = await this.firestoreRepo.getUsersByWpId(user.ID);
        if (users.length == 0) {
          missing.push(user.ID);
        } else {
          return;
        }
      });
      await Promise.all(promises);
    }
    return missing;
  }

  async getToBeImportedUsers() {
    let batchIndex = 0;
    const toBeImported = [];
    for await (const users of this.wordpressRepo.fetchAllHobUsers(100)) {
      batchIndex++;
      console.log(`Processing ${batchIndex}`);
      const promises = users.map(async (user) => {
        const users = await this.firestoreRepo.getUsersByWpId(user.ID);
        if (users.length == 0) {
          toBeImported.push(user.ID);
        } else {
          return;
        }
      });
      await Promise.all(promises);
    }
    return toBeImported;
  }

  async importWordpressUser(
    row: UserRow,
    meta: MetaRow[],
    modifier?: (user: User) => User,
  ) {
    // check existence
    const existing = await this.firestoreRepo.getUserByWpId(row.ID);
    if (existing) {
      console.log(`Skipping wpId: ${row.ID}, already exists`);
      return;
    }
    // prepare user document
    let user = this.prepareUser(row, meta);

    console.log(`Importing wpId: ${row.ID}, phone: ${user.phone}`);
    const existingbyPhone =
      user.phone == undefined || ""
        ? []
        : await this.firestoreRepo.getUsersByPhone(user.phone);
    if (existingbyPhone.length > 0) {
      user.phone = "";
    }
    if (user.phone == undefined) {
      user.phone = "";
    }
    // add any modifications
    if (modifier) user = modifier(user);
    if (this.dryRun)
      console.log(`Will add wp user ${row.ID} with phone: ${user.phone}`);
    if (!this.dryRun) {
      const created = await this.firestoreRepo.addUser(user);
      console.log(`Added wp user ${row.ID} to firestore. Id: ${created.id}`);
    }
  }

  private prepareUser(from: UserRow, meta: MetaRow[]): User {
    let phone = from.phone;
    if (!phone) {
      phone = this.getMetaValue(meta, "phone");
    }
    if (!phone) {
      phone = this.getMetaValue(meta, "billing_phone");
    }
    let firstName =
      (this.getMetaValue(meta, "first_name") || "").trim() ||
      (from.first_name || "").trim();
    let lastName =
      (this.getMetaValue(meta, "last_name") || "").trim() ||
      (from.last_name || "").trim();
    let nationality =
      (this.getMetaValue(meta, "nationality") || "").trim() ||
      (from.country || "").trim();
    if (!firstName && !lastName) {
      const displayNameSplit = from.display_name.split(" ");
      firstName = displayNameSplit[0]?.trim() || "";
      lastName = displayNameSplit[1]?.trim() || "";
    }
    firstName = capitalize(firstName || "");
    lastName = capitalize(lastName || "");
    const converted: User = {
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      email: from.user_email || from.email,
      nationality: nationality,
      wpId: from.ID,
    };
    if (phone && phone.indexOf("E+") < 0) {
      // clean phone
      if (phone[0] != "+") {
        phone = "+" + phone;
      }
      converted.phone = phone;
    }
    if (from.birthday) {
      converted.birthday = dateToFsTimestamp(from.birthday);
    } else {
      let birthDay = this.getMetaValue(meta, "birthday");
      if (birthDay) {
        const parsed = parseDate(birthDay);
        converted.birthday = dateToFsTimestamp(parsed);
      }
    }
    if (from.created_at) {
      converted.createdAt = dateToFsTimestamp(from.created_at || new Date());
    }
    converted.barbershop = {};
    let appointmentsLate = this.getMetaValue(meta, "appointments_late");
    if (appointmentsLate) {
      converted.barbershop.appointmentsLate = Number(appointmentsLate);
    }

    let appointmentsOnTime = this.getMetaValue(meta, "appointments_on_time");
    if (appointmentsOnTime) {
      converted.barbershop.appointmentsOnTime = Number(appointmentsOnTime);
    }

    let lastAppointment = this.getMetaValue(meta, "last_appointment");
    if (lastAppointment) {
      const date = parseDate(lastAppointment);
      if (date) {
        converted.barbershop.lastAppointment = dateToFsTimestamp(date);
      }
    }

    let lastBarber = this.getMetaValue(meta, "last_barber");
    if (lastBarber) {
      converted.barbershop.lastBarber = lastBarber;
    }

    let preference_beardtrim = this.getMetaValue(meta, "preference_beardtrim");
    if (preference_beardtrim) {
      converted.barbershop.expressBeardTrim = preference_beardtrim == "yes";
    }

    let preference_haircut = this.getMetaValue(meta, "preference_haircut");
    if (preference_haircut) {
      converted.barbershop.expressHaircut = preference_haircut == "yes";
    }

    let total_appointments = Number(
      this.getMetaValue(meta, "total_appointments") || 0,
    );
    let timely_appointments_count = Number(
      this.getMetaValue(meta, "timely_appointments_count") || 0,
    );
    converted.barbershop.totalAppointments =
      total_appointments + timely_appointments_count;

    let total_no_shows = Number(this.getMetaValue(meta, "total_no_shows") || 0);
    let timely_no_shows = Number(
      this.getMetaValue(meta, "timely_no_shows") || 0,
    );
    converted.barbershop.totalNoShows = total_no_shows + timely_no_shows;

    let vend_id = this.getMetaValue(meta, "vend_id");
    if (vend_id) {
      converted.vendID = vend_id;
    }

    let comments = this.getMetaValue(meta, "comments");
    if (comments) {
      converted.comments = comments;
    }

    let company = this.getMetaValue(meta, "company");
    if (company) {
      converted.company = company;
    }

    let customer_alert = this.getMetaValue(meta, "customer_alert");
    if (customer_alert) {
      converted.customerAlert = customer_alert;
    }

    let kiotviet_id = this.getMetaValue(meta, "kiotviet_id");
    if (kiotviet_id) {
      converted.kiotvietID = kiotviet_id;
    }

    let location = this.getMetaValue(meta, "location");
    if (location) {
      converted.location = location;
    }

    let membership_number = this.getMetaValue(meta, "membership_number");
    if (membership_number) {
      converted.membershipNumber = membership_number;
    }

    return converted;
  }

  private getMetaValue(meta: MetaRow[], key: string) {
    return (meta || []).filter((m) => m.meta_key === key)[0]?.meta_value;
  }
}
