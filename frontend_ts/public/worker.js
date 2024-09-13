if (typeof idb === "undefined") {
  self.importScripts('idb.js');
}

let opfsRoot;

async function downloadTile(tileUrl) {
  try {
    const response = await fetch(tileUrl);
    if (!response.ok) {
      console.log(`Request ${tileUrl} failed with status ${response.statusText}`);
      return null;
    } else {
      const blob = await response.blob();
      return blob;
    }
  } catch (error) {
    console.log(`Request ${tileUrl} failed with error ${error}`);
    return null;
  }
}

const tileStoreName = 'tileStore';
const urlTemplateIndex = 'urlTemplate';

let dbPromise;
function openTilesDataBase() {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = idb.openDB('leaflet.offline', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const tileStore = db.createObjectStore(tileStoreName, {
          keyPath: 'key'
        });
        tileStore.createIndex(urlTemplateIndex, 'urlTemplate');
        tileStore.createIndex('z', 'z');
      }
    }
  });
  return dbPromise;
}

async function saveTileToDatabase(tileInfo, blob) {
  const db = await openTilesDataBase();
  const result = await db.put(tileStoreName, {blob, ...tileInfo});
  return result;
}

async function saveTileToFile(tileInfo, blob) {
  if (! opfsRoot) {
    opfsRoot = await navigator.storage.getDirectory();
  }
  const fileHandle = await opfsRoot.getFileHandle('' + tileInfo.z + '_' + tileInfo.x + '_' + tileInfo.y, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

addEventListener('message', event => {
    const tile = event.data;
    const t2 = Date.now();
    downloadTile(tile.url).then((blob) => {
      const t3 = Date.now();
      if (blob) {
        saveTileToDatabase(tile, blob).then(() => {
          const t4 = Date.now();
          const loadTime = t3 - t2;
          const saveTime = t4 - t3;
          console.log(tile.url + ': ' + loadTime + ' ' + saveTime);
          postMessage('OK');
          //saveTileToFile(tile, blob).then(() => {
          //  const t5 = Date.now();
          //  const saveTime2 = t5 - t4;
          //})
        })
      } else {
        postMessage('DOWNLOADERROR');
      }
    }).catch((error) => {
      postMessage('DOWNLOADERROR');
    })
});