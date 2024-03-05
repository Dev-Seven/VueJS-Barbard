import axios from "axios";
import * as firestore from "firebase-admin/firestore";
import {
  addDays,
  addMinutes,
  addMonths,
  differenceInDays,
  differenceInMonths,
  format,
  isBefore,
} from "date-fns";

import {
  type Locale,
  type LocationId,
  type Agreement,
  type InternalOrder,
  type Ledger,
  type Lockerbox,
  type User,
  type BarbaardUser,
  type UserTag,
} from "@barbaard/types";

import type {
  CreateContactResponse,
  CreateProfileResponse,
  Trengo,
} from "./clients/trengo.js";

import { UserStoreService } from "./userstore.js";

import lodash from "lodash";
import type { AgreementUser } from "./types.js";
import firebase from "./sys/firebase/firebase.js";
import data from "./sys/data/data.js";
import type { BarbaardUserWithId } from "./sys/data/user_data_provider.js";
import type { BrevoService } from "./clients/BrevoService.js";
const chunk = lodash.chunk;

const firebaseApp = firebase;
const userDataProvider = data.userDataProvider();

export class MainService {
  constructor(
    private sbService: BrevoService,
    private userService: UserStoreService,
    private trengo: Trengo,
  ) {}

  async createBrevoAccountIfNotExisted(
    id: string,
    u: BarbaardUser,
  ): Promise<boolean> {
    if (u.email) {
      const byEmail = await this.sbService
        .getContact(u.email)
        .catch(console.error);
      if (byEmail) {
        console.log(`brevo acc existed ${u.email}`);
        return !!byEmail?.id;
      } else {
        console.log("creating brevo account");
      }
    }

    const result = await this.sbService.createContact(id, u);
    console.log("brevo created", { result });
    return !!result?.id;
  }

  async createBrevoProfileAndUpdateDb(id: string, u: BarbaardUser) {
    console.log(id, u.email);
    if (!u.email) {
      console.error("user did not have an email", id);
      return;
    }
    const result = await this.createBrevoAccountIfNotExisted(id, u);
    if (result) {
      await userDataProvider.update(id, {
        isBrevoActivated: true,
      });
      console.log("Brevo created successfully");
    } else {
      console.log("Nothing to create");
    }
  }

  async updateBrevoProfile(
    id: string,
    update: Partial<BarbaardUser>,
  ): Promise<boolean> {
    if (!update.isBrevoActivated) {
      console.warn("Brevo is not activated in", update.email);
      return false;
    } else {
      await this.sbService.updateContact(id, update);
      console.log("Brevo update Success");
      return true;
    }
  }

  async addTrengoUser(id: string, u: BarbaardUser) {
    let update: Partial<BarbaardUser> = {};
    const trengoUpdates = await this.createTrengoProfile(u);
    if (trengoUpdates) {
      update = { ...update, ...trengoUpdates };
    }
    if (Object.keys(update).length > 0) {
      await userDataProvider.update(id, update);
      console.log("Updated Successfully");
    } else {
      console.log("Nothing to update");
    }
  }

  async onCreateUser(id: string, u: User) {
    let update: Partial<BarbaardUser> = {};
    let locale: Locale;

    // https://barbaard.atlassian.net/browse/BF-51
    if (!u.preferences?.locale) {
      if (u.nationality === "Vietnamese") {
        locale = "vi";
        update = {
          ...update,
          preferences: {
            ...update.preferences,
            locale: locale,
          },
        };
      } else {
        locale = "en";
        update = {
          ...update,
          preferences: {
            ...update.preferences,
            locale: locale,
          },
        };
      }
    }

    if (Object.keys(update).length > 0) {
      await userDataProvider.update(id, update);
      console.log("Updated Successfully");
    } else {
      console.log("Nothing to update");
    }
  }

