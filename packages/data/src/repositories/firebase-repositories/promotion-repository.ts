import { PromotionRepository, Promotion } from "core";
import * as firebase from "firebase-admin";

export class FirebasePromotionRepository extends PromotionRepository {
  private colRef: firebase.firestore.CollectionReference;
  private converter = {
    toFirestore(data: Promotion): firebase.firestore.DocumentData {
      return Promotion.to(data) as firebase.firestore.DocumentData;
    },
    fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
    ): Promotion {
      const data = { ...snapshot.data()!, id: snapshot.id };
      return Promotion.from(data)!;
    },
  };
  constructor(store: firebase.firestore.Firestore) {
    super();
    this.colRef = store.collection(this.id);
  }
}
