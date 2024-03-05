import {
  type Agreement,
  type Event,
  type EventService,
  type Location,
  type User,
  type EventNotification,
  type LoyaltyMemberGroup,
  type LocationId,
  type BarbaardUser,
  ErrorOr,
} from "@barbaard/types";
import * as firestore from "firebase-admin/firestore";

import { format } from "date-fns";
import { isProd } from "../../config.js";
import { NotificationRepository } from "./NotificationRepository.js";
import { UserStoreService } from "../../userstore.js";
import type { AgreementUser } from "../../types.js";
import data from "../../sys/data/data.js";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import type { BrevoService } from "../../clients/BrevoService.js";
import type { SendSmtpEmail } from "../../sys/brevo/types.js";

export enum TemplateId {
  Guido = 65,
  ReservationConfirmationEn = 53,
  ReservationConfirmationVn = 54,
  ReservationCancellationEn = 55,
  ReservationCancellationVn = 56,
  AppointmentFollowUpEn = 66,
  AppointmentFollowUpVn = 67,
  AppointmentConfirmationEn = 57,
  AppointmentConfirmationVn = 58,
  AppointmentUpdateEn = 59,
  AppointmentUpdateVn = 60,
  AppointmentCancellationEn = 61,
  AppointmentCancellationVn = 62,
  AppointmentNoShowEn = 63,
  AppointmentNoShowVn = 64,

  ServiceAgreementEn = 68,
  ServiceAgreementVn = 69,
  UpgradesAgreementsEn = 70,
  UpgradesAgreementsVn = 71,
  KingsAgreementsEn = 72,
  KingsAgreementsVn = 73,

  MemberUpgradeEn = 74,
  MemberUpgradeVn = 75,
  MemberDowngradeEn = 76,
  MemberDowngradeVn = 77,
  MemberUpgradeInternal = 78,
}

export enum SendinblueEventType {
  Sent = "request",
  Click = "click",
  Deferred = "deferred",
  Delivered = "delivered",
  SoftBounce = "soft_bounce",
  HardBounce = "hard_bounce",
  Complaint = "complaint",
  UniqueOpened = "unique_opened", // first opening
  Opened = "opened",
  InvalidEmail = "invalid_email",
  Blocked = "blocked",
  Error = "error",
  Unsubscribed = "unsubscribed",
  ProxyOpen = "proxy_open",
}
export interface SendinblueEvent {
  event: SendinblueEventType; // TODO: add rest
  email: string;
  id: number;
  date: string;
  ts: number;
  "message-id": string;
  ts_event: number;
  subject: string;
  tag: string;
  sending_ip: string;
  ts_epoch: number;
  tags: string[];
}

// NotificationService has business logic related to functions: onAppointmentUpdateNotifications, sendAgreementConfirmationEmail, notifyMembershipUpdate, handleSendInblueEvent
// Tickets: https://barbaard.atlassian.net/browse/BF-4
// Design: https://www.figma.com/file/r12bfd7mTLDaYXDSd2IFNr/Scheduled?node-id=0%3A1&t=G0Dt9MSHZtI5Ay7H-0
// onAppointmentUpdateNotifications is "onEvent" section from design
// sendAgreementConfirmationEmail is "Appointment Reminder" from design
// notifyMembershipUpdate is  "Memberships" from design
// handleSendInblueEvent is "Email webhook listener" from design
// Note: whatsapp, sms implementation is pending. function for appointment scheduler and agreements is pending for the same reason.

const userDataProvider = data.userDataProvider();
export class NotificationService {
  constructor(
    private userService: UserStoreService,
    private store: firestore.Firestore,
    private sbService: BrevoService,
    private notificationRepo: NotificationRepository,
  ) {}

