import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession, type SessionStorageOptions } from '@svelte-dev/session';
import { Auth } from './auth.js';
import type { AuthOptions } from './types.js';

/**
 * Handle function for the auth package.
 * You do not need to use `handleSession()` if you use this function.
 * @example
 * const handle = handleAuth({
 *  // Session storage options
 *  adapter: {}, cookie: {}, session: {},
 *  // Auth Options
 *  autoRouting:true
 *  strategies: []
 * });
 */
export function handleAuth(
  options: AuthOptions & SessionStorageOptions,
  passedHandle: Handle = async ({ event, resolve }) => resolve(event)
): Handle {
  const { adapter, cookie, session, ...opts } = options;
  return sequence(
    handleSession({
      adapter,
      cookie,
      session
    }),
    async function handle({ event, resolve }) {
      const auth = new Auth(event, opts);
      (event.locals as any).auth = auth;
      await auth.handle(event);
      const response = await passedHandle({ event, resolve });
      return response;
    }
  );
}
