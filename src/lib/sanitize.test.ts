import { describe, it, expect } from "vitest";
import { sanitizeBlogHtml } from "./sanitize";

describe("sanitizeBlogHtml", () => {
  it("strips <script> tags entirely", () => {
    const input = `<p>Hello</p><script>alert('xss')</script><p>World</p>`;
    const out = sanitizeBlogHtml(input);
    expect(out).not.toContain("script");
    expect(out).toContain("Hello");
    expect(out).toContain("World");
  });

  it("removes inline event handlers", () => {
    const input = `<img src="/x.png" onerror="alert(1)" alt="x" />`;
    const out = sanitizeBlogHtml(input);
    expect(out).not.toMatch(/onerror/i);
    expect(out).toContain("<img");
    expect(out).toContain("/x.png");
  });

  it("blocks javascript: URLs on anchors", () => {
    const out = sanitizeBlogHtml(`<a href="javascript:alert(1)">click</a>`);
    expect(out).not.toMatch(/javascript:/i);
  });

  it("preserves safe formatting tags", () => {
    const out = sanitizeBlogHtml(
      `<p><strong>bold</strong> and <em>italic</em> and <a href="https://example.com">link</a></p>`
    );
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("example.com");
  });

  it("blocks <iframe> embeds", () => {
    const out = sanitizeBlogHtml(
      `<iframe src="https://evil.example.com"></iframe><p>ok</p>`
    );
    expect(out).not.toMatch(/<iframe/i);
    expect(out).toContain("ok");
  });

  it("returns empty string on falsy input without throwing", () => {
    expect(sanitizeBlogHtml("")).toBe("");
    // @ts-expect-error — runtime safety check
    expect(sanitizeBlogHtml(null)).toBe("");
    // @ts-expect-error — runtime safety check
    expect(sanitizeBlogHtml(undefined)).toBe("");
  });
});
