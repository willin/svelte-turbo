import { describe, test, expect } from 'vitest';
import { Session } from './session.js';

describe(Session, () => {
  test('create session', async () => {
    const session = new Session();
    expect(session.id).toBe('');
    session.set('test', { test: 1 });
    expect(session.get('test')).toEqual({ test: 1 });
    session.flash('flash', { test: 2 });
    expect(session.get('flash')).toEqual({ test: 2 });
    expect(session.get('flash')).toBeUndefined();
    session.unset('test');
    expect(session.has('test')).toBe(false);
    expect(session.data).toEqual({});
  });
});
