export * from './i18n/types.js';
export {
  $dictionary as dictionary,
  $locales as locales,
  getLocaleDictionary,
  getLocales,
  getDictionary,
  hasLocaleDictionary,
  getMessageFromDictionary,
  getClosestAvailableLocale,
  addMessages
} from './i18n/dictionary.js';
export { $t as t, $t as _ } from './i18n/formatter.js';
export { $locale as locale, getPossibleLocales, getCurrentLocale } from './i18n/locale.js';
