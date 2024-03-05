import { Event, EventStatus, User } from '@barbaard/types';
import { FirestoreRepository } from './firestore.repository';
import { getLocationByWordpressId, removeDiacritics } from './utils';
import { WordpressRepository } from './worpress.repository';
import { keyBy } from 'lodash';
import { format } from 'date-fns';
import { createWriteStream, WriteStream } from 'fs';
import { EventRow } from './wordpress.types';

import { isArray, isEmpty } from "lodash";
import { el } from "date-fns/locale";

interface IdValue {
  id: 75285 | 32991 | 2952;
  value: string | string[];
}

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

export class EventImportor {
  constructor(
    private dryRun: boolean,
    private wordpressRepo: WordpressRepository,
    private firestoreRepo: FirestoreRepository,
    private duplicateWpIdFile?: WriteStream,
    private duplicateBooklyIdFile?: WriteStream,
    private unCertainCasesFile?: WriteStream,
  ) {}

  async importEvents(wordpressUserIds: number[]) {
    let index = 0;
    for (const id of wordpressUserIds) {
      index++;
      console.info(
        `Importing events of user(${index}/${wordpressUserIds.length}): ${id}`,
      );
      await this.importWordpressUserEvents(id);
    }
  }

  async getEventsFromDate(fromDate: string) {
    const events = await this.wordpressRepo.fetchEventsFromDate(fromDate);
    return events;
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

            const service = await this.firestoreRepo.getServiceByWpId(
                Number(event.service_id)
            );
            const staff = await this.firestoreRepo.getStaffByWpId(
                Number(event.staff_id)
            );
            const newEvent: Event = {
                booklyId: event.appointment_id,
                userId: user.id,
                userName: user.doc.fullName,
                userTags: user.doc.tags || [],
                staffName: event.staff_name,
                serviceName: event.service_name,
                startDate: FirebaseFirestore.Timestamp.fromDate(new Date(event.start_date)),
                endDate: FirebaseFirestore.Timestamp.fromDate(new Date(event.end_date)),
                createdAt: FirebaseFirestore.Timestamp.fromDate(new Date(event.created_at)),
                updatedAt: FirebaseFirestore.Timestamp.fromDate(new Date(event.updated_at)),
                status: EventStatus[event.status],
                createdFrom: event.created_from,
                memberGroup: user.doc.loyalty?.memberGroup,
                completed: event.status == 'completed',
                upgrades: partialEvent.upgrades,
                notes: partialEvent.notes,
                discountCode: partialEvent.discountCode,
                source: partialEvent.source,
                medium: partialEvent.medium,
                campaign: partialEvent.campaign,
                internalNote: event.internal_note,
                services: [
                    {
                        id: service.id,
                        name: service.doc.name,
                        price: service.doc.price,
                        staff: event.staff_name,
                        staffId: staff.id,
                        duration: service.doc.duration,
                    },
                ],
                type: service.doc.type,
                staffAny: event.staff_any
            }
            if (!this.dryRun) {
                console.log(`Create Event ${location} booklyId: ${event.appointment_id}`)
                const createdEvent = await this.firestoreRepo.addEvent(location, newEvent);
                console.log(`\t- /locations/${location}/events/${createdEvent.id}`)
            } else {
                console.log(`Will create event ${location} booklyId: ${event.appointment_id}, user: ${user.id}, wpId ${user.doc.wpId}`);
            }
            // TODO: add logic to add missing ones (Required only if there are such cases)
        } else if (existingEvents.length == 1) {
            const existingEvent = existingEvents[0];
            const update: Partial<Event> = {
                userId: user.id,
                userName: user.doc.fullName,
                userTags: user.doc.tags || [],
            }
            if (user.doc.loyalty?.memberGroup) {
                update.memberGroup = user.doc.loyalty?.memberGroup;
            }
            if (!this.dryRun) {
                console.log(`Update Event ${location}/${existingEvent.id}`)
                //await this.firestoreRepo.updateEvent(location, existingEvent.id, update);
            } else {
                console.log(`Will update event /locations/${location}/events/${existingEvent.id} with user: ${user.id}, userName ${user.doc.fullName}, tags: ${user.doc.tags || []}`);
            }
        } else if (existingEvents.length == 2) {
            console.log("\n\n== DEALING with 2 duplicates ==\n\n")
            //print existing events booklyIds

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
              const upgrade = await this.firestoreRepo.getUpgradeByTitle(title);
              event.upgrades?.push({
                id: upgrade.id,
                price: upgrade.doc.price,
                name: upgrade.doc.name,
              });
            });
            await Promise.all(updatePromises);
          } else {
            const upgrade = await this.firestoreRepo.getUpgradeByTitle(v.value);
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

  async importEvent(event: EventRow, user: { id: string; doc: User }) {
    // all events were imported previosly. If user was not found, user fields were set empty.
    const location = getLocationByWordpressId(event.location_id);
    const existingEvents = await this.firestoreRepo.getEventsByBooklyId(
      location,
      event.appointment_id,
    );
    // const user = await this.firestoreRepo.getUserByWpId(event.wp_user_id);

    if (existingEvents.length == 0) {
      // console.error(`Event missing in firestore ${location}/${event.ca_bookly_id}`);
      const partialEvent = await this.getCustomFieldsUpdate(
        event.custom_fields,
      );

      const service = await this.firestoreRepo.getServiceByWpId(
        Number(event.service_id),
      );
      const staff = await this.firestoreRepo.getStaffByWpId(
        Number(event.staff_id),
      );
      const newEvent: Event = {
        booklyId: event.appointment_id,
        userId: user.id,
        userName: user.doc.fullName,
        userTags: user.doc.tags || [],
        staffName: event.staff_name,
        serviceName: event.service_name,
        startDate: firestore.Timestamp.fromDate(new Date(event.start_date)),
        endDate: firestore.Timestamp.fromDate(new Date(event.end_date)),
        createdAt: firestore.Timestamp.fromDate(new Date(event.created_at)),
        updatedAt: firestore.Timestamp.fromDate(new Date(event.updated_at)),
        status: EventStatus[event.status],
        createdFrom: event.created_from,
        memberGroup: user.doc.loyalty?.memberGroup,
        completed: event.status == "completed",
        upgrades: partialEvent.upgrades,
        notes: partialEvent.notes,
        discountCode: partialEvent.discountCode,
        source: partialEvent.source,
        medium: partialEvent.medium,
        campaign: partialEvent.campaign,
        internalNote: event.internal_note,
        services: [
          {
            id: service.id,
            name: service.doc.name,
            price: service.doc.price,
            staff: event.staff_name,
            staffId: staff.id,
            duration: service.doc.duration,
          },
        ],
        type: service.doc.type,
        staffAny: event.staff_any,
      };
      if (!this.dryRun) {
        console.log(
          `Create Event ${location} booklyId: ${event.appointment_id}`,
        );
        const createdEvent = await this.firestoreRepo.addEvent(
          location,
          newEvent,
        );
        console.log(`\t- /locations/${location}/events/${createdEvent.id}`);
      } else {
        console.log(
          `Will create event ${location} booklyId: ${event.appointment_id}, user: ${user.id}, wpId ${user.doc.wpId}`,
        );
      }
      // TODO: add logic to add missing ones (Required only if there are such cases)
    } else if (existingEvents.length == 1) {
      const existingEvent = existingEvents[0];
      const update: Partial<Event> = {
        userId: user.id,
        userName: user.doc.fullName,
        userTags: user.doc.tags || [],
      };
      if (user.doc.loyalty?.memberGroup) {
        update.memberGroup = user.doc.loyalty?.memberGroup;
      }
      if (!this.dryRun) {
        console.log(`Update Event ${location}/${existingEvent.id}`);
        //await this.firestoreRepo.updateEvent(location, existingEvent.id, update);
      } else {
        console.log(
          `Will update event /locations/${location}/events/${
            existingEvent.id
          } with user: ${user.id}, userName ${user.doc.fullName}, tags: ${
            user.doc.tags || []
          }`,
        );
      }
    } else if (existingEvents.length == 2) {
      console.log("\n\n== DEALING with 2 duplicates ==\n\n");
      //print existing events booklyIds

      for (const existingEvent of existingEvents) {
        console.log(`\t- /locations/${location}/events/${existingEvent.id}`);
      }

      // const eventToFix = existingEvents.filter((event) => event.doc.userName)[0];

      // // a.toLocaleDateString('af-ZA') + ' ' + a.toLocaleTimeString()

      // const startDate = eventToFix.doc.startDate.toDate();
      // const endDate = eventToFix.doc.endDate.toDate();

      // if (eventToFix) {
      //     const wpEvents = await this.wordpressRepo.fetchEventsByEventData(
      //         startDate.toLocaleDateString('af-ZA') + ' ' + startDate.toLocaleTimeString('af-ZA'),
      //         endDate.toLocaleDateString('af-ZA') + ' ' + endDate.toLocaleTimeString('af-ZA'),
      //         eventToFix.doc.userName,
      //         eventToFix.doc.staffName + '%'
      //     )
      //     if (wpEvents.length == 0) {
      //         throw new Error(`Event not found for ${eventToFix.id} ${startDate.toLocaleDateString('af-ZA') + ' ' + startDate.toLocaleTimeString('af-ZA')}, ${endDate.toLocaleDateString('af-ZA') + ' ' + endDate.toLocaleTimeString('af-ZA')}, ${eventToFix.doc.userName}, ${eventToFix.doc.staffName}, ${eventToFix.doc.serviceName}`)
      //     } else if (wpEvents.length != 1) {
      //         throw new Error(`Multiple events found for ${startDate.toLocaleDateString('af-ZA') + ' ' + startDate.toLocaleTimeString('af-ZA')}, ${endDate.toLocaleDateString('af-ZA') + ' ' + endDate.toLocaleTimeString('af-ZA')}, ${eventToFix.doc.userName}, ${eventToFix.doc.staffName}, ${eventToFix.doc.serviceName}`)
      //     }
      //     this.firestoreRepo.updateEvent(location, eventToFix.id, { booklyId: wpEvents[0].appointment_id })
      // }
    } else {
      throw new Error(
        `Multiple events found for ${event.ca_bookly_id}: ${existingEvents
          .map((event) => event.id)
          .join(", ")}`,
      );
    }
  }

  async importWordpressUserEvents(wordpressUserId) {
    const user = await this.firestoreRepo.getUserByWpId(wordpressUserId);
    if (!user) {
      console.error(`User not found: ${wordpressUserId}`);
      return;
    }
    const events = await this.wordpressRepo.fetchEventsByUserId([
      wordpressUserId,
    ]);
    for (const event of events) {
      await this.importEvent(event, user);
    }
  }

  // method to correct bookly id
  async fixBooklyIds(batchSize: number, startDate, endDate) {
    await this.fixBooklyIdByLocation("hanoi", batchSize, startDate, endDate);
    await this.fixBooklyIdByLocation("hcmc", batchSize, startDate, endDate);
  }

  async fixBooklyIdByLocation(
    location: "hcmc" | "hanoi",
    batchSize: number,
    startDate: Date,
    endDate: Date,
  ) {
    let index = 0;
    const isAppointmentsMatch = (
      event: { id: string; doc: Event },
      appointment: EventRow,
    ) => {
      return (
        appointment.start_date.toISOString() ==
          event.doc.startDate.toDate().toISOString() &&
        appointment.end_date.toISOString() ==
          event.doc.endDate.toDate().toISOString() &&
        appointment.staff_name.includes(event.doc.staffName) &&
        appointment.created_from == event.doc.createdFrom &&
        (appointment.status != "cancelled" || "rejected" || "no-show") &&
        (event.doc.status != "cancelled" || "rejected" || "no-show")
      );
    };

    const isUsersMatch = (
      user: { id: string; doc: User },
      appointment: EventRow,
    ) => {
      return (
        user?.doc?.wpId === appointment.wp_user_id &&
        removeDiacritics(user?.doc?.fullName) ==
          removeDiacritics(appointment.full_name) &&
        user?.doc?.booklyUserId == appointment.bookly_user_id
      );
    };

    for await (const events of this.firestoreRepo.fetchAllEventsWithBetween(
      location,
      startDate,
      endDate,
      batchSize,
    )) {
      index++;
      console.log("Processing batch: " + index);

      const eventsWithBooklyId = events.filter(
        (event) => event.doc.booklyId && event.doc.booklyId > 0,
      );

      // fetch customer appointments assuming booklyId is id
      const booklyIds = eventsWithBooklyId.map((event) => event.doc.booklyId);
      const wpAppointmentsByBooklyIds =
        await this.wordpressRepo.fetchEventsByIds(booklyIds);

      const appointmentByIdMap = keyBy(
        wpAppointmentsByBooklyIds,
        (event) => event.ca_bookly_id,
      );

      const promises = eventsWithBooklyId.map(async (event) => {
        const appointment = appointmentByIdMap[event.doc.booklyId];
        const appointmentsByAppointmentId =
          await this.wordpressRepo.fetchEventsByAppointmentIds([
            event.doc.booklyId,
          ]);

        // if appointment is not found, check if booklyId is actually appointment.id
        if (
          (!appointment || appointment === undefined) &&
          appointmentsByAppointmentId.length == 1 &&
          isAppointmentsMatch(event, appointmentsByAppointmentId[0])
        ) {
          console.log(
            `locations/${location}/events/${event.id} : SKIP mapped correctly : ${event.doc.booklyId}`,
          );
          return;
        }

    async fixEventTimeZones(location: 'hcmc' | 'hanoi', events: { id: string, doc: Event }[]) {
        // fetch wordpress event
        const booklyIds = events.map((e) => e.doc.booklyId);
        const wpEvents = await this.wordpressRepo.fetchEventsByIds(booklyIds);
        const wpEventMap: { [booklyId: number]: EventRow } = {}
        wpEvents.map((wpEvent) => {
            wpEventMap[wpEvent.ca_bookly_id] = wpEvent;
        });
        const promises = events.map(async (event) => {
            const appointment = wpEventMap[event.doc.booklyId];
            if (!appointment) {
                console.log(`Appointment missing for ${location}/${event.id} in wordpress. booklyId ${event.doc.booklyId}`);
                return;
            }
            const updatedStartDate = new Date(appointment.start_date);
            const updatedEndDate = new Date(appointment.end_date);
            const updatedCreatedAt = new Date(appointment.created_at);
            const updatedUpdatedAt = new Date(appointment.updated_at);
            if (this.dryRun) {
                console.log(`Will update ${event.id} with start date from ${event.doc.startDate?.toDate().toISOString()} to ${updatedStartDate.toISOString()}, end date from ${event.doc.endDate?.toDate().toISOString()} to ${updatedEndDate.toISOString()}, created at from ${event.doc.createdAt?.toDate().toISOString()} to ${updatedCreatedAt.toISOString()}, updated at from ${event.doc.updatedAt?.toDate().toISOString()} to ${updatedUpdatedAt.toISOString()}`);
            } else {
                await this.firestoreRepo.updateEvent(location, event.id, {
                    startDate: FirebaseFirestore.Timestamp.fromDate(updatedStartDate),
                    endDate: FirebaseFirestore.Timestamp.fromDate(updatedEndDate),
                    createdAt: FirebaseFirestore.Timestamp.fromDate(updatedCreatedAt),
                    updatedAt: FirebaseFirestore.Timestamp.fromDate(updatedUpdatedAt),
                });
            }
        });
        await Promise.all(promises);
    }
  }

  async fixTimeZones(
    location: "hcmc" | "hanoi",
    startDate: Date,
    endDate: Date,
    batchSize: number,
  ) {
    let batchIndex = 0;
    for await (const events of this.firestoreRepo.fetchAllEventsWithBetween(
      location,
      startDate,
      endDate,
      batchSize,
    )) {
      batchIndex++;
      console.log(`Processing ${batchIndex}`);
      await this.fixEventTimeZones(location, events);
    }
  }

  async fixEventTimeZones(
    location: "hcmc" | "hanoi",
    events: { id: string; doc: Event }[],
  ) {
    // fetch wordpress event
    const booklyIds = events.map((e) => e.doc.booklyId);
    const wpEvents = await this.wordpressRepo.fetchEventsByIds(booklyIds);
    const wpEventMap: { [booklyId: number]: EventRow } = {};
    wpEvents.map((wpEvent) => {
      wpEventMap[wpEvent.ca_bookly_id] = wpEvent;
    });
    const promises = events.map(async (event) => {
      const appointment = wpEventMap[event.doc.booklyId];
      if (!appointment) {
        console.log(
          `Appointment missing for ${location}/${event.id} in wordpress. booklyId ${event.doc.booklyId}`,
        );
        return;
      }
      const updatedStartDate = new Date(appointment.start_date);
      const updatedEndDate = new Date(appointment.end_date);
      const updatedCreatedAt = new Date(appointment.created_at);
      const updatedUpdatedAt = new Date(appointment.updated_at);
      if (this.dryRun) {
        console.log(
          `Will update ${event.id} with start date from ${event.doc.startDate
            ?.toDate()
            .toISOString()} to ${updatedStartDate.toISOString()}, end date from ${event.doc.endDate
            ?.toDate()
            .toISOString()} to ${updatedEndDate.toISOString()}, created at from ${event.doc.createdAt
            ?.toDate()
            .toISOString()} to ${updatedCreatedAt.toISOString()}, updated at from ${event.doc.updatedAt
            ?.toDate()
            .toISOString()} to ${updatedUpdatedAt.toISOString()}`,
        );
      } else {
        await this.firestoreRepo.updateEvent(location, event.id, {
          startDate: firestore.Timestamp.fromDate(updatedStartDate),
          endDate: firestore.Timestamp.fromDate(updatedEndDate),
          createdAt: firestore.Timestamp.fromDate(updatedCreatedAt),
          updatedAt: firestore.Timestamp.fromDate(updatedUpdatedAt),
        });
      }
    });
    await Promise.all(promises);
  }
}
