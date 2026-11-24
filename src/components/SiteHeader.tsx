"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { businessPages, isGuidePage, localePath, pageFromPathname } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activePage = pageFromPathname(locale, pathname);
  const onGuides = isGuidePage(activePage);
  const navigate = (href: string) => `${href}${typeof window === "undefined" ? "" : window.location.search}`;
  const changeLocale = (nextLocale: Locale) => {
    window.location.assign(navigate(localePath(activePage, nextLocale)));
  };

  return (
    <header className="border-b border-border/80 bg-bg/85 backdrop-blur-xl">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <a href={navigate(localePath("home", locale))} className="group inline-flex min-h-11 items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg border border-accent/50 bg-accent/10 font-black text-accent">VI</span>
          <span>
            <span className="block text-lg font-black tracking-[0.12em] text-accent">VI READY</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:block">{dictionary.common.brandTagline}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={dictionary.common.primaryNav}>
          {businessPages.map((page) => (
            <a
              key={page}
              href={navigate(localePath(page, locale))}
              aria-current={activePage === page ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${activePage === page ? "bg-white/5 text-accent" : "text-muted hover:bg-white/5 hover:text-text"}`}
            >
              {dictionary.nav[page === "home" ? "checker" : page]}
            </a>
          ))}
          <a
            href={navigate(localePath("chapters", locale))}
            aria-current={onGuides ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${onGuides ? "bg-white/5 text-accent" : "text-muted hover:bg-white/5 hover:text-text"}`}
          >
            {dictionary.nav.guides}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">{dictionary.common.language}</span>
            <select
              value={locale}
              onChange={(event) => changeLocale(event.target.value as Locale)}
              className="field min-h-11 w-auto cursor-pointer py-2 pe-8 text-sm font-bold"
              aria-label={dictionary.common.language}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="ar">AR</option>
            </select>
          </label>
          <button
            type="button"
            className="btn-secondary min-h-11 px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={dictionary.common.menu}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="text-xl leading-none" aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-navigation" className="container-shell grid gap-1 border-t border-border py-3 lg:hidden" aria-label={dictionary.common.mobileNav}>
          {businessPages.map((page) => (
            <a
              key={page}
              href={navigate(localePath(page, locale))}
              aria-current={activePage === page ? "page" : undefined}
              className={`min-h-11 rounded-lg px-3 py-2 font-semibold ${activePage === page ? "bg-white/5 text-accent" : "text-muted"}`}
            >
              {dictionary.nav[page === "home" ? "checker" : page]}
            </a>
          ))}
          <a
            href={navigate(localePath("chapters", locale))}
            aria-current={onGuides ? "page" : undefined}
            className={`min-h-11 rounded-lg px-3 py-2 font-semibold ${onGuides ? "bg-white/5 text-accent" : "text-muted"}`}
          >
            {dictionary.nav.guides}
          </a>
        </nav>
      )}
    </header>
  );
}
