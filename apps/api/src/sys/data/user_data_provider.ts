import { type BarbaardUser, ErrorOr, isBarbaardUser } from "@barbaard/types";
import type { DocumentData, QuerySnapshot } from "firebase-admin/firestore";
import { DataProvider } from "./types.js";

export type BarbaardUserWithId = [id: string, user: BarbaardUser];

export class UserDataProvider extends DataProvider<BarbaardUser> {
  protected scope(): string {
    return "UserDataProvider";
  }
  async create(data: BarbaardUser): Promise<ErrorOr<BarbaardUserWithId>> {
    return await (
      await this.repository.create(data)
    )
      .map<Promise<ErrorOr<BarbaardUserWithId>>>(async (fd) => {
        try {
          const data = (await fd.get()).data()! as BarbaardUser;
          if (isBarbaardUser(data)) {
            return ErrorOr.pure([fd.id, data]);
          }
          return this.raiseError("create", `cast ${data}`, null);
        } catch (e) {
          return this.raiseError("create", `firestore${data}`, e);
        }
      })
      .bimap(
        (e) =>
          new Promise(() => this.raiseError("create", "not parsing data", e)),
        async (pe) => pe,
      );
  }

  async update(
    id: string,
    payload: Partial<BarbaardUser>,
  ): Promise<ErrorOr<FirebaseFirestore.Timestamp>> {
    return (await this.repository.update(id, payload)).map(
      (wr) => wr.writeTime,
    );
  }

  async get(id: string): Promise<ErrorOr<BarbaardUser>> {
    return (await this.repository.get(id)).flatmap((ds) => {
      try {
        const data = ds.data()! as BarbaardUser;
        if (isBarbaardUser(data)) {
          return ErrorOr.pure(data);
        }
        return this.raiseError("get", `cast ${data}`, null);
      } catch (e) {
        return this.raiseError("get", `not existed or cast ${id}`, e);
      }
    });
  }

  private auxUserParser = (
    d: QuerySnapshot<DocumentData>,
    method: string,
    fieldName: string,
    value: string,
  ): ErrorOr<BarbaardUserWithId> => {
    if (d.docs.length === 0)
      return this.raiseError<BarbaardUserWithId>(
        method,
        `not existed ${fieldName} with ${value}`,
        null,
      );
    try {
      const doc = d.docs[0];
      const id = doc!.id;
      const data = doc?.data() as BarbaardUser;
      if (isBarbaardUser(data)) {
        return ErrorOr.pure([id, data]);
      }
      return this.raiseError(method, `cast ${data}`, null);
    } catch (e) {
      return this.raiseError(method, `parsing ${fieldName} with ${value}`, e);
    }
  };

  async getUserByWpId(wpId: number): Promise<ErrorOr<BarbaardUserWithId>> {
    return this.repository.query((c) =>
      c
        .where("wpId", "==", wpId)
        .get()
        .then(
          (d) =>
            this.auxUserParser(d, "getUserByWpId", "wordpress id", wpId + ""),
          (e) => this.raiseError("getUserById", "firebase", e),
        ),
    );
  }

  async getUserByBooklyUserId(
    booklyUserId: number,
  ): Promise<ErrorOr<BarbaardUserWithId>> {
    return this.repository.query((c) =>
      c
        .where("booklyUserId", "==", booklyUserId)
        .get()
        .then(
          (d) =>
            this.auxUserParser(
              d,
              "getUserByBooklyUserId",
              "Bookly UserId",
              booklyUserId + "",
            ),
          (e) => this.raiseError("getUserByBooklyUserId", "firebase", e),
        ),
    );
  }

  async getUserByPhone(phone: string): Promise<ErrorOr<BarbaardUserWithId>> {
    return this.repository.query((c) =>
      c
        .where("phone", "==", phone)
        .get()
        .then(
          (d) => this.auxUserParser(d, "getUserByPhone", "phone number", phone),
          (e) => this.raiseError("getUserByPhone", "firebase", e),
        ),
    );
  }

  async getUserByAffiliateCode(
    code: string,
  ): Promise<ErrorOr<BarbaardUserWithId>> {
    return this.repository.query((c) =>
      c
        .where("affiliateCodes", "array-contains", code)
        .get()
        .then(
          (d) => this.auxUserParser(d, "getUserByAffiliateCode", "code", code),
          (e) => this.raiseError("getUserByAffiliateCode", "firebase", e),
        ),
    );
  }

  async getCustomersByLastAppointment(
    from: FirebaseFirestore.Timestamp,
    to: FirebaseFirestore.Timestamp,
  ): Promise<ErrorOr<BarbaardUserWithId[]>> {
    return await this.repository.query((c) =>
      c
        .where("barbershop.lastAppointment", ">=", from)
        .where("barbershop.lastAppointment", "<=", to)
        .get()
        .then(
          (v) => {
            try {
              return ErrorOr.pure(
                v.docs
                  .filter((d) => isBarbaardUser(d.data()))
                  .map((d) => [d.id, d.data() as BarbaardUser]),
              );
            } catch (e) {
              return this.raiseError(
                "getCustomersByLastAppointment",
                `mapping from ${from} to ${to} `,
                e,
              );
            }
          },
          (e) =>
            this.raiseError("getCustomersByLastAppointment", "firebase", e),
        ),
    );
  }
}
