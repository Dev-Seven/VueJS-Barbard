import { MainService } from "./service.js";
import {
  type Event,
  type Service,
  type Staff,
  type EventStatus,
  type EventType,
  type EventService,
  type LocationId,
  type BarbaardUser,
} from "@barbaard/types";
import { UserStoreService } from "./userstore.js";

import lodash from "lodash";
const { isArray, isEmpty } = lodash;

import { parse } from "date-fns";
import { getServiceName } from "./modules/events/EventService.js";
import { parseStaffAny } from "./utils/event.js";
import data from "./sys/data/data.js";
import firebase from "./sys/firebase/firebase.js";
import * as firestore from "firebase-admin/firestore";
import type { BarbaardUserWithId } from "./sys/data/user_data_provider.js";

export interface WPcustomerCreateRequest {
  action: string;
  expressBeardTrim: "yes" | "no";
  expressHaircut: "yes" | "no";
  birthday: string;
  company: string;
  createdAt: string;
  customerAlert: string;
  email: string;
  firstName: string;
  kiotvietId: string;
  lastName: string;
  membershipNumber: string;
  nationality: string;
  phone: string;
  wpId: number;
  booklyUserId: number;
  displayName?: string;
}

export interface WPcustomerUpdateRequest {
  booklyUserId?: string;
  action: string;
  expressBeardTrim: "yes" | "no";
  expressHaircut: "yes" | "no";
  birthday: string;
  company: string;
  createdAt: string;
  customerAlert: string;
  email: string;
  firstName: string;
  kiotvietId: string;
  lastName: string;
  membershipNumber: string;
  nationality: string;
  phone: string;
  wpId: number;
}

export interface WpAppointmentCreateRequest {
  action: "new_appointment";
  locationId: number;
  booklyId: number;
  endDate: string;
  serviceId: string;
  staffId: number;
  staffAny: string | boolean;
  internalNote: string;
  startDate: string;
  userId?: string;
  customFields: string;
  createdFrom: string;
  createdAt: string;
  status: string;
  booklyUserId: number;

  // hack to get user info
  firstName: string;
  lastName: string;
  email: string;
  birthDay: string;

  // optional field to append to existing events
  chainId?: number;
}

export interface WpAppointmentUpdateRequest {
  action: "update_appointment";
  locationId: number;
  booklyId: number | string;
  endDate: string;
  serviceId: number;
  staffId: number;
  staffAny: string | boolean;
  internalNote: string;
  startDate: string;
  booklyUserId: string;
  userId: string;
  customFields: string;
  status: string;
  // optional field to append to existing events
  chainId?: number;
}

export interface WpNotificationRequest {
  action: "notification";
  locationId: number;
  booklyId: number;
}
interface IdValue {
  id: 75285 | 32991 | 2952;
  value: string | string[];
}

export const getLocationDoc = (id: number): LocationId => {
  if (id === 1 || id === 4) {
    return "hanoi";
  }
  return "hcmc";
};

export enum CustomKeys {
  discountCode = 2952,
  notes = 52386,
  UpgradeKey1 = 75285,
  UpgradeKey2 = 32991,
  source = 54270,
  medium = 56751,
  campaign = 5485,

  firebaseUidStaging = 9065,
  firebaseUid = 86621,
}

const userDataProvider = data.userDataProvider();
const firebaseApp = firebase;
export class WordpressService {
  constructor(
    private userService: UserStoreService,
    private mainService: MainService,
  ) {}

  async addUserFieldsToEvents(
    locationId: LocationId,
    userId: string,
    userDoc: BarbaardUser,
  ) {
    const events = await this.userService.getAllEventByUserId(
      locationId,
      userId,
    );
    console.log("update events linked to user: ", events.length);
    for (const event of events) {
      console.log("update event", event.id);
      await this.userService.updateEvent(locationId, event.id, {
        userName: userDoc.fullName,
        userTags: userDoc.tags || [],
      });
    }
  }

