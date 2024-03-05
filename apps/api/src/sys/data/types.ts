import { ErrorOr, Repository } from "@barbaard/types";

export abstract class DataProvider<A extends object> {
  protected abstract scope(): string;

  constructor(protected repository: Repository<A>) {}

  getCollectionReference() {
    return this.repository.getColRef();
  }

  raiseError<B extends NonNullable<unknown>>(
    method: string,
    reason: string,
    err: unknown,
  ): ErrorOr<B> {
    return ErrorOr.raiseError(this.scope(), method, reason, err);
  }
}
