/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { Auth } from '$lib/auth/auth.ts';
import type { SessionStorage } from '@svelte-dev/session';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      lang: string;
      auth: Auth;
      session: SessionStorage<{ user: any }>;
      user?:
        | {
            invalid?: boolean;
            [key: string]: unknown;
          }
        | unknown;
    }
    // interface PageData {}
    interface Platform {
      env: {
        GITHUB_ID: string;
        GITHUB_SECRET: string;
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