  async createCustomer(request: WPcustomerCreateRequest) {
    console.log({ createCustomer: request });

    // https://barbaard.atlassian.net/browse/BF-80
    // check by booklyUserId first
    if (request.booklyUserId) {
      console.log(
        `lookup existing customer with booklyUserId: ${request.booklyUserId}`,
      );
      const userByBooklyUserId = (
        await userDataProvider.getUserByBooklyUserId(
          Number(request.booklyUserId),
        )
      ).getOrNull();
      if (userByBooklyUserId) {
        const [id] = userByBooklyUserId;
        // update user doc
        console.log(
          `update existing customer with booklyUserId: ${request.booklyUserId}`,
        );
        const user = this.getUserDoc(request);

        const { tags, tagsUpdated } = await this.mainService.evaluateTags(
          id,
          user.tags,
        );
        console.log({ tags, tagsUpdated });
        if (tagsUpdated) {
          user.tags = tags;
        }
        await userDataProvider.update(id, user);
        console.log("update events");
        // add tags to related events

        await this.addUserFieldsToEvents("hanoi", id, user);
        await this.addUserFieldsToEvents("hcmc", id, user);
        return;
      }
    }

    const userByWpId = await userDataProvider
      .getUserByWpId(request.wpId)
      .catch(null);
    if (userByWpId) {
      console.log("user already exists with wpId:", request.wpId);
      return;
    }

    if (request.phone?.trim()) {
      const userByPhone = (
        await userDataProvider.getUserByPhone(request.phone)
      ).getOrNull();
      if (userByPhone) {
        const [id, usr] = userByPhone;
        if (usr.wpId !== request.wpId) {
          console.error(
            "duplicate user, phone number is found on another user with a different wpId",
            request.wpId,
            id,
          );
          return;
        }
      }
    }

    const user = this.getUserDoc(request);
    const createdUser = (await userDataProvider.create(user)).getOrNull();
    if (request.phone && createdUser) {
      const [id] = createdUser;
      await firebaseApp
        .auth()
        .createUser({
          uid: id,
          phoneNumber: request.phone,
          displayName: `${request.firstName} ${request.lastName}`,
        })
        .catch((err) => {
          console.log("failed to create auth user", err);
        });
    }
  }

  getUserDoc(request: WPcustomerCreateRequest): BarbaardUser {
    let { firstName, lastName } = request;
    const { displayName } = request;
    if (!firstName && !lastName && displayName) {
      const displayNameSplit = displayName.split(" ");
      firstName = displayNameSplit[0]?.trim() || "";
      lastName = displayNameSplit[1]?.trim() || "";
    }
    const user: BarbaardUser = {
      barbershop: {
        expressBeardTrim: request.expressBeardTrim == "yes",
        expressHaircut: request.expressHaircut == "yes",
      },
      company: request.company,
      createdAt: firestore.Timestamp.fromDate(new Date()),
      customerAlert: request.customerAlert,
      email: request.email,
      firstName: firstName || "",
      lastName: lastName || "",
      fullName: `${firstName} ${lastName}`,
      kiotvietID: request.kiotvietId,
      nationality: request.nationality,
      phone: request.phone,
      wpId: request.wpId,
      booklyUserId: Number(request.booklyUserId),
    };
    if (request.birthday) {
      user.birthday = firestore.Timestamp.fromDate(new Date(request.birthday));
    }
    return user;
  }

