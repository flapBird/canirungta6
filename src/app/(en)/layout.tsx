import "../globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getDictionary } from "@/lib/i18n";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en" dictionary={getDictionary("en")}>{children}</SiteShell>;
}
