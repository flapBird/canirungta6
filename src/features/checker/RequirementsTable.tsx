import { cpus, gpus } from "@/lib/data";
import type { Dictionary, RequirementProfile, UserSpecs } from "@/lib/types";

export function RequirementsTable({ dictionary, profile, specs }: { dictionary: Dictionary; profile: RequirementProfile; specs: UserSpecs }) {
  const t = dictionary.checker;
  const c = dictionary.common;
  const rows = [
    { key: "cpu", reference: profile.referenceCpuIds.map((id) => cpus.find((cpu) => cpu.id === id)?.name).filter(Boolean).join(" / ") || c.unknown },
    { key: "gpu", reference: profile.referenceGpuIds.map((id) => gpus.find((gpu) => gpu.id === id)?.name).filter(Boolean).join(" / ") || c.unknown },
    { key: "ram", reference: profile.ramGB === null ? c.unknown : `${profile.ramGB} GB` },
    { key: "vram", reference: profile.vramGB === null ? c.unknown : `${profile.vramGB} GB` },
    { key: "os", reference: profile.requiredOs.length ? profile.requiredOs.map((os) => t[os]).join(" / ") : c.unknown },
    { key: "storage", reference: profile.storageReferenceGB === null ? c.unknown : `${profile.storageReferenceGB} GB` },
  ];
  const userValue = (key: string) => {
    if (key === "cpu") return cpus.find((cpu) => cpu.id === specs.cpuId)?.name ?? c.unknown;
    if (key === "gpu") return gpus.find((gpu) => gpu.id === specs.gpuId)?.name ?? c.unknown;
    if (key === "ram") return specs.ramGB === null ? c.unknown : `${specs.ramGB} GB`;
    if (key === "vram") {
      const gpu = gpus.find((item) => item.id === specs.gpuId);
      const value = specs.vramOverrideGB ?? gpu?.vramGB;
      return value == null || gpu?.memoryType === "shared" ? c.unknown : `${value} GB`;
    }
    if (key === "os") return t[specs.os] ?? c.unknown;
    return specs.freeDiskGB === null ? c.unknown : `${specs.freeDiskGB} GB`;
  };

  return (
    <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="reference-table-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{profile.evidenceKind === "historical-community" ? c.historical : c.forecast}</p>
          <h2 id="reference-table-title" className="mt-1 text-2xl font-extrabold tracking-tight">{t.referenceTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">{t.referenceBody}</p>
        </div>
        {profile.stale && <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-bold text-warning">{c.stale}</span>}
      </div>
      <div className="table-scroll mt-5">
        <table>
          <caption className="sr-only">{t.referenceTitle}</caption>
          <thead><tr><th scope="col">{dictionary.requirements.component}</th><th scope="col">{t.referenceForecast}</th><th scope="col">{t.referenceUser}</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{c[row.key]}</th>
                <td dir="auto">{row.reference}</td>
                <td dir="auto">{userValue(row.key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted"><bdi dir="ltr">{profile.version}</bdi> · <bdi dir="ltr">{profile.reviewedAt}</bdi></p>
    </section>
  );
}
