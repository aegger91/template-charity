import { fetchTotalsFromEndpoint, isProviderConnected } from "./endpoint";
import type { TotalsAdapter } from "./types";

/*
 * Stub adapters. Each one is "connected" only when its id is listed in
 * site.json > giving.connectedProviders, and each reads the shared totals endpoint.
 * TODO(provider): when a real backend exists, keep this interface and point
 * giving.totalsEndpoint at it. Nothing else in the site needs to change.
 */

export const stripeAdapter: TotalsAdapter = {
  id: "stripe",
  label: "Stripe",
  isConnected: () => isProviderConnected("stripe"),
  // TODO(stripe): backend sums succeeded PaymentIntents where metadata.fund_id matches.
  getTotals: (request) => fetchTotalsFromEndpoint("stripe", request),
};

export const authorizeNetAdapter: TotalsAdapter = {
  id: "authorize-net",
  label: "Authorize.net",
  isConnected: () => isProviderConnected("authorize-net"),
  // TODO(authorize-net): backend sums settled transactions whose order description or
  // user field "fund_id" matches, from Webhooks or the Transaction Reporting API.
  getTotals: (request) => fetchTotalsFromEndpoint("authorize-net", request),
};

export const tithelyAdapter: TotalsAdapter = {
  id: "tithely",
  label: "Tithe.ly",
  isConnected: () => isProviderConnected("tithely"),
  // TODO(tithely): backend sums completed gifts whose giving type or fund matches the fund id.
  getTotals: (request) => fetchTotalsFromEndpoint("tithely", request),
};
