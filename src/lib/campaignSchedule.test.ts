import { describe, it, expect, afterEach, vi } from "vitest";
import {
  snapToQuarterHourUtc,
  isQuarterHourUtc,
  parseLocalInput,
  isTooSoon,
  buildScheduleCandidate,
  toScheduleTime,
  toLocalInputValue,
  defaultScheduleValue,
} from "./campaignSchedule";

/**
 * Mailchimp only accepts :00/:15/:30/:45 UTC and rejects anything else, so
 * these are the calculations that decide whether a newsletter goes out at the
 * right hour. Hour and day rollovers are covered explicitly because that is
 * where off-by-one errors hide.
 */
describe("campaignSchedule", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("snapToQuarterHourUtc", () => {
    it("rounds up to the next slot", () => {
      const out = snapToQuarterHourUtc(new Date("2027-01-05T09:01:00Z"));
      expect(out.toISOString()).toBe("2027-01-05T09:15:00.000Z");
    });

    it("leaves a time already on a slot untouched", () => {
      const out = snapToQuarterHourUtc(new Date("2027-01-05T09:15:00Z"));
      expect(out.toISOString()).toBe("2027-01-05T09:15:00.000Z");
    });

    it("rolls over the hour", () => {
      const out = snapToQuarterHourUtc(new Date("2027-01-05T09:46:00Z"));
      expect(out.toISOString()).toBe("2027-01-05T10:00:00.000Z");
    });

    it("rolls over the day", () => {
      const out = snapToQuarterHourUtc(new Date("2027-01-05T23:50:00Z"));
      expect(out.toISOString()).toBe("2027-01-06T00:00:00.000Z");
    });

    it("rolls over the year", () => {
      const out = snapToQuarterHourUtc(new Date("2027-12-31T23:59:30Z"));
      expect(out.toISOString()).toBe("2028-01-01T00:00:00.000Z");
    });

    it("discards seconds and milliseconds even on an exact slot", () => {
      const out = snapToQuarterHourUtc(new Date("2027-01-05T09:30:45.123Z"));
      expect(out.toISOString()).toBe("2027-01-05T09:45:00.000Z");
    });

    it("never moves a time earlier than asked for", () => {
      const input = new Date("2027-01-05T09:01:00Z");
      expect(snapToQuarterHourUtc(input).getTime()).toBeGreaterThanOrEqual(input.getTime());
    });
  });

  describe("isQuarterHourUtc", () => {
    it("accepts each valid slot", () => {
      for (const minute of ["00", "15", "30", "45"]) {
        expect(isQuarterHourUtc(new Date(`2027-01-05T09:${minute}:00Z`))).toBe(true);
      }
    });

    it("rejects an off-slot minute and stray seconds", () => {
      expect(isQuarterHourUtc(new Date("2027-01-05T09:07:00Z"))).toBe(false);
      expect(isQuarterHourUtc(new Date("2027-01-05T09:15:30Z"))).toBe(false);
    });
  });

  describe("parseLocalInput", () => {
    it("returns null rather than an Invalid Date", () => {
      expect(parseLocalInput("")).toBeNull();
      expect(parseLocalInput("not a date")).toBeNull();
    });

    it("reads a datetime-local value as local time", () => {
      const parsed = parseLocalInput("2027-01-05T16:00");
      expect(parsed).not.toBeNull();
      // Local, not UTC: the hour is what the admin typed.
      expect(parsed?.getHours()).toBe(16);
      expect(parsed?.getMinutes()).toBe(0);
    });
  });

  describe("isTooSoon", () => {
    it("rejects the past and the next few minutes", () => {
      const now = new Date("2027-01-05T09:00:00Z");
      expect(isTooSoon(new Date("2027-01-05T08:45:00Z"), now)).toBe(true);
      expect(isTooSoon(new Date("2027-01-05T09:03:00Z"), now)).toBe(true);
    });

    it("accepts a time comfortably ahead", () => {
      const now = new Date("2027-01-05T09:00:00Z");
      expect(isTooSoon(new Date("2027-01-05T09:30:00Z"), now)).toBe(false);
    });
  });

  describe("buildScheduleCandidate", () => {
    it("returns null for an empty input", () => {
      expect(buildScheduleCandidate("", new Date("2027-01-05T09:00:00Z"))).toBeNull();
    });

    it("flags that an off-slot time was moved", () => {
      const now = new Date("2027-01-05T00:00:00Z");
      const local = toLocalInputValue(new Date("2027-01-05T09:07:00Z"));
      const candidate = buildScheduleCandidate(local, now);
      expect(candidate?.adjusted).toBe(true);
      expect(isQuarterHourUtc(candidate!.date)).toBe(true);
      expect(candidate?.error).toBeNull();
    });

    it("does not flag a time that was already on a slot", () => {
      const now = new Date("2027-01-05T00:00:00Z");
      const local = toLocalInputValue(new Date("2027-01-05T09:30:00Z"));
      expect(buildScheduleCandidate(local, now)?.adjusted).toBe(false);
    });

    it("reports a time that is too soon", () => {
      const now = new Date("2027-01-05T09:00:00Z");
      const local = toLocalInputValue(new Date("2027-01-05T09:01:00Z"));
      const candidate = buildScheduleCandidate(local, now);
      // 09:01 snaps to 09:15, which is more than the 5 minute floor away.
      expect(candidate?.error).toBeNull();

      const tooSoon = buildScheduleCandidate(
        toLocalInputValue(new Date("2027-01-05T08:50:00Z")),
        now
      );
      expect(tooSoon?.error).toBeTruthy();
    });

    it("always emits a schedule_time carrying an explicit UTC offset", () => {
      const now = new Date("2027-01-05T00:00:00Z");
      const candidate = buildScheduleCandidate(
        toLocalInputValue(new Date("2027-01-05T09:07:00Z")),
        now
      );
      expect(candidate?.scheduleTime).toMatch(/[+-]\d{2}:\d{2}$/);
    });
  });

  describe("toScheduleTime", () => {
    it("writes an explicit offset instead of Z, and drops milliseconds", () => {
      expect(toScheduleTime(new Date("2027-01-05T09:30:00.000Z"))).toBe(
        "2027-01-05T09:30:00+00:00"
      );
    });
  });

  describe("toLocalInputValue", () => {
    it("round-trips through parseLocalInput", () => {
      const original = new Date(2027, 0, 5, 16, 30, 0, 0);
      const parsed = parseLocalInput(toLocalInputValue(original));
      expect(parsed?.getTime()).toBe(original.getTime());
    });

    it("zero-pads every component", () => {
      expect(toLocalInputValue(new Date(2027, 0, 5, 9, 5))).toBe("2027-01-05T09:05");
    });
  });

  describe("defaultScheduleValue", () => {
    it("suggests a slot roughly an hour out", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2027-01-05T09:07:00Z"));
      const parsed = parseLocalInput(defaultScheduleValue());
      expect(parsed).not.toBeNull();
      expect(isQuarterHourUtc(parsed!)).toBe(true);
      expect(parsed!.getTime()).toBeGreaterThan(Date.now() + 55 * 60_000);
    });
  });
});
