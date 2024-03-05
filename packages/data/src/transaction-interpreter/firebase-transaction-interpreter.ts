import {
  DeleteTransactionOp,
  UpdateTransactionOp,
  type ITransactionInterpreter,
  type TransactionOp,
  CreateTransactionOp,
  type IRepository,
} from "core";
import * as firebase from "firebase-admin";
import error from "../error/index.js";
export class FirebaseTransactionIntepreter implements ITransactionInterpreter {
  constructor(private store: FirebaseFirestore.Firestore) {
    this._repos = new Map();
  }

  private _repos: Map<string, string>;

  addRepository(repository: IRepository) {
    this._repos.set(repository.type, repository.id);
  }

  private getColRef(
    path: string,
  ): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    return this.store.collection(path);
  }

  private async processingOp(
    op: TransactionOp,
    colRef: FirebaseFirestore.CollectionReference,
    t: firebase.firestore.Transaction,
  ): Promise<void> {
    if (op instanceof DeleteTransactionOp) {
      t.delete(colRef.doc(op.key));
    } else if (op instanceof UpdateTransactionOp) {
      t.update(
        colRef.doc(op.key),
        op.deserialize(
          op.update(
            op.serialize(
              (await this.store.doc(colRef.doc(op.key).path).get()).data()!,
            ),
          ),
        ),
      );
    } else if (op instanceof CreateTransactionOp) {
      t.create(colRef.doc(op.key), op.deserialize(op.data));
    } else {
      throw new Error(`operations not supported ${JSON.stringify(op)}`);
    }
  }

  public async run(...ops: TransactionOp[]): Promise<[boolean, string[]]> {
    return this.store
      .runTransaction(async (t) => {
        for (const op of ops) {
          if (this._repos.has(op.childType)) {
            await this.processingOp(
              op,
              this.getColRef(this._repos.get(op.childType)!),
              t,
            );
          }
        }
      })
      .then(
        () => [true, []],
        (e) => {
          console.warn(
            "FirebaseTransactionIntepreter/run: ",
            "ops",
            JSON.stringify(ops),
            error.format(e),
          );
          return [false, ["transaction failed"]];
        },
      );
  }
}
