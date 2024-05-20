import { openDB } from 'idb';

const DB_NAME = 'maplas_db'
const STORE_NAME = 'maplas_store'

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export async function get(key) {
  return (await dbPromise).get(STORE_NAME, key);
}
export async function set(key, val) {
  return (await dbPromise).put(STORE_NAME, val, key);
}
export async function del(key) {
  return (await dbPromise).delete(STORE_NAME, key);
}
export async function clear() {
  return (await dbPromise).clear(STORE_NAME);
}
export async function keys() {
  return (await dbPromise).getAllKeys(STORE_NAME);
}