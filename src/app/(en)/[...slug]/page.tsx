import type { Metadata } from "next";
import { notFound } from "next/navigation";
import routes from "@/data/routes.json";
import { LocalizedSlugPage } from "@/features/content/LocalizedSlugPage";
import { getDictionary, resolvePage } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(routes).filter((route) => route.en).map((route) => ({ slug: route.en.split("/").filter(Boolean) }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = resolvePage("en", slug.join("/"));
  if (!page) notFound();
  return pageMetadata(page, "en", getDictionary("en"));
}
export default async function EnglishSlug({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <LocalizedSlugPage locale="en" slug={slug.join("/")} />;
}
