export async function getAllKeys() {
  const promises = [];
  let keys = [];
  for (const db of window.dbs) {
    promises.push(db.keys());
  }
  const values = await Promise.all(promises);
  for (const value of values) {
    keys = keys.concat(value);
  }
  const cacheKeysSet = new Set(keys);
  return cacheKeysSet;
}

export async function removeKeyFromDB(key: string) {
  const db = window.getDB(key);
  await db.removeItem(key);
  return true;
}

export async function countKeysInDBs() {
  const promises = [];
  const result: number[] = [];
  for (const db of window.dbs) {
    promises.push(db.length());
  }
  const values = await Promise.all(promises);
  for (const value of values) {
    result.push(value);
  }
  return result;
}

export async function countKeysInDBsSum() {
  const promises = [];
  let sum = 0;
  for (const db of window.dbs) {
    promises.push(db.length());
  }
  const values = await Promise.all(promises);
  for (const value of values) {
    sum = sum + value;
  }
  return sum;
}

export async function clearDBs() {
  const promises = [];
  for (const db of window.dbs) {
    promises.push(db.clear());
  }
  const values = await Promise.all(promises);
  return true;
}