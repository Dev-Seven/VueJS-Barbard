import { ErrorOr, type Promotion } from "@barbaard/types";
import { DataProvider } from "./types.js";

export class PromotionDataProvider extends DataProvider<Promotion> {
  protected scope(): string {
    return "PromotionDataProvider";
  }

  async create(data: Promotion): Promise<ErrorOr<string>> {
    return await (
      await this.repository.create(data)
    )
      .map<Promise<ErrorOr<string>>>(async (fd) => {
        try {
          return ErrorOr.pure(fd.id as string);
        } catch (e) {
          return this.raiseError("create", `firestore or cast ${data}`, e);
        }
      })
      .bimap(
        (e) =>
          new Promise(() => this.raiseError("create", "not parsing data", e)),
        async (pe) => pe,
      );
  }
}
