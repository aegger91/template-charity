import type { ComponentType } from "react";
import type { Section } from "@/lib/types";
import { BlessingSection, FinancialsSection, HistorySection, PartnersSection, PeopleSection } from "./about";
import { CallToActionSection, CampaignsSection, PageHeaderSection, ProgramsSection, StoriesSection } from "./collections";
import { EventsSection, NeedsBoardSection, VolunteerSection } from "./engage";
import { GivingFormSection, MonthlyDonorsSection, SponsorshipSection, TaxReceiptSection } from "./giving";
import { HeroSection } from "./hero";
import { ImpactStatsSection } from "./impact-stats";
import { ChaptersSection, ContactSection, ImageCreditsSection, PressKitSection, TextSection } from "./resources";
import type { SectionProps } from "./types";
import { WorkMapSection } from "./work-map";

/** Every section type a page in content/pages.json may use. Keep in sync with schemas/pages.schema.json. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<string, ComponentType<SectionProps<any>>> = {
  hero: HeroSection,
  "impact-stats": ImpactStatsSection,
  "page-header": PageHeaderSection,
  programs: ProgramsSection,
  "work-map": WorkMapSection,
  stories: StoriesSection,
  campaigns: CampaignsSection,
  "call-to-action": CallToActionSection,
  "giving-form": GivingFormSection,
  sponsorship: SponsorshipSection,
  "monthly-donors": MonthlyDonorsSection,
  "tax-receipt-note": TaxReceiptSection,
  "needs-board": NeedsBoardSection,
  volunteer: VolunteerSection,
  events: EventsSection,
  history: HistorySection,
  blessing: BlessingSection,
  people: PeopleSection,
  financials: FinancialsSection,
  partners: PartnersSection,
  "press-kit": PressKitSection,
  chapters: ChaptersSection,
  contact: ContactSection,
  "image-credits": ImageCreditsSection,
  text: TextSection,
};

export function Sections({ sections, lang }: { sections: Section[]; lang: string }) {
  return (
    <>
      {sections
        .filter((s) => s.enabled !== false)
        .map((section, index) => {
          const Component = sectionRegistry[section.type];
          if (!Component) return null;
          return <Component key={`${section.type}-${index}`} section={section} lang={lang} index={index} />;
        })}
    </>
  );
}
