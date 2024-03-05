import { addYears, endOfYear, format, isBefore } from "date-fns";
import { createWriteStream } from "fs";
import { Writable } from "stream";
import { keyBy } from "lodash";

import { User, Agreement } from "@barbaard/types";

import {
  dateToFsTimestamp,
  getLocationByWordpressId,
  parseTimestamp,
} from "./utils";
import {
  GentlemanAgreementKeys,
  HobUser,
  KeyValue,
  MetaRow,
} from "./wordpress.types";
import { FirestoreRepository, ServiceNameMap } from "./firestore.repository";
import { WordpressRepository } from "./worpress.repository";

export class AgreementImportor {
  constructor(
    private dryRun: boolean,
    private wordpressRepo: WordpressRepository,
    private firestoreRepo: FirestoreRepository,
  ) {}

  async importAgreements(wordpressUserIds: number[]) {
    let index = 0;
    for (const id of wordpressUserIds) {
      index++;
      console.info(
        `Importing agreements of user(${index}/${wordpressUserIds.length}): ${id}`,
      );
      await this.importWordpressUserAgreements(id);
    }
    console.log("Completed Agreement import");
  }

  async importWordpressUserAgreements(wordpressUserId: number) {
    // only agreements with a user linked were imported previously
    // Note: We don't store wordpress agreement id in firestore (or there is no id since data in meta key value pairs),
    // So running the import without checking if it's already imported, might add duplicates.
    const user = await this.firestoreRepo.getUserByWpId(wordpressUserId);
    if (!user) {
      console.error(`User not found to import agreements: ${wordpressUserId}`);
      return;
    }
    const serviceMap = await this.firestoreRepo.getServiceMap();
    const userMeta = await this.wordpressRepo.fetchUsersMeta([wordpressUserId]);
    if (userMeta.length <= 0) {
      console.info(`No metadata for the user: ${wordpressUserId}`);
      return;
    }

    await this.addGentlemanAgreements(user, userMeta, serviceMap);
  }

  async addGentlemanAgreements(
    user: { id: string; doc: User },
    meta: MetaRow[],
    serviceNameMap: ServiceNameMap,
  ) {
    const agreements = this.groupAgreements(meta);
    const keys = Object.keys(agreements);
    const promises = keys.sort().map(async (key) => {
      const agreementMeta = agreements[Number(key)];
      const agreement = await this.prepareAgreement(
        agreementMeta,
        user,
        serviceNameMap,
      );
      if (!this.dryRun) {
        const createdAgreement =
          await this.firestoreRepo.addAgreement(agreement);
        console.log(
          `Created Agreement: ${createdAgreement.id} for user ${user.id}, AMOUNT: ${createdAgreement.doc.amount}, LEFT: ${createdAgreement.doc.left}`,
        );
      } else {
        console.log(
          `Will create agreement for ${user.id}, wpId ${user.doc.wpId}`,
        );
      }
    });
    await Promise.all(promises);
  }

  async prepareAgreement(
    agreementMeta: KeyValue[],
    user: { id: string; doc: User },
    serviceNameMap: ServiceNameMap,
  ) {
    const agreement: Agreement = { userMap: {} };
    agreement.users = [
      {
        userId: user.id,
        userName: `${user.doc.firstName} ${user.doc.lastName}`,
      },
    ];
    agreement.userMap = { [user.id]: true };
    const amount = this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_amount,
    );
    if (amount) {
      agreement.amount = Number(amount);
    }

    const type = this.getGAValue(agreementMeta, GentlemanAgreementKeys.ga_type);
    if (type) {
      agreement.type = type?.toLowerCase();
    }

    const paid = this.getGAValue(agreementMeta, GentlemanAgreementKeys.ga_paid);
    if (paid) {
      agreement.paid = Number(paid) >= 1;
    }

