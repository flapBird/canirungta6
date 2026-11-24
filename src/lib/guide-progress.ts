import { allMissionIds } from "@/lib/guide-data";

const storagePrefix = "vi-ready-guide-progress-v1:";

export function parseProgress(value: unknown, allowedIds: ReadonlySet<string> = allMissionIds): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && allowedIds.has(id)))];
}

export function progressStorageKey(page: string): string {
  return `${storagePrefix}${page}`;
}

export function readProgress(storage: Pick<Storage, "getItem">, page: string, allowedIds: ReadonlySet<string> = allMissionIds): string[] {
  try {
    const raw = storage.getItem(progressStorageKey(page));
    return raw ? parseProgress(JSON.parse(raw), allowedIds) : [];
  } catch {
    return [];
  }
}

export function writeProgress(storage: Pick<Storage, "setItem">, page: string, ids: string[], allowedIds: ReadonlySet<string> = allMissionIds): boolean {
  try {
    storage.setItem(progressStorageKey(page), JSON.stringify(parseProgress(ids, allowedIds)));
    return true;
  } catch {
    return false;
  }
}

export function progressPercent(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
