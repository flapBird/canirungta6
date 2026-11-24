import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  const { common, nav, guides, support } = dictionary;
  const groups = [
    { title: common.footerTools, links: [
      ["home", nav.checker], ["requirements", nav.requirements], ["status", nav.status],
      ["port", nav.port], ["leonida", nav.leonida],
    ] },
    { title: nav.guides, links: [
      ["chapters", guides.chaptersCrumb], ["characters", guides.charactersCrumb], ["money", guides.moneyCrumb],
    ] },
    { title: common.footerSite, links: [
      ["about", support.aboutTitle], ["methodology", support.methodologyTitle], ["privacy", support.privacyTitle],
      ["terms", support.termsTitle], ["cookies", common.footerCookies],
    ] },
  ] as const;

  return (
    <footer className="mt-16 border-t border-border bg-[#0d0d15]">
      <div className="container-shell grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 lg:py-10">
        <div className="min-w-0 max-w-md">
          <div className="text-xl font-black tracking-[0.12em] text-accent">VI READY</div>
          <p className="mt-3 text-sm leading-6 text-muted">{common.independent}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{common.noGameFiles}</p>
          <a href={`mailto:${support.contactEmail}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline" dir="ltr">
            <span className="sr-only">{support.contactLabel} </span><bdi>{support.contactEmail}</bdi>
          </a>
        </div>
        <nav className="grid grid-cols-2 items-start gap-x-5 gap-y-6 sm:grid-cols-3" aria-label={common.footerNav}>
          {groups.map(({ title, links }) => (
            <div key={title} className="min-w-0">
              <h2 className="mb-2 text-sm font-bold text-text">{title}</h2>
              <ul>
                {links.map(([page, label]) => (
                  <li key={page}>
                    <a href={localePath(page, locale)} className="inline-flex min-h-9 items-center py-1 text-sm leading-5 text-muted hover:text-accent">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-border/70">
        <div className="container-shell flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 text-xs text-muted">
          <span>© 2026 VI Ready</span>
          <span>{common.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}
