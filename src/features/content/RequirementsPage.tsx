import { SourceList } from "@/components/SourceList";
import { gpus } from "@/lib/data";
import profile from "@/data/profiles/gta6.json";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function RequirementsPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.requirements;
  const rows = [
    [dictionary.common.cpu, t.cpuEstimate],
    [dictionary.common.gpu, dictionary.checker.consoleAnchor],
    [dictionary.common.ram, t.ramEstimate],
    [dictionary.common.storage, t.storageEstimate],
  ];
  return (
    <article className="container-shell pt-10 sm:pt-14">
      <h1 className="gradient-text max-w-4xl text-3xl font-black sm:text-5xl">{dictionary.seo.requirements.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{t.intro}</p>
      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-extrabold">{t.forecastTitle}</h2>
        <p className="mt-3">{t.forecastBody}</p>
        <div className="table-scroll mt-5"><table>
          <thead><tr><th scope="col">{t.component}</th><th scope="col">{t.officialValue}</th><th scope="col">{t.forecastValue}</th></tr></thead>
          <tbody>{rows.map(([component, forecast]) => <tr key={component}><th scope="row">{component}</th><td>{dictionary.status.configValue}</td><td>{forecast}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="panel mt-6 p-6">
        <h2 className="text-2xl font-extrabold">{t.bandsTitle}</h2><p className="mt-3">{t.bandsBody}</p>
        <dl className="mt-5 space-y-4">{Object.entries(profile.consoleGpuBands).map(([band, ids]) => (
          <div key={band}><dt className="font-bold text-secondary">{dictionary.checker[band]}</dt><dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {ids.map((id) => <a key={id} className="underline" href={`${localePath("home", locale)}?gpu=${id}&device=desktop`}><bdi>{gpus.find((gpu) => gpu.id === id)?.name}</bdi></a>)}
          </dd></div>
        ))}</dl>
        <p className="mt-4 text-sm text-muted">{t.laptopBody}</p>
        <a href={localePath("home", locale)} className="btn-primary mt-4">{dictionary.common.backToChecker}</a>
      </section>
      <div className="mt-6"><SourceList ids={profile.sourceIds} dictionary={dictionary} title={dictionary.common.sources} /></div>
    </article>
  );
}
