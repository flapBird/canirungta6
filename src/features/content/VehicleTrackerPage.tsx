import { SourceList } from "@/components/SourceList";
import { pageSourceIds } from "@/lib/guide-data";
import type { Dictionary } from "@/lib/types";

export function VehicleTrackerPage({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.guides;
  const sections = [
    [t.advancedHeading, t.advancedBody],
    [t.standardHeading, t.standardBody],
    [t.registerHeading, t.registerBody],
    [t.immobilizerHeading, t.immobilizerBody],
  ];

  return (
    <article className="container-shell space-y-6 pt-10 sm:pt-14">
      <header className="max-w-4xl">
        <h1 className="gradient-text text-3xl font-black tracking-tight sm:text-5xl">{dictionary.seo.vehicleTracker.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.trackerIntro}</p>
      </header>
      <section className="panel p-5 sm:p-7">
        <h2 id="tracker-comparison" className="text-2xl font-extrabold">{t.trackerComparison}</h2>
        <div className="table-scroll mt-4">
          <table aria-labelledby="tracker-comparison">
            <thead><tr><th scope="col">{t.trackerType}</th><th scope="col">{t.trackerEffect}</th><th scope="col">{t.trackerUnlock}</th></tr></thead>
            <tbody>
              <tr><th scope="row">{t.trackerStandard}</th><td>{t.standardEffect}</td><td>{t.standardUnlock}</td></tr>
              <tr><th scope="row">{t.trackerAdvanced}</th><td>{t.advancedEffect}</td><td>{t.advancedUnlock}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      {sections.map(([heading, body]) => (
        <section key={heading} className="prose-site panel p-5 sm:p-7">
          <h2>{heading}</h2>
          <p className="mt-3 max-w-3xl">{body}</p>
        </section>
      ))}
      <SourceList ids={pageSourceIds("vehicleTracker")} dictionary={dictionary} title={dictionary.common.sources} />
    </article>
  );
}
