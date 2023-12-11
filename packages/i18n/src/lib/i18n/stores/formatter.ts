import dlv from 'dlv';
import templite from 'templite';
import { derived } from 'svelte/store';
import { $dictionary, getMessageFromDictionary } from './dictionary.js';
import { $locale, getCurrentLocale } from './locale.js';

const formatMessage = (key: string, params?: any, lang?: string): string => {
  const dict = getMessageFromDictionary(lang || getCurrentLocale());
  const val = dlv(dict, key, key);
  if (typeof val === 'function') return val(params) as string;
  if (typeof val === 'string') return templite(val, params);
  return val as string;
};

export const $t = derived([$locale, $dictionary], () => formatMessage);