  async getUserFromRequest(request: WpAppointmentCreateRequest) {
    let user: { id: string; doc: Partial<BarbaardUser> } | null = null;
    const db = firebase.firestore();

    const firebaseUid = this.getFirebaseUidFromCustomFields(
      request.customFields,
    );

    if (firebaseUid) {
      const userByFirebaseUid = await db.doc(`users/${firebaseUid}`).get();
      if (userByFirebaseUid.exists) {
        user = {
          id: userByFirebaseUid.id,
          doc: userByFirebaseUid.data() as BarbaardUser,
        };
      }
    }

    if (!user && request.userId) {
      const querySnapshot = await db
        .collection("users")
        .where("wpId", "==", Number(request.userId))
        .get();
      if (querySnapshot.size > 1) {
        const wpIds: string[] = [];
        querySnapshot.forEach((doc) => {
          wpIds.push(doc.id);
        });
        throw new Error(
          `duplicate users found with wpId: ${request.userId}: ${wpIds.join(
            ", ",
          )}`,
        );
      } else if (querySnapshot.size === 1) {
        console.log(`found user by wpId: ${request.userId}`);
        querySnapshot.forEach((doc) => {
          user = {
            id: doc.id,
            doc: doc.data() as BarbaardUser,
          };
        });
      } else {
        console.log(`user not found by wpId: ${request.userId}`);
      }
    }

    if (!user && request.booklyUserId) {
      const querySnapshot = await db
        .collection("users")
        .where("booklyUserId", "==", Number(request.booklyUserId))
        .get();
      if (querySnapshot.size > 1) {
        const booklyUserIds: string[] = [];
        querySnapshot.forEach((doc) => {
          booklyUserIds.push(doc.id);
        });
        throw new Error(
          `duplicate users found with booklyUserId: ${
            request.booklyUserId
          }: ${booklyUserIds.join(", ")}`,
        );
      } else if (querySnapshot.size === 1) {
        console.log(`found user by booklyUserId: ${request.booklyUserId}`);
        querySnapshot.forEach((doc) => {
          user = {
            id: doc.id,
            doc: doc.data() as BarbaardUser,
          };
        });
      } else {
        console.log(`user not found by booklyUserId: ${request.booklyUserId}`);
        console.log(
          `creating new user with booklyUserId: ${request.booklyUserId}`,
        );
        const userDoc = {
          booklyUserId: +request.booklyUserId,
          createdAt: firestore.Timestamp.now(),
        };

        const docRef = await db.collection("users").add(userDoc);
        console.log(`newly created user id: ${docRef.id}`);
        user = {
          id: docRef.id,
          doc: userDoc,
        };
      }
    }

    if (user) {
      // check if request.firstName, request.lastName, request.email, request.birthDay are present and not empty then assign to User.doc
      if (request.firstName.trim()) {
        user.doc.firstName = request.firstName.trim();
      }
      if (request.lastName.trim()) {
        user.doc.lastName = request.lastName.trim();
      }
      if (request.email.trim()) {
        user.doc.email = request.email.trim();
      }

      if (request.booklyUserId) {
        user.doc.booklyUserId = Number(request.booklyUserId);
      }
      if (request.birthDay) {
        user.doc.birthday = firestore.Timestamp.fromDate(
          this.parseDate(request.birthDay.trim()),
        );
      }
      await userDataProvider.update(user.id, user.doc);
    }

    return user;
  }

  parseDate(birthDay: string) {
    if (birthDay.indexOf("/") >= 0) {
      if (Number(birthDay.split("/")[1]) >= 13) {
        return parse(birthDay, "MM/dd/yyyy", new Date());
      }
      return parse(birthDay, "dd/MM/yyyy", new Date());
    } else if (/^\d+$/.test(birthDay)) {
      return parse(birthDay, "yyyyMMdd", new Date());
    }
    return new Date(birthDay);
  }

