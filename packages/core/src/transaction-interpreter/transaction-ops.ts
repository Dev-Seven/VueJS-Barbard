import type { Indexable } from "../entities/types.js";

export abstract class TransactionOp {
  constructor(private type: string) {}

  get childType(): string {
    return this.type;
  }
}
export class DeleteTransactionOp extends TransactionOp {
  constructor(
    public key: string,
    type: string,
  ) {
    super(type);
  }
}

export class UpdateTransactionOp<A> extends TransactionOp {
  constructor(
    public key: string,
    public update: (_: A) => A,
    public serialize: (_: Indexable) => A,
    public deserialize: (_: A) => object,
    type: string,
  ) {
    super(type);
  }
}

export class CreateTransactionOp<A> extends TransactionOp {
  constructor(
    public key: string,
    public data: A,
    public deserialize: (_: A) => object,
    type: string,
  ) {
    super(type);
  }
}
