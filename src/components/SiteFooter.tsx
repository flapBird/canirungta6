import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  const links = [
    ["home", dictionary.nav.checker],
    ["leonida", dictionary.nav.leonida],
    ["requirements", dictionary.nav.requirements],
    ["status", dictionary.nav.status],
    ["chapters", dictionary.guides.chaptersCrumb],
    ["characters", dictionary.guides.charactersCrumb],
    ["money", dictionary.guides.moneyCrumb],
    ["methodology", dictionary.support.methodologyTitle],
    ["privacy", dictionary.support.privacyTitle],
    ["terms", dictionary.support.termsTitle],
    ["cookies", dictionary.support.cookiesTitle],
    ["about", dictionary.support.aboutTitle],
  ] as const;

  return (
    <footer className="mt-16 border-t border-border bg-[#0d0d15]">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="text-xl font-black tracking-[0.12em] text-accent">VI READY</div>
          <p className="mt-3 max-w-md text-sm text-muted">{dictionary.common.independent}</p>
          <p className="mt-2 max-w-md text-sm text-muted">{dictionary.common.noGameFiles}</p>
          <a href={`mailto:${dictionary.support.contactEmail}`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent hover:underline" dir="ltr">
            <bdi>{dictionary.support.contactLabel}</bdi>
            <bdi>{dictionary.support.contactEmail}</bdi>
          </a>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3" aria-label={dictionary.common.footerNav}>
          {links.map(([page, label]) => (
            <a key={page} href={localePath(page, locale)} className="min-h-11 py-2 text-muted hover:text-accent">
              <bdi>{label}</bdi>
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border/70">
        <div className="container-shell flex flex-col gap-1 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 VI Ready · {dictionary.common.footerNote}</span>
          <span>{dictionary.common.updated}: <bdi dir="ltr">2026-11-24</bdi></span>
        </div>
      </div>
    </footer>
  );
}
