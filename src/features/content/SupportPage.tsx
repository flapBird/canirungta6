import { SourceList } from "@/components/SourceList";
import { hardwareCoverage } from "@/lib/data";
import { interpolate } from "@/lib/i18n";
import { localePath, type PageId } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

type SupportPageId = Extract<PageId, "methodology" | "privacy" | "terms" | "cookies" | "about">;

export function SupportPage({ page, locale, dictionary }: { page: SupportPageId; locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.support;
  const legal = page === "privacy" || page === "terms" || page === "cookies";
  const title = page === "methodology" ? t.methodologyTitle : page === "privacy" ? t.privacyTitle : page === "terms" ? t.termsTitle : page === "cookies" ? t.cookiesTitle : t.aboutTitle;
  const intro = page === "methodology" ? t.methodologyIntro : page === "privacy" ? t.privacyIntro : page === "terms" ? t.termsIntro : page === "cookies" ? t.cookiesIntro : t.aboutIntro;
  const sections = page === "methodology"
    ? [[t.methodStep1Title, t.methodStep1], [t.methodStep2Title, t.methodStep2], [t.methodStep3Title, t.methodStep3], [t.methodStep4Title, t.methodStep4], [t.methodStep5Title, t.methodStep5], [t.dataCoverageTitle, interpolate(t.dataCoverage, hardwareCoverage)], [t.limitationsTitle, t.limitations], [t.sourcePolicyTitle, t.sourcePolicy]]
    : page === "privacy"
      ? [[t.privacyScopeTitle, t.privacyScope], [t.privacyLocalTitle, t.privacyLocal], [t.privacyShareTitle, t.privacyShare], [t.privacyHostingTitle, t.privacyHosting], [t.privacyAnalyticsTitle, t.privacyAnalytics], [t.privacyStorageTitle, t.privacyStorage], [t.privacyRetentionTitle, t.privacyRetention], [t.privacyThirdPartiesTitle, t.privacyThirdParties], [t.privacyChildrenTitle, t.privacyChildren], [t.privacyRightsTitle, t.privacyRights], [t.privacyChangesTitle, t.privacyChanges]]
      : page === "terms"
        ? [[t.termsInformationTitle, t.termsInformation], [t.termsAccuracyTitle, t.termsAccuracy], [t.termsEvidenceTitle, t.termsEvidence], [t.termsUseTitle, t.termsUse], [t.termsProhibitedTitle, t.termsProhibited], [t.termsLocalTitle, t.termsLocal], [t.termsChangesTitle, t.termsChanges], [t.termsLiabilityTitle, t.termsLiability]]
        : page === "cookies"
          ? [[t.cookiesLocalTitle, t.cookiesLocal], [t.cookiesConsentTitle, t.cookiesConsent], [t.cookiesThirdPartyTitle, t.cookiesThirdParty], [t.cookiesControlsTitle, t.cookiesControls], [t.cookiesKeysTitle, t.cookiesKeys], [t.cookiesOtherTitle, t.cookiesOther]]
          : [[t.aboutMissionTitle, t.aboutMission], [t.aboutDesignTitle, t.aboutDesign], [t.aboutBrandTitle, t.aboutBrand]];
  const contactTitle = page === "privacy" ? t.privacyContactTitle : page === "terms" ? t.termsContactTitle : t.cookiesContactTitle;
  const contactBody = page === "privacy" ? t.privacyContact : page === "terms" ? t.termsContact : t.cookiesContact;

  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <header className="max-w-4xl">
        <p className="eyebrow">VI Ready</p>
        <h1 className="gradient-text mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-muted">{intro}</p>
        {legal && <p className="mt-3 text-sm text-muted">{t.legalUpdatedLabel}: <bdi dir="ltr">{t.legalUpdated}</bdi></p>}
        {legal && (
          <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold" aria-label={t.legalPagesLabel}>
            {(["privacy", "terms", "cookies"] as const).map((item) => (
              <a key={item} href={localePath(item, locale)} className={`min-h-11 py-2 hover:text-accent ${item === page ? "text-accent" : "text-muted"}`} aria-current={item === page ? "page" : undefined}>
                <bdi>{item === "privacy" ? t.privacyTitle : item === "terms" ? t.termsTitle : t.cookiesTitle}</bdi>
              </a>
            ))}
          </nav>
        )}
      </header>
      <div className="prose-site mt-8 grid gap-5 lg:grid-cols-2">
        {sections.map(([heading, body]) => <section key={heading} className="panel p-6"><h2>{heading}</h2><p className="mt-3">{body}</p></section>)}
      </div>
      {legal && (
        <section className="panel mt-6 max-w-4xl p-6">
          <h2>{contactTitle}</h2>
          <p className="mt-3">{contactBody}</p>
          <a href={`mailto:${t.contactEmail}`} className="mt-4 inline-flex min-h-11 items-center font-bold text-accent hover:underline" dir="ltr"><bdi>{t.contactEmail}</bdi></a>
        </section>
      )}
      {page === "methodology" && <div className="mt-8"><SourceList ids={["src-nvidia-rtx-4060-family", "src-amd-rx-6700-xt", "src-intel-core-i5-12400f", "mdn-device-memory"]} dictionary={dictionary} title={dictionary.common.sources} /></div>}
    </div>
  );
}
