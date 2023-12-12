import type { SessionStorage } from '@svelte-dev/session';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { Strategy } from './strategy.js';
import type { AuthenticateOptions, AuthOptions } from './types.js';

export class Auth<User = unknown> {
  /**
   * A map of the configured strategies, the key is the name of the strategy
   * @private
   */
  #strategies = new Map<string, Strategy<User, never>>();
  #options: AuthOptions<User>;
  #session: SessionStorage;

  constructor(event: RequestEvent, options: AuthOptions<User> = {}) {
    this.#options = options;
    this.#session = (event.locals as any)?.session;
    options.strategies?.forEach((strategy) => {
      strategy.setAuthOptions(options);
      this.use(strategy);
    });
    (event.locals as any).user = this.#session.get(options.sessionKey ?? 'user');
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
    options: AuthenticateOptions
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

  /**
   * Inject handlers for /auth/[provider] &&
   * /auth/[provider]/callback Routes
   */
  async handle(event: RequestEvent) {
    const inject = this.#options.autoRouting ?? true;
    if (!inject || !event.url.pathname.startsWith('/auth')) {
      return;
    }
    const params = event.url.pathname.split('/');
    if (params.length !== 3 || params.length !== 4) {
      // /auth
      return;
    }
    if (!this.#strategies.keys().includes(params[2])) {
      // /auth/invalid-provider
      return;
    }
    if (params.length === 4 && params[3] !== 'callback') {
      // /auth/provider/invalid-path
      return;
    }
    if ((event.locals as any).user) {
      throw redirect(307, this.#options.successRedirect ?? '/');
    }
    const idx = params.findIndex((x) => x === 'auth') + 1;
    const provider = idx > 0 && idx < params.length ? params[idx] : '';
    if (!provider) {
      throw redirect(307, this.#options.failureRedirect ?? '/');
    }

    await this.authenticate(event, provider, {
      successRedirect: this.#options.successRedirect ?? '/',
      failureRedirect: this.#options.failureRedirect ?? '/'
    });
  }
}
