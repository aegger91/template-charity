import type { TotalsProvider } from "@/lib/types";

/**
 * Totals for one campaign or fund. Always computed by the payment side, never typed into content.
 * Shape matches schemas/totals-response.schema.json.
 */
export type FundTotals = {
  raised: number;
  donors: number;
  updatedAt: string;
};

export type TotalsRequest = {
  fundId: string;
  /** Only the mock adapter uses this, to produce believable sample progress. */
  goal?: number;
};

/**
 * Every provider implements this. The real adapters do not talk to Stripe, Authorize.net
 * or Tithe.ly from the browser. They read the placeholder totals endpoint, whose server
 * side sums successful payments tagged with the fund id (fed by provider webhooks or a
 * scheduled API sync) and answers with { raised, donors, updatedAt }.
 */
export interface TotalsAdapter {
  id: TotalsProvider;
  label: string;
  /** True when the site config says this provider is connected for the organization. */
  isConnected(): boolean;
  /** Sample adapters can answer at build time so the static HTML already holds the numbers. */
  getStaticTotals?(request: TotalsRequest): FundTotals;
  getTotals(request: TotalsRequest): Promise<FundTotals>;
}
