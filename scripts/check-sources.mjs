import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadDataset } from "./validate-data.mjs";

const MAX_HASH_BYTES = 1024 * 1024;

async function contentHash(response) {
  if (!response.ok || !response.body) return null;
  const type = response.headers.get("content-type") ?? "";
  if (!/text\/|json|xml/i.test(type)) return null;
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (size < MAX_HASH_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.byteLength;
    }
  } finally {
    if (size >= MAX_HASH_BYTES) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return createHash("sha256").update(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))).digest("hex");
}

async function checkOne(source, fetchImpl, previous) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetchImpl(source.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "VI-Ready-Source-Check/1.0" },
    });
    const accessible = response.ok;
    const hash = await contentHash(response);
    const finalUrl = response.url || source.url;
    const changes = [];
    if (previous) {
      if (previous.accessible !== accessible) changes.push(accessible ? "became-accessible" : "became-inaccessible");
      if (previous.finalUrl && previous.finalUrl !== finalUrl) changes.push("redirected");
      if (hash && previous.contentHash && hash !== previous.contentHash) changes.push("content-changed");
    }
    return {
      id: source.id,
      url: source.url,
      publisher: source.publisher,
      recordedAccessible: source.accessible,
      recordedCheckedAt: source.checkedAt,
      checkedAt,
      accessible,
      statusCode: response.status,
      finalUrl,
      contentHash: hash,
      changes,
      error: null,
    };
  } catch (error) {
    return {
      id: source.id,
      url: source.url,
      publisher: source.publisher,
      recordedAccessible: source.accessible,
      recordedCheckedAt: source.checkedAt,
      checkedAt,
      accessible: false,
      statusCode: null,
      finalUrl: null,
      contentHash: null,
      changes: previous?.accessible ? ["check-failed"] : [],
      error: error instanceof Error ? error.message : "Unknown network error",
    };
  }
}

export async function checkSources(sources, fetchImpl = fetch, previousReport = null) {
  const previous = new Map((previousReport?.results ?? []).map((result) => [result.id, result]));
  const results = new Array(sources.length);
  let cursor = 0;
  async function worker() {
    while (cursor < sources.length) {
      const index = cursor++;
      results[index] = await checkOne(sources[index], fetchImpl, previous.get(sources[index].id));
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, sources.length) }, () => worker()));
  return {
    checkedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      accessible: results.filter((result) => result.accessible).length,
      changed: results.filter((result) => result.changes.length > 0).length,
    },
    results,
  };
}

async function main() {
  const { sources } = loadDataset();
  const writeIndex = process.argv.indexOf("--write-report");
  const reportPath = writeIndex >= 0 ? process.argv[writeIndex + 1] : null;
  let previous = null;
  if (reportPath) {
    try {
      previous = JSON.parse(await readFile(resolve(reportPath), "utf8"));
    } catch {
      previous = null;
    }
  }
  const report = await checkSources(sources, fetch, previous);
  if (reportPath) {
    const destination = resolve(reportPath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(`Source check: ${report.summary.accessible}/${report.summary.total} accessible; ${report.summary.changed} changes or failed checks.`);
  for (const result of report.results.filter((item) => item.changes.length > 0)) {
    console.log(`- ${result.id}: ${result.changes.join(", ")}${result.error ? ` (${result.error})` : ""}`);
  }
  console.log("No source files were modified. Review evidence manually before updating checkedAt, accessible, or stale flags.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
