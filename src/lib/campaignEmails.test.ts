import { describe, it, expect } from "vitest";
import { parseTestRecipients, MAX_TEST_RECIPIENTS } from "./campaignEmails";

describe("parseTestRecipients", () => {
  it("returns nothing for empty input", () => {
    expect(parseTestRecipients("")).toEqual({ emails: [], invalid: [], error: null });
    expect(parseTestRecipients("   \n  ")).toEqual({ emails: [], invalid: [], error: null });
  });

  it("accepts a single address", () => {
    expect(parseTestRecipients("me@example.com").emails).toEqual(["me@example.com"]);
  });

  it("splits on commas, semicolons and newlines alike", () => {
    // Admins paste from wherever; the separator is whatever they happened to
    // have.
    const { emails } = parseTestRecipients("a@x.com, b@x.com; c@x.com\nd@x.com");
    expect(emails).toEqual(["a@x.com", "b@x.com", "c@x.com", "d@x.com"]);
  });

  it("trims surrounding whitespace", () => {
    expect(parseTestRecipients("  me@example.com  ").emails).toEqual(["me@example.com"]);
  });

  it("lower-cases and de-duplicates", () => {
    // Two spellings of one inbox must not burn two of the five slots.
    const { emails } = parseTestRecipients("Me@Example.com, me@example.com, ME@EXAMPLE.COM");
    expect(emails).toEqual(["me@example.com"]);
  });

  it("reports entries that are not addresses", () => {
    const result = parseTestRecipients("good@x.com, nonsense, also bad");
    expect(result.emails).toEqual(["good@x.com"]);
    expect(result.invalid).toEqual(["nonsense", "also bad"]);
    expect(result.error).toContain("nonsense");
  });

  it("accepts exactly the maximum", () => {
    const input = Array.from({ length: MAX_TEST_RECIPIENTS }, (_, i) => `a${i}@x.com`).join(",");
    const result = parseTestRecipients(input);
    expect(result.emails).toHaveLength(MAX_TEST_RECIPIENTS);
    expect(result.error).toBeNull();
  });

  it("rejects one over the maximum", () => {
    const input = Array.from({ length: MAX_TEST_RECIPIENTS + 1 }, (_, i) => `a${i}@x.com`).join(",");
    const result = parseTestRecipients(input);
    expect(result.error).toContain(String(MAX_TEST_RECIPIENTS));
  });

  it("ignores trailing separators", () => {
    expect(parseTestRecipients("a@x.com,,b@x.com,").emails).toEqual(["a@x.com", "b@x.com"]);
  });
});
