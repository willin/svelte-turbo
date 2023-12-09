import type { FlashSessionData, SessionData, SessionStorageStrategy } from '../types.js';

const map = new Map<
  string,
  {
    data: any;
    expires?: Date;
  }
>();

/**
 * Creates and returns a simple in-memory SessionStorage object, mostly useful
 * for testing and as a reference implementation.
 *
 * Note: This storage does not scale beyond a single process, so it is not
 * suitable for most production scenarios.
 *
 */
export class MemoryStrategy<Data = SessionData, FlashData = Data>
  implements SessionStorageStrategy<Data, FlashData>
{
  constructor() {}
  /**
   * Creates a new record with the given data and returns the session id.
   */
  async createData(data, expires?: Date): Promise<string> {
    const id = Math.random().toString(36).substring(2, 10);
    map.set(id, { data, expires });
    return id;
  }

  /**
   * Returns data for a given session id, or `null` if there isn't any.
   */
  async readData(id: string): Promise<FlashSessionData<Data, FlashData> | null> {
    if (map.has(id)) {
      const { data, expires } = map.get(id)!;
      if (!expires || expires > new Date()) {
        return data;
      }
      // Remove expired session data.
      if (expires) map.delete(id);
    }
    return null;
  }

  /**
   * Updates data for the given session id.
   */
  async updateData(
    id: string,
    data: FlashSessionData<Data, FlashData>,
    expires?: Date
  ): Promise<void> {
    map.set(id, { data, expires });
  }

  /**
   * Deletes data for a given session id from the data store.
   */
  async deleteData(id: string): Promise<void> {
    map.delete(id);
  }
}
