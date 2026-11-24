import type { Metadata } from "next";
import { notFound } from "next/navigation";
import routes from "@/data/routes.json";
import { LocalizedSlugPage } from "@/features/content/LocalizedSlugPage";
import { getDictionary, resolvePage } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(routes).filter((route) => route.ar && route.ar !== "ar").map((route) => ({ slug: route.ar.split("/").filter(Boolean).slice(1) }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = resolvePage("ar", slug.join("/"));
  if (!page) notFound();
  return pageMetadata(page, "ar", getDictionary("ar"));
}
export default async function ArabicSlug({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <LocalizedSlugPage locale="ar" slug={slug.join("/")} />;
}
