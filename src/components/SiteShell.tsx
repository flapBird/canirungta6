import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Dictionary, Locale } from "@/lib/types";

export function SiteShell({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: React.ReactNode }) {
  return (
    <html lang={locale} dir={dictionary.direction}>
      <body>
        <a href="#main-content" className="fixed start-3 top-3 z-[100] -translate-y-20 rounded-lg bg-accent px-4 py-3 font-bold text-bg focus:translate-y-0">{dictionary.common.skip}</a>
        <SiteHeader locale={locale} dictionary={dictionary} />
        <main id="main-content" className="min-h-[60vh]">{children}</main>
        <SiteFooter locale={locale} dictionary={dictionary} />
        <Analytics locale={locale} dictionary={dictionary} />
      </body>
    </html>
  );
}