  async sendNotificationsOnAppointmentUpdate(
    locationId: LocationId,
    eventId: string,
    event: Event,
    before: Event,
  ) {
    console.log({ locationId, eventId });

    if (!event.userId) {
      console.log("error: user id not defined");
      return;
    }

    const userDoc = (await userDataProvider.get(event.userId)).getOrNull();
    if (!userDoc) {
      return;
    } else {
      const user = userDoc!;
      const location: Location = await this.userService.getLocation(locationId);
      if (!location) {
        console.log("error: location not found");
        return;
      }

      const eventRef = this.userService.getEventRef(locationId, eventId);
      await this.store.runTransaction(async (transaction) => {
        const doc = await transaction.get(eventRef);
        const event = doc.data() as Event;
        if (event.type === "reservation") {
          if (!event.notifyUser) {
            console.log(
              `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason notifyUser: false`,
            );
            return;
          }

          if (event.status == "confirmed") {
            await this.checkAndNotify(
              transaction,
              eventRef,
              event,
              "confirmation",
              async () => {
                if (!user.email) {
                  console.log(
                    `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                  );
                  return false;
                }
                console.log(
                  `Sending email notification. Location: ${locationId}, Event: ${eventId}`,
                );
                await this.sendReservationConfirmationEmail(
                  "" + event.userId,
                  user,
                  event,
                  location,
                );
                if (this.shouldNotifyGuido(user)) {
                  await this.sendReservationConfirmationEmailToGuido(
                    user,
                    event,
                    location,
                  ).catch((err) => {
                    console.log("Failed to notify guido. Error: ", err);
                  });
                }
                return true;
              },
            );
          } else if (event.status === "cancelled") {
            await this.checkAndNotify(
              transaction,
              eventRef,
              event,
              "cancelled",
              async () => {
                if (!user.email) {
                  console.log(
                    `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                  );
                  return false;
                }
                console.log(
                  `Sending email cacellation notification. Location: ${locationId}, Event: ${eventId}`,
                );
                await this.sendReservationCancellationEmail(
                  "" + event.userId,
                  user,
                  event,
                  location,
                );
                if ((user.tags || []).includes("notify guido")) {
                  await this.sendReservationCancellationEmailToGuido(
                    user,
                    event,
                    location,
                  ).catch((err) => {
                    console.log("Failed to notify guido. Error: ", err);
                  });
                }
                return true;
              },
            );
          }
        } else if (event.type == "appointment") {
          if (event.completed) {
            await this.checkAndNotify(
              transaction,
              eventRef,
              event,
              "completed",
              async () => {
                if (!user.email) {
                  console.log(
                    `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                  );
                  return false;
                }
                await this.sendAppointmentFollowUpEmail(
                  user,
                  event.userId || "",
                  event,
                  eventId,
                );
                return true;
              },
            );
          } else {
            if (!event.notifyUser) {
              console.log(
                `Skipping notification. Location: ${locationId}, Event: ${eventId} notifyUser: false`,
              );
              return;
            }
            if (event.status === "no-show") {
              await this.checkAndNotify(
                transaction,
                eventRef,
                event,
                "no-show",
                async () => {
                  if (!user.email) {
                    console.log(
                      `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                    );
                    return false;
                  }
                  await this.sendAppointmentNoShowEmail(
                    user,
                    event.userId ?? "",
                    event,
                    location,
                  );
                  return true;
                },
              );
            } else if (event.status === "approved") {
              if (this.hasNotified(event, "confirmation")) {
                // confirm the check
                if (this.shouldSendUpdateEmail(event, before)) {
                  if (!user.email) {
                    console.log(
                      `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                    );
                    return false;
                  }
                  await this.sendAppointmentUpdateEmail(
                    user,
                    event.userId ?? "",
                    event,
                    location,
                  );
                  if (!this.hasNotified(event, "update")) {
                    this.addNotification(
                      transaction,
                      eventRef,
                      event,
                      "update",
                    );
                  }
                }
              } else {
                // send confirmation
                await this.checkAndNotify(
                  transaction,
                  eventRef,
                  event,
                  "confirmation",
                  async () => {
                    if (!user.email) {
                      console.log(
                        `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                      );
                      return false;
                    }
                    await this.sendAppointmentConfirmationEmail(
                      user,
                      event.userId || "",
                      event,
                      location,
                    );
                    if (this.shouldNotifyGuido(user)) {
                      await this.sendAppointmentConfirmationEmailToGuido(
                        user,
                        event,
                        location,
                      ).catch((err) => {
                        console.log("Failed to notify guido. Error: ", err);
                      });
                    }
                    return true;
                  },
                );
              }
            } else if (event.status === "cancelled") {
              await this.checkAndNotify(
                transaction,
                eventRef,
                event,
                "cancelled",
                async () => {
                  if (!user.email) {
                    console.log(
                      `Skipping notification. Location: ${locationId}, Event: ${eventId} Reason email not found for the user: ${event.userId}`,
                    );
                    return false;
                  }
                  await this.sendAppointmentCancellationEmail(
                    user,
                    event.userId ?? "",
                    event,
                    location,
                  );
                  if (this.shouldNotifyGuido(user)) {
                    await this.sendAppointmentCancellationEmailToGuido(
                      user,
                      event,
                      location,
                    ).catch((err) => {
                      console.log("Failed to notify guido. Error: ", err);
                    });
                  }
                  return true;
                },
              );
            }
          }
        }
        return;
      });
    }
  }

  shouldNotifyGuido(user: BarbaardUser) {
    return (user.tags || []).includes("notify guido");
  }

  shouldSendUpdateEmail(event: Event, before: Event) {
    if (
      event.startDate &&
      event.startDate.toDate().toJSON() !==
        before.startDate?.toDate?.().toJSON()
    ) {
      console.log("start date changed", {
        before: event.startDate,
        after: before.startDate,
      });
      return true;
    }
    const beforeServices = (before.services || [])
      .map((service: EventService) => service.id)
      .join();
    const afterServices = (event.services || [])
      .map((service: EventService) => service.id)
      .join();
    if (event.services && afterServices !== beforeServices) {
      console.log("service changed", {
        before: event.serviceName,
        after: before.serviceName,
      });
      return true;
    }
    const beforeStaff = (before.services || [])
      .map((service: EventService) => service.staffId)
      .join();
    const afterStaff = (event.services || [])
      .map((service: EventService) => service.staffId)
      .join();
    if (event.services && afterStaff !== beforeStaff) {
      console.log("staff changed", {
        before: event.staffName,
        after: before.staffName,
      });
      return true;
    }
    return false;
  }

  hasNotified(event: Event, notification: EventNotification) {
    return (event.notifications || []).includes(notification);
  }

  addNotification(
    transaction: firestore.Transaction,
    eventRef: firestore.DocumentReference,
    event: Event,
    notification: EventNotification,
  ) {
    const update: Partial<Event> = {
      notifications: [...(event.notifications || []), notification],
    };
    transaction.update(eventRef, update);
  }

  async checkAndNotify(
    transaction: firestore.Transaction,
    eventRef: firestore.DocumentReference,
    event: Event,
    notification: EventNotification,
    notifyFn: () => Promise<boolean>,
  ) {
    if (this.hasNotified(event, notification)) {
      console.log(
        `Skipping notification. Already notified: ${notification}, ID: ${event.booklyId}`,
      );
      return;
    }
    const notified = await notifyFn();
    if (notified) {
      this.addNotification(transaction, eventRef, event, notification);
    }
  }

  getReservationEmailContent(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ): Partial<SendSmtpEmail> {
    return {
      replyTo: {
        email: "info@ministryof.men",
      },
      params: {
        FIRSTNAME: user.firstName,
        LASTNAME: user.lastName,
        DATE: format(event.startDate.toDate(), "yyyy-MM-dd"),
        TIME: format(event.startDate.toDate(), "HH:mm"),
        SERVICE: event.serviceName,
        LOCATION: `Ministry of Men - ${location.name}`,
        ADDRESSFIRST: location.addressFirst,
        ADDRESSSECOND: location.addressSecond,
        PHONE: location.phone,
      },
    };
  }

  getAppointmentEmailContent(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ): Partial<SendSmtpEmail> {
    return {
      replyTo: {
        email: "info@ministryof.men",
      },
      params: {
        FIRSTNAME: user.firstName,
        LASTNAME: user.lastName,
        DATE: format(event.startDate.toDate(), "yyyy-MM-dd"),
        TIME: format(event.startDate.toDate(), "HH:mm"),
        SERVICE: event.serviceName,
        LOCATION: `Ministry of Men - ${location.name}`,
        ADDRESSFIRST: location.addressFirst,
        ADDRESSSECOND: location.addressSecond,
        PHONE: location.phone,
      },
    };
  }

  getAppointmentFollowUpEmailContent(
    user: BarbaardUser,
    userId: string,
    event: Event,
    eventId: string,
  ): Partial<SendSmtpEmail> {
    return {
      replyTo: {
        email: "info@houseofbarbaard.com",
      },
      params: {
        FIRSTNAME: user.firstName,
        LASTNAME: user.lastName,
        BARBER: event.staffName,
        HAIRCUT: event.serviceName, // TODO: confirm
        BEARDTRIM: event.serviceName, // TODO: confirm
        EVENTID: eventId,
        USERID: userId,
        NEXT: "?", // ?
        SHAMPOOS: [],
        HAIRS: [],
        BEARDS: [],
      },
    };
  }

  async sendAppointmentFollowUpEmail(
    user: BarbaardUser,
    userId: string,
    event: Event,
    eventId: string,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getAppointmentFollowUpEmailContent(
          user,
          userId,
          event,
          eventId,
        ),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.AppointmentFollowUpVn
            : TemplateId.AppointmentFollowUpEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "completed",
      },
    );
  }

  async sendAppointmentConfirmationEmail(
    user: BarbaardUser,
    userId: string,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getAppointmentEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.AppointmentConfirmationVn
            : TemplateId.AppointmentConfirmationEn,
      },
      {
        userId,
        userName: user.fullName,
        type: "confirmation",
      },
    );
  }

  async sendAppointmentConfirmationEmailToGuido(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    return this.sendToGuido({
      ...this.getAppointmentEmailContent(user, event, location),
      templateId: TemplateId.Guido,
    });
  }

  async sendAppointmentUpdateEmail(
    user: BarbaardUser,
    userId: string,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getAppointmentEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.AppointmentUpdateVn
            : TemplateId.AppointmentUpdateEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "update",
      },
    );
  }

  async sendAppointmentCancellationEmail(
    user: BarbaardUser,
    userId: string,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getAppointmentEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.AppointmentCancellationVn
            : TemplateId.AppointmentCancellationEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "cancelled",
      },
    );
  }

  async sendAppointmentCancellationEmailToGuido(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    return this.sendToGuido({
      ...this.getAppointmentEmailContent(user, event, location),
      templateId: TemplateId.Guido,
    });
  }

  async sendAppointmentNoShowEmail(
    user: BarbaardUser,
    userId: string,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    await this.sendEmail(
      {
        ...this.getAppointmentEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.AppointmentNoShowVn
            : TemplateId.AppointmentNoShowEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "no-show",
      },
    );
  }

  async sendEmail(
    email: SendSmtpEmail,
    params: { userId: string; userName?: string; type: string },
  ) {
    const payload = {
      ...email,
      to: isProd()
        ? email.to
        : [
            {
              email: "admin@barbaard.com",
              name: "Admin",
            },
          ],
    };
    const response = await this.sbService.sendEmail(payload);
    console.log("email sent", { response: response.body });
    const notification = await this.notificationRepo.addNotification({
      messageId: response.data.messageId,
      method: "email",
      sendAt: firestore.Timestamp.fromDate(new Date()),
      userId: params.userId,
      userName: params.userName,
      payload: payload,
      type: params.type,
    });
    console.log("notification added. Id:", notification.id);
    return response;
  }

  async sendToGuido(email: Partial<SendSmtpEmail>) {
    const response = await this.sbService.sendEmail({
      ...email,
      to: [
        {
          email: "guido@barbaard.com",
          name: "Guido",
        },
      ],
    });
    console.log("guido email sent", { response: response.body });
    return response;
  }

  async sendReservationCancellationEmail(
    userId: string,
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getReservationEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.ReservationCancellationVn
            : TemplateId.ReservationCancellationEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "cancelled",
      },
    );
  }

  async sendReservationConfirmationEmail(
    userId: string,
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    if (!user.email) return;
    return this.sendEmail(
      {
        ...this.getReservationEmailContent(user, event, location),
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        templateId:
          user.preferences?.locale === "vi"
            ? TemplateId.ReservationConfirmationVn
            : TemplateId.ReservationConfirmationEn,
      },
      {
        userId: userId,
        userName: user.fullName,
        type: "confirmation",
      },
    );
  }

  async sendReservationCancellationEmailToGuido(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    return this.sendToGuido({
      ...this.getReservationEmailContent(user, event, location),
      templateId: TemplateId.Guido,
    });
  }

  async sendReservationConfirmationEmailToGuido(
    user: BarbaardUser,
    event: Event,
    location: Location,
  ) {
    return this.sendToGuido({
      ...this.getReservationEmailContent(user, event, location),
      templateId: TemplateId.Guido,
    });
  }

  // Appointment Reminder
  // Every 15 minutes between 7:00 and 21:00, query all appointments starting between now and now + 2 hours,
  //

  // email to send when agreement is created
  async sendAgreementConfirmationEmail(agreement: Agreement) {
    const userPromises = (agreement.users || []).map((user: AgreementUser) =>
      userDataProvider.get(user.userId),
    );

    const errorOrUsers = await Promise.all(userPromises);
    const users =
      ErrorOr.transform<
        DocumentSnapshot<BarbaardUser>,
        Array<object>,
        Array<DocumentSnapshot<BarbaardUser>>
      >(
        errorOrUsers,
        () => [],
        (a, l) => l.push(a),
      ).getOrNull() ?? [];
    for (const userDoc of users) {
      const user = userDoc.data()!;
      let templateId: TemplateId;
      if (agreement.type == "king") {
        templateId =
          user.preferences?.locale === "vi"
            ? TemplateId.KingsAgreementsVn
            : TemplateId.KingsAgreementsEn;
      } else if (agreement.type == "service") {
        templateId =
          user.preferences?.locale === "vi"
            ? TemplateId.ServiceAgreementVn
            : TemplateId.ServiceAgreementEn;
      } else if (agreement.type == "gentleman up") {
        // gentleman up is same as upgrades
        templateId =
          user.preferences?.locale === "vi"
            ? TemplateId.UpgradesAgreementsVn
            : TemplateId.UpgradesAgreementsEn;
      } else {
        console.log("ignoring for agreement type", agreement.type);
        return;
      }
      if (!user.email) continue;
      await this.sendEmail(
        {
          to: [
            {
              email: user.email,
              name: user.fullName,
            },
          ],
          replyTo: {
            email: "info@houseofbarbaard.com",
          },
          params: {
            FIRSTNAME: user.firstName,
            LASTNAME: user.lastName,
            SERVICENAME: agreement.serviceName,
            AMOUNT: agreement.amount,
            EXPIRY: agreement.expiryDate
              ? format(agreement.expiryDate?.toDate(), "yyyy-MM-dd")
              : "",
          },
          templateId: templateId,
        },
        {
          userId: userDoc.id,
          userName: user.fullName,
          type: "agreement-create",
        },
      );
    }
  }

  async sendMembershipUpgradeEmail(userId: string, user: User, before: User) {
    const currentMemberGroup: LoyaltyMemberGroup | null =
      user.loyalty?.memberGroup ?? null;
    if (!currentMemberGroup) {
      console.log("no member group set");
      return;
    }
    const previousMemberGroup: LoyaltyMemberGroup | null =
      before.loyalty?.memberGroup ?? null;
    if (currentMemberGroup === previousMemberGroup) {
      console.log("no change in member group");
      return;
    }
    let templateId: TemplateId;

    const memberGroupValues = {
      "Club Member": 1,
      "Silver Member": 2,
      "Gold Member": 3,
      "Black Member": 4,
      "Black Diamond Member": 5,
    };

    const isUpgrade =
      !previousMemberGroup ||
      (Object.keys(memberGroupValues).some((v) => v == currentMemberGroup) &&
        Object.keys(memberGroupValues).some((v) => v == previousMemberGroup) &&
        memberGroupValues[
          currentMemberGroup as keyof typeof memberGroupValues
        ] >
          memberGroupValues[
            previousMemberGroup as keyof typeof memberGroupValues
          ]);

    if (isUpgrade) {
      templateId =
        user.preferences?.locale === "vi"
          ? TemplateId.MemberUpgradeVn
          : TemplateId.MemberUpgradeEn;
    } else {
      templateId =
        user.preferences?.locale === "vi"
          ? TemplateId.MemberDowngradeVn
          : TemplateId.MemberDowngradeEn;
    }
    if (!user.email) return;
    await this.sendEmail(
      {
        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],
        replyTo: {
          email: "info@houseofbarbaard.com",
        },
        params: {
          FIRSTNAME: user.firstName,
          LASTNAME: user.lastName,
          MEMBERGROUP: user.loyalty?.memberGroup,
          POINTS: user.loyalty?.totalPoints,
        },
        templateId: templateId,
      },
      {
        userId,
        userName: user.fullName,
        type: "membership-update",
      },
    );
    if (
      currentMemberGroup === "Gold Member" ||
      currentMemberGroup === "Black Member"
    ) {
      await this.sendEmail(
        {
          to: [
            {
              email: "info@barbaard.com",
              name: "Info",
            },
          ],
          replyTo: {
            email: "info@houseofbarbaard.com",
          },
          params: {
            FIRSTNAME: user.firstName,
            LASTNAME: user.lastName,
            MEMBERGROUP: user.loyalty?.memberGroup,
            POINTS: user.loyalty?.totalPoints,
          },
          templateId: TemplateId.MemberUpgradeInternal,
        },
        {
          userId,
          userName: user.fullName,
          type: "membership-update",
        },
      );
    }
  }

  //	async handleSendInblueEvent(event: SendinblueEvent) {
  //		const notification = await this.notificationRepo
  //			.getByMessageId(event["message-id"])
  //			.catch(() => null);
  //		if (!notification) {
  //			console.log(
  //				"notification not found for:" +
  //					event["message-id"]
  //			);
  //			return;
  //		}
  //		await this.notificationRepo.updateNotification(
  //			notification.id,
  //			{
  //				events: [
  //					...(notification.doc.events || []),
  //					event,
  //				],
  //			}
  //		);
  //		if (!notification.doc.userId) {
  //			console.log("user not found on notification document");
  //			return;
  //		}
  //		const errorTypes: {
  //			[eventType in SendinblueEventType]?: boolean;
  //		} = {
  //			[SendinblueEventType.Deferred]: true,
  //			[SendinblueEventType.HardBounce]: true,
  //			[SendinblueEventType.SoftBounce]: true,
  //			[SendinblueEventType.Complaint]: true,
  //			[SendinblueEventType.InvalidEmail]: true,
  //			[SendinblueEventType.Blocked]: true,
  //			[SendinblueEventType.Error]: true,
  //		};
  //		if (errorTypes[event.event]) {
  //			await userDataProvider.repo.update(
  //				notification.doc.userId,
  //				{
  //
  //					"notifications.emailError": true,
  //					"notifications.emailErrorType":
  //						event.event,
  //					// 'notifications.emailErrorReason': '' TODO
  //				}
  //			);
  //		} else if (event.event === SendinblueEventType.Unsubscribed) {
  //			await this.userService.updateUserByUpdateData(
  //				notification.doc.userId,
  //				{
  //					"notifications.emailNotificationSubscribed":
  //						false,
  //				}
  //			);
  //		}
  //		if (event.event != SendinblueEventType.Click) {
  //			await this.userService.updateUserByUpdateData(
  //				notification.doc.userId,
  //				{
  //					"notifications.emailError": false,
  //					"notifications.emailErrorType": null,
  //					"notifications.emailErrorReason": null,
  //				}
  //			);
  //		}
  //	}
}
