import { describe, expect, it } from "vitest";
import { checkSources, type SourceCheckReport } from "../../scripts/check-sources.mjs";

const source = { id: "example", url: "https://example.com/", accessible: true };

function previous(overrides: Partial<SourceCheckReport["results"][number]> = {}): SourceCheckReport {
  return {
    summary: { total: 1, accessible: 1, changed: 0 },
    results: [{
      id: source.id,
      url: source.url,
      accessible: true,
      finalUrl: source.url,
      contentHash: "old-hash",
      changes: [],
      ...overrides,
    }],
  };
}

describe("source maintenance check", () => {
  it("reports accessibility changes without modifying source records", async () => {
    const report = await checkSources([source], async () => new Response("Unavailable", { status: 404 }), previous());
    expect(report.results[0].accessible).toBe(false);
    expect(report.results[0].changes).toContain("became-inaccessible");
    expect(source.accessible).toBe(true);
  });

  it("detects changed text content", async () => {
    const report = await checkSources([source], async () => new Response("New content", { headers: { "content-type": "text/html" } }), previous());
    expect(report.results[0].changes).toContain("content-changed");
    expect(report.results[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("reports redirects and network failures as review items", async () => {
    const redirectedResponse = new Response(null, { status: 200 });
    Object.defineProperty(redirectedResponse, "url", { value: "https://example.com/new" });
    const redirect = await checkSources([source], async () => redirectedResponse, previous());
    expect(redirect.results[0].changes).toContain("redirected");

    const failed = await checkSources([source], async () => { throw new Error("offline"); }, previous());
    expect(failed.results[0].changes).toContain("check-failed");
    expect(failed.summary.accessible).toBe(0);
  });

  it("does not treat an inaccessible page as a content change", async () => {
    const report = await checkSources([source], async () => new Response("Forbidden", { status: 403 }), previous());
    expect(report.results[0].contentHash).toBeNull();
    expect(report.results[0].changes).not.toContain("content-changed");
  });
});
