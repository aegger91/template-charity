import { geoEqualEarth, geoPath } from "d3-geo";
import { merge } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { SectionHeading } from "@/components/section-heading";
import { WorkMap, type MapMarker } from "@/components/work-map";
import { locations, programs } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { programHref } from "@/lib/links";
import type { Section } from "@/lib/types";
import type { SectionProps } from "./types";

const WIDTH = 1000;
const HEIGHT = 470;

let cache: { land: string; project: (lonLat: [number, number]) => [number, number] | null } | null = null;

/** Projects Natural Earth land shapes once per build. Antarctica is left out to save space. */
function getMap() {
  if (cache) return cache;
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const land = merge(
    topo,
    topo.objects.countries.geometries.filter((g) => g.id !== "010") as Parameters<typeof merge>[1],
  );
  const projection = geoEqualEarth().fitExtent(
    [
      [8, 8],
      [WIDTH - 8, HEIGHT - 8],
    ],
    land,
  );
  const path = geoPath(projection);
  cache = { land: path(land) ?? "", project: (p) => projection(p) };
  return cache;
}

type MapSection = Section & { showList?: boolean };

export function WorkMapSection({ section, lang }: SectionProps<MapSection>) {
  const { land, project } = getMap();
  const markers: MapMarker[] = locations.map((loc) => {
    const [x, y] = project([loc.lon, loc.lat]) ?? [0, 0];
    return {
      id: loc.id,
      x: (x / WIDTH) * 100,
      y: (y / HEIGHT) * 100,
      name: t(loc.name, lang),
      region: t(loc.region, lang),
      summary: t(loc.summary, lang),
      programs: programs
        .filter((p) => p.locations.includes(loc.id))
        .map((p) => ({ title: t(p.title, lang), href: programHref(lang, p.slug) })),
    };
  });

  return (
    <section className="bg-surface-warm py-16 md:py-24" id={section.id}>
      <div className="container-site">
        <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
        <WorkMap
          land={land}
          width={WIDTH}
          height={HEIGHT}
          markers={markers}
          showList={section.showList}
          strings={{
            select: tr("selectLocation", lang),
            programsHere: tr("programsHere", lang),
            sample: tr("sampleLocation", lang),
          }}
        />
      </div>
    </section>
  );
}
