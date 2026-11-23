import campaignsFile from "@/content/campaigns.json";
import chaptersFile from "@/content/chapters.json";
import eventsFile from "@/content/events.json";
import imageSources from "@/content/image-sources.json";
import impactFile from "@/content/impact.json";
import locationsFile from "@/content/locations.json";
import needsFile from "@/content/needs.json";
import pagesFile from "@/content/pages.json";
import partnersFile from "@/content/partners.json";
import peopleFile from "@/content/people.json";
import programsFile from "@/content/programs.json";
import reportsFile from "@/content/reports.json";
import siteFile from "@/content/site.json";
import sponsorshipFile from "@/content/sponsorship.json";
import storiesFile from "@/content/stories.json";
import type {
  Campaign,
  Chapter,
  EventItem,
  ImpactStat,
  Localized,
  Location,
  Need,
  Page,
  Partner,
  PeopleFile,
  Program,
  Report,
  SiteConfig,
  Story,
} from "@/lib/types";

export const site = siteFile as unknown as SiteConfig;
export const pages = pagesFile.pages as unknown as Page[];
export const programs = programsFile.items as unknown as Program[];
export const campaigns = campaignsFile.items as unknown as Campaign[];
export const stories = (storiesFile.items as unknown as Story[]).sort((a, b) => b.date.localeCompare(a.date));
export const events = (eventsFile.items as unknown as EventItem[]).sort((a, b) => a.start.localeCompare(b.start));
export const needs = needsFile.items as unknown as Need[];
export const people = peopleFile as unknown as PeopleFile;
export const reports = reportsFile.items as unknown as Report[];
export const partners = partnersFile.items as unknown as Partner[];
export const chapters = chaptersFile.items as unknown as Chapter[];
export const chapterRegions = chaptersFile.regions as Record<string, Localized>;
export const locations = locationsFile.items as unknown as Location[];
export const impact = impactFile.items as unknown as ImpactStat[];
export const sponsorship = sponsorshipFile as unknown as {
  note: Localized;
  options: { id: string; title: Localized; body: Localized; monthlyAmount: number; fundId: string }[];
};
export const credits = imageSources;

export function getPageById(id: string) {
  return pages.find((p) => p.id === id);
}

export function getFeaturedCampaign() {
  return campaigns.find((c) => c.featured) ?? campaigns[0];
}

export function getProgram(slug: string) {
  return programs.find((p) => p.slug === slug);
}

export function getCampaign(slug: string) {
  return campaigns.find((c) => c.slug === slug);
}

export type Route =
  | { kind: "page"; page: Page }
  | { kind: "program"; program: Program }
  | { kind: "campaign"; campaign: Campaign }
  | { kind: "story"; story: Story };

/** Every path the static build emits, without the language prefix. */
export function getAllPaths(): string[] {
  const c = site.collections;
  return [
    ...pages.map((p) => p.path),
    ...programs.map((p) => `${c.programs}/${p.slug}`),
    ...campaigns.map((x) => `${c.campaigns}/${x.slug}`),
    ...stories.map((s) => `${c.stories}/${s.slug}`),
  ];
}

export function resolveRoute(path: string): Route | null {
  const page = pages.find((p) => p.path === path);
  if (page) return { kind: "page", page };
  const c = site.collections;
  const match = (base: string) => (path.startsWith(`${base}/`) ? path.slice(base.length + 1) : null);
  const programSlug = match(c.programs);
  const program = programSlug && programs.find((p) => p.slug === programSlug);
  if (program) return { kind: "program", program };
  const campaignSlug = match(c.campaigns);
  const campaign = campaignSlug && campaigns.find((x) => x.slug === campaignSlug);
  if (campaign) return { kind: "campaign", campaign };
  const storySlug = match(c.stories);
  const story = storySlug && stories.find((s) => s.slug === storySlug);
  if (story) return { kind: "story", story };
  return null;
}
