import type { Order } from "@barbaard/types";
import sanitize from "pos-macro";

import { orderStatus } from "../../variables";
import { useDatabaseList, useDatabase, useDatabaseObject } from "vuefire";
import {
  onDisconnect,
  ref as dbRef,
  query,
  equalTo,
  orderByChild,
  update,
} from "firebase/database";
import { type Ref } from "vue";

export const db = useDatabase();

const presenceRef = dbRef(db, "disconnectmessage");
onDisconnect(presenceRef).set("Working offline");

export const queryOrdersByStatus = (dbQuery: string) => {
  const tableOrders = query(
    dbRef(db, dbQuery),
    orderByChild("status"),
    equalTo(orderStatus),
  );
  return useDatabaseList<Order>(tableOrders);
};

export const getOrderById = (payload: {
  orderId: string;
  dbQuery: string;
}): Ref<Order> => {
  const { orderId, dbQuery } = payload;
  const order = useDatabaseObject(
    dbRef(db, `${dbQuery}/${orderId}`),
  ) as unknown as Ref<Order>;
  return sanitize(order);
};

export const updateOrder = async (payload: {
  order: Order;
  dbQuery: string;
}) => {
  const { order, dbQuery } = payload;
  const orderId = order.id;
  const ordersRef = dbRef(db, `${dbQuery}/${orderId}`);
  const ordersSnapshot = useDatabaseObject(ordersRef);

  const newVal = {
    ...ordersSnapshot.value,
    order,
  };
  await update(ordersRef, newVal);
};

export const updateOrderField = async (
  orderId: string,
  fieldKey: string,
  fieldValue: any,
  dbQuery: string,
) => {
  const ordersRef = dbRef(db, `${dbQuery}/${orderId}`);
  const ordersSnapshot = useDatabaseObject(ordersRef);

  const newVal = {
    ...ordersSnapshot.value,
    [fieldKey]: fieldValue,
  };

  try {
    await update(ordersRef, newVal);
  } catch (e) {
    console.error(e);
  }
};

export const updateOrderFields = async (
  orderId: string,
  fields: { [key: string]: any },
  dbQuery: string,
) => {
  const ordersRef = dbRef(db, `${dbQuery}/${orderId}`);
  const ordersSnapshot = useDatabaseObject(ordersRef);

  const currentValues = ordersSnapshot.value;
  const newValues = { ...currentValues, ...fields };
  try {
    await update(ordersRef, newValues);
  } catch (e) {
    console.error(e);
  }
};

// add new filed for all items in collection
export const addNewFieldForAllItemsInCollection = async (
  fieldKey: string,
  fieldValue: any,
  dbQuery: string,
) => {
  const ordersRef = dbRef(db, dbQuery);
  const ordersSnapshot = useDatabaseList(query(dbRef(db, dbQuery)));
  const updates: any = {};

  ordersSnapshot.value.forEach((child: { readonly id: string }) => {
    if (child && child.id) {
      updates[child.id] = { ...child, [fieldKey]: fieldValue };
    }
  });
  console.log("updates", updates);
  update(ordersRef, updates);
};
