export class ErrorOr<A extends NonNullable<unknown>> {
  private constructor(private value: Error | A) {}

  static readonly raiseError = <A extends NonNullable<unknown>>(
    scope: string,
    method: string,
    reason: string,
    err: Error | unknown,
  ): ErrorOr<A> => {
    return new ErrorOr<A>(
      new Error(
        `${scope} : ${method} : ${reason} : ${
          err instanceof Error
            ? `${err.message} : ${err.stack}`
            : `${JSON.stringify(err)}`
        }`,
      ),
    );
  };

  static readonly pure = <A extends NonNullable<unknown>>(
    val: A,
  ): ErrorOr<A> => {
    return new ErrorOr(val);
  };

  static readonly transform = <
    A extends NonNullable<unknown>,
    F extends Iterable<any>,
    G extends Iterable<A>,
  >(
    errOrs: F,
    pure: () => F,
    populate: (a: A, f: F) => void,
  ): ErrorOr<G> => {
    const res = pure();

    for (const errOr of errOrs) {
      if (errOr instanceof ErrorOr) {
        if (errOr.value instanceof Error) {
          return errOr.warp(
            ErrorOr.raiseError(
              "ErrorOr",
              "transform",
              "invalid input",
              Error(`current processing ${errOr}`),
            ),
          );
        }
        populate(errOr.value, res);
      }
      return ErrorOr.raiseError(
        "ErrorOr",
        "transform",
        "invalid agrument",
        Error(`errOrs's elements must be ErrorOr`),
      );
    }
    try {
      return ErrorOr.pure(res) as unknown as ErrorOr<G>;
    } catch (_) {
      return ErrorOr.raiseError(
        "ErrorOr",
        "transform",
        "cannot cast from F to G",
        Error("G must be convariant of F"),
      );
    }
  };

  recoverWith(fea: (e: Error) => A): A {
    return this.value instanceof Error ? fea(this.value) : this.value;
  }

  warp(errorOr: ErrorOr<A>): ErrorOr<A> {
    return this.value instanceof Error
      ? errorOr.value instanceof Error
        ? new ErrorOr<A>(
            new Error(`${errorOr.value.message}\n${this.value.message}`),
          )
        : this
      : this;
  }

  map<B extends NonNullable<unknown>>(fab: (a: A) => B): ErrorOr<B> {
    return this.value instanceof Error
      ? (this as unknown as ErrorOr<B>)
      : new ErrorOr<B>(fab(this.value));
  }

  bimap<R extends unknown>(fer: (e: Error) => R, far: (a: A) => R) {
    return this.value instanceof Error ? fer(this.value) : far(this.value);
  }

  flatmap<B extends NonNullable<unknown>>(
    fafb: (a: A) => ErrorOr<B>,
  ): ErrorOr<B> {
    return this.value instanceof Error
      ? (this as unknown as ErrorOr<B>)
      : fafb(this.value).bimap<ErrorOr<B>>(
          (e) =>
            ErrorOr.raiseError("barbaardType", "flatmap", "calling fafb", e),
          ErrorOr.pure,
        );
  }

  getOrNull(log: (e: Error) => void = console.error): A | null {
    return this.bimap(
      (e) => {
        log(e);
        return null;
      },
      (a) => a,
    );
  }

  getOrThrow(): A {
    return this.bimap(
      (e) => {
        throw e;
      },
      (a) => a,
    );
  }

  public toString = (): string => {
    return this.value instanceof Error
      ? this.value.message
      : typeof this.value == "object"
        ? this.value.toString()
        : `${this.value}`;
  };
}
