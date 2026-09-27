export interface PostDraft {
  id: string;
  userId: string;
  kind?: 'post' | 'soult';
  content: string;
  category: string | null;
  audience?: 'PUBLIC' | 'REAL_FRIENDS' | 'PRIVATE';
  files: File[];
  duration?: number;
  updatedAt: number;
}

const DB_NAME = 'soul-post-drafts';
const STORE_NAME = 'drafts';

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason: unknown) => void) => void): Promise<T> {
  return openDraftDb().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    let value: T;
    tx.oncomplete = () => { db.close(); resolve(value); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('Não foi possível salvar o rascunho.')); };
    operation(tx.objectStore(STORE_NAME), result => { value = result; }, reject);
  }));
}

export const draftService = {
  async list(userId: string): Promise<PostDraft[]> {
    const all = await run<PostDraft[]>('readonly', (store, resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as PostDraft[]);
      request.onerror = () => reject(request.error);
    });
    return all.filter(draft => draft.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  save(draft: PostDraft): Promise<void> {
    return run<void>('readwrite', (store, resolve, reject) => {
      const request = store.put(draft);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  delete(id: string): Promise<void> {
    return run<void>('readwrite', (store, resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