  async createTrengoProfile(u: BarbaardUser): Promise<BarbaardUser> {
    // trengo sync
    const updates: Partial<BarbaardUser> = {};
    let createContactEmailResponse: CreateContactResponse | undefined;
    if (u.email) {
      createContactEmailResponse = await this.trengo
        .createContactEmail({
          identifier: u.email,
          name: `${u.firstName} ${u.lastName}`,
        })
        .catch((err) => {
          console.log("Error creating trengo email contact", err);
          return undefined;
        });
    }
    let createContactPhoneResponse: CreateContactResponse | undefined;
    if (u.phone) {
      createContactPhoneResponse = await this.trengo
        .createContactPhone({
          identifier: u.phone,
          name: `${u.firstName} ${u.lastName}`,
        })
        .catch((err) => {
          console.log("Error creating trengo phone contact", err);
          return undefined;
        });
    }
    let createProfileResponse: CreateProfileResponse | undefined;
    if (createContactEmailResponse || createContactPhoneResponse) {
      createProfileResponse = createProfileResponse = await this.trengo
        .createProfile({
          name: `${u.firstName} ${u.lastName}`,
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            console.log("Error creating trengo profile", err?.response?.data);
          } else {
            console.log("Error creating trengo profile", err);
          }
          return undefined;
        });
    }

