import { Faq } from "@/components/Faq";
import { SourceList } from "@/components/SourceList";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function StatusPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.status;
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <header className="max-w-4xl">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1 className="gradient-text mt-3 text-3xl font-black tracking-tight sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 text-lg text-muted">{t.intro}</p>
      </header>

      <section className="panel mt-8 border-warning/40 p-5 sm:p-7" aria-labelledby="status-answer-title">
        <h2 id="status-answer-title" className="text-2xl font-extrabold text-warning">{t.answerTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.answer}</p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[[t.pcTitle, t.pcValue], [t.configTitle, t.configValue], [t.platformsTitle, "PS5 · Xbox Series X|S"]].map(([label, value]) => (
          <div key={label} className="panel p-5"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-2 text-xl font-black text-warning">{value}</p></div>
        ))}
      </div>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><h2>{t.platformsTitle}</h2><p className="mt-3">{t.platformsBody}</p></section>
        <section className="panel p-6"><h2>{t.uncertaintyTitle}</h2><p className="mt-3">{t.uncertaintyBody}</p></section>
      </div>

      <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="status-timeline-title">
        <h2 id="status-timeline-title" className="text-2xl font-extrabold">{t.timelineTitle}</h2>
        <div className="mt-5 border-s-2 border-secondary/50 ps-5">
          <span className="text-sm font-bold text-secondary"><bdi dir="ltr">2026-11-19</bdi></span>
          <h3 className="mt-1 text-lg font-extrabold">{t.releaseTitle}</h3>
          <p className="mt-2 text-muted">{t.releaseBody}</p>
          <a href="https://www.rockstargames.com/VI/out-now" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-bold text-accent hover:underline">{t.checkTitle} ↗</a>
        </div>
      </section>

      <section className="panel mt-6 p-5 sm:p-7"><h2 className="text-2xl font-extrabold">{t.leonidaTitle}</h2><p className="mt-3 max-w-4xl text-muted">{t.leonidaBody}</p><div className="mt-4 flex flex-wrap gap-2"><a href={localePath("leonida", locale)} className="btn-secondary">{dictionary.nav.leonida}</a><a href={localePath("home", locale)} className="btn-primary">{dictionary.common.backToChecker}</a></div></section>
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
        <SourceList ids={["rockstar-gta6-out-now", "rockstar-gta6-platforms"]} dictionary={dictionary} title={dictionary.common.sources} />
        <Faq dictionary={dictionary} title={t.faqTitle} />
      </div>
    </div>
  );
}
