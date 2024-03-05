import axios from "axios";
import admin from "firebase-admin";
import functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import lodash from "lodash";

export const MarketManApiKey = defineSecret("MARKETMAN_API_KEY");
export const MarketManApiPassword = defineSecret("MARKETMAN_API_PASSWORD");
export const MarketManBuyerGuid = defineSecret("MARKETMAN_BUYER_GUID");

const BaseUrl = "https://api.marketman.com/v3";

const chunk = lodash.chunk;

async function GetBuyerToken() {
  const APIKey = MarketManApiKey.value();
  const APIPassword = MarketManApiPassword.value();

  const { data } = await axios.post<{ Token: string }>(
    `${BaseUrl}/buyers/auth/GetToken`,
    {
      APIKey,
      APIPassword,
    },
  );

  const { Token } = data;

  return Token;
}

async function GetItems() {
  const BuyerGuid = MarketManBuyerGuid.value();
  const AUTH_TOKEN = await GetBuyerToken();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await axios.post<{ Items: any[] }>(
    `${BaseUrl}/buyers/inventory/GetMenuItems`,
    {
      BuyerGuid,
    },
    {
      headers: {
        AUTH_TOKEN,
      },
    },
  );

  const { Items } = data;

  return Items;
}

export async function pullMarketManItems(
  req: functions.https.Request,
  resp: functions.Response,
): Promise<void> {
  const [skuPatched, total] = await auxPullMarketManItems();
  resp.json({
    message: "imported all MarketMan items",
    skuPatched,
    total,
  });
}

export async function auxPullMarketManItems() {
  const db = admin.firestore();
  const collectionDetails = db.collection("posItems/f&b/details");
  const collection = db.collection("posItems/f&b/items");

  const allItems = await GetItems();
  if (!allItems) {
    throw Error("Unable to get data from market man.");
  }

  const skuPatched: string[] = [];

  await Promise.all(
    chunk(allItems, 500).map(async (items) => {
      const batch = db.batch();
      await Promise.all(
        items.map(async (item) => {
          const itemId = item.ID.toString();

          if (item.Skus?.length) {
            await Promise.all(
              item.Skus.map(async (sk: string) => {
                const skRef = collectionDetails.doc(sk);
                const skDoc = await skRef.get();
                const skData = skDoc.data();

                // only if itemId is mismatched
                if (skData && skData.itemId !== itemId) {
                  // for log purpose
                  skuPatched.push(`${sk}: ${skData.itemId + " to " + itemId}`);

                  // Update item Id
                  skData.itemId = itemId;
                  batch.set(skRef, skData);
                }
              }),
            );
          }

          const ref = collection.doc(itemId);
          batch.set(ref, item);
        }),
      );

      await batch.commit();
    }),
  );

  return [skuPatched, allItems.length];
}
