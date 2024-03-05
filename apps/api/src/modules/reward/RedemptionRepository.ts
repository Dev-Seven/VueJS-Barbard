export interface Redemption {
  code: string;
  connectaId: string;
  date: firestore.Timestamp;
  points: number;
  pointsAfter: number;
  pointsBefore: number;
  rewardId: string; // firestore id
  userId: string;
  userName: string;
}

import * as firestore from "firebase-admin/firestore";

export class RedemptionRepository {
  constructor(private store: firestore.Firestore) {}

  async add(reward: Redemption) {
    return this.store.collection("redemptions").add(reward);
  }

  async update(id: string, redemption: Partial<Redemption>) {
    return this.store.collection("redemptions").doc(id).update(redemption);
  }

  async get(id: string): Promise<{ id: string; doc: Redemption }> {
    return this.store
      .collection("redemptions")
      .doc(id)
      .get()
      .then((d) => {
        return { id: id, doc: d.data() as Redemption };
      });
  }
}
