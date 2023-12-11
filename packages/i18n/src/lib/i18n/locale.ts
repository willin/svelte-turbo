import { writable } from 'svelte/store';

let current: string | null | undefined;
export const $locale = writable<string | null | undefined>(null);

function getSubLocales(refLocale: string) {
  return refLocale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
    .reverse();
}

export function getPossibleLocales(refLocale: string, fallbackLocale?: string): string[] {
  const locales = getSubLocales(refLocale);

  if (fallbackLocale) {
    return [...new Set([...locales, ...getSubLocales(fallbackLocale)])];
  }

  return locales;
}

export function getCurrentLocale() {
  return current ?? undefined;
}

$locale.subscribe((newLocale: string | null | undefined) => {
  current = newLocale ?? undefined;

  if (typeof window !== 'undefined' && newLocale != null) {
    document.documentElement.setAttribute('lang', newLocale);
  }
});
