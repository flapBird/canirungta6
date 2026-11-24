import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const messages = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"));
const output = new URL("../public/", import.meta.url);
mkdirSync(output, { recursive: true });
const escapeXml = (value) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]);
const copy = {
  en: { title: "Can I Run GTA 6?", subtitle: "Evidence-aware PC readiness checker", tag: "NO INVENTED FPS" },
  es: { title: "¿Mi PC puede correr GTA 6?", subtitle: "Comprobador de requisitos con evidencia", tag: "SIN FPS INVENTADOS" },
  ar: { title: "هل جهازي يشغل GTA 6؟", subtitle: "فحص متطلبات الكمبيوتر بناءً على الأدلة", tag: "من دون أرقام FPS وهمية" },
};
for (const locale of ["en", "es", "ar"]) {
  const item = copy[locale];
  const rtl = locale === "ar";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#171522"/><stop offset="1" stop-color="#101019"/></linearGradient><linearGradient id="pink" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ffd1e2"/><stop offset=".5" stop-color="#ff86ae"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1080" cy="70" r="280" fill="#a78bfa" opacity=".08"/><circle cx="100" cy="620" r="260" fill="#ff86ae" opacity=".07"/>
    <rect x="64" y="56" width="74" height="54" rx="14" fill="#ff86ae" opacity=".12" stroke="#ff86ae"/>
    <text x="101" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#ff86ae">VI</text>
    <text x="158" y="92" font-family="Arial, sans-serif" font-size="27" font-weight="800" letter-spacing="4" fill="#ff86ae">VI READY</text>
    <text x="1136" y="91" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#b3b1c2">${escapeXml(messages.seo["home.title"])}</text>
    <line x1="64" y1="132" x2="1136" y2="132" stroke="#383747"/>
    <text x="64" y="272" direction="${rtl ? "rtl" : "ltr"}" text-anchor="${rtl ? "end" : "start"}" font-family="Arial, Tahoma, sans-serif" font-size="${locale === "es" ? 66 : 76}" font-weight="800" fill="url(#pink)">${escapeXml(item.title)}</text>
    <text x="64" y="330" direction="${rtl ? "rtl" : "ltr"}" text-anchor="${rtl ? "end" : "start"}" font-family="Arial, Tahoma, sans-serif" font-size="29" fill="#f5f3fa">${escapeXml(item.subtitle)}</text>
    <rect x="64" y="386" width="1072" height="126" rx="20" fill="#1c1c2a" stroke="#383747"/>
    <text x="96" y="432" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#b3b1c2">CPU · GPU · RAM · VRAM · OS</text>
    <text x="96" y="477" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#34d399">${rtl ? "غير معروف عندما لا توجد أدلة" : "Unknown when evidence is missing"}</text>
    <rect x="850" y="414" width="252" height="66" rx="12" fill="#fbbf24" opacity=".1" stroke="#fbbf24"/>
    <text x="976" y="455" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="18" font-weight="800" fill="#fbbf24">${escapeXml(item.tag)}</text>
    <text x="64" y="574" font-family="Arial, Tahoma, sans-serif" font-size="18" fill="#b3b1c2">${escapeXml(messages.common.independent)}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL(`og-${locale}.png`, output).pathname);
}
writeFileSync(new URL("favicon.svg", output), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#101019"/><rect x="8" y="8" width="48" height="48" rx="12" fill="#ff86ae" opacity=".12" stroke="#ff86ae"/><text x="32" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="800" fill="#ff86ae">VI</text></svg>`);
console.log("Generated original localized OG images and favicon.");
