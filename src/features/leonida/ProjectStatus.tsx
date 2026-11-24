import type { Dictionary } from "@/lib/types";

export function ProjectStatus({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.leonida;
  const cards = [
    { label: t.repository, value: t.repositoryValue, tone: "text-warning" },
    { label: t.gameplay, value: t.gameplayValue, tone: "text-warning" },
    { label: t.officialPc, value: t.officialPcValue, tone: "text-warning" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{card.label}</p>
          <p className={`mt-1 font-extrabold ${card.tone}`}><span className="status-dot me-2" aria-hidden="true" />{card.value}</p>
        </div>
      ))}
    </div>
  );
}
