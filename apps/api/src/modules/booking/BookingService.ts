import type { Event, EventService, LocationId } from "@barbaard/types";

import { addMonths, isAfter } from "date-fns";
import { EventRepository } from "./EventRepository.js";

export interface TimeSlot {
  staff?: string;
  staffId?: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
}

export class BookingService {
  constructor(private eventRepository: EventRepository) {}

  // get avialble time slots
  async getBookedTimeSlots(
    location: LocationId,
    startDate: Date,
    endDate: Date,
  ) {
    if (isAfter(startDate, endDate))
      throw new Error("Start date cannot be after end date");
    const maxRangeDate = addMonths(new Date(), 3);
    if (isAfter(startDate, maxRangeDate) || isAfter(endDate, maxRangeDate))
      throw new Error(
        "Sorry, currently we accept booking in advance maximum for 3 month",
      );
    const events = await this.eventRepository.getEventsByStartDate(
      location,
      startDate,
      endDate,
    );
    // transform booked slots
    return this.transformEventsToSlots(events);
  }

  transformEventsToSlots(events: { id: string; doc: Event }[]) {
    const timeslots: TimeSlot[] = [];
    events.map((event) => {
      const { doc } = event;
      const { startDate, endDate } = doc;
      doc.services?.map((service: EventService) => {
        timeslots.push({
          staff: service.staff,
          staffId: service.staffId,
          serviceId: service.id,
          serviceName: service.name,
          startTime: startDate.toDate().toJSON(),
          endTime: endDate.toDate().toJSON(),
        });
      });
    });
    return timeslots;
  }
}