  async updateCustomer(request: WPcustomerUpdateRequest) {
    console.log({ updateCustomer: request });
    let user: { id: string; doc: Partial<BarbaardUser> } | null = null;

    const db = firebase.firestore();

    const querySnapshotByWpId = await db
      .collection("users")
      .where("wpId", "==", Number(request.wpId))
      .get();

    if (querySnapshotByWpId.size > 1) {
      const userIds: string[] = [];
      querySnapshotByWpId.forEach((doc) => {
        userIds.push(doc.id);
      });
      throw new Error(
        `duplicate users found with wpId: ${request.wpId}: ${userIds.join(
          ", ",
        )}`,
      );
    } else if (querySnapshotByWpId.size === 1) {
      console.log(`found user by wpId: ${request.wpId}`);
      user = {
        id: querySnapshotByWpId.docs[0]!.id,
        doc: querySnapshotByWpId.docs[0]!.data() as BarbaardUser,
      };
    } else {
      console.log(`user not found by wpId: ${request.wpId}`);
    }

    if (!user && request.phone) {
      const querySnapshotByPhone = await db
        .collection("users")
        .where("phone", "==", request.phone.trim())
        .get();

      if (querySnapshotByPhone.size > 1) {
        const userIds: string[] = [];
        querySnapshotByPhone.forEach((doc) => {
          userIds.push(doc.id);
        });
        throw new Error(
          `duplicate users found with phone: ${request.phone}: ${userIds.join(
            ", ",
          )}`,
        );
      } else if (querySnapshotByPhone.size === 1) {
        console.log(`found user by phone: ${request.phone}`);
        user = {
          id: querySnapshotByPhone.docs[0]!.id,
          doc: querySnapshotByPhone.docs[0]!.data() as BarbaardUser,
        };
      } else {
        console.log(`user not found by phone: ${request.phone}`);
      }
    }

    if (!user && request.booklyUserId) {
      const querySnapshotByBooklyId = await db
        .collection("users")
        .where("booklyUserId", "==", Number(request.booklyUserId))
        .get();

      if (querySnapshotByBooklyId.size > 1) {
        const userIds: string[] = [];
        querySnapshotByBooklyId.forEach((doc) => {
          userIds.push(doc.id);
        });
        throw new Error(
          `duplicate users found with booklyUserId: ${
            request.booklyUserId
          }: ${userIds.join(", ")}`,
        );
      } else if (querySnapshotByBooklyId.size === 1) {
        console.log(`found user by booklyUserId: ${request.booklyUserId}`);
        user = {
          id: querySnapshotByBooklyId.docs[0]!.id,
          doc: querySnapshotByBooklyId.docs[0]!.data() as BarbaardUser,
        };
      } else {
        console.log(`user not found by booklyUserId: ${request.booklyUserId}`);
      }
    }

    if (!user) {
      throw new Error(
        `Coudn't match to an existing user with wpid: ${request.wpId} or phone: ${request.phone} or booklyUserId: ${request.booklyUserId}`,
      );
    }

    const { id: id, doc: usr } = user;

    const update: Partial<BarbaardUser> = {
      barbershop: {
        ...usr.barbershop,
        expressBeardTrim: request.expressBeardTrim == "yes",
        expressHaircut: request.expressHaircut == "yes",
      },
      company: request.company,
      customerAlert: request.customerAlert,
      email: request.email,
      kiotvietID: request.kiotvietId,
      nationality: request.nationality,
      phone: request.phone,
      wpId: request.wpId,
    };
    if (request.firstName && request.lastName) {
      update.firstName = request.firstName;
      update.lastName = request.lastName;
    }
    if (request.birthday) {
      update.birthday = firestore.Timestamp.fromDate(
        this.parseDate(request.birthday),
      );
    }
    console.log({ id: id, update });
    await userDataProvider.update(id, update);
  }

  async createEvent(request: WpAppointmentCreateRequest) {
    console.log({ request });
    if (!request.locationId) {
      throw new Error("location id can't be empty");
    }
    const location = getLocationDoc(request.locationId);
    const service = await this.userService.getServiceByWpId(
      Number(request.serviceId),
    );
    const staff = await this.userService.getStaffByWpId(
      Number(request.staffId),
    );
    const user = await this.getUserFromRequest(request);

    if (user != null) {
      console.log("updating user: " + user.id);

      await userDataProvider.update(user.id, user.doc);

      if (request.chainId) {
        const existingEventByChainId = await this.userService
          .getEventByChainId(location, Number(request.chainId))
          .catch(() => null);

        if (existingEventByChainId) {
          // append or update
          await this.mergeChainedEvents(
            request,
            existingEventByChainId,
            service,
            staff,
            location,
          );
          return;
        }
      }

      // check if event exists by booklyId before create
      const existingEvent = await this.userService
        .getEventByBooklyId(location, request.booklyId)
        .catch(() => null);
      if (existingEvent) {
        throw new Error(`event ${request.booklyId} has already been created.`);
      }

      let event: Event = {
        booklyId: Number(request.booklyId),
        chainId: Number(request.chainId),
        createdAt: firestore.Timestamp.fromDate(new Date(request.createdAt)),
        updatedAt: firestore.Timestamp.fromDate(new Date(request.createdAt)),
        createdFrom: request.createdFrom,

        startDate: firestore.Timestamp.fromDate(new Date(request.startDate)),
        endDate: firestore.Timestamp.fromDate(new Date(request.endDate)),

        internalNote: request.internalNote || "",

        staffAny: parseStaffAny(request.staffAny),
        type: service.doc.type as EventType | undefined,

        userId: user.id,
        userName: `${user.doc.firstName} ${user.doc.lastName}`,
        userTags: user.doc.tags || [],

        services: [
          {
            id: service.id,
            name: service.doc.name,
            price: service.doc.price,
            staff: staff.doc.name,
            staffId: staff.id,
            duration: service.doc.duration,
          },
        ],
        status: request.status as EventStatus,
      };

      if (request.customFields) {
        const customFieldUpdates = await this.getCustomFieldsUpdate(
          request.customFields,
        );
        event = { ...event, ...customFieldUpdates };
      }

      await this.userService.addEvent(location, event);
    }
  }

