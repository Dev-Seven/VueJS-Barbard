import type { SendinblueEvent } from "./NotificationService.js";
import * as firestore from "firebase-admin/firestore";

export interface Notification {
  messageId?: string;
  method: "email";
  userId: string;
  userName?: string;
  sendAt: firestore.Timestamp;
  status?: string;
  type?: string;
  payload?: object;
  events?: SendinblueEvent[];
}

export class NotificationRepository {
  constructor(private store: firestore.Firestore) {}

  addNotification(notification: Notification) {
    return this.store.collection("notifications").add(notification);
  }

  updateNotification(id: string, notification: Partial<Notification>) {
    return this.store.collection("notifications").doc(id).update(notification);
  }

  async getByMessageId(
    messageId: string,
  ): Promise<{ id: string; doc: Notification }> {
    return this.store
      .collection("notifications")
      .where("messageId", "==", messageId)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("notification not found for messageId:" + messageId);
        const doc = d.docs[0];
        const id = doc?.id || ""; // Use an empty string as a fallback if id is undefined
        return { id, doc: doc?.data() as Notification };
      });
  }
}
