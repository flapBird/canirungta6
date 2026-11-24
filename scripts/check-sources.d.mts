export interface SourceCheckResult {
  id: string;
  url: string;
  accessible: boolean;
  finalUrl: string | null;
  contentHash: string | null;
  changes: string[];
}

export interface SourceCheckReport {
  summary: { total: number; accessible: number; changed: number };
  results: SourceCheckResult[];
}

export function checkSources(
  sources: Array<{ id: string; url: string; accessible: boolean }>,
  fetchImpl?: typeof fetch,
  previousReport?: SourceCheckReport | null,
): Promise<SourceCheckReport>;
