import type { FlashDataKey, FlashSessionData, SessionData } from './types.js';

function flashKey<Key extends string>(name: Key): FlashDataKey<Key> {
  return `__flash_${name}__`;
}

/**
 * @private Session persists data across HTTP requests.
 */
export class Session<Data = SessionData, FlashData = Data> {
  readonly #id: string;
  #data: Map<keyof Data | FlashDataKey<keyof FlashData & string>, any>;

  constructor(initialData: Partial<Data> = {}, id = '') {
    this.#id = id;
    this.#data = new Map(Object.entries(initialData)) as Map<
      keyof Data | FlashDataKey<keyof FlashData & string>,
      any
    >;
  }

  /**
   * A unique identifier for this session.
   *
   * Note: This will be the empty string for newly created sessions and
   * sessions that are not backed by a database (i.e. cookie-based sessions).
   */
  get id(): string {
    return this.#id;
  }

  /**
   * The raw data contained in this session.
   *
   * This is useful mostly for SessionStorage internally to access the raw
   * session data to persist.
   */
  get data(): FlashSessionData<Data, FlashData> {
    return Object.fromEntries(this.#data) as FlashSessionData<Data, FlashData>;
  }

  /**
   * Returns `true` if the session has a value for the given `name`, `false`
   * otherwise.
   */
  has(name: (keyof Data | keyof FlashData) | string): boolean {
    return (
      this.#data.has(name as keyof Data) ||
      this.#data.has(flashKey(name as keyof FlashData & string))
    );
  }

  /**
   * Returns the value for the given `name` in this session.
   */
  get<Key extends (keyof Data | keyof FlashData) & string>(
    name: Key
  ):
    | (Key extends keyof Data ? Data[Key] : undefined)
    | (Key extends keyof FlashData ? FlashData[Key] : undefined)
    | undefined {
    if (this.#data.has(name as keyof Data)) return this.#data.get(name as keyof Data);

    const flashName = flashKey(name as keyof FlashData & string);
    if (this.#data.has(flashName)) {
      const value = this.#data.get(flashName);
      this.#data.delete(flashName);
      return value;
    }

    return undefined;
  }

  /**
   * Sets a value in the session for the given `name`.
   */
  set<Key extends keyof Data & string>(name: Key, value: Data[Key]): void {
    this.#data.set(name, value);
  }

  /**
   * Sets a value in the session that is only valid until the next `get()`.
   * This can be useful for temporary values, like error messages.
   */
  flash<Key extends keyof FlashData & string>(name: Key, value: FlashData[Key]): void {
    this.#data.set(flashKey(name), value);
  }

  /**
   * Removes a value from the session.
   */
  unset(name: keyof Data & string): void {
    this.#data.delete(name);
  }
}
