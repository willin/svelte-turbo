---
title: '@svelte-dev/i18n'
desc: 一个简单好用的 Svelte 国际化脚手架工具
---

## 安装

可以通过 `npm`, `yarn`, `pnpm` 或者 `bun` 进行安装：

```bash
npm add @svelte-dev/i18n
```

## 使用

创建 `lib` 声明：

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

创建翻译文件，这里是一个示例：

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

创建路由页面 `[[lang]]/+page.svelte` 或 `[[lang=locale]]/+page.svelte`。

可选，配置语言参数校验 `src/params/locale.ts`：

```ts
import type { ParamMatcher } from '@sveltejs/kit';
import { getLocales } from '@svelte-dev/i18n';

export const match: ParamMatcher = (param) => {
  return getLocales().includes(param);
};
```

配置 `+layout.ts`：

```ts
import '$lib/i18n';
```

在页面中使用：

```svelte
<script>
  import { t } from '@svelte-dev/i18n';
</script>

{$t('message')}
```

## API 文档

[API 接口文档](https://paka.dev/npm/@svelte-dev/i18n/api)

## 赞助

维护者： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
