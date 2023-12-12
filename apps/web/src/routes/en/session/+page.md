---
title: '@svelte-dev/session'
desc: A simple and easy-to-use Svelte Session storage management library
---

<script>
   import { page } from "$app/stores"
</script>

## Overview

Sessions are an important part of websites that allow the server to identify requests coming from the same person, especially when it comes to server-side form validation or when JavaScript is not on the page. Sessions are a fundamental building block of many sites that let users "log in", including social, e-commerce, business, and educational websites.

Svelte-Session comes with several pre-built session storage options for common scenarios, and one to create your own:

- custom storage with `createCustomStrategy`
- `CookieSessionStrategy`
- `MemoryStrategy`
- `CloudflareKVStrategy` (Cloudflare Workers)

## Demo

## Installation

To use it, install it from `npm` (`yarn` or `bun`):

```bash
npm add @svelte-dev/session
```

## Demo

<div class="flex justify-center">
  <div class="stats shadow">
    <div class="stat">
      <div class="stat-title">You have visited</div>
      <div class="stat-value">{$page.data.views}</div>
      <div class="stat-desc">Refresh to check</div>
    </div>
  </div>
</div>

## Usage

Init from `hooks.server.ts`:

```ts
import { handleSession } from '@svelte-dev/session';

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
  }
});
```

### Svelte 5

Load Data from `+page.server.ts`:

```ts
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const views = locals.session.get('views') ?? 0;
  await locals.session.set('views', views + 1);
  return {};
};
```

Use in `svelte5` runes component:

```svelte
<script>
  let { data } = $props();
</script>

{data.session.views}
```

### Svelte 4

Load Data from `+page.server.ts`:

```ts
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const views = locals.session.get('views') ?? 0;
  await locals.session.set('views', views + 1);
  return { views };
};
```

Use in `svelte4` component:

```svelte
<script>
  import { page } from '$app/stores';
</script>

{$page.data.views}
```

## Advanced Usage

### Cloudflare KV

Init from `hooks.server.ts`:

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

Checkout the docs for more details: <https://kit.svelte.dev/docs/adapter-cloudflare#bindings>

### Custom Handler

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
		// event.locals is populated with the session `event.locals.session`
		// Do anything you want here
		return resolve(event);
	}
);
```

In case you're using [sequence()](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence), do this

```ts
const sessionHandler = handleSession({
  adapter: {
    name: 'cookie',
    options: {
      chunk: true
    }
  }
});

export const handle = sequence(sessionHandler, ({ resolve, event }) => {
  // event.locals is populated with the session `event.locals.session`
  // event.locals is also populated with all parsed cookies by handleSession, it would cause overhead to parse them again - `event.locals.cookies`.
  // Do anything you want here
  return resolve(event);
});
```

### Typescript

Here's a simple example, modify `app.d.ts`:

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

### Create your own stragety

Interface:

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

A simple example:

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

## TypeDocs

[API Spec](/docs/session/)

## Sponsor

Owner： [Willin Wang](https://willin.wang)

Donation ways:

- Follow me:[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## License

Apache-2.0
