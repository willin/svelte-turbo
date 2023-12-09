import { beforeAll } from 'vitest';
import crypto from 'node:crypto';

beforeAll(() => {
  if (!globalThis.crypto)
    // @ts-expect-error type
    globalThis.crypto = crypto;
});
