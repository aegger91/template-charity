"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** False in the static HTML and during hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

/** Reads a browser-only value. Returns `serverValue` in the static HTML. `read` must return a primitive. */
export function useClientValue<T extends string | number | boolean | null>(
  read: () => T,
  serverValue: T,
  subscribe: (onChange: () => void) => () => void = noSubscribe,
) {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
