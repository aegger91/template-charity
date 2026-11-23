import site from "@/content/site.json";
import type { TotalsProvider } from "@/lib/types";
import type { FundTotals, TotalsRequest } from "./types";

/**
 * Placeholder endpoint shared by every real provider.
 *
 *   GET {totalsEndpoint}   with {fundId} and {provider} filled in
 *   200 { "raised": 18250, "donors": 214, "updatedAt": "2026-11-20T09:00:00Z" }
 *
 * The OrthodoxConnect backend (or any small server) owns this endpoint. It must:
 *  1. receive provider webhooks for successful payments (Stripe payment_intent.succeeded,
 *     Authorize.net net.authorize.payment.authcapture.created, Tithe.ly transaction events)
 *     or run a scheduled API sync,
 *  2. keep only payments tagged with the fund id (payment metadata or designation),
 *  3. subtract refunds, and answer with the sum, the count of distinct donors and the time of
 *     the last update. Amounts are whole units of site.currency.
 */
export async function fetchTotalsFromEndpoint(
  provider: TotalsProvider,
  { fundId }: TotalsRequest,
): Promise<FundTotals> {
  const url = site.giving.totalsEndpoint
    .replaceAll("{fundId}", encodeURIComponent(fundId))
    .replaceAll("{provider}", encodeURIComponent(provider));
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Totals endpoint answered ${res.status}`);
  const data = (await res.json()) as Partial<FundTotals>;
  if (typeof data.raised !== "number" || typeof data.donors !== "number" || typeof data.updatedAt !== "string") {
    throw new Error("Totals endpoint returned an unexpected shape");
  }
  return { raised: data.raised, donors: data.donors, updatedAt: data.updatedAt };
}

export function isProviderConnected(provider: string) {
  return (site.giving.connectedProviders as string[]).includes(provider);
}
