import { differenceInDays } from "date-fns";
import { getZoneTime } from "../../time.js";

import {
  type Event,
  type InternalOrder,
  type Ledger,
  type Lockerbox,
  type Order,
  type User,
  type LocationId,
  type LoyaltyMemberGroup,
  type BarbaardProduct,
  type BarbaardUser,
} from "@barbaard/types";

import { UserStoreService } from "../../userstore.js";
import data from "../../sys/data/data.js";
const userDataProvider = data.userDataProvider();
export class OrderService {
  constructor(private userService: UserStoreService) {}

  // https://www.figma.com/file/BLWyHfdUmkBZPERcdebMmM/On-order-complete?node-id=9%3A76
  async onCompleteOrder(
    locationId: LocationId,
    orderId: string,
    orderObj: Order | InternalOrder,
  ) {
    console.log({ locationId, orderId });
    if (!(orderObj as Order).userId) {
      return;
    }
    const order = orderObj as Order;
    if (!order.paid) {
      console.log("order not paid", orderId, locationId);
      return;
    }
    if (order.completed) {
      console.log("order already completed", orderId, locationId);
      return;
    }
    await this.runOrderCompleteFlow(locationId, orderId, order);
  }

  /**
   * Runs orderCompleteFlow without any checks
   */
  async runOrderCompleteFlow(
    locationId: LocationId,
    orderId: string,
    order: Order,
  ) {
    const user = (await userDataProvider.get(order.userId)).getOrNull();
    console.log("Finding userId :", order.userId);
    if (user) {
      console.log("found user");
      const orderEventUpdates = await this.orderCompleteFlow(
        locationId,
        orderId,
        order,
        order.userId,
        user!,
      );
      if (Object.keys(orderEventUpdates).length > 0) {
        console.log("Updates: ", orderEventUpdates);
        await this.userService.updateOrder(
          locationId,
          orderId,
          orderEventUpdates,
        );
      }
    }
  }