  getChainedUpdate(
    request: WpAppointmentCreateRequest | WpAppointmentUpdateRequest,
    existingEventByChainId: { id: string; doc: Event },
    service: { id: string; doc: Service },
    staff: { id: string; doc: Staff },
  ): Partial<Event> {
    let services: EventService[] = existingEventByChainId.doc.services || [];
    const serviceIndex = services.findIndex((s) => s.id === service.id);
    if (serviceIndex >= 0) {
      services[serviceIndex] = {
        ...services[serviceIndex],
        name: service.doc.name,
        price: service.doc.price,
        staff: staff.doc.name,
        staffId: staff.id,
        duration: service.doc.duration,
        id: service?.id,
      };
    } else {
      // append
      services = [
        ...services,
        {
          id: service.id,
          name: service.doc.name,
          price: service.doc.price,
          staff: staff.doc.name,
          staffId: staff.id,
          duration: service.doc.duration,
        },
      ];
    }
    const event: Partial<Event> = {
      services,
    };
    event.serviceName = getServiceName(event.services);
    const index = services.findIndex((s) => s.id === service.id);
    if (index === 0) {
      // if first service, update start date
      event.startDate = firestore.Timestamp.fromDate(
        new Date(request.startDate),
      );
    } else if (index === services.length - 1) {
      // if last service, update end date
      event.endDate = firestore.Timestamp.fromDate(new Date(request.endDate));
    }
    if (
      existingEventByChainId.doc.type !== "appointment" &&
      service.doc.type === "appointment"
    ) {
      event.type = "appointment";
    }
    event.staffAny === event.staffAny || parseStaffAny(request.staffAny);
    return event;
  }

  async mergeChainedEvents(
    request: WpAppointmentCreateRequest | WpAppointmentUpdateRequest,
    existingEventByChainId: { id: string; doc: Event },
    service: { id: string; doc: Service },
    staff: { id: string; doc: Staff },
    location: LocationId,
  ) {
    console.log(
      `appending event: ${request.booklyId} to existing event ${existingEventByChainId.id} with same chainId`,
    );
    const eventUpdate = this.getChainedUpdate(
      request,
      existingEventByChainId,
      service,
      staff,
    );
    await this.userService.updateEvent(
      location,
      existingEventByChainId.id,
      eventUpdate,
    );
  }

  getFirebaseUidFromCustomFields(customFields: string): string | null {
    let firebaseUid: string | null = null;
    const parsed = JSON.parse(customFields);
    if (!isArray(parsed)) {
      return firebaseUid;
    }
    if (isArray(parsed)) {
      const getValue = (id: CustomKeys) => {
        const filtered = parsed.filter((obj) => obj.id == id);
        return filtered[0]?.value;
      };
      if (process.env.GCLOUD_PROJECT == "barbaard-dev") {
        firebaseUid = getValue(CustomKeys.firebaseUidStaging);
      } else {
        firebaseUid = getValue(CustomKeys.firebaseUid);
      }
      if (firebaseUid && !isArray(firebaseUid)) {
        return firebaseUid;
      }
    }
    return firebaseUid;
  }

