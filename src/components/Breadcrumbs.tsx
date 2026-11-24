import { breadcrumbTrail, localePath, type PageId } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export function Breadcrumbs({ locale, dictionary, page }: { locale: Locale; dictionary: Dictionary; page: PageId }) {
  const trail = page === "home" ? [] : breadcrumbTrail(page);
  return (
    <nav aria-label={dictionary.common.breadcrumb} className="container-shell flex flex-wrap items-center gap-2 pt-5 text-xs text-muted">
      <a href={localePath("home", locale)} className="min-h-11 py-2 hover:text-accent">{dictionary.common.home}</a>
      {trail.map((item, index) => {
        const current = index === trail.length - 1;
        const name = dictionary.guides[`${item}Crumb`] ?? dictionary.seo[item].title;
        return (
          <span key={item} className="inline-flex min-h-11 items-center gap-2">
            <span aria-hidden="true">/</span>
            {current
              ? <span aria-current="page" className="py-2 text-text">{name}</span>
              : <a href={localePath(item, locale)} className="py-2 hover:text-accent">{name}</a>}
          </span>
        );
      })}
    </nav>
  );
}
