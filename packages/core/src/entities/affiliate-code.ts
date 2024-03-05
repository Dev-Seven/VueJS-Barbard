const kAffiliateCodes = ["A", "B", "C"] as const;
export type AffiliateCar = (typeof kAffiliateCodes)[number];

export class AffiliateCode {
  static isValidated(code: string): [boolean, string[]] {
    const pcode = code.trim();

    let errs: string[] = [];

    if (pcode.length != 6) {
      errs = ["affilate code: not has a proper length", ...errs];
    }

    const [f1, f2] = pcode.split("").slice(0, 2);

    const codes = kAffiliateCodes as unknown as string[];
    if (!(codes.includes(f1!) && codes.includes(f2!) && f2 != "B")) {
      errs = ["affilate code: invalid format", ...errs];
    }

    if (errs.length > 0) {
      return [false, errs];
    }

    return [true, []];
  }

  private _referrerCode: AffiliateCar;
  private _recepientCode: AffiliateCar;
  private code: string;

  constructor(code: string) {
    const [ok] = AffiliateCode.isValidated(code);

    if (!ok) {
      throw new Error("Invalid code");
    }
    this.code = code;
    const [refCode, recCode] = code.split("").slice(0, 2);
    this._referrerCode = refCode as unknown as AffiliateCar;
    this._recepientCode = recCode as unknown as AffiliateCar;
  }

  get value(): string {
    return this.code;
  }

  get referrerCode(): AffiliateCar {
    return this._referrerCode;
  }

  get recepientCode(): AffiliateCar {
    return this._recepientCode;
  }
}
