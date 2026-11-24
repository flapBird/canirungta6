import "../../globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getDictionary } from "@/lib/i18n";

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ar" dictionary={getDictionary("ar")}>{children}</SiteShell>;
}
