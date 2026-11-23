export type Localized = string | Record<string, string>;

export type Language = {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
  locale: string;
};

export type LogoStyle = "circular-seal" | "kiot-frame" | "square-image" | "wordmark";

/** Where a campaign or impact figure gets its totals. "mock" is demo data only. */
export type TotalsProvider = "mock" | "stripe" | "authorize-net" | "tithely" | "none";
export type PaymentProvider = "none" | "stripe" | "authorize-net" | "tithely";

export type NavItem = {
  label: Localized;
  page?: string;
  href?: string;
  children?: NavItem[];
};

export type ImageRef = {
  src: string;
  alt: Localized;
  position?: string;
};

export type Fund = {
  fundId: string;
  name: Localized;
};

export type SiteConfig = {
  name: Localized;
  shortName: Localized;
  mission: Localized;
  description: Localized;
  sampleNotice: Localized;
  defaultLanguage: string;
  languages: Language[];
  currency: string;
  logo: {
    style: LogoStyle;
    image: string;
    alt: Localized;
    sealText?: Localized;
  };
  contact: {
    email: string;
    phone: string;
    address: Localized;
    hours?: Localized;
  };
  navigation: NavItem[];
  donateButton: { label: Localized; page: string };
  footer: {
    about: Localized;
    columns: { heading: Localized; links: NavItem[] }[];
    legal: Localized;
  };
  orthodoxConnect: {
    enabled: boolean;
    newsletter: boolean;
    baseUrl: string;
    organizationId: string;
    links: Record<OrthodoxConnectLink, string>;
  };
  giving: {
    paymentProvider: PaymentProvider;
    connectedProviders: Exclude<TotalsProvider, "mock" | "none">[];
    totalsEndpoint: string;
    presetAmounts: number[];
    monthlyPresetAmounts: number[];
    funds: Fund[];
    taxReceiptNote: Localized;
  };
  collections: {
    programs: string;
    campaigns: string;
    stories: string;
  };
};

export type OrthodoxConnectLink =
  | "volunteerSignup"
  | "postNeed"
  | "respondToNeed"
  | "eventRsvp"
  | "newsletterSignup"
  | "donorPortal";

export type Section = {
  type: string;
  enabled?: boolean;
  id?: string;
  heading?: Localized;
  eyebrow?: Localized;
  intro?: Localized;
  [key: string]: unknown;
};

export type Page = {
  id: string;
  path: string;
  title: Localized;
  description?: Localized;
  sections: Section[];
};

export type Program = {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized[];
  image: ImageRef;
  fundId: string;
  locations: string[];
  highlights?: Localized[];
};

export type CampaignUpdate = {
  date: string;
  title: Localized;
  body: Localized;
};

export type Campaign = {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized[];
  image: ImageRef;
  goal: number;
  currency?: string;
  fundId: string;
  provider: TotalsProvider;
  deadline: string;
  featured?: boolean;
  program?: string;
  updates: CampaignUpdate[];
};

export type Story = {
  slug: string;
  title: Localized;
  kind: "story" | "news";
  date: string;
  summary: Localized;
  body: Localized[];
  image?: ImageRef;
  program?: string;
};

export type EventItem = {
  id: string;
  title: Localized;
  start: string;
  end?: string;
  location: Localized;
  summary: Localized;
  kind: Localized;
};

export type Need = {
  id: string;
  title: Localized;
  category: "food" | "household" | "transport" | "skills" | "prayer" | "visits";
  location: Localized;
  postedBy: Localized;
  posted: string;
  urgent?: boolean;
};

export type Person = {
  name: Localized;
  role: Localized;
  bio?: Localized;
};

export type PeopleFile = {
  spiritualAdvisor: Person & { blessing: Localized; letterFile?: string };
  groups: { id: string; title: Localized; members: Person[] }[];
};

export type Report = {
  title: Localized;
  year: number;
  kind: "annual-report" | "financial-statement" | "tax-filing" | "letter";
  file: string;
  sizeKb: number;
};

export type Partner = { name: Localized; kind: Localized; url?: string };

export type Chapter = {
  name: Localized;
  type: "chapter" | "partner-parish";
  city: Localized;
  region: string;
  country: Localized;
  email: string;
};

export type Location = {
  id: string;
  name: Localized;
  region: Localized;
  lon: number;
  lat: number;
  summary: Localized;
};

export type ImpactStat = {
  id: string;
  label: Localized;
  value?: number;
  suffix?: Localized;
  giving?: {
    fundId: string;
    metric: "raised" | "donors";
    provider: TotalsProvider;
  };
};
