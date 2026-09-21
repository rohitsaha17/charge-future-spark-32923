import { describe, it, expect, beforeEach } from "vitest";
import {
  contentHash,
  matchesSubjectConfirmation,
  sendPreconditions,
  readTestSend,
  writeTestSend,
  clearTestSend,
  type TestSendRecord,
} from "./campaignGuards";
import type { Campaign } from "./api";

const campaign = (
  overrides: Partial<Campaign> = {}
): Pick<Campaign, "subject_line" | "from_name" | "reply_to" | "recipient_count" | "status"> => ({
  subject_line: "September update",
  from_name: "A Plus Charge",
  reply_to: "hello@apluscharge.in",
  recipient_count: 3412,
  status: "save",
  ...overrides,
});

const HTML = "<p>Hello there</p>";

const passingTest = (html = HTML, subject = "September update"): TestSendRecord => ({
  at: Date.now(),
  hash: contentHash(html, subject),
  emails: ["me@example.com"],
});

describe("campaignGuards", () => {
  describe("matchesSubjectConfirmation", () => {
    it("accepts the exact subject line", () => {
      expect(matchesSubjectConfirmation("September update", "September update")).toBe(true);
    });

    it("forgives surrounding whitespace, as the API does", () => {
      expect(matchesSubjectConfirmation("  September update  ", "September update")).toBe(true);
    });

    it("rejects a different case, because the API compares exactly", () => {
      // Accepting this client-side would enable the button for a value the
      // server then refuses, which reads as a bug rather than a guard.
      expect(matchesSubjectConfirmation("september update", "September update")).toBe(false);
    });

    it("rejects near misses and empty input", () => {
      expect(matchesSubjectConfirmation("September updat", "September update")).toBe(false);
      expect(matchesSubjectConfirmation("September updates", "September update")).toBe(false);
      expect(matchesSubjectConfirmation("", "September update")).toBe(false);
    });

    it("never passes when the campaign has no subject line", () => {
      expect(matchesSubjectConfirmation("", null)).toBe(false);
      expect(matchesSubjectConfirmation("   ", "   ")).toBe(false);
    });
  });

  describe("contentHash", () => {
    it("is stable for identical input", () => {
      expect(contentHash(HTML, "a")).toBe(contentHash(HTML, "a"));
    });

    it("changes when the body changes", () => {
      expect(contentHash(HTML, "a")).not.toBe(contentHash("<p>Different</p>", "a"));
    });

    it("changes when only the subject changes", () => {
      expect(contentHash(HTML, "a")).not.toBe(contentHash(HTML, "b"));
    });

    it("does not confuse a subject/body boundary shift", () => {
      // Without a separator, ("ab", "c") and ("a", "bc") would collide.
      expect(contentHash("bc", "a")).not.toBe(contentHash("c", "ab"));
    });
  });

  describe("sendPreconditions", () => {
    it("passes when everything is in order", () => {
      const result = sendPreconditions({
        campaign: campaign(),
        html: HTML,
        dirty: false,
        lastTest: passingTest(),
      });
      expect(result).toEqual({ ok: true, reasons: [] });
    });

    it("requires a subject line", () => {
      const result = sendPreconditions({
        campaign: campaign({ subject_line: "  " }),
        html: HTML,
        dirty: false,
        lastTest: passingTest(HTML, "  "),
      });
      expect(result.ok).toBe(false);
      expect(result.reasons).toContain("Add a subject line.");
    });

    it("requires a sender name", () => {
      const result = sendPreconditions({
        campaign: campaign({ from_name: null }),
        html: HTML,
        dirty: false,
        lastTest: passingTest(),
      });
      expect(result.reasons).toContain("Set a sender name.");
    });

    it("requires a valid reply-to", () => {
      for (const replyTo of [null, "", "not-an-email"]) {
        const result = sendPreconditions({
          campaign: campaign({ reply_to: replyTo }),
          html: HTML,
          dirty: false,
          lastTest: passingTest(),
        });
        expect(result.reasons).toContain("Set a valid reply-to address.");
      }
    });

    it("requires content", () => {
      const result = sendPreconditions({
        campaign: campaign(),
        html: "   ",
        dirty: false,
        lastTest: passingTest("   "),
      });
      expect(result.reasons).toContain("Write some content.");
    });

    it("blocks while there are unsaved changes", () => {
      // The API sends the saved version, so sending now would mail the
      // previous draft rather than what is on screen.
      const result = sendPreconditions({
        campaign: campaign(),
        html: HTML,
        dirty: true,
        lastTest: passingTest(),
      });
      expect(result.reasons).toContain("Save your changes first.");
    });

    it("blocks an empty audience", () => {
      const result = sendPreconditions({
        campaign: campaign({ recipient_count: 0 }),
        html: HTML,
        dirty: false,
        lastTest: passingTest(),
      });
      expect(result.reasons).toContain("This audience has no contacts to send to.");
    });

    it("requires a test send before the first send", () => {
      const result = sendPreconditions({
        campaign: campaign(),
        html: HTML,
        dirty: false,
        lastTest: null,
      });
      expect(result.reasons).toContain("Send yourself a test email first.");
    });

    it("invalidates the test gate when the body changes afterwards", () => {
      const result = sendPreconditions({
        campaign: campaign(),
        html: "<p>Rewritten after the test</p>",
        dirty: false,
        lastTest: passingTest(),
      });
      expect(result.ok).toBe(false);
      expect(result.reasons).toContain(
        "Content changed since the last test — send another test first."
      );
    });

    it("invalidates the test gate when only the subject changes", () => {
      const result = sendPreconditions({
        campaign: campaign({ subject_line: "October update" }),
        html: HTML,
        dirty: false,
        lastTest: passingTest(),
      });
      expect(result.ok).toBe(false);
    });

    it("lists every unmet reason at once", () => {
      const result = sendPreconditions({
        campaign: campaign({ subject_line: null, from_name: null, recipient_count: 0 }),
        html: "",
        dirty: true,
        lastTest: null,
      });
      expect(result.reasons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("test-send memory", () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it("round-trips a record", () => {
      const record = passingTest();
      writeTestSend("abc123", record);
      expect(readTestSend("abc123")).toEqual(record);
    });

    it("keeps campaigns separate", () => {
      writeTestSend("abc123", passingTest());
      expect(readTestSend("def456")).toBeNull();
    });

    it("returns null for an unknown campaign", () => {
      expect(readTestSend("nothing-here")).toBeNull();
    });

    it("treats corrupt storage as no test recorded", () => {
      // The safe direction: the gate stays closed rather than opening on junk.
      sessionStorage.setItem("campaign_test:abc123", "{not json");
      expect(readTestSend("abc123")).toBeNull();

      sessionStorage.setItem("campaign_test:abc123", JSON.stringify({ nope: true }));
      expect(readTestSend("abc123")).toBeNull();
    });

    it("clears a record", () => {
      writeTestSend("abc123", passingTest());
      clearTestSend("abc123");
      expect(readTestSend("abc123")).toBeNull();
    });
  });
});
