import type { KVNamespace } from '@cloudflare/workers-types';
import type { FlashSessionData, SessionData, SessionStorageStrategy } from '../types.js';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Creates a SessionStorage that stores session data in the Clouldflare KV Store.
 *
 * The advantage of using this instead of cookie session storage is that
 * KV Store may contain much more data than cookies.
 */
export class CloudflareKVStrategy<
  Data = SessionData,
  FlashData = Data,
  CustomOptions = { namespace: string }
> implements SessionStorageStrategy<Data, FlashData>
{
  #kv: KVNamespace;
  constructor(event: RequestEvent, options: CustomOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#kv = event.platform?.env?.[options?.namespace ?? 'CACHE'];
  }
  /**
   * Creates a new record with the given data and returns the session id.
   */
  async createData(data, expires?: Date): Promise<string> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const randomBytes = new Uint8Array(8);
      crypto.getRandomValues(randomBytes);
      // This storage manages an id space of 2^64 ids, which is far greater
      // than the maximum number of files allowed on an NTFS or ext4 volume
      // (2^32). However, the larger id space should help to avoid collisions
      // with existing ids when creating new sessions, which speeds things up.
      const newId = [...randomBytes].map((x) => x.toString(16).padStart(2, '0')).join('');

      if (await this.#kv.get(newId, 'json')) {
        continue;
      }

      await this.#kv.put(newId, JSON.stringify(data), {
        expiration: expires ? Math.round(expires.getTime() / 1000) : undefined
      });

      return newId;
    }
  }

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  async readData(id: string): Promise<FlashSessionData<Data, FlashData> | null> {
    const session = await this.#kv.get(id);

    if (!session) {
      return null;
    }

    return JSON.parse(session);
  }

  /**
   * Updates data for the given session id.
   */
  async updateData(
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ): Promise<void> {
    await this.#kv.put(id, JSON.stringify(data), {
      expiration: expires ? Math.round(expires.getTime() / 1000) : undefined
    });
  }

  /**
   * Deletes data for a given session id from the data store.
   */
  async deleteData(id: string): Promise<void> {
    await this.#kv.delete(id);
  }
}
