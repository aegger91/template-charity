import site from "@/content/site.json";
import type { PaymentProvider } from "@/lib/types";

export type Tribute = {
  kind: "honor" | "memory";
  honoreeName: string;
  card: "none" | "ecard" | "printed";
  recipientName?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  message?: string;
};

export type DonationIntent = {
  amount: number;
  currency: string;
  frequency: "one-time" | "monthly";
  /** Every payment must carry this so the totals endpoint can sum it per campaign or fund. */
  fundId: string;
  donor: { name: string; email: string };
  tribute?: Tribute;
  language: string;
};

export type DonationResult =
  | { status: "demo"; reference: string }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

/**
 * Single entry point for every gift form on the site.
 * TODO(payments): implement one branch per provider. Keep fundId in the payment metadata.
 *  - stripe: create a Checkout Session (mode "payment" or "subscription") on your server,
 *    metadata { fund_id, tribute_* }, then return { status: "redirect", url }.
 *  - authorize-net: request an Accept Hosted payment page token on your server and redirect.
 *  - tithely: open the Tithe.ly giving page for the organization with the fund preselected.
 */
export async function submitDonation(intent: DonationIntent): Promise<DonationResult> {
  const provider = site.giving.paymentProvider as PaymentProvider;
  switch (provider) {
    case "stripe":
    case "authorize-net":
    case "tithely":
      return { status: "error", message: `TODO: ${provider} checkout is not wired up yet.` };
    case "none":
    default:
      await new Promise((r) => setTimeout(r, 700));
      return { status: "demo", reference: `DEMO-${intent.fundId}-${Date.now().toString(36).toUpperCase()}` };
  }
}
