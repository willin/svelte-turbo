import type { SessionStorage } from '@svelte-dev/session';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { Strategy } from './strategy.js';
import type { AuthOptions } from './types.js';

export class Auth<User = unknown> {
  /**
   * A map of the configured strategies, the key is the name of the strategy
   * @private
   */
  #strategies = new Map<string, Strategy<User, never>>();
  #session: SessionStorage;

  constructor(event: RequestEvent) {
    this.#session = (event.locals as any)?.session;
  }

  /**
   * Call this method with the Strategy, the optional name allows you to setup
   * the same strategy multiple times with different names.
   * It returns the Authenticator instance for concatenation.
   * @example
   * auth
   *  .use(new SomeStrategy({}, (user) => Promise.resolve(user)))
   *  .use(new SomeStrategy({}, (user) => Promise.resolve(user)), "another");
   */
  use(strategy: Strategy<User, never>, name?: string): Auth<User> {
    this.#strategies.set(name ?? strategy.name, strategy);
    return this;
  }

  /**
   * Call this method with the name of the strategy you want to remove.
   * It returns the Authenticator instance for concatenation.
   * @example
   * auth.unuse("another").unuse("some");
   */
  unuse(name: string): Auth<User> {
    this.#strategies.delete(name);
    return this;
  }

  /**
   * Call this to authenticate a request using some strategy. You pass the name
   * of the strategy you want to use and the request to authenticate.
   * @example
   * async function action({ locals }: RequestEvent) {
   *   return locals.auth.authenticate("some", {
   *     successRedirect: "/private",
   *     failureRedirect: "/login",
   *   });
   * };
   */
  async authenticate(
    event: RequestEvent,
    strategy: string,
    options: AuthOptions
  ): Promise<User | void> {
    const strategyObj = this.#strategies.get(strategy);
    if (!strategyObj) throw new Error(`Strategy ${strategy} not found.`);
    return strategyObj.authenticate(event, {
      ...options,
      name: strategy
    });
  }

  /**
   * Destroy the user session throw a redirect to another URL.
   * @example
   *   await auth.logout({ redirectTo: "/login" });
   */
  async logout(options: { redirectTo: string }): Promise<never> {
    await this.#session.destory();
    throw redirect(307, options.redirectTo);
  }
}
