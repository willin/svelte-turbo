import { describe, test, expect } from 'vitest';
import { sign, unsign } from './crypto.js';

describe('crypto', () => {
  const testText = 'test';
  const testSecret = 'test';
  const testValue = 'test.iM0hCLU0fZc885zfkFPX3UJwSHbYyam9ji0WglnT3fc';

  test('sign', async () => {
    const signed = await sign(testText, testSecret);
    expect(signed).toBe(testValue);
  });

  test('unsign', async () => {
    const unsigned = await unsign(testValue, testSecret);
    expect(unsigned).toBe(testText);
  });

  test('unsign', async () => {
    const unsigned = await unsign('test', testSecret);
    expect(unsigned).toBe(false);
  });
});
