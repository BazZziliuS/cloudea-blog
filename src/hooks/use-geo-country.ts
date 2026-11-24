"use client";

import { useEffect, useState } from "react";
import { IPINFO_ORIGIN } from "@/lib/security";

const IPINFO_TOKEN = "58e6c8d230085c";

export type GeoState =
  | { status: "loading" }
  | { status: "resolved"; country: string }
  | { status: "error" };

let countryRequest: Promise<string | null> | null = null;

/** Detect the visitor's country once per page load; concurrent callers share the request. */
function fetchCountry(): Promise<string | null> {
  countryRequest ??= fetch(`${IPINFO_ORIGIN}/json?token=${IPINFO_TOKEN}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((data: { country?: string }) => data.country ?? null)
    .catch(() => {
      countryRequest = null; // allow a retry on the next mount
      return null;
    });
  return countryRequest;
}

/**
 * Resolve the visitor's ISO country code (via ipinfo.io).
 * Pass `enabled: false` to skip the request entirely when nothing is geo-restricted.
 */
export function useGeoCountry(enabled = true): GeoState {
  const [state, setState] = useState<GeoState>({ status: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchCountry().then((country) => {
      if (active) setState(country ? { status: "resolved", country } : { status: "error" });
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}

/** Whether content restricted to `countries` must be hidden for the given geo state. */
export function isGeoBlocked(state: GeoState, countries: readonly string[]): boolean {
  return state.status === "resolved" && countries.includes(state.country);
}
