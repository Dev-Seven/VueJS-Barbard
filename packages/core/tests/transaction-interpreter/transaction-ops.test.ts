import { expect, test } from "vitest";
import {
  DeleteTransactionOp,
  UpdateTransactionOp,
  CreateTransactionOp,
  Indexable,
} from "../../src/index.js";

test("DeleteTransactionOp", () => {
  const deleteTransactionOp = new DeleteTransactionOp("key", "type");
  expect(deleteTransactionOp.childType).toBe("type");
});

type Foo = { foo: number };

test("UpdateTransactionOp", () => {
  const updateTransactionOp = new UpdateTransactionOp(
    "key",
    (a: Foo) => a,
    (a: Indexable) => a as Foo,
    (a: Foo) => ({ a }),
    "type",
  );
  expect(updateTransactionOp.childType).toBe("type");
});

test("CreateTransactionOp", () => {
  const createTransactionOp = new CreateTransactionOp(
    "key",
    1,
    (a: number) => ({ a }),
    "type",
  );
  expect(createTransactionOp.childType).toBe("type");
});
