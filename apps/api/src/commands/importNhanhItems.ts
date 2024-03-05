import axios from "axios";
import FormData from "form-data";
import admin from "firebase-admin";
import functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";

export const NhanhAppId = defineSecret("NHANH_APP_ID");
export const NhanhBusinessId = defineSecret("NHANH_BUSINESS_ID");
export const NhanhAccessToken = defineSecret("NHANH_ACCESS_TOKEN");

async function* NhanhProducts(opts: {
  appId: string;
  businessId: string;
  accessToken: string;
}) {
  let lastPage = 0;

  while (true) {
    const body: FormData = new FormData();
    body.append("version", "2.0");
    body.append("appId", opts.appId);
    body.append("businessId", opts.businessId);
    body.append("accessToken", opts.accessToken);
    body.append("data", `{ "page": "${lastPage + 1}"}`);

    const response = await axios({
      method: "POST",
      url: "https://open.nhanh.vn/api/product/search",
      data: body,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${body.getBoundary()}`,
      },
    });

    const { code, data, messages } = response.data;
    if (code === 0) {
      throw new Error(
        `Unable to get data from rest api, Error: ${JSON.stringify(
          messages,
          null,
          4,
        )}`,
      );
    }

    const { currentPage, totalPages, products } = data;
    yield { currentPage, totalPages, products };
    if (currentPage >= totalPages) {
      break;
    }

    lastPage = currentPage;
  }
}

export async function ImportNhanhItems(
  req: functions.https.Request,
  resp: functions.Response,
): Promise<void> {
  const appId = NhanhAppId.value();
  const businessId = NhanhBusinessId.value();
  const accessToken = NhanhAccessToken.value();

  for await (const { products } of NhanhProducts({
    appId,
    businessId,
    accessToken,
  })) {
    const db = admin.firestore();
    const batch = db.batch();
    const collection = db.collection("posItems/products/items");

    Object.keys(products).forEach((key) =>
      batch.set(collection.doc(key), products[key]),
    );

    await batch.commit();
  }

  resp.json({ message: "imported all nhanh items" });
}
