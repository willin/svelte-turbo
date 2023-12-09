import { describe, test, expect } from 'vitest';
import { SessionStorage } from './storage.js';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

describe(SessionStorage, () => {
  test('SessionStorage', () => {
    const cookies = {} as Cookies;
    const s = new SessionStorage({ cookies } as RequestEvent);
    expect(s).toBeDefined();
  });
});
