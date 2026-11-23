import type { Section } from "@/lib/types";

export type SectionProps<S extends Section = Section> = {
  section: S;
  lang: string;
  index: number;
};
