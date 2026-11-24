import "../../globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getDictionary } from "@/lib/i18n";

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="es" dictionary={getDictionary("es")}>{children}</SiteShell>;
}
