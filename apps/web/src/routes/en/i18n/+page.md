---
title: '@svelte-dev/i18n'
desc: A simple and easy-to-use Svelte I18n management library
---

## Installation

To use it, install it from npm (yarn or bun):

```bash
npm add @svelte-dev/i18n
```

## Useage

Create `lib` config file：

```ts
import { browser } from '$app/environment';
import { navigating } from '$app/stores';
import { addMessages, locale } from '@svelte-dev/i18n';

const translations = import.meta.glob(`../i18n/*.ts`, { eager: true });

export const supportedLanguages = [];
export const fallbackLng = 'zh';

Object.entries(translations).forEach(([name, mod]) => {
  const lang = name.replace(/.+\/(.+)\.ts/, '$1');
  addMessages(lang, mod.dict);
  supportedLanguages.push(lang);
});

if (browser) {
  const path = new URL(location.href).pathname.split('/');
  const lang = supportedLanguages.includes(path?.[1]) ? path?.[1] : fallbackLng;
  locale.set(lang);

  navigating.subscribe((params) => {
    if (params?.to?.params?.lang) {
      locale.set(params.to?.params?.lang);
    }
  });
}
```

Add translation files, here is an example:

```ts
// src/i18n/en.ts
import type { I18nDict } from '@svelte-dev/i18n';

export const dict: I18nDict = {
  __name: 'English',
  __flag: '🇺🇸',
  __unicode: '1f1fa-1f1f8',
  __code: 'EN',
  __direction: 'ltr',
  __status: 'beta',
  site: {
    title: 'Hello World'
  },
  common: {
    get_started: 'Get Started',
    npm_downloads: 'NPM Downloads'
  }
};
```

Create route page `[[lang]]/+page.svelte` ,or `[[lang=locale]]/+page.svelte`.

Optional, param checker `src/params/locale.ts`：

```ts
import type { ParamMatcher } from '@sveltejs/kit';
import { getLocales } from '@svelte-dev/i18n';

export const match: ParamMatcher = (param) => {
  return getLocales().includes(param);
};
```

Import i18n from `+layout.ts`：

```ts
import '$lib/i18n':
```

Use in page:

```svelte
<script>
  import { t } from '@svelte-dev/i18n';
</script>

{$t('message')}
```

## TypeDocs

[API Spec](/docs/i18n/)

## Sponsor

Owner： [Willin Wang](https://willin.wang)

Donation ways:

- Follow me: [@willin](https://github.com/willin) [![github](https://img.shields.io/- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
