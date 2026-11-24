import { Faq } from "@/components/Faq";
import { SourceList } from "@/components/SourceList";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function RequirementsPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.requirements;
  const rows = [
    [dictionary.common.cpu, t.cpuValue, t.cpuValue],
    [dictionary.common.gpu, t.gpuValue, t.gpuValue],
    [dictionary.common.ram, t.ramValue, t.ramValue],
    [dictionary.common.vram, t.vramValue, t.vramValue],
    [dictionary.common.storage, t.storageValue, t.storageValue],
    [dictionary.common.os, t.osValue, t.osValue],
  ];
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <header className="max-w-4xl">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1 className="gradient-text mt-3 text-3xl font-black tracking-tight sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 text-lg text-muted">{t.intro}</p>
      </header>

      <section className="panel mt-8 border-warning/40 p-5 sm:p-7" aria-labelledby="requirements-answer-title">
        <h2 id="requirements-answer-title" className="text-2xl font-extrabold text-warning">{t.answerTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.answer}</p>
      </section>

      <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="requirements-table-title">
        <h2 id="requirements-table-title" className="text-2xl font-extrabold">{t.officialTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-black/10 p-4"><h3 className="font-extrabold text-secondary">{t.officialTitle}</h3><p className="mt-2 text-sm text-muted">{t.officialBody}</p></div>
          <div className="rounded-xl border border-border bg-black/10 p-4"><h3 className="font-extrabold text-accent">{t.forecastTitle}</h3><p className="mt-2 text-sm text-muted">{t.forecastBody}</p></div>
        </div>
        <div className="table-scroll mt-5"><table>
          <thead><tr><th scope="col">{t.component}</th><th scope="col">{t.officialValue}</th><th scope="col">{t.forecastValue}</th></tr></thead>
          <tbody>{rows.map(([component, official, forecast]) => <tr key={component}><th scope="row">{component}</th><td>{official}</td><td>{forecast}</td></tr>)}</tbody>
        </table></div>
        <a href={localePath("home", locale)} className="btn-primary mt-5">{dictionary.common.backToChecker}</a>
      </section>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><h2>{t.resolutionTitle}</h2><p className="mt-3">{t.resolutionBody}</p></section>
        <section className="panel p-6"><h2>{t.laptopTitle}</h2><p className="mt-3">{t.laptopBody}</p></section>
      </div>

      <section className="panel mt-6 p-5 sm:p-7"><h2 className="text-2xl font-extrabold">{t.evidenceTitle}</h2><p className="mt-3 max-w-4xl text-muted">{t.evidenceBody}</p></section>
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
        <SourceList ids={["rockstar-gta6-out-now", "rockstar-gta6-platforms"]} dictionary={dictionary} title={dictionary.common.sources} />
        <Faq dictionary={dictionary} title={t.faqTitle} />
      </div>
    </div>
  );
}
