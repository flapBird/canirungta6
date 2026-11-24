import { SourceList } from "@/components/SourceList";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function StatusPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.status;
  const events = [
    ["2026-11-25", t.latestNews, "rockstar-gta6-platforms"],
    ["2026-11-19", t.releaseBody, "rockstar-gta6-out-now"],
    ["2023-12-04", t.initialNews, "initial-platforms"],
  ];
  return (
    <article className="container-shell pt-10 sm:pt-14">
      <h1 className="gradient-text max-w-4xl text-3xl font-black sm:text-5xl">{dictionary.seo.status.title}</h1>
      <p className="mt-4 text-lg text-muted">{t.pcTitle} · {t.pcValue}</p>
      <ol className="panel mt-8 space-y-6 p-6">{events.map(([date, body]) => (
        <li className="border-s-2 border-secondary/50 ps-4" key={date}><time dateTime={date} className="font-bold text-secondary">{date}</time><p className="mt-2">{body}</p></li>
      ))}</ol>
      <div className="my-6 flex flex-wrap gap-3">
        <a href={localePath("requirements", locale)} className="btn-secondary">{dictionary.seo.requirements.title}</a>
        <a href={localePath("port", locale)} className="btn-secondary">{dictionary.seo.port.title}</a>
      </div>
      <SourceList ids={events.map(([, , source]) => source)} dictionary={dictionary} title={dictionary.common.sources} />
    </article>
  );
}
