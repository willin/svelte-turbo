import deepmerge from 'deepmerge';
import { derived, writable, type Readable } from 'svelte/store';
import type { I18nDict } from './types.js';
import { getPossibleLocales } from './locale.js';

let dictionary: I18nDict = {};
const $dictionary = writable<I18nDict>({});

/**
 * Get Locale Dictionary from server
 */
export function getLocaleDictionary(locale: string) {
  return (dictionary[locale] as I18nDict) || null;
}

/**
 * Get All Locales from server
 */
export function getLocales() {
  return Object.keys(dictionary);
}

/**
 * Get All Dictionaries from server
 */
export function getDictionary() {
  return dictionary;
}

/**
 * Check if the locale dictionary exists
 */
export function hasLocaleDictionary(locale: string) {
  return locale in dictionary;
}

/**
 * Get Message from Dictionary
 */
export function getMessageFromDictionary(locale: string) {
  if (!hasLocaleDictionary(locale)) {
    return null;
  }

  return getLocaleDictionary(locale);
}

export function getClosestAvailableLocale(
  refLocale: string | null | undefined
): string | undefined {
  if (refLocale == null) return undefined;

  const relatedLocales = getPossibleLocales(refLocale);

  for (let i = 0; i < relatedLocales.length; i++) {
    const locale = relatedLocales[i];

    if (hasLocaleDictionary(locale)) {
      return locale;
    }
  }

  return undefined;
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
export function addMessages(locale: string, ...partials: I18nDict[]) {
  $dictionary.update((d) => {
    // @ts-ignore
    d[locale] = deepmerge.all<I18nDict>([d[locale] || {}, ...partials]);
    return d;
  });
}

const $locales: Readable<string[]> = derived([$dictionary], ([dictionary]) =>
  Object.keys(dictionary)
);

$dictionary.subscribe((newDictionary) => (dictionary = newDictionary));

export { $dictionary, $locales };
