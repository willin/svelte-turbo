export type { SessionStorageOptions, SessionStorage } from '@svelte-dev/session';
/**
 * Extra information from the Authenticator to the strategy
 */
export interface AuthOptions {
  /**
   * The name used to register the strategy
   */
  name?: string;
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
   * If not defined, it will return the user data.
   */
  successRedirect?: string;
  /**
   * To what URL redirect in case of a failed authentication.
   * If not defined, it will return null
   */
  failureRedirect?: string;
  /**
   * Set if the strategy should throw an error instead of a Reponse in case of
   * a failed authentication.
   * @default true
   */
  throwOnError?: boolean;
}
