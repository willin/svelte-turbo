---
title: '@svelte-dev/auth'
desc: A simple and easy-to-use Svelte identity management library
---

<script>
  import { page } from "$app/stores"
</script>

![Logo](https://repository-images.githubusercontent.com/726691357/f09bf6fc-3844-4584-8eee-6bfb425d8a38)

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

## Demo

{#if $page && $page.data.user}

  <div class="w-full">
    <pre>{JSON.stringify($page.data.user, null, 2)}</pre>
  </div>
{:else}
  <!-- <a href="/auth/alipay">Alipay Login</a> -->
  <!-- <a href="/auth/sso">SSO Login</a> | -->
  <a class="btn btn-secondary m-auto !w-32 !max-w-32 !min-w-0 flex" href="/auth/github?redirect_uri=/en/auth">Github Login</a>

{/if}

## Installation

To use it, install it from npm (yarn or bun):

```bash
npm install @svelte-dev/auth @svelte-dev/session
```

## Usage

Here's an simple Example:

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

That's it.

## Advanced Usage

### Custom Handle

If you did not set `authRouting`. You need to add a login handler `src/routes/auth/[provider]/+server.ts`:

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

Then, add a callback handler `src/routes/auth/[provider]/callback/+server.ts.ts`:

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

### Strategies

| Package                                          | Meta                                                                                                                                                                                                                                                                                                                                                                                                                                         | Changelog                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [@svelte-dev/auth-oauth2](https://github.com/willin/svelte-turbo/tree/main/packages/auth-oauth2/) | [![npm](https://img.shields.io/npm/v/@svelte-dev/auth-oauth2?style=flat-square&logo=npm)](https://npmjs.org/package/@svelte-dev/auth-oauth2) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth-oauth2?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-oauth2) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth-oauth2?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-oauth2) | [Changelog](https://github.com/willin/svelte-turbo/tree/main/packages/auth-oauth2/CHANGELOG.md) |
| [@svelte-dev/auth-github](https://github.com/willin/svelte-turbo/tree/main/packages/auth-github/) | [![npm](https://img.shields.io/npm/v/@svelte-dev/auth-github?style=flat-square&logo=npm)](https://npmjs.org/package/@svelte-dev/auth-github) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth-github?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-github) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth-github?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-github) | [Changelog](https://github.com/willin/svelte-turbo/tree/main/packages/auth-github/CHANGELOG.md) |
| [@svelte-dev/auth-alipay](https://github.com/willin/svelte-turbo/tree/main/packages/auth-alipay/) | [![npm](https://img.shields.io/npm/v/@svelte-dev/auth-alipay?style=flat-square&logo=npm)](https://npmjs.org/package/@svelte-dev/auth-alipay) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth-alipay?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-alipay) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth-alipay?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-alipay) | [Changelog](https://github.com/willin/svelte-turbo/tree/main/packages/auth-alipay/CHANGELOG.md) |
| [@svelte-dev/auth-afdian](https://github.com/willin/svelte-turbo/tree/main/packages/auth-afdian/) | [![npm](https://img.shields.io/npm/v/@svelte-dev/auth-afdian?style=flat-square&logo=npm)](https://npmjs.org/package/@svelte-dev/auth-afdian) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth-afdian?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-afdian) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth-afdian?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-afdian) | [Changelog](https://github.com/willin/svelte-turbo/tree/main/packages/auth-afdian/CHANGELOG.md) |
| [@svelte-dev/auth-sso](https://github.com/willin/svelte-turbo/tree/main/packages/auth-sso/)       | [![npm](https://img.shields.io/npm/v/@svelte-dev/auth-sso?style=flat-square&logo=npm)](https://npmjs.org/package/@svelte-dev/auth-sso) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth-sso?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-sso) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth-sso?style=flat-square&label=down)](https://npmjs.org/package/@svelte-dev/auth-sso)                   | [Changelog](https://github.com/willin/svelte-turbo/tree/main/packages/auth-sso/CHANGELOG.md)    |

> Welcome to share your strategies here.

## TypeDocs

[API Spec](/docs/auth/)

## Sponsor

Owner： [Willin Wang](https://willin.wang)

Donation ways:

- Follow me: [@willin](https://github.com/willin) [![github](https://img.shields.io/- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
