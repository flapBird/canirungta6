import type { Dictionary } from "@/lib/types";

const history = [
  { ps5: "01.002.002", xbox: "1.0.2.2", date: "2026-11-23", fixes: ["launchFix1", "launchFix2", "launchFix3", "launchFix4", "launchFix5", "launchFix6", "launchFix7"], issues: "patchOpen", source: "https://support.rockstargames.com/articles/sN5pEdFYZdlvijKXd6xpJ/grand-theft-auto-vi-launch-updates-ps5-xbox-series-x-or-s", publisher: "Rockstar Support" },
  ...[["01.002.001", "2026-11-16"], ["01.002.000", "2026-11-13"]].map(([ps5, date]) => ({
    ps5, xbox: null, date, fixes: ["preFix"], issues: "preIssues", source: "https://gta.exputer.com/gta-6/gameplay/updates-and-patches/", publisher: "eXputer",
  })),
];

export function PatchNotes({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.guides;
  return <article className="container-shell py-10">
    <h1 className="gradient-text text-3xl font-black sm:text-5xl">{t.patchCrumb}</h1>
    <p className="mt-4 max-w-3xl text-muted">{dictionary.seo.patch.description}</p>
    <nav aria-label={t.patchCrumb} className="my-6 flex flex-wrap gap-3">{history.map((p) => <a className="btn-secondary" key={p.ps5} href={'#version-' + p.ps5}>{p.ps5}</a>)}</nav>
    {history.map((p) => <section className="panel mt-5 p-6" id={'version-' + p.ps5} key={p.ps5}>
      <time className="text-sm text-secondary" dateTime={p.date}>{p.date}</time>
      <h2 className="my-2 text-2xl font-extrabold"><bdi>PS5 {p.ps5}{p.xbox && ' · Xbox ' + p.xbox}</bdi></h2>
      <h3 className="mt-4 font-bold">{t.fixes}</h3>
      <ul className="my-2 list-disc space-y-1 ps-5">{p.fixes.map((key) => <li key={key}>{t[key]}</li>)}</ul>
      <h3 className="mt-4 font-bold">{t.issues}</h3><p>{t[p.issues]}</p>
      <a className="mt-4 inline-block text-sm text-accent underline" href={p.source}>{p.publisher}</a>
    </section>)}
  </article>;
}
