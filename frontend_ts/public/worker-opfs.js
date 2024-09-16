let opfsRoot;
let directoryHandle;


async function openDirectory() {
  if (! directoryHandle) {
    opfsRoot = await navigator.storage.getDirectory();
    directoryHandle = await opfsRoot.getDirectoryHandle("leafletoffline", {create: true});
  }
}

function createFileName(tileInfo) {
  return tileInfo.layerName + '_' + tileInfo.z + '_' + tileInfo.x + '_' + tileInfo.y;
}
  
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

async function checkTileInCache(tileInfo, blob) {
  try {
    await openDirectory();
    const fileHandle = await directoryHandle.getFileHandle(createFileName(tileInfo), { create: false });
    return true;  
  } catch {
    return false;
  }
}
  
async function saveTileToCache(tileInfo, blob) {
  await openDirectory();
  const fileHandle = await directoryHandle.getFileHandle(createFileName(tileInfo), { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
  
addEventListener('message', async event => {
  const tileInfo = event.data;
  if (event.data.type == 'REOPEN') {
    directoryHandle = null;
  } else {
    const t1 = Date.now();
    const tileExists = await checkTileInCache(tileInfo);
    const t2 = Date.now();
    const checkCacheTime = t2 - t1;
    if ((! tileExists) || (tileInfo.alwaysDownload)) {
      try {
        const blob = await downloadTile(tileInfo.url);
        const t3 = Date.now();
        const downloadTileTime = t3 - t2;
        if (blob) {
          await saveTileToCache(tileInfo, blob);
          const t4 = Date.now();
          const saveTileTime = t4 - t3;
          console.log(tileInfo.url + ': downloaded, times: ' + checkCacheTime + ' ' + downloadTileTime + ' ' + saveTileTime);
          postMessage({event: 'OK', timestamp: tileInfo.timestamp});
        } else {
          postMessage({event: 'DOWNLOADERROR', timestamp: tileInfo.timestamp});
        }
      } catch {
        postMessage({event: 'DOWNLOADERROR', timestamp: tileInfo.timestamp});
      }
    } else {
      postMessage({event: 'TILEINCACHE', timestamp: tileInfo.timestamp});
      console.log(tileInfo.url + ': in cache, times: ' + checkCacheTime);
    }
  }
});