  // https://www.figma.com/file/BLWyHfdUmkBZPERcdebMmM/On-order-complete?node-id=9%3A76
  async orderCompleteFlow(
    locationId: LocationId,
    orderId: string,
    order: Order,
    userId: string,
    user: BarbaardUser,
  ): Promise<Partial<Order>> {
    console.log("In OrderCompleteFlow", orderId, userId);
    const orderUpdate: Partial<Order> = {
      completed: true,
    };
    console.log("checking eventItem Id", order.eventItem?._id);
    if (order.eventItem?._id) {
      const event = await this.userService.getEvent(
        locationId,
        order.eventItem._id,
      );
      console.log("found service name", event.doc.serviceName);
      const userUpdate: Partial<BarbaardUser> = {};

      const setTagsAndUpdateUser = async () => {
        let tags = user.tags || [];
        if (tags.includes("customer lost")) {
          // remove customer lost
          console.log("remove customer lost", userId);
          tags = tags.filter((tag) => tag !== "customer lost");
        }
        userUpdate.tags = tags;
        console.log("user update", userUpdate);
        await userDataProvider.update(userId, userUpdate);
      };

      console.log("event", event.doc.type);
      if (event.doc.type === "reservation") {
        console.log("run revservation");
        const eventUpdate: Partial<Event> = {
          billTotal: order.totalReportingValue,
          orderId: orderId,
          amountOfGuest: order.amountOfGuests,
        };
        const lastReservation = await this.userService
          .getLastReservation(locationId, order.userId, event.doc.startDate)
          .catch(() => null);
        if (lastReservation && lastReservation.doc.startDate) {
          eventUpdate.daysSinceLastReservation = differenceInDays(
            event.doc.startDate.toDate(),
            lastReservation.doc.startDate.toDate(),
          );
        }
        console.log("event update", eventUpdate);
        await this.userService.updateEvent(
          locationId,
          order.eventItem?._id,
          eventUpdate,
        );
        userUpdate.bar = { ...user.bar };
        if (!user.bar?.totalReservations || user.bar?.totalReservations == 0) {
          userUpdate.bar.firstReservation = event.doc.startDate;
        }
        const firstReservation =
          user.bar?.firstReservation || userUpdate.bar.firstReservation;
        userUpdate.bar.lastReservation = event.doc.startDate;
        const totalReservations = (userUpdate.bar.totalReservations || 0) + 1;
        userUpdate.bar.totalReservations = totalReservations;
        if (firstReservation && totalReservations >= 2) {
          userUpdate.bar.averageDaysPerReservation =
            differenceInDays(
              userUpdate.bar.lastReservation.toDate(),
              firstReservation.toDate(),
            ) /
            (totalReservations - 1);
        }

        if (user.tags?.includes("locker box")) {
          const lockerboxes =
            await this.userService.getAllActiveLockerboxesByUser(
              "hcmc",
              userId,
            );
          const promises = lockerboxes.map(async (lockerbox) => {
            const totalRevenue =
              (lockerbox.doc.totalRevenue || 0) + order.totalReportingValue;
            const lockerBoxUpdate: Partial<Lockerbox> = {
              totalRevenue: totalRevenue,
              orders: [
                ...lockerbox.doc.orders,
                {
                  date: order.createdAt,
                  id: orderId,
                  orderNumber: order.id || "",
                  total: order.totalOrderValue,
                  amountOfGuests: order.amountOfGuests,
                },
              ],
            };
            console.log("locker box update", lockerBoxUpdate);
            await this.userService.updateLockerbox(
              "hcmc",
              userId,
              lockerBoxUpdate,
            );
          });
          await Promise.all(promises);
        }

        await setTagsAndUpdateUser();
      } else if (event.doc.type == "appointment") {
        console.log("run appointment");
        const eventUpdate: Partial<Event> = {
          completed: true,
          food: event.doc.food,
          drink: event.doc.drink,
          billTotal: order.totalReportingValue,
          orderId: orderId,
        };
        const lastAppointment = await this.userService
          .getLastAppointment(locationId, order.userId, event.doc.startDate)
          .catch(() => null);
        if (lastAppointment && lastAppointment.doc.startDate) {
          eventUpdate.daysSinceLastAppointment = differenceInDays(
            event.doc.startDate.toDate(),
            lastAppointment.doc.startDate.toDate(),
          );
        }
        console.log("event update", event);
        await this.userService.updateEvent(
          locationId,
          order.eventItem?._id,
          eventUpdate,
        );
        userUpdate.barbershop = { ...user.barbershop };
        userUpdate.barbershop.lastBarber = event.doc.staffName;
        userUpdate.barbershop.lastAppointment = event.doc.startDate;

        if (event.doc.serviceName) {
          userUpdate.barbershop.lastService = event.doc.serviceName;
        }

        const totalAppointments =
          (userUpdate.barbershop.totalAppointments || 0) + 1;
        userUpdate.barbershop.totalAppointments = totalAppointments;

        const firstAppointment = user.barbershop?.firstAppointment;

        if (firstAppointment && totalAppointments >= 2) {
          userUpdate.barbershop.averageDaysPerAppointment =
            differenceInDays(
              userUpdate.barbershop.lastAppointment.toDate(),
              firstAppointment.toDate(),
            ) /
            (totalAppointments - 1);
        }
        await setTagsAndUpdateUser();
      }

      console.log("end run event", event.doc.type);

      // set utm fields
      orderUpdate.source = event.doc.source;
      orderUpdate.campaign = event.doc.campaign;
      orderUpdate.medium = event.doc.medium;
    }

    // orderUpdate.totalSpending =
    //   (order.totalSpending || 0) + (order.totalReportingValue || 0);
    // orderUpdate.totalOrders = (order.totalOrders || 0) + 1;
    // orderUpdate.averageSpending =
    //   orderUpdate.totalSpending / orderUpdate.totalOrders;
    console.log("order flow update", orderUpdate);
    return orderUpdate;
  }

