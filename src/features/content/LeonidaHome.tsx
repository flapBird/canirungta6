import { Faq } from "@/components/Faq";
import { SourceList } from "@/components/SourceList";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";
import { CheckerTool } from "@/features/checker/CheckerTool";
import { ProjectStatus } from "@/features/leonida/ProjectStatus";

export function LeonidaHome({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.leonida;
  const timeline = [
    [t.timeline1Date, t.timeline1Title, t.timeline1Body],
    [t.timeline2Date, t.timeline2Title, t.timeline2Body],
    [t.timeline3Date, t.timeline3Title, t.timeline3Body],
  ];
  return (
    <>
      <section className="container-shell pt-10 text-center sm:pt-14">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1 className="gradient-text mx-auto mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">{t.h1}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-muted sm:text-lg">{t.intro}</p>
        <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-danger/50 bg-danger/5 p-5 text-start">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-black text-danger sm:text-2xl">{t.statusTitle}</h2>
            <span className="text-xs text-muted"><bdi dir="ltr">2026-11-24</bdi></span>
          </div>
          <p className="mt-2 text-sm text-muted">{t.statusBody}</p>
        </div>
        <div className="mx-auto mt-4 max-w-4xl"><ProjectStatus dictionary={dictionary} /></div>
      </section>

      <div className="container-shell">
        <CheckerTool locale={locale} dictionary={dictionary} game="leonida" />

        <div className="prose-site mt-12 grid gap-6 lg:grid-cols-2">
          <section className="panel p-6"><h2>{t.whatTitle}</h2><p className="mt-3">{t.whatBody}</p></section>
          <section className="panel p-6"><h2>{t.technicalTitle}</h2><p className="mt-3">{t.technicalBody}</p></section>
        </div>

        <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="historical-requirements-title">
          <p className="eyebrow">{dictionary.common.historical}</p>
          <h2 id="historical-requirements-title" className="mt-1 text-2xl font-extrabold">{t.historicalTitle}</h2>
          <p className="mt-3 max-w-4xl text-muted">{t.historicalBody}</p>
          <div className="table-scroll mt-5"><table>
            <thead><tr><th scope="col">{t.tableComponent}</th><th scope="col">{t.tableLow}</th><th scope="col">{t.tableHigh}</th></tr></thead>
            <tbody>
              <tr><th scope="row">{dictionary.common.cpu}</th><td dir="ltr">{t.cpuLow}</td><td dir="ltr">{t.cpuHigh}</td></tr>
              <tr><th scope="row">{dictionary.common.gpu}</th><td dir="ltr">{t.gpuLow}</td><td dir="ltr">{t.gpuHigh}</td></tr>
              <tr><th scope="row">{dictionary.common.ram}</th><td>{t.ramLow}</td><td>{t.ramHigh}</td></tr>
            </tbody>
          </table></div>
        </section>

        <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="text-2xl font-extrabold">{t.timelineTitle}</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {timeline.map(([date, title, body]) => (
              <li key={date} className="relative border-s-2 border-secondary/50 ps-4">
                <span className="text-xs font-bold text-secondary"><bdi dir="ltr">{date}</bdi></span>
                <h3 className="mt-1 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
          <section className="panel p-6"><h2>{t.compareTitle}</h2><p className="mt-3">{t.compareBody}</p><a className="mt-4 inline-flex min-h-11 items-center" href={localePath("status", locale)}>{dictionary.nav.status} →</a></section>
          <section className="panel p-6"><h2>{t.safetyTitle}</h2><p className="mt-3">{t.safetyBody}</p></section>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <SourceList ids={["leonida-project-site", "leonida-upstream-repository", "leonida-status-snapshot", "leonida-historical-reference"]} dictionary={dictionary} title={dictionary.common.sources} />
          <Faq dictionary={dictionary} title={dictionary.checker.faqTitle} />
        </div>
      </div>
    </>
  );
}
