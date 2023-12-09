![Logo](https://repository-images.githubusercontent.com/726691357/f09bf6fc-3844-4584-8eee-6bfb425d8a38)

# @svelte-dev/auth

[![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin) [![npm](https://img.shields.io/npm/v/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth)

Simple Authentication for [Svlelte](https://svelte.dev/).

## Features

- Full **Server-Side** Authentication
- Complete **TypeScript** Support
- **Strategy**-based Authentication
- Easily handle **success and failure**
- Implement **custom** strategies
- Supports persistent **sessions**

## Overview

Svelte Auth is a complete open-source authentication solution for Svelte applications.

Heavily inspired by [Passport.js](https://passportjs.org) and [Remix-Auth](https://github.com/sergiodxa/remix-auth), but completely rewrote it from scratch to work on top of the [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Svelte Auth can be dropped in to any Svelte-based application with minimal setup.

As with Passport.js, it uses the strategy pattern to support the different authentication flows. Each strategy is published individually as a separate npm package.

## Installation

To use it, install it from npm (yarn or bun):

```bash
npm install @svelte-dev/auth @svelte-dev/session
```

## Usage

API Specification: [Documentation](https://svelte-auth.js.cool/docs/)

Here's an simple Example:

```ts
// hooks.server.ts
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession } from '@svelte-dev/session';
import { Auth } from '@svelte-dev/auth';
import { OAuth2Strategy } from '@svelte-dev/auth-oauth2';

export const handle = sequence(
  handleSession({
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
  }),
  async function handle({ event, resolve }) {
    const auth = new Auth(event);
    const oauthStrategy = new OAuth2Strategy(
      {
        clientID: env.SSO_ID,
        clientSecret: env.SSO_SECRET,
        callbackURL: env.SSO_CALLBACK_URL || 'http://localhost:8788/auth/sso/callback'
      },
      async ({ profile }) => {
        // Get the user data from your DB or API using the tokens and profile
        return profile;
      }
    );
    auth.use(oauthStrategy);
    event.locals.auth = auth;
    event.locals.user = event.locals.session.get(
      // replace your session key, AuthOptions.sessionKey
      'user'
    );
    const response = await resolve(event);

    return response;
  }
);
```

Then, add a login handler `src/routes/auth/[provider]/+server.ts`:

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

Finally, add a callback handler `src/routes/auth/[provider]/callback/+server.ts.ts`:

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

## Advanced Usage

### Typescript

Modify `app.d.ts`, here is an example:

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

## 赞助 Sponsor

维护者 Owner： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

Donation ways:

- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## 许可证 License

Apache-2.0
