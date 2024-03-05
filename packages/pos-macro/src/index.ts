import { map } from "lodash";
import { assign } from "./util.js";

export const sanitize = (order: any) => {
  order.products = map(order.products, (product) => assign(product, order));

  return order;
};

export default sanitize;
