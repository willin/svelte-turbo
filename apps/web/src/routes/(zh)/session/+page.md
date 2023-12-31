---
title: '@svelte-dev/session'
desc: 一个简单好用的 Svelte Session 会话管理库
---

<script>
   import { page } from "$app/stores"
</script>

## 概述

Session 是网站的重要组成部分，它允许服务器识别来自同一个人的请求，尤其是在涉及服务器端表单验证或页面上没有 JavaScript 时。会话是许多允许用户“登录”的网站的基本构建块，包括社交、电子商务、商业和教育网站。

@svelte-dev/session 附带了几个用于常见场景的预构建 Session 存储桶的方式，以及一个用于创建自定义 SessionStorage 的策略：

- 创建自定义的 Session 存储策略
- `CookieSessionStrategy`
- `MemoryStrategy`
- `CloudflareKVStrategy` (可用于 Cloudflare Workers、Pages)

## 演示

<div class="flex justify-center">
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-title">您已经访问本页面</div>
      <div class="stat-value">{$page.data.views} 次</div>
      <div class="stat-desc">刷新页面查看更新</div>
    </div>
  </div>
</div>

## 安装

可以通过 `npm`, `yarn`, `pnpm` 或者 `bun` 进行安装：

```bash
npm add @svelte-dev/session
```

## 基础使用

### 使用 `handleSession` 提供的傻瓜化注入

在项目根目录下创建 `hooks.server.ts`:

```ts
import { handleSession } from '@svelte-dev/session';

export const handle = handleSession({
  // 选择您所需要的适配器
  adapter: {
    name: 'cookie',
    options: {
      chunk: true
    }
  },
  // Session 会话配置
  session: {
    key: '__sid',
    secrets: ['s3cr3t']
  },
  // Cookie 配置
  cookie: {
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: true
  }
});
```

### Svelte 5 中使用

在 `+page.server.ts` 中读取、修改 Session 数据:

```ts
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const views = locals.session.get('views') ?? 0;
  await locals.session.set('views', views + 1);
  return {};
};
```

在 `svelte5 runes` 组件中读取:

```svelte
<script>
  let { data } = $props();
</script>

您访问了本页面 {data.session.views} 次
```

### Svelte 4 中使用

在 `+page.server.ts` 中读取、修改 Session 数据:

```ts
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const views = locals.session.get('views') ?? 0;
  await locals.session.set('views', views + 1);
  return { views };
};
```

在 `svelte5 runes` 组件中读取:

```svelte
<script>
  import { page } from '$app/stores';
</script>

您访问了本页面 {$page.data.views} 次
```

## 进阶使用

### Cloudflare KV

从 `hooks.server.ts` 中初始化:

```ts
import { handleSession } from '@svelte-dev/session';

export const handle = handleSession({
  adapter: {
    name: 'cloudflare-kv',
    options: {
      namespace: 'SESSION'
    }
  },
  session: {
    secrets: ['s3cr3t']
  },
  cookie: {
    path: '/'
  }
});
```

详细 Cloudflare adapter 文档: <https://kit.svelte.dev/docs/adapter-cloudflare#bindings>

### 自定义 Handle 方法

```ts
export const handle = handleSession({
	adapter: {
		name: 'cookie',
		options: {
			chunk: true
		}
	},
	session: {
		key: '__sid',
		secrets: ['s3cr3t']
	},
	cookie: {
		path: '/',
		sameSite: 'lax',
		secure: true,
		httpOnly: true
	},
	({ event, resolve }) => {
		// 可以通过 `event.locals.session` 访问 Session 数据
		// 自定义 handle 方法从这里开始写
		return resolve(event);
	}
);
```

同时，你还可以用 [sequence()](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence) 来组合多个 handle 方法:

```ts
const sessionHandler = handleSession({
  // ... 配置
});

export const handle = sequence(sessionHandler, ({ resolve, event }) => {
  // 可以通过 `event.locals.session` 访问 Session 数据
  // 自定义 handle 方法从这里开始写
  return resolve(event);
});
```

### Typescript 类型

这里有一个 `app.d.ts` 的示例，根据实际需要修改:

```ts
import type { FlashSessionData, SessionData, SessionStorage } from '@svelte-dev/session';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: SessionStorage<{ views: number }>;
    }
    interface PageData {
      session: FlashSessionData<SessionData, SessionData>;
    }
    interface Session extends SessionStorage {}
    // interface Platform {}
  }
}
```

### 创建自定义 Session 策略

接口定义如下：

```ts
export interface SessionStorageStrategy<Data = SessionData, FlashData = Data> {
  /**
   * Creates a new record with the given data and returns the session id.
   */
  createData: (data: FlashSessionData<Data, FlashData>, expires?: Date) => Promise<string>;

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  readData: (id: string) => Promise<FlashSessionData<Data, FlashData> | null>;

  /**
   * Updates data for the given session id.
   */
  updateData: (
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ) => Promise<void>;

  /**
   * Deletes data for a given session id from the data store.
   */
  deleteData: (id: string) => Promise<void>;
}
```

一个简单的实现示例：

```ts
import type { RequestEvent } from '@sveltejs/kit';
import type {
  CookieOptions,
  FlashSessionData,
  SessionData,
  SessionOptions,
  SessionStorageStrategy
} from '@svelte-dev/session';

export type YourStrageOptions = {
  /**
   * Example
   */
  key?: string;
};

export class YourStrategy<Data = SessionData, FlashData = Data>
  implements SessionStorageStrategy<Data, FlashData>
{
  constructor(
    event: RequestEvent,
    options: YourStrageOptions & { cookie: CookieOptions; session: SessionOptions }
  ) {}
  /**
   * Creates a new record with the given data and returns the session id.
   */
  async createData(data, expires?: Date): Promise<string> {}

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  async readData(id: string): Promise<FlashSessionData<Data, FlashData> | null> {}

  /**
   * Updates data for the given session id.
   */
  async updateData(
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ): Promise<void> {}

  /**
   * Deletes data for a given session id from the data store.
   */
  async deleteData(id: string): Promise<void> {}
}
```

## API 文档

[API 接口文档](https://paka.dev/npm/@svelte-dev/session/api)

## 赞助

维护者： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
