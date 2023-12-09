import type { SessionStorage } from '@svelte-dev/session';
import { json, redirect, type RequestEvent } from '@sveltejs/kit';
import { AuthorizationError } from './error.js';
import type { AuthOptions } from './types.js';

/**
 * A function which will be called to find the user using the information the
 * strategy got from the request.
 *
 * @param params The params from the strategy.
 * @returns The user data.
 * @throws {AuthorizationError} If the user was not found. Any other error will be ignored and thrown again by the strategy.
 */
export interface StrategyVerifyCallback<User, VerifyParams> {
  (params: VerifyParams): Promise<User>;
}

/**
 * The Strategy class is the base class every strategy should extend.
 *
 * This class receives two generics, a User and a VerifyParams.
 * - User is the type of the user data.
 * - VerifyParams is the type of the params the verify callback will receive from the strategy.
 *
 * This class also defines as protected two methods, `success` and `failure`.
 * - `success` is called when the authentication was successful.
 * - `failure` is called when the authentication failed.
 * These methods helps you return or throw the correct value, response or error
 * from within the strategy `authenticate` method.
 */
export abstract class Strategy<User, VerifyOptions> {
  /**
   * The name of the strategy.
   * This will be used by the Authenticator to identify and retrieve the
   * strategy.
   */
  public abstract name: string;

  public constructor(protected verify: StrategyVerifyCallback<User, VerifyOptions>) {}

  /**
   * The authentication flow of the strategy.
   *
   * This method receives the Request to authenticator and the session storage
   * to use from the Authenticator. It may receive a custom callback.
   *
   * At the end of the flow, it will return a Response to be used by the
   * application.
   */
  public abstract authenticate(event: RequestEvent, options: AuthOptions): Promise<User>;

  /**
   * Throw an AuthorizationError or a redirect to the failureRedirect.
   * @param message The error message to set in the session.
   * @param event The RequestEvent to get the session out of.
   * @param options The strategy options.
   * @throws {AuthorizationError} If the throwOnError is set to true.
   * @throws {Response} If the failureRedirect is set or throwOnError is false.
   * @returns {Promise<never>}
   */
  protected async failure(
    message: string,
    event: RequestEvent,
    options: AuthOptions,
    cause?: Error
  ): Promise<void> {
    // if a failureRedirect is not set, we throw a 401 Response or an error
    if (!options.failureRedirect) {
      if (options.throwOnError) throw new AuthorizationError(message, cause);
      throw json(
        { message },
        {
          status: 401
        }
      );
    }
    const session = (event.locals as any).session as SessionStorage;
    session.flash(options.sessionErrorKey ?? 'auth:error', { message });
    throw redirect(307, options.failureRedirect);
  }

  /**
   * Returns the user data or throw a redirect to the successRedirect.
   * @param user The user data to set in the session.
   * @param event The RequestEvent to get the session out of.
   * @param options The strategy options.
   * @returns {Promise<User>} The user data.
   * @throws {Response} If the successRedirect is set, it will redirect to it.
   */
  protected async success(user: User, event: RequestEvent, options: AuthOptions): Promise<User> {
    // if a successRedirect is not set, we return the user
    if (!options.successRedirect) return user;
    const session = (event.locals as any).session as SessionStorage;
    await session.set(options?.sessionKey ?? 'user', user);
    await session.set('strategy', this.name);
    throw redirect(307, options.successRedirect);
  }
}
