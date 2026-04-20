import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isThrottled,
  markSubmission,
  isHoneypotTripped,
  HONEYPOT_FIELD,
  getThrottleKey,
} from "./antiSpam";

describe("antiSpam", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("getThrottleKey", () => {
    it("namespaces throttle keys by form id", () => {
      expect(getThrottleKey("partner")).toBe("enq_last:partner");
      expect(getThrottleKey("investor")).toBe("enq_last:investor");
    });
  });

  describe("isThrottled / markSubmission", () => {
    it("returns 0 when no prior submission was recorded", () => {
      expect(isThrottled("partner")).toBe(0);
    });

    it("returns remaining seconds after a recent submission", () => {
      markSubmission("partner");
      const remaining = isThrottled("partner");
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(60);
    });

    it("stops throttling once the window has elapsed", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
      markSubmission("partner");
      // Jump 61s forward
      vi.setSystemTime(new Date("2030-01-01T00:01:01Z"));
      expect(isThrottled("partner")).toBe(0);
    });

    it("each form id throttles independently", () => {
      markSubmission("partner");
      expect(isThrottled("partner")).toBeGreaterThan(0);
      expect(isThrottled("investor")).toBe(0);
    });
  });

  describe("isHoneypotTripped", () => {
    it("returns false for empty/null honeypot", () => {
      expect(isHoneypotTripped(null)).toBe(false);
      expect(isHoneypotTripped("")).toBe(false);
      expect(isHoneypotTripped("   ")).toBe(false);
    });

    it("returns true when the field contains any visible text", () => {
      expect(isHoneypotTripped("http://bot.example.com")).toBe(true);
      expect(isHoneypotTripped("x")).toBe(true);
    });

    it("ignores File instances (non-string values)", () => {
      const fakeFile = new File(["x"], "a.txt");
      expect(isHoneypotTripped(fakeFile)).toBe(false);
    });
  });

  it("exposes a stable honeypot field name used by the forms", () => {
    expect(HONEYPOT_FIELD).toBe("website_url");
  });
});