  // /locations/{wildcard}/orders
  async onUpdateOrder(
    locationId: LocationId,
    orderId: string,
    orderObj: Order | InternalOrder,
  ) {
    console.log({ locationId, orderId });
    if (!(orderObj as Order).userId) {
      return;
    }
    const order = orderObj as Order;
    // const before = beforeObj as Order;
    // if (!order.paid) {
    //     console.log("order not paid", orderId, locationId)
    //     return
    // }
    const location = await this.userService.getLocation(locationId);
    const ledger = await this.userService.getLedger(locationId, orderId);
    const user = (await userDataProvider.get(order.userId)).getOrNull();
    if (!user) {
      console.log("error: User not found");
      return;
    }
    if (!location) {
      console.log("error: location not found");
      return;
    }

    const isProductOrService =
      (order.products || []).filter(
        (v: BarbaardProduct) =>
          v.category == "services" || v.category == "product",
      ).length > 0;
    const pos_id = isProductOrService
      ? location.connectaBranchCodeHob
      : location.connectaBranchCodeMom;

    if (user) {
      const payload = {
        event_id: 11,
        event: "sale_manager",
        timestamp: "" + new Date().getTime(),
        sale_manager: {
          pos_name: "houseofbarbaard",
          pos_type: "ipos_pc",
          channels: [
            {
              channel: "voucher",
              source: "10000007",
            },
            {
              channel: "delivery",
              source: "10000006",
            },
          ],
          pos_parent: "BARBAARD",
          pos_id: pos_id,
          tran_id: orderId,
          tran_date: order.orderedAt
            ? getZoneTime(order.orderedAt.toDate())
            : undefined,
          created_at: order.orderedAt
            ? getZoneTime(order.orderedAt.toDate())
            : undefined,
          discount_extra: 0,
          discount_extra_amount: 0,
          service_charge: 0,
          service_charge_amount: 0,
          coupon_amount: 0,
          coupon_code: "",
          ship_fee_amount: 0,
          discount_amount_on_item: 0,
          original_amount: 0,
          vat_amount: 0,
          bill_amount: order.totalOrderValue,
          total_amount: order.totalOrderValue,
          membership_name: user!.firstName + " " + user!.lastName,
          membership_id: user!.phone,
          sale_note: "Test Sale POS",
          tran_no: order.orderNumber,
          sale_type: "TA",
          hour: new Date().getHours(),
          pos_city: 129,
          pos_district: 12904,
          items: (order.products || []).map((product: BarbaardProduct) => ({
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            quantity: product.quantity,
            amount: product.itemTotal,
            discount_amount: 0, // ?
          })),
          payment_info: ledger.map((l) => ({
            tran_id: l.id, // ? Confirm
            method_id: l.doc.method, // ? Confirm
            name: l.doc.order,
            currency: "VND",
            amount: l.doc.amount,
            trace_no: "",
          })),
          delivery_info: {
            order_code: "",
            address: "",
            lng: 0,
            lat: 0,
          },
        },
      };
      console.log(
        "payload",
        JSON.stringify(payload, null, 2),
        order.totalOrderValue,
      );
      // push only for prod

      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 30 * 1000),
      ); // wait 30s
    }
  }

  getAgreementBonusPointPayload(
    order: Order,
    pos_id: string,
    orderId: string,
    user: User,
    ledger?: { doc: Ledger; id: string },
  ) {
    let totalPayableAmount = 0;
    (order.products || []).forEach((product) => {
      totalPayableAmount += product.itemTotal;
    });
    const orderValue = totalPayableAmount * 0.25;
    const payload = {
      event_id: 11,
      event: "sale_manager",
      timestamp: "" + new Date().getTime(),
      sale_manager: {
        pos_name: "houseofbarbaard",
        pos_type: "ipos_pc",
        channels: [
          {
            channel: "voucher",
            source: "10000007",
          },
          {
            channel: "delivery",
            source: "10000006",
          },
        ],
        pos_parent: "BARBAARD",
        pos_id: pos_id,
        tran_id: orderId,
        tran_date: order.orderedAt
          ? getZoneTime(order.orderedAt.toDate())
          : undefined,
        created_at: order.orderedAt
          ? getZoneTime(order.orderedAt.toDate())
          : undefined,
        discount_extra: 0,
        discount_extra_amount: 0,
        service_charge: 0,
        service_charge_amount: 0,
        coupon_amount: 0,
        coupon_code: "",
        ship_fee_amount: 0,
        discount_amount_on_item: 0,
        original_amount: 0,
        vat_amount: 0,
        bill_amount: orderValue,
        total_amount: orderValue,
        membership_name: user.firstName + " " + user.lastName,
        membership_id: user.phone,
        sale_note: "Agreement Bonus Points",
        tran_no: order.orderNumber,
        sale_type: "TA",
        hour: new Date().getHours(),
        pos_city: 129,
        pos_district: 12904,
        items: [
          {
            item_id: "",
            item_name: "",
            price: 0,
            quantity: 0,
            amount: 0,
            discount_amount: 0, // ?
          },
        ],
        payment_info: [
          {
            tran_id: ledger?.id ?? "", // use ledger Id
            method_id: ledger?.doc.method ?? "", // Depending on the payment method
            name: "",
            currency: "VND",
            amount: 0,
            trace_no: "",
          },
        ],
        delivery_info: {
          order_code: "",
          address: "",
          lng: 0,
          lat: 0,
        },
      },
    };
    return payload;
  }

  getMemberBonusPointPayload(
    order: Order,
    pos_id: string,
    orderId: string,
    user: User,
    ledger?: { doc: Ledger; id: string },
  ) {
    const memberGroup: LoyaltyMemberGroup | null =
      user.loyalty?.memberGroup ?? null;

    let orderValue = order.totalOrderValue * (10 / 9 - 1);
    if (memberGroup == "Black Diamond Member") {
      orderValue = order.totalOrderValue * (4 / 3 - 1);
    }
    const payload = {
      event_id: 11,
      event: "sale_manager",
      timestamp: "" + new Date().getTime(),
      sale_manager: {
        pos_name: "houseofbarbaard",
        pos_type: "ipos_pc",
        channels: [
          {
            channel: "voucher",
            source: "10000007",
          },
          {
            channel: "delivery",
            source: "10000006",
          },
        ],
        pos_parent: "BARBAARD",
        pos_id: pos_id,
        tran_id: orderId,
        tran_date: order.orderedAt
          ? getZoneTime(order.orderedAt.toDate())
          : undefined,
        created_at: order.orderedAt
          ? getZoneTime(order.orderedAt.toDate())
          : undefined,
        discount_extra: 0,
        discount_extra_amount: 0,
        service_charge: 0,
        service_charge_amount: 0,
        coupon_amount: 0,
        coupon_code: "",
        ship_fee_amount: 0,
        discount_amount_on_item: 0,
        original_amount: 0,
        vat_amount: 0,
        bill_amount: orderValue,
        total_amount: orderValue,
        membership_name: user.firstName + " " + user.lastName,
        membership_id: user.phone,
        sale_note: "Black Member Bonus Points",
        tran_no: order.orderNumber,
        sale_type: "TA",
        hour: new Date().getHours(),
        pos_city: 129,
        pos_district: 12904,
        items: [
          {
            item_id: "",
            item_name: "",
            price: 0,
            quantity: 0,
            amount: 0,
            discount_amount: 0, // always
          },
        ],
        payment_info: [
          {
            tran_id: ledger?.id ?? "", // use ledger Id
            method_id: ledger?.doc.method ?? "", // Depending on the payment method
            name: "",
            currency: "VND",
            amount: 0,
            trace_no: "",
          },
        ],
        delivery_info: {
          order_code: "",
          address: "",
          lng: 0,
          lat: 0,
        },
      },
    };
    return payload;
  }
}
