import { sources } from "@/lib/data";
import type { Dictionary } from "@/lib/types";

interface SourceListProps {
  ids: string[];
  dictionary: Dictionary;
  title: string;
}

export function SourceList({ ids, dictionary, title }: SourceListProps) {
  const entries = ids.map((id) => sources.find((source) => source.id === id)).filter((source) => source !== undefined);
  if (entries.length === 0) return null;
  return (
    <section className="panel p-5" aria-labelledby="source-list-title">
      <h2 id="source-list-title" className="text-lg font-extrabold">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {entries.map((source) => (
          <li key={source.id} className="rounded-xl border border-border bg-black/10 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-1 font-bold text-secondary">
                {source.kind === "official" ? dictionary.common.official : source.kind === "community" ? dictionary.common.community : source.kind === "upstream" ? dictionary.common.upstream : dictionary.common.secondary}
              </span>
              {source.stale && <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-1 font-bold text-warning">{dictionary.common.staleShort}</span>}
              {!source.accessible && <span className="rounded-full border border-danger/40 bg-danger/10 px-2 py-1 font-bold text-danger">{dictionary.common.unavailable}</span>}
              <span className="text-muted"><bdi dir="ltr">{source.checkedAt}</bdi></span>
            </div>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-bold text-accent hover:underline">
              {source.title} <span className="flip-in-rtl" aria-hidden="true">↗</span>
            </a>
            <p className="mt-1 text-sm text-muted">{source.publisher}{source.notes ? ` — ${source.notes}` : ""}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
