import dlv from 'dlv';
import templite from 'templite';
import { derived, type Readable } from 'svelte/store';
import { $dictionary, getMessageFromDictionary } from './dictionary.js';
import { $locale, getCurrentLocale } from './locale.js';
import type { MessageFormatter } from './types.js';

const formatMessage: MessageFormatter = (key: string, params?: any, lang?: string): string => {
  const dict = getMessageFromDictionary(lang || (getCurrentLocale() as string));
  const val = dlv(dict as any, key, key);
  if (typeof val === 'function') return val(params) as string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof val === 'string') return templite(val, params);
  return val as string;
};

export const $t: Readable<MessageFormatter> = derived([$locale, $dictionary], () => formatMessage);