  async getCustomFieldsUpdate(customFields: string): Promise<Partial<Event>> {
    const event: Partial<Event> = {};
    try {
      const parsed: IdValue[] = JSON.parse(customFields);
      if (!isArray(parsed)) {
        console.log("custom fields is not an array: " + parsed);
        return event;
      }
      const getValue = (id: CustomKeys) => {
        const filtered = parsed.filter((obj) => obj.id == id);
        return filtered[0]?.value;
      };
      const discountCode = getValue(CustomKeys.discountCode);
      if (discountCode && !isArray(discountCode)) {
        event.discountCode = discountCode;
      }

      const notes = getValue(CustomKeys.notes);
      if (notes && !isArray(notes)) {
        event.notes = notes;
      }

      const source = getValue(CustomKeys.source);
      if (source && !isArray(source)) {
        event.source = source;
      }

      const medium = getValue(CustomKeys.medium);
      if (medium && !isArray(medium)) {
        event.medium = medium;
      }

      const campaign = getValue(CustomKeys.campaign);
      if (campaign && !isArray(campaign)) {
        event.campaign = campaign;
      }

      event.upgrades = [];
      const promises = parsed.map(async (v) => {
        if (
          v.value &&
          !isEmpty(v.value) &&
          (v.id === CustomKeys.UpgradeKey1 || v.id === CustomKeys.UpgradeKey2)
        ) {
          if (isArray(v.value)) {
            const updatePromises = (v.value || []).map(async (title) => {
              const upgrade = await this.userService.getUpgradeByName(title);
              event.upgrades?.push({
                id: upgrade.id,
                price: upgrade.doc.price,
                name: upgrade.doc.name,
              });
            });
            await Promise.all(updatePromises);
          } else {
            const upgrade = await this.userService.getUpgradeByName(v.value);
            event.upgrades?.push({
              id: upgrade.id,
              price: upgrade.doc.price,
              name: upgrade.doc.name,
            });
          }
        }
      });
      await Promise.all(promises);
    } catch (err) {
      console.log(err, customFields);
    }
    return event;
  }

  async updateEvent(request: WpAppointmentUpdateRequest) {
    console.log({ request });
    if (!request.locationId) {
      throw new Error("location id can't be empty");
    }
    const location = getLocationDoc(request.locationId);
    const service = await this.userService.getServiceByWpId(
      Number(request.serviceId),
    );
    const user = (
      await userDataProvider.getUserByWpId(Number(request.userId))
    ).getOrNull();
    const staff = await this.userService.getStaffByWpId(
      Number(request.staffId),
    );

    const existing = await this.userService
      .getEventByBooklyId(location, Number(request.booklyId))
      .catch(console.error);

    // if it is chained and not the first event, append to existing event
    if (request.chainId && !existing) {
      console.log("Lookup chained event");
      const existingEventByChainId = await this.userService
        .getEventByChainId(location, Number(request.chainId))
        .catch(() => null);

      if (existingEventByChainId) {
        // append or update
        await this.mergeChainedEvents(
          request,
          existingEventByChainId,
          service,
          staff,
          location,
        );
        return;
      }
    }

    if (!existing) {
      throw new Error(`event with ${request.booklyId} not found.`);
    }
    const eventUpdate = this.getChainedUpdate(
      request,
      existing,
      service,
      staff,
    );
    if (user) {
      const [id, usr] = user;
      let event: Partial<Event> = {
        booklyId: existing.doc.booklyId,
        internalNote: request.internalNote || "",
        staffAny: parseStaffAny(request.staffAny),
        type: service.doc.type,
        userId: id,
        userName: usr.fullName,
        userTags: usr.tags || [],
        notifyUser: false,
        status: request.status as EventStatus,
        ...eventUpdate,
      };
      if (request.customFields) {
        const customFieldUpdates = await this.getCustomFieldsUpdate(
          request.customFields,
        );
        event = { ...event, ...customFieldUpdates };
      }

      await this.userService.updateEvent(location, existing.id, event);
    }
  }

  async notifyUser(request: WpNotificationRequest) {
    console.log("notifying user");

    console.log({ request });
    if (!request.locationId) {
      throw new Error("location id can't be empty");
    }
    const location = getLocationDoc(request.locationId);
    console.log("location: " + location);

    const existing = await this.userService.getEventByBooklyId(
      location,
      Number(request.booklyId),
    );
    console.log(`event:  locations/${location}/${existing.id}`);
    await this.userService.updateEvent(location, existing.id, {
      notifyUser: true,
    });
    console.log("event updated");
  }
}
