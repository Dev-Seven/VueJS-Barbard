import axios from "axios";
import { format } from "date-fns";

import {
  type Order,
  type LocationId,
  type ProductCategory,
} from "@barbaard/types";
import FormData from "form-data";
import { UserStoreService } from "../../userstore.js";
import * as firestore from "firebase-admin/firestore";

// export interface Session {
//     openStatus: boolean;
//     registerManagement: {

//         closed_at: string;
//         closing_note: string;
//         current_date: string;
//         current_day: string;
//         opened_at: string;
//         opening_float?: string;
//         opening_note: string;
//         register_opening_entry_id: string;
//     };
//     summary: {
//         close: {
//             float: number;
//             note: string;
//             time: string;
//         };
//         open: {
//             float: number;
//             note: string;
//             time: string;
//         };
//         payments: {
//             cash: {
//                 counted: number;
//                 difference: number;
//                 total: number;
//             };
//             gentleman_agreements: {
//                 counted: number;
//                 difference: number;
//                 total: number;
//             };
//             mastercard: {
//                 counted: number;
//                 difference: number;
//                 total: number;
//             };
//             visa: {
//                 counted: number;
//                 difference: number;
//                 total: number;
//             }
//         }
//     }
//     userId: string;
//     userName: string;
//     pushedToNhanh?: boolean;
//     pushedToMarketMan?: boolean;
// }
export interface Session {
  _id: string;
  closedAt: firestore.Timestamp;
  closedByUserId: string;
  closedByUserName: string;
  closingNote: string;
  code: number;
  handover: boolean;
  openStatus: boolean;
  openedAt: firestore.Timestamp;
  openedByUserId: string;
  openedByUserName: string;
  openingNote: string;
  registerManagement: {
    cashManagement: {
      addedByUserId: string;
      addedByUserName: string;
      amount: number;
      reason: string;
      timestamp: firestore.Timestamp;
      type: string;
    }[];
  };
  summary: {
    payments: {
      cash: {
        counted: number;
        difference: number;
        total: number;
      };
      onAccount: {
        counted: number;
        difference: number;
        total: number;
      };
    };
  };
  totalDifference: number;
  totalPayment: number;

  pushedToNhanh?: boolean;
  nhanhOrderdId?: string;
  pushedToMarketMan?: boolean;
}
export interface FnbItem {
  AboutTheItem?: string;
  BOMPrice: number;
  BOMPriceFC: number;
  CategoryID: number;
  CategoryName: string;
  CookTime?: number;
  CookingInstructions?: string;
  ID: number;
  IsDeleted: boolean;
  LocationSyncInfos: {
    POSCode: string;
    Type: string;
    TypeID: number;
  }[];
  MaxFC: number;
  MinOnHand?: string;
  Name: string;
  POSCodes?: string;
  ParLevel?: string;
  PrepTime?: string;
  SalePriceWithVAT: number;
  SalePriceWithoutVAT: number;
  PriceWithVAT?: number;
  PriceWithoutVAT?: number;
  Skus: [];
  SubItems: {
    ActualUsage: number;
    ItemID: string;
    ItemName: string;
    ItemTypeName: string;
    LossPercent: number;
    SortIndex: number;
    UsageNet: number;
  }[];
  Type?: string;
  UpdatedDate?: string;
}

// Register Service has business logic related to register closure
// Tickets: https://barbaard.atlassian.net/browse/BF-55
// Design: https://www.figma.com/file/1izDSb9II0bXs5DuDkPLsi/onRegisterClose?node-id=0%3A1&t=b7h1zv63edpG2LUC-0
export class RegisterService {
  constructor(
    private store: firestore.Firestore,
    private userStore: UserStoreService,
  ) {}