    const price = this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_price,
    );
    if (price) {
      agreement.price = Number(price);
    }

    const redeemed = this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_redeemed,
    );
    if (redeemed) {
      agreement.redeemed = Number(redeemed);
    }

    agreement.left = (agreement.amount || 0) - (agreement.redeemed || 0);
    if (agreement.price && agreement.amount) {
      agreement.pricePerService = agreement.price / agreement.amount;
      agreement.storeCredit = agreement.left * agreement.pricePerService;
    }

    const purchaseDate = this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_purchase_date,
    );
    if (purchaseDate) {
      const date = parseTimestamp(purchaseDate);
      let expiry = endOfYear(addYears(date, 2)); // add 2 years
      if (agreement.type === "king") {
        expiry = addYears(date, 1); // if king, add 1 year
      }
      agreement.purchasedAt = dateToFsTimestamp(date);
      agreement.expiryDate = dateToFsTimestamp(expiry);
      if (isBefore(new Date(), expiry)) {
        agreement.active = true;
      } else {
        agreement.active = false;
      }
    }

    agreement.appointments = await this.getAppointments(agreementMeta);
    const service = await this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_service,
    );
    if (service && serviceNameMap[service]) {
      const serviceObj = serviceNameMap[service];
      agreement.services = [
        {
          id: serviceObj.id,
          name: serviceObj.doc.name,
        },
      ];
      agreement.serviceName = agreement.services
        ?.map((service) => service.name)
        .join(" & ");
    }
    return agreement;
  }

  async getAppointments(agreementMeta: KeyValue[]) {
    const appointmentList = [];
    const appointments = this.getGAValue(
      agreementMeta,
      GentlemanAgreementKeys.ga_appointments,
    );
    if (appointments) {
      try {
        const parsedAppointments = JSON.parse(appointments);
        if (parsedAppointments && parsedAppointments?.length > 0) {
          const appointments: {
            id: string;
            location_id: number;
            ca_id: number;
          }[] =
            await this.wordpressRepo.fetchCorrectAppointments(
              parsedAppointments,
            );
          const appointmentMap = keyBy(appointments, (a) => a.id);
          const promises = parsedAppointments.map(async (id: string) => {
            const appnt = appointmentMap[id];
            if (!appnt) return;
            const location = getLocationByWordpressId(appnt.location_id);
            const eventDoc = await this.firestoreRepo.getEventByBooklyId(
              location,
              appnt.ca_id,
            );
            if (eventDoc) {
              const id = eventDoc.id;
              const doc = eventDoc.doc;
              appointmentList.push({
                date: doc.startDate,
                id: id,
                location: location,
                staff: (doc.services || [])
                  .filter((s) => s.staff)
                  .map((service) => service.staff as string),
              });
            } else {
              throw new Error(`Event not found: ${appnt.ca_id}`);
            }
          });
          await Promise.all(promises);
        }
      } catch (err) {
        console.log("appointments parse error", err, appointments);
      }
    }
    return appointmentList;
  }

  getGAValue(meta: KeyValue[], key: GentlemanAgreementKeys) {
    return (meta || []).filter((m) => m.key === key)[0]?.value;
  }

  /**
   * Groups agreement by indexes.
   * meta keys for agreements are of the form gentleman_agreements_$index_$key.
   * eg: gentleman_agreements_0_ga_type, gentleman_agreements_0_ga_id, gentleman_agreements_1_ga_type
   * output: {
   *      [0]: [{ key: 'ga_type', value: 'value1' }, { key: 'ga_id', value: 'id' }],
   *      [1]: [{ key: 'ga_type', value: 'value2' }]}
   * }
   * @param meta
   * @returns
   */
  groupAgreements(meta: MetaRow[]) {
    const regex = /^gentleman_agreements_(\d+)_(.*)/;
    const groups: { [index: number]: KeyValue[] } = {};
    meta.forEach((m) => {
      const matches = regex.exec(m.meta_key);
      if (matches && matches.length >= 2) {
        const index = Number(matches[1]);
        if (groups[index]) {
          groups[index].push({
            key: matches[2],
            value: m.meta_value,
          });
        } else {
          groups[index] = [
            {
              key: matches[2],
              value: m.meta_value,
            },
          ];
        }
      }
    });
    return groups;
  }

  async importMissing(batchSize = 1) {
    const totalHobUsers = await this.wordpressRepo.countHobUsers();
    let batchIndex = 0;
    let missingUserStream = createWriteStream("./missing-fs-users-debug.log");
    const serviceNameMap = await this.firestoreRepo.getServiceMap();
    for await (const users of this.wordpressRepo.fetchAllHobUsers(batchSize)) {
      batchIndex++;
      console.log(
        `Processing ${batchIndex} / ${
          Math.floor(totalHobUsers / batchSize) + 1
        }`,
      );
      const promises = users.map((user) =>
        this.addMissingAgreements(user, missingUserStream, serviceNameMap),
      );
      await Promise.all(promises);
    }
  }

  async addMissingAgreements(
    user: HobUser,
    missingUserStream: Writable,
    serviceNameMap: ServiceNameMap,
  ) {
    const fbUser = await this.firestoreRepo.getUserByWpId(user.ID);
    if (!fbUser) {
      missingUserStream.write(`${user.ID}\n`);
      return;
    }
    const userMeta = await this.wordpressRepo.fetchUsersMeta([user.ID]);
    if (userMeta.length <= 0) {
      // no agreements in wordpress
      return;
    }
    const wordpressAgrements = this.groupAgreements(userMeta);
    const fbAgreements = await this.firestoreRepo.getAgreementsByUser(
      fbUser.id,
    );
    const indices = Object.keys(wordpressAgrements);
    console.log(
      `User: ${fbUser.id}(${user.ID}), wpAgreements: ${indices.length}, fbAgreements: ${fbAgreements.length}`,
    );
    if (indices.length != fbAgreements.length) {
      console.log(
        `Number of agreements mismatch: ${fbUser.id}(${user.ID}), wpAgreements: ${indices.length}, fbAgreements: ${fbAgreements.length}`,
      );
    }
    for (let index of indices) {
      const agreementMeta = wordpressAgrements[index];
      const mappedAgreement = await this.prepareAgreement(
        agreementMeta,
        fbUser,
        serviceNameMap,
      );
      if (!mappedAgreement.serviceName || !mappedAgreement.purchasedAt) {
        console.log(
          `Skip agreement, index ${index}, userId ${user.ID} / ${fbUser.id}`,
        );
        continue;
      }
      if (!this.checkAgreementAlreadyMigrated(fbAgreements, mappedAgreement)) {
        if (!this.dryRun) {
          const createdAgreement =
            await this.firestoreRepo.addAgreement(mappedAgreement);
          console.log(
            `Created Agreement: ${createdAgreement.id} for user ${fbUser.id}, index: ${index} `,
          );
        } else {
          console.log(
            `Will create agreement for ${fbUser.id}, wpId ${fbUser.doc.wpId}, index: ${index} `,
          );
        }
      }
    }
  }

  checkAgreementAlreadyMigrated(
    fbAgreements: { id: string; doc: Agreement }[],
    agreement: Agreement,
    debug?: boolean,
  ) {
    return (
      fbAgreements.filter((check) => {
        return (
          check.doc.serviceName === agreement.serviceName &&
          format(check.doc.purchasedAt?.toDate(), "yyyy-MM-dd") ==
            format(agreement.purchasedAt?.toDate(), "yyyy-MM-dd")
        );
      }).length > 0
    );
  }
}
