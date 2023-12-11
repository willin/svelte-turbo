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
} from './i18n/stores/dictionary.js';
export { $t as t, $t as _ } from './i18n/stores/formatter.js';
export { $locale as locale, getPossibleLocales, getCurrentLocale } from './i18n/stores/locale.js';
