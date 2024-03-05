import { test, expect, describe } from "vitest";
import { AffiliateCode } from "../../src/index.js";

test("AffiliateCode.isValidated returns true for valid code", () => {
  const code = "AABBCD";
  const [isValid, errors] = AffiliateCode.isValidated(code);
  expect(isValid).toBe(true);
  expect(errors.length).toBe(0);
});

describe("isValidated", () => {
  test("returns true for a valid code", () => {
    const code = "AC1234";
    const [result, errors] = AffiliateCode.isValidated(code);
    expect(result).toBe(true);
    expect(errors).toEqual([]);
  });

  test("returns false for an invalid code with incorrect length", () => {
    const code = "AB123";
    const [result, errors] = AffiliateCode.isValidated(code);
    expect(result).toBe(false);
    expect(errors).toContain("affilate code: not has a proper length");
  });

  test("returns false for an invalid code with incorrect format", () => {
    const code = "AB1B34";
    const [result, errors] = AffiliateCode.isValidated(code);
    expect(result).toBe(false);
    expect(errors).toContain("affilate code: invalid format");
  });

  test("Empty input code", () => {
    expect(AffiliateCode.isValidated("")).toEqual([
      false,
      [
        "affilate code: invalid format",
        "affilate code: not has a proper length",
      ],
    ]);
  });

  test("Input code less than 6 characters", () => {
    expect(AffiliateCode.isValidated("12345")).toEqual([
      false,
      [
        "affilate code: invalid format",
        "affilate code: not has a proper length",
      ],
    ]);
  });

  test("Input code greater than 6 characters", () => {
    expect(AffiliateCode.isValidated("1234567")).toEqual([
      false,
      [
        "affilate code: invalid format",
        "affilate code: not has a proper length",
      ],
    ]);
  });

  test("Input code has invalid format", () => {
    expect(AffiliateCode.isValidated("XXB123")).toEqual([
      false,
      ["affilate code: invalid format"],
    ]);
  });

  test("Input code has valid format", () => {
    expect(AffiliateCode.isValidated("ACA123")).toEqual([true, []]);
  });
});

test("AffiliateCode constructor throws error for invalid code", () => {
  const code = "AABBC";
  expect(() => new AffiliateCode(code)).toThrowError("Invalid code");
});

test("AffiliateCode constructor sets referrerCode and recepientCode correctly", () => {
  const code = "AABBCD";
  const affiliateCode = new AffiliateCode(code);
  expect(affiliateCode.referrerCode).toBe("A");
  expect(affiliateCode.recepientCode).toBe("A");
});
