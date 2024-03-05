import type { IRepository } from "../index.js";
import type { TransactionOp } from "./transaction-ops.js";

export interface ITransactionInterpreter {
  run(...ops: TransactionOp[]): Promise<[boolean, string[]]>;
  addRepository(repository: IRepository): void;
}
