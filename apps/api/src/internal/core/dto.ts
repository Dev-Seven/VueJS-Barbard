import { ErrorOr } from "@barbaard/types";
import * as firestore from "firebase-admin/firestore";

type Indexable = {
  [index: string]: unknown;
};

const auxFromDto = <A extends Indexable, B extends object>(u: A): B => {
  const a: Indexable = {};
  type Key = keyof typeof u;
  Object.getOwnPropertyNames(u).forEach((k) =>
    u[k as Key]
      ? Array.isArray(u[k as Key])
        ? auxArrayParser(u[k as Key] as Indexable[]).length
          ? (a[k] = auxArrayParser(u[k as Key] as Indexable[]))
          : null
        : u[k as Key] instanceof firestore.Timestamp
          ? (a[k] = u[k as Key])
          : typeof u[k as Key] == "object"
            ? isValidObject(auxFromDto(u[k as Key] as Indexable))
              ? (a[k] = auxFromDto(u[k as Key] as Indexable))
              : null
            : (a[k] = u[k as Key])
      : null,
  );
  return a as B;
};

const fromDto = <A extends Indexable, B extends object>(u: A): ErrorOr<B> => {
  try {
    return ErrorOr.pure(auxFromDto(u));
  } catch (e) {
    return ErrorOr.raiseError("core", "fromDto", `cast${u}`, e);
  }
};

const isValidObject = (o: object): boolean => Object.values(o).some((v) => v);

const auxArrayParser = (as: object[]): object[] =>
  as
    .filter(isValidObject)
    .map((a) => a as Indexable)
    .map(auxFromDto)
    .filter(isValidObject);

const arrayParser = (as: object[]): ErrorOr<object[]> => {
  try {
    return ErrorOr.pure(auxArrayParser(as));
  } catch (e) {
    return ErrorOr.raiseError("core", "arrayParser", `cast ${as}`, e);
  }
};

export default {
  fromDto,
  arrayParser,
};
