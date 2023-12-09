import { describe, test, expect } from 'vitest';
import { SessionStorage } from '../storage.js';
import { MemoryStrategy } from './memory.js';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

describe(MemoryStrategy, () => {
  test('Create SessionStorage with CustomStrategy', () => {
    const cookies = {} as Cookies;
    const s = new SessionStorage({ cookies } as RequestEvent, {
      adapter: {
        name: 'custom',
        strategy: MemoryStrategy
      }
    });
    expect(s).toBeDefined();
  });

  const cookies = new Map<string, any>() as any as Cookies;

  test('Create SessionStorage with MemoryStrategy', async () => {
    const s = new SessionStorage({ cookies } as RequestEvent, {
      adapter: {
        name: 'memory'
      },
      cookie: {
        maxAge: 10
      }
    });
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