    if (createProfileResponse) {
      // links
      updates.trengoProfileId = createProfileResponse.id;
      if (createContactEmailResponse) {
        await this.trengo
          .linkContact(createProfileResponse.id, {
            contact_id: createContactEmailResponse.id,
            type: "EMAIL",
          })
          .catch((err) => {
            if (axios.isAxiosError(err)) {
              console.log(
                "Error linking email to trengo profile",
                err.response?.data,
              );
            } else {
              console.log("Error linking email to trengo profile", err);
            }
            return undefined;
          });
      }

      if (createContactPhoneResponse) {
        await this.trengo
          .linkContact(createProfileResponse.id, {
            contact_id: createContactPhoneResponse.id,
            type: "TELEGRAM",
          })
          .catch((err) => {
            if (axios.isAxiosError(err)) {
              console.log(
                "Error linking phone to trengo profile",
                err?.response?.data,
              );
            } else {
              console.log("Error linking phone to trengo profile", err);
            }

            return undefined;
          });
        await this.trengo
          .linkContact(createProfileResponse.id, {
            contact_id: createContactPhoneResponse.id,
            type: "WA_BUSINESS",
          })
          .catch((err) => {
            if (axios.isAxiosError(err)) {
              console.log(
                "Error linking whatsapp to trengo profile",
                err?.response?.data,
              );
            } else {
              console.log("Error linking whatsapp to trengo profile", err);
            }
            return undefined;
          });
      }
    }
    return updates;
  }

  async updateTrengoPhone(trengoId: number, u: User) {
    if (u.phone) {
      const createContactPhoneResponse = await this.trengo
        .createContactPhone({
          identifier: u.phone,
          name: `${u.firstName} ${u.lastName}`,
        })
        .catch((err) => {
          console.log("Error creating trengo phone contact", err);
          return undefined;
        });

      if (!createContactPhoneResponse) return;

      await this.trengo
        .linkContact(trengoId, {
          contact_id: createContactPhoneResponse.id,
          type: "TELEGRAM",
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            console.log(
              "Error linking phone to trengo profile",
              err?.response?.data,
            );
          } else {
            console.log("Error linking phone to trengo profile", err);
          }

          return undefined;
        });
      await this.trengo
        .linkContact(trengoId, {
          contact_id: createContactPhoneResponse.id,
          type: "WA_BUSINESS",
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            console.log(
              "Error linking whatsapp to trengo profile",
              err?.response?.data,
            );
          } else {
            console.log("Error linking whatsapp to trengo profile", err);
          }
          return undefined;
        });
    }
  }

  async updateTrengoEmail(trengoId: number, u: User) {
    if (u.email) {
      const createContactEmailResponse = await this.trengo
        .createContactEmail({
          identifier: u.email,
          name: `${u.firstName} ${u.lastName}`,
        })
        .catch((err) => {
          console.log("Error creating trengo email contact", err);
          return undefined;
        });
      if (!createContactEmailResponse) return;

      await this.trengo
        .linkContact(trengoId, {
          contact_id: createContactEmailResponse.id,
          type: "EMAIL",
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            console.log(
              "Error linking email to trengo profile",
              err.response?.data,
            );
          } else {
            console.log("Error linking email to trengo profile", err);
          }
          return undefined;
        });
    }
  }

  async updateTrengoUser(update: User, before: User) {
    if (update.trengoProfileId) {
      // check if phone updated
      if (before.phone != update.phone) {
        // phone updated
        await this.updateTrengoPhone(update.trengoProfileId, update);
      }
      if (before.email != update.email) {
        // email updated
        await this.updateTrengoEmail(update.trengoProfileId, update);
      }

      // TODO: set member group
    }
  }

  async onUpdateUser(id: string, update: BarbaardUser, before: BarbaardUser) {
    if (update.phone) {
      const existing = await firebaseApp
        .auth()
        .getUser(id)
        .catch((err) => {
          console.error("failed to get auth user", err);
        });
      if (!existing) {
        await firebaseApp
          .auth()
          .createUser({
            uid: id,
            phoneNumber: update.phone,
            displayName: `${update.firstName} ${update.lastName}`,
          })
          .then(() => {
            console.error("success created an auth document", update.phone);
          })
          .catch((err) => {
            console.error("failed to create auth user", err);
          });
      } else if (existing.phoneNumber != update.phone) {
        await firebaseApp
          .auth()
          .updateUser(id, {
            phoneNumber: update.phone,
          })
          .then(() => {
            console.error("success updated auth document", update.phone);
          })
          .catch((err) => {
            console.error("failed to update auth user", err);
          });
      }
    }

    const fullName = `${update.firstName} ${update.lastName}`;
    let userUpdates: Partial<BarbaardUser> | undefined;
    if (fullName != update.fullName) {
      userUpdates = { ...userUpdates, fullName: fullName };
      console.log("update name: ", fullName, update.fullName);
    }

    const { tags, tagsUpdated } = await this.evaluateTags(id, update.tags);
    if (tagsUpdated) {
      userUpdates = { ...userUpdates, tags: tags };
    }

    let locale: Locale;
    // https://barbaard.atlassian.net/browse/BF-51
    if (
      !update.preferences?.locale ||
      update.nationality != before.nationality
    ) {
      if (update.nationality === "Vietnamese") {
        locale = "vi";
        userUpdates = {
          ...userUpdates,
          preferences: {
            ...userUpdates?.preferences,
            locale: locale,
          },
        };
      } else {
        locale = "en";
        userUpdates = {
          ...userUpdates,
          preferences: {
            ...userUpdates?.preferences,
            locale: locale,
          },
        };
      }
    }

    if (userUpdates && Object.keys(userUpdates).length > 0) {
      console.log("update user", userUpdates);
      await userDataProvider.update(id, userUpdates);
    }
  }

  async evaluateTags(userId: string, userTags?: UserTag[]) {
    let tagsUpdated = false;
    let tags: UserTag[] = [...(userTags || [])];
    if (!tags.includes("returning")) {
      // check new tag needs to be added
      const hanoiEvents = await this.userService.getEventByUserId(
        "hanoi",
        userId,
        2,
      ); // query with limit 2
      const hcmcEvents = await this.userService.getEventByUserId(
        "hcmc",
        userId,
        2,
      ); // query with limit 2
      // if hanoiEvents.length + hcmcEvents.length === 1, there is exactly 1 event for the user.
      if (hanoiEvents.length + hcmcEvents.length === 1) {
        // exactly 1 event
        if (!tags.includes("new")) {
          tagsUpdated = true;
          tags.push("new");
        }
      } else if (hanoiEvents.length + hcmcEvents.length > 1) {
        tagsUpdated = true;
        tags = tags.filter((tag) => tag != "new"); // remove new tag
        tags.push("returning"); // add returning
      }
    }

    if (!tags.includes("barbershop")) {
      // check barbershop tag needs to be added
      const hanoiEvents =
        await this.userService.getCompletedEventByUserIdAndType(
          "hanoi",
          userId,
          "appointment",
          1,
        );
      if (hanoiEvents.length > 0) {
        tagsUpdated = true;
        tags.push("barbershop");
      } else {
        const hcmcEvents =
          await this.userService.getCompletedEventByUserIdAndType(
            "hcmc",
            userId,
            "appointment",
            1,
          );
        if (hcmcEvents.length > 0) {
          tagsUpdated = true;
          tags.push("barbershop");
        }
      }
    }

    if (!tags.includes("ex-agreement")) {
      // check exagreement tag needs to be added
      const agreements = await this.userService.getAgreementsByActive(
        userId,
        false,
        1,
      );
      if (agreements.length > 0) {
        tagsUpdated = true;
        tags.push("ex-agreement");
      }
    }

    if (!tags.includes("bar")) {
      const hanoiReservationEvents =
        await this.userService.getCompletedEventByUserIdAndType(
          "hanoi",
          userId,
          "reservation",
          1,
        );
      if (hanoiReservationEvents.length >= 1) {
        tagsUpdated = true;
        tags.push("bar");
      } else {
        const hcmcReservationEvents =
          await this.userService.getCompletedEventByUserIdAndType(
            "hcmc",
            userId,
            "reservation",
            1,
          );
        if (hcmcReservationEvents.length > 0) {
          tagsUpdated = true;
          tags.push("bar");
        }
      }
    }
    return {
      tagsUpdated,
      tags,
    };
  }

  // https://www.figma.com/file/r12bfd7mTLDaYXDSd2IFNr/Scheduled?node-id=2%3A4
  async runKingsAgreementRedemption() {
    // query all active agreements
    const today = addDays(new Date(), -1); // last day of previous month
    const activeAgreements = await this.userService.getActiveAgreements();
    const promises = activeAgreements.map((agreement) => {
      return this.kingsAgreementRedemption(agreement, today);
    });
    await Promise.all(promises);
  }

  getNextId(currentId: string, today: Date) {
    const prefix = currentId.substring(0, 3);
    const year = currentId.substring(3, 5);
    const number = currentId.substring(5);
    const currentYear = format(today, "yy");
    if (currentYear != year) {
      // start of new id
      return prefix + currentYear + "1".padStart(7, "0");
    }
    return prefix + year + (Number(number) + 1 + "").padStart(7, "0");
  }

  getOrderDto(nextId: string, total: number, today: Date): InternalOrder {
    const order: InternalOrder = {
      createdAt: firestore.Timestamp.fromDate(today),
      id: nextId,
      paid: true,
      paymentMethod: "storecredit",
      totalOrderValue: total,
      totalReportingValue: total,
      userName: "internal",
      products: [
        {
          category: "agreement", // TODO: check
          id: "agreement-redemption", // TODO: check
          price: total,
          priceAfterDiscount: total,
          quantity: 1,
        },
      ],
    };
    return order;
  }

  getLedgerDto(
    orderNr: string,
    orderId: string,
    total: number,
    today: Date,
    method: "Store Credit - Agreement" | "Store Credit - Locker Box",
  ): Ledger {
    const ledger: Ledger = {
      amount: total,
      date: firestore.Timestamp.fromDate(today),
      method: method, // ?
      order: orderNr,
      orderId: orderId,
      status: 1,
      userName: "internal",
    };
    return ledger;
  }

  async kingsAgreementRedemption(
    agreement: { id: string; doc: Agreement },
    today: Date,
  ) {
    // validate
    if (
      !agreement.doc.expiryDate ||
      !agreement.doc.purchasedAt ||
      !agreement.doc.price ||
      !agreement.doc.purchaseLocation ||
      !agreement.doc.amount
    ) {
      return;
    }
    if (!agreement.doc.storeCredit || agreement.doc.storeCredit <= 0) {
      return;
    }
    const redeemed = agreement.doc.redeemed || 0;
    // get previous id
    const lastOrder = await this.userService.getLastOrderById(
      agreement.doc.purchaseLocation,
    );
    const nextId = this.getNextId(lastOrder.doc.id || "", today);

    let total = 0;
    if (redeemed <= 0) {
      // first time
      const totalDays = differenceInDays(
        agreement.doc.expiryDate.toDate(),
        agreement.doc.purchasedAt.toDate(),
      );
      const totalElapsed = differenceInDays(
        today,
        agreement.doc.purchasedAt.toDate(),
      );
      total = agreement.doc.price * (totalElapsed / totalDays);
    } else if (redeemed < agreement.doc.amount) {
      //
      const totalMonths = differenceInMonths(
        agreement.doc.expiryDate.toDate(),
        agreement.doc.purchasedAt.toDate(),
      );
      total = agreement.doc.price / totalMonths;
    } else if (redeemed >= agreement.doc.amount) {
      total = agreement.doc.storeCredit;
    }

    const order = this.getOrderDto(nextId, total, today);
    const orderDoc = await this.userService.addOrder(
      agreement.doc.purchaseLocation,
      order,
    );
    const ledger = this.getLedgerDto(
      nextId,
      orderDoc.id,
      total,
      today,
      "Store Credit - Agreement",
    );
    await this.userService.addLedger(agreement.doc.purchaseLocation, ledger);

    agreement.doc.orders = [
      ...(agreement.doc.orders || []),
      {
        id: orderDoc.id,
        orderNumber: nextId,
        total: total,
        date: firestore.Timestamp.fromDate(today),
      },
    ];
    const agreementUpdate: Partial<Agreement> = {
      orders: agreement.doc.orders,
      redeemed: (agreement.doc.redeemed || 0) + 1,
      storeCredit: agreement.doc.storeCredit - total,
    };
    if (redeemed >= agreement.doc.amount) {
      agreementUpdate.active = false;
      agreementUpdate.storeCredit = 0;
    }
    await this.userService.updateAgreement(agreement.id, agreementUpdate);

    if (redeemed >= agreement.doc.amount) {
      const userPromises = (agreement.doc.users || []).map(
        async (user: AgreementUser) => {
          if (user.userId) {
            const agreements =
              await this.userService.getAgreementsByActiveAndType(
                user.userId,
                "king",
                true,
                1,
              );
            if (agreements.length == 0) {
              const userDoc = (
                await userDataProvider.get(user.userId)
              ).getOrNull();
              if (userDoc) {
                const tags = (userDoc!.tags || []).filter(
                  (tag: UserTag) =>
                    tag != "ex-kings-agreement" && tag != "kings-agreement",
                );
                tags.push("ex-kings-agreement");
                await userDataProvider.update(user.userId, {
                  tags: tags,
                });
              }
            }
          }
        },
      );
      await Promise.all(userPromises);
    }
  }

  // https://www.figma.com/file/r12bfd7mTLDaYXDSd2IFNr/Scheduled?node-id=2%3A4
  async runAgreementsDeactivation() {
    const activeAgreements = await this.userService.getActiveAgreements();
    const promises = activeAgreements.map(async (agreement) => {
      if (
        agreement.doc.expiryDate &&
        isBefore(agreement.doc.expiryDate.toDate(), new Date())
      ) {
        // agreement has expired.
        await this.userService.updateAgreement(agreement.id, {
          active: false,
        });
        const userPromises = (agreement.doc.users || []).map(
          async (user: AgreementUser) => {
            if (user.userId) {
              const agreements = await this.userService.getAgreementsByActive(
                user.userId,
                true,
                1,
              );
              if (agreements.length == 0) {
                const userDoc = (
                  await userDataProvider.get(user.userId)
                ).getOrNull();
                if (userDoc) {
                  const tags = (userDoc!.tags || []).filter(
                    (tag: UserTag) => tag != "agreement",
                  ); // remove agreement
                  tags.push("ex-agreement"); // add ex agreement
                  await userDataProvider.update(user.userId, {
                    tags: tags,
                  });
                }
              }
            }
          },
        );
        await Promise.all(userPromises);
      }
    });
    await Promise.all(promises);
  }

  async runLockerboxRedemption() {
    // query all active agreements
    const today = addDays(new Date(), -1);
    await this.runLockerboxRedemptionForLocation("hcmc", today);
    await this.runLockerboxRedemptionForLocation("hanoi", today);
  }

  async runLockerboxRedemptionForLocation(location: LocationId, today: Date) {
    const hcmcAgreements = await this.userService.getActiveLockerboxes(
      location,
      true,
    );
    const promises = hcmcAgreements.map((agreement) => {
      return this.lockerboxRedemption(location, agreement, today);
    });
    await Promise.all(promises);
  }

  async lockerboxRedemption(
    location: LocationId,
    lockerbox: { id: string; doc: Lockerbox },
    today: Date,
  ) {
    // validate
    if (
      !lockerbox.doc.expiryDate ||
      !lockerbox.doc.purchasedAt ||
      !lockerbox.doc.price ||
      !lockerbox.doc.amount
    ) {
      return;
    }
    if (!lockerbox.doc.storeCredit || lockerbox.doc.storeCredit <= 0) {
      return;
    }
    const months = lockerbox.doc.months;
    const redeemed = lockerbox.doc.redeemed || 0;
    // get previous id
    const lastOrder = await this.userService.getLastOrderById(location);
    const nextId = this.getNextId(lastOrder.doc.id || "", today);

    let total = 0;
    if (redeemed <= 0) {
      // first time
      const totalDays = differenceInDays(
        lockerbox.doc.expiryDate.toDate(),
        lockerbox.doc.purchasedAt.toDate(),
      );
      const totalElapsed = differenceInDays(
        today,
        lockerbox.doc.purchasedAt.toDate(),
      );
      total = lockerbox.doc.price * (totalElapsed / totalDays);
    } else if (redeemed < months) {
      //
      const totalMonths = differenceInMonths(
        lockerbox.doc.expiryDate.toDate(),
        lockerbox.doc.purchasedAt.toDate(),
      );
      total = lockerbox.doc.price / totalMonths;
    } else if (redeemed >= months) {
      total = lockerbox.doc.storeCredit;
    }

    const order = this.getOrderDto(nextId, total, today);
    const orderDoc = await this.userService.addOrder(location, order);
    const ledger = this.getLedgerDto(
      nextId,
      orderDoc.id,
      total,
      today,
      "Store Credit - Locker Box",
    );
    await this.userService.addLedger(location, ledger);

    lockerbox.doc.orders = [
      ...(lockerbox.doc.orders || []),
      {
        id: orderDoc.id,
        orderNumber: nextId,
        total: total,
        date: firestore.Timestamp.fromDate(today),
      },
    ];
    const agreementUpdate: Partial<Agreement> = {
      orders: lockerbox.doc.orders,
      redeemed: (lockerbox.doc.redeemed || 0) + 1,
      storeCredit: lockerbox.doc.storeCredit - total,
    };
    if (redeemed >= months) {
      agreementUpdate.active = false;
      agreementUpdate.storeCredit = 0;
    }
    await this.userService.updateAgreement(lockerbox.id, agreementUpdate);

    if (redeemed >= months) {
      const agreements = await this.userService.getActiveLockerboxesByUser(
        location,
        lockerbox.doc.userId,
        true,
        1,
      );
      if (agreements.length == 0) {
        const userDoc = (
          await userDataProvider.get(lockerbox.doc.userId)
        ).getOrNull();
        if (userDoc) {
          const tags = (userDoc!.tags || []).filter(
            (tag: UserTag) => tag != "ex locker box" && tag != "locker box",
          );
          tags.push("ex locker box");
          await userDataProvider.update(lockerbox.doc.userId, {
            tags: tags,
          });
        }
      }
    }
  }

  // https://www.figma.com/file/r12bfd7mTLDaYXDSd2IFNr/Scheduled?node-id=2%3A4
  async runGiftChequeDeactivation() {
    const cheques = await this.userService.getActiveGiftCheques();
    const promises = cheques.map(async (cheque) => {
      if (
        cheque.doc.expiryDate &&
        isBefore(cheque.doc.expiryDate.toDate(), new Date())
      ) {
        // agreement has expired.
        await this.userService.updateGiftCheque(cheque.id, {
          active: false,
        });
      }
    });
    await Promise.all(promises);
  }

  async runSendReminders() {
    const now = new Date();
    const start = addMinutes(now, -15);
    const hanoiEvents = await this.userService.getEventsByReminderDate(
      "hanoi",
      firestore.Timestamp.fromDate(start),
      firestore.Timestamp.fromDate(now),
    );
    const promises = hanoiEvents.map(async () => {
      // send reminder
      // this.sbService.
    });
    await Promise.all(promises);
  }

  //async sendWhatsapp(user: User) {
  //    const ticket = await this.trengo.createTicket(whatsappChannel, user., "Appointment Reminder"); // TODO add contact id
  //    await this.trengo.attachLabel(ticket.id, appointmentReminderLabelId);
  //    await this.trengo.startWhatsAppConversation(ticket.id, 0, [
  //     { key: "name", value: ""} // TODO:
  //    ])
  //    await this.trengo.closeTicket(ticket.id);
  //}

  async addCustomerLostTags() {
    const lastAppointmentBefore = addMonths(new Date(), -3);
    const lastAppintmentStart = addDays(lastAppointmentBefore, -3); // add 3 days grace period to limit the results
    console.log({ lastAppintmentStart, lastAppointmentBefore });
    const lostCustomers = (
      await userDataProvider.getCustomersByLastAppointment(
        firestore.Timestamp.fromDate(lastAppintmentStart),
        firestore.Timestamp.fromDate(lastAppointmentBefore),
      )
    ).getOrNull();
    if (lostCustomers) {
      console.log({ noOfCustomers: lostCustomers.length });
      let totalUpdated = 0;
      const batches = chunk(lostCustomers, 100);
      for (const batch of batches) {
        totalUpdated += await this.addLostCustomerTagsBatch(batch);
      }
      console.log({ totalUpdated });
    }
  }

  async addLostCustomerTagsBatch(lostCustomers: BarbaardUserWithId[]) {
    let updated = 0;
    const promises = lostCustomers.map((customer) => {
      const [id, doc] = customer;
      if (
        doc.barbershop?.lastAppointment &&
        isBefore(
          doc.barbershop?.lastAppointment?.toDate(),
          addMonths(new Date(), -3),
        )
      ) {
        return;
      }
      if (
        !doc.barbershop?.totalAppointments ||
        doc.barbershop?.totalAppointments <= 0
      ) {
        return;
      }
      const docsList: UserTag[] = doc.tags!;
      if (docsList?.includes("customer lost")) {
        return;
      }
      console.log(`Updating ${id}`);
      updated++;
      const tag: UserTag = "customer lost";

      return userDataProvider.update(id, {
        tags: [...new Set(...tag, ...(doc.tags ?? []))] as UserTag[],
      });
    });
    await Promise.all(promises);
    return updated;
  }
}
