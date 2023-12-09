import type { Handle } from '@sveltejs/kit';
import type { SessionStorageOptions } from './types.js';
import { SessionStorage } from './storage.js';

export function handleSession(
  options: SessionStorageOptions,
  passedHandle: Handle = async ({ event, resolve }) => resolve(event)
): Handle {
  return async function handle({ event, resolve }) {
    const session = new SessionStorage(event, options);
    await session.init();

    (event.locals as any).session = session;

    const response = await passedHandle({ event, resolve });

    return response;
  };
}
