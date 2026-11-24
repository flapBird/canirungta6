import { Faq } from "@/components/Faq";
import { SourceList } from "@/components/SourceList";
import { gpus } from "@/lib/data";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";
import { CheckerTool } from "@/features/checker/CheckerTool";
import { GuideCard } from "@/features/guides/GuideCard";

const popularIds = [
  "nvidia-rtx-4060-8gb-desktop",
  "nvidia-rtx-3060-12gb-desktop",
  "amd-rx-6700-xt-desktop",
  "nvidia-rtx-4070-12gb-desktop",
  "amd-rx-7600-desktop",
];

export function CheckerHome({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.checker;
  const cards = [
    { page: "leonida" as const, title: t.leonidaTitle, body: t.leonidaBody },
    { page: "status" as const, title: t.statusTitle, body: t.statusBody },
    { page: "methodology" as const, title: t.methodologyTitle, body: t.methodologyBody },
  ];
  return (
    <>
      <section className="container-shell pb-2 pt-10 text-center sm:pt-14">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1 className="gradient-text mx-auto mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">{t.h1}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">{t.intro}</p>
        <div className="mx-auto mt-5 inline-flex max-w-3xl items-start gap-2 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 text-start text-sm">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
          <span><strong className="text-warning">{t.noticeTitle}</strong> <span className="text-muted">{t.noticeBody}</span></span>
        </div>
      </section>

      <div className="container-shell">
        <CheckerTool locale={locale} dictionary={dictionary} game="gta6" />

        <section className="mt-12" aria-labelledby="popular-gpus-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="eyebrow">{t.presetEyebrow}</p><h2 id="popular-gpus-title" className="mt-1 text-2xl font-extrabold tracking-tight">{t.popularTitle}</h2></div>
            <p className="max-w-xl text-sm text-muted">{t.popularBody}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {popularIds.map((id) => {
              const gpu = gpus.find((item) => item.id === id)!;
              return (
                <a key={id} href={`${localePath("home", locale)}?gpu=${encodeURIComponent(id)}&device=${gpu.deviceType}`} className="panel group min-h-32 p-4 transition-colors hover:border-secondary/60" data-clarity-mask="true">
                  <span className="block text-xs font-bold uppercase tracking-wider text-secondary">{gpu.brand}</span>
                  <span className="mt-2 block font-extrabold" dir="ltr">{gpu.name}</span>
                  <span className="mt-3 inline-flex text-sm font-bold text-accent">{t.preset} <span className="flip-in-rtl" aria-hidden="true">→</span></span>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="home-guides-title">
          <p className="eyebrow">{t.homeEyebrow}</p>
          <h2 id="home-guides-title" className="mt-2 text-2xl font-extrabold tracking-tight">{t.homeTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <GuideCard page="chapters" title={t.homeChaptersTitle} body={t.homeChaptersBody} locale={locale} />
            <GuideCard page="characters" title={t.homeCharactersTitle} body={t.homeCharactersBody} locale={locale} />
            <GuideCard page="money" title={t.homeMoneyTitle} body={t.homeMoneyBody} locale={locale} />
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3" aria-label="Related tools">
          {cards.map((card) => (
            <a key={card.page} href={localePath(card.page, locale)} className="panel group p-5 transition-colors hover:border-accent/60">
              <h2 className="text-lg font-extrabold text-accent">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">{dictionary.common.readMore}<span className="flip-in-rtl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
            </a>
          ))}
        </section>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <SourceList ids={["rockstar-gta6-out-now", "rockstar-gta6-platforms"]} dictionary={dictionary} title={t.sources} />
          <Faq dictionary={dictionary} title={t.faqTitle} />
        </div>
      </div>
    </>
  );
}