  private async updateSession(
    locationId: LocationId,
    registerId: string,
    sessionId: string,
    update: Partial<Session>,
  ) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("registers")
      .doc(registerId)
      .collection("sessions")
      .doc(sessionId)
      .update(update);
  }

  // private async getSession(locationId: string, registerId: string, sessionId: string): Promise<Session> {
  //     return this.store.collection("locations").doc(locationId).collection("registers").doc(registerId).collection("sessions").doc(sessionId).get().then((doc) => {
  //         return doc.data() as Session;
  //     });
  // }

  // private async getAllFnbItems() {
  //     // TODO: consider caching
  //     return this.store.collection("posItems").doc("f&b").collection("items").get().then((doc) => {
  //         return doc.docs.map((d) => ({ id: d.id, doc: d.data() as FnbItem }));
  //     });
  // }

  private async getFnbItem(id: string) {
    return this.store
      .collection("posItems")
      .doc("f&b")
      .collection("items")
      .doc(id)
      .get()
      .then((doc) => {
        return {
          id: doc.id,
          doc: doc.data() as FnbItem,
        };
      });
  }

  private async getFnbItems(ids: number[] | string[]) {
    const itemPromises = ids.map((id) => this.getFnbItem("" + id));
    const items = await Promise.all(itemPromises);
    return items.filter((item) => item.doc);
  }

  private async productsPresent(
    locationId: string,
    orders: { id: string; doc: Order }[],
  ) {
    let productsPresent = false;

    const items = await Promise.all(
      orders.map((order) =>
        this.store
          .collection("locations")
          .doc(locationId)
          .collection("orders")
          .doc(order.id)
          .collection("items")
          .get(),
      ),
    );

    const allItems = items.map((item) => item.docs).flat();
    allItems.forEach((item) => {
      const data = item.data();
      const category: ProductCategory = "product";
      if (data.category === category) {
        productsPresent = true;
      }
    });

    return productsPresent;
  }

  async onRegisterClose(
    locationId: LocationId,
    registerId: string,
    sessionId: string,
    session: Session,
  ) {
    if (session.openStatus !== false) {
      // proceed only when openStatus is not false
      console.log(
        { locationId, registerId, sessionId },
        "openStatus != false ",
      );
      return;
    }
    if (session.pushedToNhanh && session.pushedToMarketMan) {
      // updates have already been pushed to Nhanh and marketman, Skip
      console.log({ locationId, registerId, sessionId }, "already pushed");
      return;
    }

    const time = format(new Date(), "yyyyMMddHHmmss");
    const uniqueId = "HN-" + time;

    const updates: Partial<Session> = {};
    const orders = await this.userStore.getOrdersByRegisterId(
      locationId,
      sessionId,
    );

    const isProductPresent = await this.productsPresent(locationId, orders);
    if (!session.pushedToNhanh && isProductPresent) {
      await this.pushToNhanh(locationId, uniqueId, orders)
        .then((data) => {
          console.log("Successfully pushed to pushedToNhanh");
          updates.pushedToNhanh = true;
          if (data?.data?.orderId) {
            updates.nhanhOrderdId = data?.data?.orderId;
          }
        })
        .catch((err) => {
          console.log("error pushing to Nhanh", err);
        });
    }

    if (!session.pushedToMarketMan) {
      await this.pushToMarketMan(locationId, uniqueId, session, orders)
        .then(() => {
          console.log("Successfully pushed to marketman");
          updates.pushedToMarketMan = true;
        })
        .catch((err) => {
          console.log("error pushing to marketman", err);
        });
    }

    if (Object.keys(updates).length > 0) {
      await this.updateSession(locationId, registerId, sessionId, updates);
    }
  }

  private async getMarketManToken() {
    type MarketmanTokenResponse = {
      Token: string;
      ExpireDateUTC: string;
      IsSuccess: boolean;
      ErrorMessage: string;
      ErrorCode: string;
      RequestID: string;
    };

    const { status, data } = await axios.post(
      "https://api.marketman.com/v3/vendors/auth/GetToken",
      {
        APIKey: "9a7a589e25174326987b6e63c296ec1d",
        APIPassword: "2ec8d4d621ee4b439d0e0d10e681ec65",
      },
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
    console.log("token response", { status, data });
    return data as MarketmanTokenResponse;
  }

  private async getMarketmanAuthorisedAccounts(token: string) {
    type AuthorizedAccountsResponse = {
      Buyers: object[];
      Vendors: object[];
      Chains: {
        ChainName: string;
        Guid: string;
        Buyers: {
          BuyerName: string;
          Guid: string;
        }[];
      }[];
      IsSuccess: boolean;
      ErrorMessage?: string;
      ErrorCode?: string;
      RequestID: string;
    };
    const { status, data } = await axios.post(
      "https://api.marketman.com/v3/buyers/partneraccounts/GetAuthorisedAccounts",
      {},
      {
        headers: {
          "content-type": "application/json",
          AUTH_TOKEN: token,
        },
      },
    );
    console.log("accounts response", { status, data });
    return data as AuthorizedAccountsResponse;
  }

  private async getAllProductIds(
    locationId: string,
    orders: { id: string; doc: Order }[],
  ) {
    const items = await Promise.all(
      orders.map((order) =>
        this.store
          .collection("locations")
          .doc(locationId)
          .collection("orders")
          .doc(order.id)
          .collection("items")
          .get(),
      ),
    );

    const allItems = items.map((item) => item.docs).flat();
    const ids = allItems.map((item) => {
      const data = item.data();
      return data.id;
    });

    return ids;
  }

  private formatMarketManDate(date: Date): string {
    return format(date, "yyyy/MM/dd HH:mm:ss");
  }

  private async pushToMarketMan(
    locationId: LocationId,
    uniqueId: string,
    session: Session,
    orders: { id: string; doc: Order }[],
  ) {
    const loginResponse = await this.getMarketManToken();
    const token = loginResponse.Token;
    const accounts = await this.getMarketmanAuthorisedAccounts(token);
    const buyerName =
      locationId === "hanoi"
        ? "Ministry of Men - Hanoi"
        : "Ministry of Men - HCMC";
    let buyerGuid = "";

    accounts.Chains.forEach((chain) => {
      chain.Buyers.forEach((buyer) => {
        if (buyer.BuyerName === buyerName) {
          buyerGuid = buyer.Guid;
        }
      });
    });

    type Item = {
      Type: string;
      Name: string; // Name found in posItems document
      ID: number; // ID found in posItems document
      PriceWithVAT: number; // PriceWithVat found in posItems document
      PriceWithoutVAT: number; // PriceWithoutVat found in posItems document
      SKU: string; // SKU found in posItems document
      Category: string; // Category found in posItems document
    };
    const ids = await this.getAllProductIds(locationId, orders);
    console.log({ "Total Ids": ids.length });
    const allItems = await this.getFnbItems(ids);
    const items = allItems.map((item) => {
      const marketmanItem: Item = {
        Type: "MenuItem",
        Name: item.doc.Name,
        ID: item.doc.ID,
        PriceWithVAT: item.doc.PriceWithVAT || 0,
        PriceWithoutVAT: item.doc.PriceWithoutVAT || 0,
        SKU: "", // Use id as sku for now
        Category: item.doc.CategoryName,
      };
      return marketmanItem;
    });

    type Transaction = {
      ItemCode: number; // use id found in fnb item array in order document
      ItemID: number;
      ItemName: string;
      PriceTotalWithVAT: number; // /use priceWithVat found in fnb item array in order document
      PriceTotalWithoutVAT: number; // use priceWithoutVat found in fnb item array in order document
      DateUTC: string; // use closedAt found in order document
      Quantity: number; // use quantity found in fnb item array in order document
    };

    const transactions: Transaction[] = [];
    let TotalPriceWithVAT = 0;
    let TotalPriceWithoutVAT = 0;

    await Promise.all(
      orders.map(async (order) => {
        const items = await this.store
          .collection("locations")
          .doc(locationId)
          .collection("orders")
          .doc(order.id)
          .collection("items")
          .get();

        items.forEach((item) => {
          const product = item.data();
          if (!["fnb", "complimentary"].includes(product.category)) return;
          TotalPriceWithVAT += product.price * 1.1;
          TotalPriceWithoutVAT += product.price;
          transactions.push({
            ItemCode: product.id, // use id found in fnb item array in order document
            ItemID: product.id,
            ItemName: product.name || "",
            PriceTotalWithVAT: product.price * 1.1, // /use priceWithVat found in fnb item array in order document // TODO: confirm
            PriceTotalWithoutVAT: product.price, // use priceWithoutVat found in fnb item array in order document
            DateUTC: order.doc.createdAt
              ? this.formatMarketManDate(order.doc.createdAt.toDate())
              : "", // use closedAt found in order document
            Quantity: product.quantity, // use quantity found in fnb item array in order document
          });
        });
      }),
    );

    const payload = {
      UniqueID: uniqueId,
      BuyerGuid: buyerGuid,
      FromDateUTC: session.openedAt
        ? this.formatMarketManDate(session.openedAt.toDate())
        : "",
      ToDateUTC: session.closedAt
        ? this.formatMarketManDate(session.closedAt?.toDate())
        : "",
      TotalPriceWithVAT: TotalPriceWithVAT,
      TotalPriceWithoutVAT: TotalPriceWithoutVAT,
      Items: items,
      Transactions: transactions,
    };
    console.log(JSON.stringify(payload));
    const { status, data } = await axios.post(
      "https://api.marketman.com/v3/buyers/sales/SetSalesAsync",
      payload,
      {
        headers: {
          "content-type": "application/json",
          AUTH_TOKEN: token,
        },
      },
    );
    console.log("sales sync response", { status, data });
    if (!data.IsSuccess) {
      throw new Error("failed to push to marketman");
    }
  }

  private async pushToNhanh(
    locationId: LocationId,
    uniqueId: string,
    orders: { id: string; doc: Order }[],
  ) {
    type Product = {
      id: number;
      idNhanh: number;
      quantity: number;
      name: string;
      price: number;
    };
    const products: Product[] = [];

    // query location from locations collection
    const location = await this.store
      .collection("locations")
      .doc(locationId)
      .get();

    await Promise.all(
      orders.map(async (order) => {
        const items = await this.store
          .collection("locations")
          .doc(locationId)
          .collection("orders")
          .doc(order.id)
          .collection("items")
          .get();

        items.forEach((item) => {
          const product = item.data();
          const category: ProductCategory = "product";
          if (product.category !== category) return;
          products.push({
            id: product.id,
            idNhanh: product.id,
            quantity: product.quantity,
            name: product.name || "",
            price: product.price,
          });
        });
      }),
    );

    const nhanhPayload = {
      id: uniqueId,
      type: "Shopping",
      depotId: locationId === "hanoi" ? 102591 : 100518, // Depending on location
      customerName: locationId === "hanoi" ? "POS - HN" : "POS - HCM", // Depending on location
      customerMobile: locationId === "hanoi" ? "02477727737" : "02877727737",
      customerAddress: location.data()?.addressFirst,
      customerCityName: location.data()?.addressCity,
      customerDistrictName: location.data()?.addressDistrict,
      paymentMethod: "Store",
      paymentGateway: "POS",
      status: "Confirmed",
      affiliate: "POS",
      trafficSource: locationId === "hanoi" ? "Hanoi POS" : "Hcmc POS", // Depending on location
      productList: products,
    };
    console.log({ nhanhPayload });
    const form = new FormData();
    form.append(
      "accessToken",
      "zpNWNGqVkX8kcHdWruS18bFVMmCwvWF1fMqn0LxGPX7bp5ugZPDqX5YtYe36w5xzQnP3mKAC9bLEp8dG4Lj6b7lTPduGUPQblEnx6TXc4lKE4XsyyVxwE32wJZ2LcONbxvJySQGrZo9gaQk7FH1f8HpviQDvjb37vxcX1jppiZG3jdNc4FpfmNcfYbdcB5c0F7lK04",
    );
    form.append("appId", "73503");
    form.append("version", "2.0");
    form.append("businessId", "99997");
    form.append("data", JSON.stringify(nhanhPayload));

    const { status, data } = await axios.post(
      "https://open.nhanh.vn/api/order/add",
      form,
      {
        headers: form.getHeaders(),
      },
    );
    console.log({ status, data });
    return data;
  }
}
