import type { TotalsProvider } from "@/lib/types";
import { mockAdapter } from "./mock";
import { authorizeNetAdapter, stripeAdapter, tithelyAdapter } from "./providers";
import type { TotalsAdapter } from "./types";

export type { FundTotals, TotalsAdapter, TotalsRequest } from "./types";

const adapters: Record<Exclude<TotalsProvider, "none">, TotalsAdapter> = {
  mock: mockAdapter,
  stripe: stripeAdapter,
  "authorize-net": authorizeNetAdapter,
  tithely: tithelyAdapter,
};

/**
 * Returns the adapter for a campaign or impact figure, or null when nothing is connected.
 * Null means: hide the progress bar and the raised amount, show only the goal or description.
 */
export function getTotalsAdapter(provider: TotalsProvider | undefined): TotalsAdapter | null {
  if (!provider || provider === "none") return null;
  const adapter = adapters[provider];
  return adapter && adapter.isConnected() ? adapter : null;
}
