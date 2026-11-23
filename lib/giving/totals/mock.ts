import type { FundTotals, TotalsAdapter, TotalsRequest } from "./types";

/** Fixed so the static build and the browser agree. */
const SAMPLE_UPDATED_AT = "2026-11-20T09:00:00Z";

function seed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function sampleTotals({ fundId, goal }: TotalsRequest): FundTotals {
  const s = seed(fundId);
  const base = goal ?? 150000;
  const share = goal ? 0.38 + s * 0.42 : 0.6 + s * 0.3;
  const raised = Math.round((base * share) / 50) * 50;
  const donors = Math.max(12, Math.round(raised / (70 + s * 40)));
  return { raised, donors, updatedAt: SAMPLE_UPDATED_AT };
}

/** Demo only. Produces clearly labeled sample totals so the design can be previewed. */
export const mockAdapter: TotalsAdapter = {
  id: "mock",
  label: "Demo adapter (sample data)",
  isConnected: () => true,
  getStaticTotals: sampleTotals,
  getTotals: async (request) => sampleTotals(request),
};
