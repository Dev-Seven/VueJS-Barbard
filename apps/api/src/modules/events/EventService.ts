import { addDays, addHours, differenceInDays, formatISO } from "date-fns";

import lodash from "lodash";
import * as firestore from "firebase-admin/firestore";
const { isEqual } = lodash;

import { CustomerFieldId, Trengo } from "../../clients/trengo.js";

import {
  type Event,
  type LocationId,
  type EventService as BarbaardEventService,
  type BarbaardUser,
} from "@barbaard/types";
import axios from "axios";
import { UserStoreService } from "../../userstore.js";
import data from "../../sys/data/data.js";

export const getServiceName = (services: Event["services"]) => {
  return (services || [])
    .map((service: BarbaardEventService) => service.name)
    .join(" & ");
};

const userDataProvider = data.userDataProvider();
export class EventService {
  constructor(
    private userService: UserStoreService,
    private trengo: Trengo,
  ) {}
  // /locations/{wild}/events
  async onCreateAppointment(
    locationId: LocationId,
    eventId: string,
    event: Event,
  ) {
    console.log({ locationId, eventId });

    // caculate serviceName, staffName, reminderDate
    let eventUpdate: Partial<Event> | undefined;
    const serviceName = (event.services || [])
      .map((service: BarbaardEventService) => service.name)
      .join(" & ");
    if (serviceName != event.serviceName) {
      eventUpdate = {
        ...eventUpdate,
        serviceName: serviceName,
      };
    }
    const staffName = (event.services || [])
      .map((service: BarbaardEventService) => service.staff)
      .join(" & ");
    if (staffName != event.staffName) {
      eventUpdate = { ...eventUpdate, staffName: staffName };
    }
    const reminderDate = this.getRemiderDate(event);
    if (
      reminderDate &&
      (!event.reminderDate ||
        !isEqual(reminderDate, event.reminderDate.toDate()))
    ) {
      eventUpdate = {
        ...eventUpdate,
        reminderDate: firestore.Timestamp.fromDate(reminderDate),
      };
    }

    // https://barbaard.atlassian.net/browse/BF-70
    if (event.userId) {
      const hanoiEvents = await this.userService.getEventByUserId(
        "hanoi",
        event.userId,
        1,
      );
      const hcmcEvents = await this.userService.getEventByUserId(
        "hcmc",
        event.userId,
        1,
      );
      if (hanoiEvents.length + hcmcEvents.length === 1) {
        eventUpdate = {
          ...eventUpdate,
          firstVisit: true,
        };
      } else {
        eventUpdate = {
          ...eventUpdate,
          firstVisit: false,
        };
      }
    }

    if (eventUpdate && Object.keys(eventUpdate).length > 0) {
      await this.userService.updateEvent(locationId, eventId, eventUpdate);
    }
    console.log("Updated Successfully");
  }

  getRemiderDate(e: Event) {
    if (e.startDate && e.createdAt) {
      const diff = differenceInDays(e.startDate.toDate(), e.createdAt.toDate());
      if (diff <= 5) {
        return addHours(e.startDate.toDate(), -2);
      } else {
        return addDays(e.startDate.toDate(), -1);
      }
    }
    return;
  }

  async onUpdateAppointment(
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
      console.log("error: user not found");
    }

    // set trengo custom fields
    if (
      userDoc &&
      event.type == "appointment" &&
      event.completed &&
      !before.completed
    ) {
      // event just completed
      await this.trengoUpdateForAppointmentComplete(
        userDoc!,
        event,
        locationId,
      ).catch((err) => {
        if (axios.isAxiosError(err)) {
          console.log("Error creating customer field", err?.response?.data);
        } else {
          console.log("Error creating custom field", err?.response?.data);
        }
      });
    }

    if (
      userDoc &&
      event.type == "reservation" &&
      event.completed &&
      !before.completed
    ) {
      // event just completed
      await this.trengoUpdateForReservationComplete(
        userDoc!,
        event,
        locationId,
      ).catch((err) => {
        if (axios.isAxiosError(err)) {
          console.log("Error creating customer field", err?.response?.data);
        } else {
          console.log("Error creating custom field", err?.response?.data);
        }
      });
    }

    // caculate serviceName, staffName, reminderDate
    let eventUpdate: Partial<Event> | undefined;
    const serviceName = getServiceName(event.services);
    if (serviceName != event.serviceName) {
      eventUpdate = {
        ...eventUpdate,
        serviceName: serviceName,
      };
    }
    const staffName = (event.services || [])
      .map((service: BarbaardEventService) => service.staff)
      .join(" & ");
    if (staffName != event.staffName) {
      eventUpdate = { ...eventUpdate, staffName: staffName };
    }
    const reminderDate = this.getRemiderDate(event);
    if (
      reminderDate &&
      (!event.reminderDate ||
        !isEqual(reminderDate, event.reminderDate.toDate()))
    ) {
      eventUpdate = {
        ...eventUpdate,
        reminderDate: firestore.Timestamp.fromDate(reminderDate),
      };
    }
    if (eventUpdate && Object.keys(eventUpdate).length > 0) {
      console.log("Update event", eventUpdate);
      await this.userService.updateEvent(locationId, eventId, eventUpdate);
    }
  }

  async trengoUpdateForAppointmentComplete(
    user: BarbaardUser,
    event: Event,
    locationId: string,
  ) {
    if (user.trengoProfileId) {
      const staffName =
        event.staffName ||
        (event.services || [])
          .map((service: BarbaardEventService) => service.staff)
          .join(" & ");
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.lastBarber,
        staffName,
      );
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.lastAppointment,
        formatISO(event.startDate.toDate()),
      );
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.totalAppointments,
        (user.barbershop?.totalAppointments || 0) + 1,
      ); // TODO: confirm
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.location,
        locationId,
      );
    }
  }

  async trengoUpdateForReservationComplete(
    user: BarbaardUser,
    event: Event,
    locationId: string,
  ) {
    if (user.trengoProfileId) {
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.lastReservation,
        formatISO(event.startDate.toDate()),
      );
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.totalReservation,
        (user.bar?.totalReservations || 0) + 1,
      ); // TODO: confirm
      await this.trengo.setCustomerField(
        user.trengoProfileId,
        CustomerFieldId.location,
        locationId,
      );
    }
  }
}
