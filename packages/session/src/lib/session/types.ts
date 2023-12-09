import type { RequestEvent } from '@sveltejs/kit';

/**
 * @hidden
 */
export type ImplementsOrExtends<L, R> = R & Pick<L, Exclude<keyof L, keyof R>>;

/**
 * @private
 */
export interface Constructable<T, P> {
  new (event: RequestEvent, options: P): T;
}

/**
 * @external
 * @protected
 */
export interface CookieOptions extends Omit<import('cookie').CookieSerializeOptions, 'encode'> {}

/**
 * @protected
 */
export interface SessionOptions {
  /**
   * The key of the cookie used to set the session data.
   *
   * @default __sid
   */
  key?: string;

  /**
   * An array of secrets that may be used to sign/unsign the value of a cookie.
   *
   * The array makes it easy to rotate secrets. New secrets should be added to
   * the beginning of the array. `cookie.serialize()` will always use the first
   * value in the array, but `cookie.parse()` may use any of them so that
   * cookies that were signed with older secrets still work.
   */
  secrets?: string[];
}

/**
 * @protected
 */
export interface AdapterOptions<Data = SessionData, FlashData = Data, CustomStrategyOptions = any> {
  /**
   * Use a built-in strategy
   * Available Values: `cookie`, `memory`, `cloudflare-kv`, `custom`
   * @default cookie
   */
  name?: string;
  /**
   * The Custom adapter to use for storing session data.
   *
   *  ```ts
   *  constructor(event: RequestEvent, options: YourConfigType & {session: SessionOptions; cookie: CookieOptions;}) {}
   *  ```
   */
  strategy?: Constructable<
    SessionStorageStrategy<Data, FlashData>,
    {
      cookie: CookieOptions;
      session: SessionOptions;
    } & AdapterOptions['options']
  >;
  /**
   * Options to pass to the adapter
   */
  options?: CustomStrategyOptions;
}

export interface SessionStorageOptions<
  Data = SessionData,
  FlashData = Data,
  CustomStrategyOptions = any
> {
  adapter?: AdapterOptions<Data, FlashData, CustomStrategyOptions>;
  cookie?: CookieOptions;
  session?: SessionOptions;
}

/**
 * @protected An object of name/value pairs to be used in the session.
 */
export type SessionData = {
  [name: string]: unknown;
};

/**
 * @hidden
 */
export type FlashDataKey<Key extends string> = `__flash_${Key}__`;

/**
 * @protected
 */
export type FlashSessionData<Data, FlashData> = Partial<
  Data & {
    [Key in keyof FlashData as FlashDataKey<Key & string>]: FlashData[Key];
  }
>;

/**
 * SessionStorageStrategy is designed to allow anyone to easily build their
 * own SessionStorage.
 *
 * This strategy describes a common scenario where the session id is stored in
 * a cookie but the actual session data is stored elsewhere, usually in a
 * database or on disk. A set of create, read, update, and delete operations
 * are provided for managing the session data.
 *
 * @example
 *
 * ```ts
 * import type { SessionStorageStrategy } from '@sveltejs/kit/session';
 *
 * export class CloudflareKVStrategy<Data = SessionData, FlashData = Data>
	implements SessionStorageStrategy<Data, FlashData>
 * {
 *	  constructor(event: RequestEvent, options: YourConfigType & {session: SessionOptions; cookie: CookieOptions;}) {}
 * }
 * ```
 */
export interface SessionStorageStrategy<Data = SessionData, FlashData = Data> {
  /**
   * Creates a new record with the given data and returns the session id.
   */
  createData: (data: FlashSessionData<Data, FlashData>, expires?: Date) => Promise<string>;

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  readData: (id: string) => Promise<FlashSessionData<Data, FlashData> | null>;

  /**
   * Updates data for the given session id.
   */
  updateData: (
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ) => Promise<void>;

  /**
   * Deletes data for a given session id from the data store.
   */
  deleteData: (id: string) => Promise<void>;
}
