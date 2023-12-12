---
title: '@svelte-dev/auth'
desc: 一个简单好用的 Svelte 身份管理库
---

<script>
  import { page } from "$app/stores"
</script>

![Logo](https://repository-images.githubusercontent.com/726691357/f09bf6fc-3844-4584-8eee-6bfb425d8a38)

## 特性

- 完全的**服务器端**身份验证
- 完整的**TypeScript**支持
- **策略**-基础身份验证
- 轻松处理**成功和失败**
- 实现**自定义**策略
- 支持持久**会话**

## 概述

Svelte Auth是一个完整的开源身份验证解决方案，适用于Svelte应用程序。

深受[Passport.js](https://passportjs.org)和[Remix-Auth](https://github.com/sergiodxa/remix-auth)的启发，但完全从头开始重写，以便在[Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)之上工作。 Svelte Auth可以在最小的设置下添加到任何基于Svelte的应用程序中。

与Passport.js一样，它使用策略模式来支持不同的身份验证流程。 每个策略都作为单独的npm包单独发布。

## 演示

{#if $page && $page.data.user}

  <div class="w-full">
    <pre>{JSON.stringify($page.data.user, null, 2)}</pre>
  </div>
{:else}
  <!-- <a href="/auth/alipay">Alipay Login</a> -->
  <!-- <a href="/auth/sso">SSO Login</a> | -->
  <a class="btn btn-secondary m-auto !w-32 !max-w-32 !min-w-0 flex" href="/auth/github">Github 登录</a>
{/if}

## 安装

要使用它，从npm（yarn或bun）安装：

```bash
npm install @svelte-dev/auth @svelte-dev/session
```

## 使用

API规范：[文档](https://svelte-auth.js.cool/docs/)

这是一个简单的例子：

```ts
// hooks.server.ts
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import { handleAuth } from '@svelte-dev/auth';
import { OAuth2Strategy } from '@svelte-dev/auth-oauth2';

const oauthStrategy = new OAuth2Strategy(
  {
    clientID: env.SSO_ID,
    clientSecret: env.SSO_SECRET,
    callbackURL: env.SSO_CALLBACK_URL || 'http://localhost:8788/auth/oauth2/callback'
  },
  async ({ profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return profile;
  }
);

export const handle = handleAuth({
  // Auth Options
  autoRouting: true,
  strategies: [oauthStrategy],
  sessionKey: 'user',
  sessionErrorKey: 'auth:error',
  sessionStrategyKey: 'strategy',
  successRedirect: '/',
  failureRedirect: '/',
  // Session Storage Options
  adapter: {
    name: 'cookie',
    options: {
      chunk: true
    }
  },
  session: {
    secrets: ['s3cr3t']
  },
  cookie: {
    secure: !!env.SSO_CALLBACK_URL,
    sameSite: 'lax',
    path: '/',
    httpOnly: !!env.SSO_CALLBACK_URL
  }
});
```

就是这样。

## 高级使用

如果您没有设置`authRouting`。 您需要添加一个登录处理程序`src/routes/auth/[provider]/+server.ts`：

```ts
import { redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  const { request } = event;
  const provider = event.params.provider ?? 'github';
  return await event.locals.auth.authenticate(event, provider, {
    successRedirect: '/dashboard',
    failureRedirect: '/error'
  });
};
```

然后，添加一个回调处理程序`src/routes/auth/[provider]/callback/+server.ts.ts`：

```ts
// same as before...
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  const provider = event.params.provider ?? 'github';

  return await event.locals.auth.authenticate(event, provider, {
    successRedirect: '/dashboard',
    failureRedirect: '/error'
  });
};
```

### Typescript

修改`app.d.ts`，这是一个例子：

```ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      auth: Auth;
      session: SessionStorage<{ user: any }>;
      user:
        | {
            invalid?: boolean;
            [key: string]: unknown;
          }
        | unknown;
    }
    // interface PageData {}
    interface Platform {
      env: {
        SSO_ID: string;
        SSO_SECRET: string;
      };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
  }
}

export {};
```

## TypeDocs

[自动化生成的接口文档](/docs/auth/)

## 赞助

维护者： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
