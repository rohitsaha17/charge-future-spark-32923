import { describe, it, expect } from "vitest";
import {
  isEditable,
  canSend,
  canSchedule,
  canUnschedule,
  canCancel,
  canDelete,
  isLocked,
  isSettling,
  hasReport,
  statusLabel,
} from "./campaignStatus";
import type { CampaignStatus } from "./api";

const ALL: CampaignStatus[] = [
  "save",
  "paused",
  "schedule",
  "sending",
  "sent",
  "canceled",
  "canceling",
];

/**
 * A full predicate-by-status matrix. It reads as repetitive, but the point is
 * that every cell is stated explicitly — an accidental `||` that let `sent`
 * back into `canSend` would otherwise be invisible.
 */
const expected: Record<CampaignStatus, CampaignStatus[]> = {} as never;

describe("campaignStatus", () => {
  const only = (...statuses: CampaignStatus[]) => (s: CampaignStatus) => statuses.includes(s);

  const cases: [string, (s: CampaignStatus) => boolean, (s: CampaignStatus) => boolean][] = [
    ["isEditable", isEditable, only("save")],
    ["canSend", canSend, only("save")],
    ["canSchedule", canSchedule, only("save")],
    ["canUnschedule", canUnschedule, only("schedule")],
    ["canCancel", canCancel, only("sending")],
    ["canDelete", canDelete, only("save", "sent", "canceled")],
    ["isLocked", isLocked, only("sending", "sent", "canceling")],
    ["isSettling", isSettling, only("sending", "canceling")],
    ["hasReport", hasReport, only("sent")],
  ];

  for (const [name, predicate, truthFor] of cases) {
    describe(name, () => {
      for (const status of ALL) {
        const want = truthFor(status);
        it(`${want ? "allows" : "refuses"} "${status}"`, () => {
          expect(predicate(status)).toBe(want);
        });
      }
    });
  }

  describe("guarantees that matter most", () => {
    it("never allows sending a campaign that already went out", () => {
      expect(canSend("sent")).toBe(false);
      expect(canSend("sending")).toBe(false);
      expect(canSchedule("sent")).toBe(false);
      expect(canSchedule("sending")).toBe(false);
    });

    it("never treats an in-flight or finished send as editable", () => {
      expect(isEditable("sending")).toBe(false);
      expect(isEditable("sent")).toBe(false);
    });

    it("never offers to delete a campaign that is mid-send", () => {
      expect(canDelete("sending")).toBe(false);
      expect(canDelete("canceling")).toBe(false);
      expect(canDelete("schedule")).toBe(false);
    });
  });

  describe("statusLabel", () => {
    it("gives every status a human label", () => {
      for (const status of ALL) {
        expect(statusLabel(status)).toBeTruthy();
        expect(statusLabel(status)).not.toBe(status === "save" ? "save" : "");
      }
    });

    it("calls Mailchimp's 'save' a draft", () => {
      expect(statusLabel("save")).toBe("Draft");
    });

    it("falls back to the raw value for an unknown status", () => {
      expect(statusLabel("something-new" as CampaignStatus)).toBe("something-new");
    });
  });
});
