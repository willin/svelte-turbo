// export type { SessionStorageOptions, SessionStorage } from '@svelte-dev/session';
import type { Strategy } from './strategy.js';

/**
 * The options for the Auth class
 */
export interface AuthOptions<User = any, VerifyOptions = any> {
  /**
   * Auto inject handlers for /auth/[provider] &&
   * /auth/[provider]/callback Routes
   * @default true
   */
  autoRouting?: boolean;
  /**
   * The strategies to use
   */
  strategies?: Strategy<User, VerifyOptions>[];
  /**
   * The key of the session used to set the user data.
   * @default "user"
   */
  sessionKey?: string;
  /**
   * In what key of the session the errors will be set.
   * @default "auth:error"
   */
  sessionErrorKey?: string;
  /**
   * The key of the session used to set the strategy used to authenticate the
   * user.
   */
  sessionStrategyKey?: string;
  /**
   * To what URL redirect in case of a successful authentication.
   * If not defined, it will return User data. AutoRouting default '/'
   */
  successRedirect?: string;
  /**
   * To what URL redirect in case of a failed authentication.
   * If not defined, it will return null. AutoRouting default '/'
   */
  failureRedirect?: string;
  /**
   * Set if the strategy should throw an error instead of a Reponse in case of
   * a failed authentication.
   * @default true
   */
  throwOnError?: boolean;
}

/**
 * Extra information from the Authenticator to the strategy
 */
export interface AuthenticateOptions {
  /**
   * The name used to register the strategy
   */
  name?: string;
  /**
   * The key of the session used to set the user data.
   * @default "user"
   */
  sessionKey?: AuthOptions['sessionKey'];
  /**
   * To what URL redirect in case of a successful authentication.
   * If not defined, it will return the user data.
   */
  successRedirect?: AuthOptions['successRedirect'];
  /**
   * To what URL redirect in case of a failed authentication.
   * If not defined, it will return null
   */
  failureRedirect?: AuthOptions['failureRedirect'];
  /**
   * Set if the strategy should throw an error instead of a Reponse in case of
   * a failed authentication.
   * @default true
   */
  throwOnError?: AuthOptions['throwOnError'];
}
