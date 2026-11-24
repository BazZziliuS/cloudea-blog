import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse a `?page=` search param into a positive integer (defaults to 1). */
export function parsePageParam(value: string | string[] | undefined): number {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? "1"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** "getting-started" → "Getting started" */
export function humanizeSlug(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}
