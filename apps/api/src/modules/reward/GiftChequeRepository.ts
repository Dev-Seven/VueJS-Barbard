export interface GiftCheque {
  active: boolean;
  code: string;
  expiryDate: firestore.Timestamp;
  purchasedAt: firestore.Timestamp;
  redemptionId: string;
  salesChannel: string;
  storeCredit: number;
  userId: string;
  userName: string;
  value: number;
}
import * as firestore from "firebase-admin/firestore";

export class GiftChequeRepository {
  constructor(private store: firestore.Firestore) {}

  async add(reward: GiftCheque) {
    return this.store.collection("giftcheques").add(reward);
  }

  async update(id: string, redemption: Partial<GiftCheque>) {
    return this.store.collection("giftcheques").doc(id).update(redemption);
  }

  async get(id: string): Promise<{ id: string; doc: GiftCheque }> {
    return this.store
      .collection("giftcheques")
      .doc(id)
      .get()
      .then((d) => {
        return { id: id, doc: d.data() as GiftCheque };
      });
  }
}
