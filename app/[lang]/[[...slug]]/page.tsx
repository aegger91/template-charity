import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail, ProgramDetail, StoryDetail } from "@/components/detail-pages";
import { Sections } from "@/components/sections";
import { getAllPaths, resolveRoute, site } from "@/lib/content";
import { getLanguages, t } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  const paths = getAllPaths();
  return getLanguages().flatMap((l) =>
    paths.map((p) => ({ lang: l.code, slug: p ? p.split("/") : [] })),
  );
}

async function getRoute(params: PageProps<"/[lang]/[[...slug]]">["params"]) {
  const { lang, slug } = await params;
  return { lang, route: resolveRoute((slug ?? []).join("/")) };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { lang, route } = await getRoute(params);
  if (!route) return {};
  const pick = () => {
    switch (route.kind) {
      case "page":
        return route.page.path === "" ? null : { title: route.page.title, description: route.page.description };
      case "program":
        return { title: route.program.title, description: route.program.summary };
      case "campaign":
        return { title: route.campaign.title, description: route.campaign.summary };
      case "story":
        return { title: route.story.title, description: route.story.summary };
    }
  };
  const m = pick();
  if (!m) return { title: { absolute: t(site.name, lang) } };
  return { title: t(m.title, lang), description: m.description ? t(m.description, lang) : undefined };
}

export default async function Page({ params }: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, route } = await getRoute(params);
  if (!route) notFound();
  switch (route.kind) {
    case "page":
      return <Sections sections={route.page.sections} lang={lang} />;
    case "program":
      return <ProgramDetail program={route.program} lang={lang} />;
    case "campaign":
      return <CampaignDetail campaign={route.campaign} lang={lang} />;
    case "story":
      return <StoryDetail story={route.story} lang={lang} />;
  }
}
