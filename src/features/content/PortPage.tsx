import { SourceList } from "@/components/SourceList";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function PortPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.port;
  const projects = [
    ["Leonida", t.leonidaStage, t.leonidaPlay, t.leonidaHw],
    ["VIctory", t.victoryStage, t.victoryPlay, t.victoryHw],
    ["XCL", t.xclStage, t.xclPlay, t.xclHw],
  ];
  return (
    <article className="container-shell pt-10 sm:pt-14">
      <h1 className="gradient-text max-w-4xl text-3xl font-black sm:text-5xl">{dictionary.seo.port.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{t.intro}</p>
      <p className="mt-2 text-sm text-muted">{dictionary.common.updated} · <time dateTime="2026-11-25">2026-11-25</time></p>
      <div className="panel table-scroll mt-8 p-5">
        <table>
          <thead><tr>{[t.project, t.milestone, t.play, t.hardware].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{projects.map(([name, stage, playable, hardware]) => (
            <tr key={name}><th scope="row">{name}</th><td>{stage}</td><td>{playable}</td><td>{hardware}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <section className="panel mt-6 p-6">
        <h2 className="text-2xl font-extrabold">{t.timeline}</h2>
        <ol className="mt-5 space-y-4">{[["2026-11-24", t.crash], ["2026-11-23", t.compile], ["2026-11-22", t.copies]].map(([date, event]) => (
          <li key={date}><time className="text-sm font-bold text-secondary" dateTime={date}>{date}</time><p>{event}</p></li>
        ))}</ol>
      </section>
      <section className="panel mt-6 p-6">
        <h2 className="text-2xl font-extrabold">{t.compareHeading}</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt><a className="font-bold text-accent underline" href="https://portwatch.online/">PortWatch VI</a></dt>
            <dd className="mt-1 max-w-3xl text-muted">{t.comparePortWatch}</dd>
          </div>
          <div>
            <dt><a className="font-bold text-accent underline" href="https://gta6port.app/">gta6port.app</a></dt>
            <dd className="mt-1 max-w-3xl text-muted">{t.compareGta6Port}</dd>
          </div>
          <div>
            <dt className="font-bold">VI Ready</dt>
            <dd className="mt-1 max-w-3xl text-muted">{t.compareHere}</dd>
          </div>
        </dl>
      </section>
      <div className="my-6 flex flex-wrap gap-3">
        <a className="btn-secondary" href={localePath("leonida", locale)}>{dictionary.leonida.h1}</a>
        <a className="btn-secondary" href={localePath("status", locale)}>{dictionary.seo.status.title}</a>
      </div>
      <SourceList ids={["victory-readme", "xcl-world", "tracker-copies", "leonida-upstream-repository", "leonida-historical-reference"]} dictionary={dictionary} title={dictionary.common.sources} />
    </article>
  );
}
