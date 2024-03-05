import { ErrorOr } from "../index.js";
import {
  DocumentReference,
  Transaction,
  type UpdateData,
} from "firebase-admin/firestore";

export abstract class Repository<A extends object> {
  constructor(private store: FirebaseFirestore.Firestore) {}

  abstract getCollectionPath(): string;

  static async transaction<A extends Object>(
    store: FirebaseFirestore.Firestore,
    colrefs: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[],
    actions: (_: TransactionOperations<A>[]) => Promise<void>,
  ): Promise<[boolean, string]> {
    try {
      store.runTransaction(async (t) => {
        actions(
          colrefs.map(
            (
              colRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
            ) => {
              const create = (id: string, data: A) =>
                t.create(colRef.doc(id), data);
              const update = (id: string, payload: UpdateData<A>) =>
                t.update(colRef.doc(id) as DocumentReference<A>, payload);
              const del = (id: string) => t.delete(colRef.doc(id));

              return {
                create,
                update,
                del,
              };
            },
          ),
        );
      });
      return [true, ""];
    } catch (e) {
      return [false, e instanceof Error ? e.message : "unknown"];
    }
  }

  protected raiseError<F extends object>(
    method: string,
    reason: string,
    errOrNot: Error | unknown,
  ): ErrorOr<F> {
    return ErrorOr.raiseError(
      `repository ${this.getCollectionPath()}`,
      method,
      reason,
      errOrNot,
    );
  }

  async create(
    data: A,
  ): Promise<ErrorOr<FirebaseFirestore.DocumentReference<A>>> {
    return this.query((c) =>
      c.add(data).then(
        (v) => {
          try {
            return ErrorOr.pure(v as FirebaseFirestore.DocumentReference<A>);
          } catch (e) {
            return this.raiseError<FirebaseFirestore.DocumentReference<A>>(
              "create",
              `cast ${JSON.stringify(data)}`,
              e,
            );
          }
        },
        (e) =>
          this.raiseError<FirebaseFirestore.DocumentReference<A>>(
            "create",
            `firestore ${JSON.stringify(data)}`,
            e,
          ),
      ),
    );
  }

  async addWithCustomId(
    data: A,
    id: string,
  ): Promise<ErrorOr<FirebaseFirestore.WriteResult>> {
    return this.query((c) =>
      c
        .doc(id)
        .set(data)
        .then(
          (v) => {
            try {
              return ErrorOr.pure(v as FirebaseFirestore.WriteResult);
            } catch (e) {
              return this.raiseError<FirebaseFirestore.WriteResult>(
                "create",
                `cast ${JSON.stringify(data)}`,
                e,
              );
            }
          },
          (e) =>
            this.raiseError<FirebaseFirestore.WriteResult>(
              "create",
              `firestore ${JSON.stringify(data)}`,
              e,
            ),
        ),
    );
  }

  async set(
    id: string,
    data: A,
  ): Promise<ErrorOr<FirebaseFirestore.WriteResult>> {
    return this.query((c) =>
      c
        .doc(id)
        .set(data)
        .then(ErrorOr.pure, (e) =>
          this.raiseError<FirebaseFirestore.WriteResult>(
            "set",
            `firestore ${id} ${JSON.stringify(data)}`,
            e,
          ),
        ),
    );
  }

  async update(
    id: string,
    payload: Partial<A>,
  ): Promise<ErrorOr<FirebaseFirestore.WriteResult>> {
    return this.query((c) =>
      c
        .doc(id)
        .update(payload)
        .then(ErrorOr.pure, (e) =>
          this.raiseError<FirebaseFirestore.WriteResult>(
            "update",
            `firestore id-${id} ${JSON.stringify(payload)}`,
            e,
          ),
        ),
    );
  }

  async get(
    id: string,
  ): Promise<ErrorOr<FirebaseFirestore.DocumentSnapshot<A>>> {
    return this.query((c) =>
      c
        .doc(id)
        .get()
        .then(
          (v) => {
            try {
              return ErrorOr.pure(v as FirebaseFirestore.DocumentSnapshot<A>);
            } catch (e) {
              return this.raiseError<FirebaseFirestore.DocumentSnapshot<A>>(
                "cast",
                `get ${id}`,
                e,
              );
            }
          },
          (e) =>
            this.raiseError<FirebaseFirestore.DocumentSnapshot<A>>(
              "firestore",
              `get ${id}`,
              e,
            ),
        ),
    );
  }

  query<B extends object>(
    f: (
      _: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    ) => Promise<ErrorOr<B>>,
  ): Promise<ErrorOr<B>> {
    return f(this.getColRef());
  }

  getColRef(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    return this.store.collection(this.getCollectionPath());
  }
}

export type TransactionOperations<A extends Object> = {
  create: (id: string, data: A) => Transaction;
  update: (id: string, payload: UpdateData<A>) => Transaction;
  del: (id: string) => Transaction;
};
