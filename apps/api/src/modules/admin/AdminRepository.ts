import * as firebase from "firebase-admin";

export interface Admin {
  email: string;
  locations: string[];
  name: string;
  password?: string;
  roles: string[];
}

export class AdminRepository {
  constructor(private store: firebase.firestore.Firestore) {}

  async get(id: string): Promise<{ id: string; doc: Admin }> {
    return this.store
      .collection("admin")
      .doc(id)
      .get()
      .then((d) => {
        return { id: id, doc: d.data() as Admin };
      });
  }

  async update(id: string, admin: Partial<Admin>) {
    return this.store.collection("admin").doc(id).update(admin);
  }
}
