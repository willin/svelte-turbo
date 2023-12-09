import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type {
  CookieOptions,
  FlashSessionData,
  SessionData,
  SessionOptions,
  SessionStorageStrategy
} from '../types.js';
import { decodeCookieValue, encodeCookieValue } from '../utils.js';
import { sign, unsign } from '../crypto.js';

/**
 * @private
 */
export type CookieStrageOptions = {
  /**
   * Chunk data to multiple cookies
   */
  chunk?: boolean;
};

/**
 * Creates and returns a SessionStorage object that stores all session data
 * directly in the session cookie itself.
 *
 * This has the advantage that no database or other backend services are
 * needed, and can help to simplify some load-balanced scenarios. However, it
 * also has the limitation that serialized session data may not exceed the
 * browser's maximum cookie size. Trade-offs!
 *
 */
export class CookieStrategy<Data = SessionData, FlashData = Data>
  implements SessionStorageStrategy<Data, FlashData>
{
  #cookies: Cookies;
  #options: CookieOptions;
  #chunk: boolean;
  #secrets: string[];

  constructor(
    event: RequestEvent,
    options: CookieStrageOptions & { cookie: CookieOptions; session: SessionOptions }
  ) {
    this.#cookies = event.cookies;
    this.#options = options.cookie;
    this.#chunk = !!options?.chunk;
    this.#secrets = options?.session?.secrets ?? [];
  }
  /**
   * Creates a new record with the given data and returns the session id.
   */
  async createData(data, expires?: Date): Promise<string> {
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    // This storage manages an id space of 2^64 ids, which is far greater
    // than the maximum number of files allowed on an NTFS or ext4 volume
    // (2^32). However, the larger id space should help to avoid collisions
    // with existing ids when creating new sessions, which speeds things up.
    const id = [...randomBytes].map((x) => x.toString(16).padStart(2, '0')).join('');
    await this.updateData(id, data, expires);
    return id;
  }

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  async readData(id: string): Promise<FlashSessionData<Data, FlashData> | null> {
    let data: string;
    if (this.#chunk) {
      data = this.#getChunkedCookie(id);
    } else {
      data = this.#cookies.get(id) as string;
    }
    if (!data) return {};

    const result = await decodeCookieValue(unsign, data, this.#secrets);
    return result as any;
  }

  /**
   * Updates data for the given session id.
   */
  async updateData(
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ): Promise<void> {
    const encoded = await encodeCookieValue(sign, data, this.#secrets);
    if (!this.#chunk) {
      return this.#cookies.set(id, encoded, {
        ...this.#options,
        expires
      });
    }
    const chunkSize = 3950 - id.length;
    const chunks = this.#chunkString(encoded, chunkSize);
    for (let i = 0; i < chunks.length; i++) {
      this.#cookies.set(`${id}.${i}`, chunks[i], {
        ...this.#options,
        expires
      });
    }
  }

  /**
   * Deletes data for a given session id from the data store.
   */
  async deleteData(id: string): Promise<void> {
    this.#cookies.delete(id, this.#options);
  }

  #chunkString(str: string, chunkSize: number) {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += chunkSize) {
      chunks.push(str.substring(i, i + chunkSize));
    }
    return chunks;
  }

  #getChunkedCookie(id) {
    const allCookies = this.#cookies.getAll().filter((cookie) => cookie.name.startsWith(id));

    const chunks = allCookies.sort((a, b) => {
      const aIndex = Number(a.name.split('.')[1]);
      const bIndex = Number(b.name.split('.')[1]);
      return aIndex - bIndex;
    });

    return chunks.map((chunk) => chunk.value).join('');
  }
}
