import { UserRepository, User } from "core";
import * as firebase from "firebase-admin";
import error from "../../error/index.js";

export class FirebaseUserRepository extends UserRepository {
  private colRef: firebase.firestore.CollectionReference;
  private converter = {
    toFirestore(data: User): firebase.firestore.DocumentData {
      return User.to(data) as firebase.firestore.DocumentData;
    },
    fromFirestore(snapshot: firebase.firestore.QueryDocumentSnapshot): User {
      const data = { ...snapshot.data()!, id: snapshot.id };
      return User.from(data)!;
    },
  };

  constructor(store: firebase.firestore.Firestore) {
    super();
    this.colRef = store.collection(this.id);
  }
  async get(userId: string): Promise<[boolean, User | null]> {
    try {
      const res = (
        await this.colRef.doc(userId).withConverter(this.converter).get()
      ).data();

      if (res == undefined) {
        throw new Error("user not found");
      }
      return [true, res];
    } catch (e) {
      console.warn(
        `FirebaseUserRepository/get: `,
        "user_id",
        userId,
        error.format(e),
      );
      return [false, null];
    }
  }

  async update(user: User): Promise<[boolean, string]> {
    try {
      const res = await this.colRef
        .doc(user.id)
        .withConverter(this.converter)
        .update(this.converter.toFirestore(user));
      if (res.writeTime) {
        return [true, ""];
      }
      return [false, "cannot update user's data"];
    } catch (e) {
      console.warn(
        "FirebaseUserRepository/update: ",
        "user",
        JSON.stringify(User.to(user)),
        error.format(e),
      );
      return [false, "fail to update user's data"];
    }
  }

  async getByAffiliateCode(code: string): Promise<[boolean, User | null]> {
    try {
      const res = (
        await this.colRef
          .where("affiliateCodes", "array-contains", code)
          .withConverter(this.converter)
          .get()
      ).docs;

      if (res.length > 1) {
        throw new Error(
          `affilate code ${code} is already used in ${res.length} user(s)`,
        );
      }

      if (res.length == 0) {
        throw new Error(`user not found`);
      }
      return [true, res.at(0)!.data()!];
    } catch (e) {
      console.warn(
        "FirebaseUserRepository/getByAffiliateCode: ",
        "code",
        code,
        error.format(e),
      );
      return [false, null];
    }
  }
}
