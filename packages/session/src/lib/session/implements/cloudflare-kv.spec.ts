import { describe, test, expect } from 'vitest';
import { SessionStorage } from '../storage.js';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { KVNamespace } from '@miniflare/kv';
import { MemoryStorage } from '@miniflare/storage-memory';
import { CloudflareKVStrategy } from './cloudflare-kv.js';

describe(CloudflareKVStrategy, () => {
  test('Create SessionStorage with Cloudflare KV', async () => {
    const cookies = new Map<string, any>() as any as Cookies;
    const s = new SessionStorage(
      {
        cookies,
        platform: {
          env: {
            kv: new KVNamespace(new MemoryStorage())
          }
        }
      } as any as RequestEvent,
      {
        adapter: {
          name: 'cloudflare-kv',
          options: {
            namespace: 'kv'
          }
        },
        cookie: {
          maxAge: 1000
        }
      }
    );
    expect(s).toBeDefined();
    // Throw before init
    expect(() => s.sid).toThrowError();
    expect(() => s.data).toThrowError();
    expect(() => s.get('key')).toThrowError();
    await expect(() => s.set('key', 'value')).rejects.toThrow();
    await expect(() => s.flash('key', 'value')).rejects.toThrow();

    await expect(() => s.unset('key')).rejects.toThrow();
    await expect(() => s.destory()).rejects.toThrow();
    await s.init();
    await s.init();
    // Change a new Sid
    const sid = s.sid;
    await s.updateSid('new');
    await s.updateSid('new', {});
    expect(s.sid).not.toEqual(sid);
    expect(s.data).toBeDefined();
    await s.set('test', 'test');
    const result = await s.get('test');
    expect(result).toBe('test');
    await s.flash('flash', 'test');
    const flash = await s.get('flash');
    expect(flash).toBe('test');
    await s.unset('test');
    const deleted = await s.get('test');
    expect(deleted).toBe(undefined);
    await s.destory();
  });
});
