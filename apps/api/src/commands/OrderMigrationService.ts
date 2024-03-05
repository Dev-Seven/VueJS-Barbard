import type { InternalOrder, LocationId, Order } from "@barbaard/types";
import { OrderService } from "../modules/order/OrderService.js";
import { UserStoreService } from "../userstore.js";
import { snooze } from "../utils/snooze.js";

export interface MigratePayload {
  orderId: string | "all";
  lastDocumentId?: string; // offset to continue exection from, incase of orderId='all'
  locationId: LocationId;
}

export interface LinkEventPayload {
  locationId: LocationId;
  orderId: string;
  eventId: string;
}

export class OrderMigrationService {
  constructor(
    private store: UserStoreService,
    private orderService: OrderService,
  ) {}

  /**
   * https://barbaard.atlassian.net/browse/BF-105
   */
  async migrate(payload: MigratePayload) {
    if (payload.orderId == "all") {
      await this.migrateAll(payload.locationId, payload.lastDocumentId);
    } else {
      await this.migrateOne(payload.orderId, payload.locationId);
    }
  }

  async migrateAll(locationId: LocationId, lastDocumentId?: string) {
    for await (const orders of this.fetchOrders(locationId, lastDocumentId)) {
      for (const order of orders) {
        console.log(`migrate ${order.id} ${locationId}`);
        await this.orderService.onCompleteOrder(
          locationId,
          order.id,
          order.doc,
        );
        await snooze(500);
      }
    }
  }

  async *fetchOrders(locationId: LocationId, lastDocumentId?: string) {
    const limit = 50;
    let docs: { id: string; doc: Order | InternalOrder }[] = [];
    do {
      console.log(`fetch orders last doc id ${lastDocumentId}`);
      docs = await this.store.getOrdersByLimit(
        locationId,
        limit,
        lastDocumentId,
      );
      lastDocumentId = docs[docs.length - 1]?.id;
      yield docs;
    } while (docs.length > 0);
  }

  async migrateOne(orderId: string, locationId: LocationId) {
    const order = await this.store.getOrder(locationId, orderId);
    if (!order.doc)
      throw new Error(
        `order not found, orderId: ${orderId}, location: ${locationId}`,
      );
    console.log(`migrate ${orderId} ${locationId}`);
    await this.orderService.onCompleteOrder(locationId, orderId, order.doc);
  }

  /**
   * https://barbaard.atlassian.net/browse/BF-106
   */
  async linkEvent({ locationId, eventId, orderId }: LinkEventPayload) {
    const event = await this.store.getEvent(locationId, eventId);
    if (!event.doc) throw new Error("event not found");
    await this.store.updateOrder(locationId, orderId, {
      eventItem: {
        ...event.doc,
        _id: eventId,
      },
    });
    const order = await this.store.getOrder(locationId, orderId);
    await this.orderService.runOrderCompleteFlow(
      locationId,
      orderId,
      order.doc as Order,
    );
  }
}
