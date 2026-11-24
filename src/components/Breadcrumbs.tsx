import { breadcrumbTrail, localePath, type PageId } from "@/lib/i18n-routes";
import { crumbName } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

export function Breadcrumbs({ locale, dictionary, page }: { locale: Locale; dictionary: Dictionary; page: PageId }) {
  const trail = page === "home" ? [] : breadcrumbTrail(page);
  return (
    <nav aria-label={dictionary.common.breadcrumb} className="container-shell flex flex-wrap items-center gap-x-2 pt-3 text-xs leading-5 text-muted">
      <a href={localePath("home", locale)} className="inline-flex min-h-11 items-center hover:text-accent">{dictionary.common.home}</a>
      {trail.map((item, index) => {
        const current = index === trail.length - 1;
        const name = crumbName(item, dictionary);
        return (
          <span key={item} className="inline-flex min-h-11 min-w-0 items-center gap-2">
            <span aria-hidden="true">/</span>
            {current
              ? <span aria-current="page" className="inline-flex min-h-11 items-center text-text">{name}</span>
              : <a href={localePath(item, locale)} className="inline-flex min-h-11 items-center hover:text-accent">{name}</a>}
          </span>
        );
      })}
    </nav>
  );
}
