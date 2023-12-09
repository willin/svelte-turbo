import { describe, test, expect } from 'vitest';
import { SessionStorage } from '../storage.js';
import type { RequestEvent } from '@sveltejs/kit';
import { KVNamespace } from '@miniflare/kv';
import { MemoryStorage } from '@miniflare/storage-memory';
import { CookieStrategy } from './cookie.js';

const data = new Map<string, any>();

describe(CookieStrategy, () => {
  test('Create SessionStorage with Cookie Session', async () => {
    const s = new SessionStorage(
      {
        cookies: {
          get(key) {
            return data.get(key);
          },
          set(key, value) {
            return data.set(key, value);
          },
          delete(key) {
            return data.delete(key);
          },
          getAll() {
            return [...data.entries()].map(([key, value]) => ({ name: key, value }));
          }
        },
        platform: {
          env: {
            kv: new KVNamespace(new MemoryStorage())
          }
        }
      } as any as RequestEvent,
      {
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
          path: '/'
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
