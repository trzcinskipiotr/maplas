import leaflet from 'leaflet';
import * as idb from 'idb';

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

export async function getStorageLength() {
  const db = await openTilesDataBase();
  const result = await db.count(tileStoreName);
  return result;
}

export async function getAllKeys() {
  const db = await openTilesDataBase();
  const result = await db.getAllFromIndex(tileStoreName, urlTemplateIndex);
  const arr = [];
  for(const row of result) {
    arr.push(row.key);
  }
  return new Set(arr);
}

export async function getAllValues() {
  const db = await openTilesDataBase();
  const result = await db.getAllFromIndex(tileStoreName, urlTemplateIndex);
  return result;
}

export async function removeTile(key) {
  const db = await openTilesDataBase();
  const result = await db.delete(tileStoreName, key);
  return result;
}

let opfsRoot;

export async function saveTileToFile(tileInfo, blob) {
  if (! opfsRoot) {
    opfsRoot = await navigator.storage.getDirectory();
  }
  const fileHandle = await opfsRoot.getFileHandle('' + tileInfo.z + '_' + tileInfo.x + '_' + tileInfo.y, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function saveTile(tileInfo, blob) {
  const db = await openTilesDataBase();
  const result = await db.put(tileStoreName, {blob, ...tileInfo});
  return result;
}

async function hasTile(key) {
  const db = await openTilesDataBase();
  const result = await db.getKey(tileStoreName, key);
  return result !== undefined;
}

export async function truncate() {
  const db = await openTilesDataBase();
  const result = await db.clear(tileStoreName);
  return result;
}

async function getBlobByKey(key) {
  const db = await openTilesDataBase();
  const result = await db.get(tileStoreName, key);
  return result && result.blob;
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

function getTileUrl(urlTemplate, data) {
  return leaflet.Util.template(urlTemplate, {...data, r: leaflet.Browser.retina ? '@2x' : ''});
}

function getTilePoints(area, tileSize) {
  const points = [];
  if (!area.min || !area.max) {
    return points;
  }
  const topLeftTile = area.min.divideBy(tileSize.x).floor();
  const bottomRightTile = area.max.divideBy(tileSize.x).floor();
  for (let j = topLeftTile.y; j <= bottomRightTile.y; j += 1) {
    for (let i = topLeftTile.x; i <= bottomRightTile.x; i += 1) {
      points.push(new leaflet.Point(i, j));
    }
  }
  return points;
}

function getTilePointsCount(area, tileSize) {
  if (!area.min || !area.max) {
    return 0;
  }
  const topLeftTile = area.min.divideBy(tileSize.x).floor();
  const bottomRightTile = area.max.divideBy(tileSize.x).floor();
  return (bottomRightTile.y - topLeftTile.y + 1) * (bottomRightTile.x - topLeftTile.x + 1);
}


export class TileLayerOffline extends leaflet.TileLayer {

  createTile(coords, done) {
    const tile = document.createElement('img');
    leaflet.DomEvent.on(tile, 'load', leaflet.Util.bind(this._tileOnLoad, this, done, tile));
    leaflet.DomEvent.on(tile, 'error', leaflet.Util.bind(this._tileOnError, this, done, tile));
    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }
    tile.alt = '';
    tile.setAttribute('role', 'presentation');
    this.setDataUrl(coords).then(dataurl => tile.src = dataurl).catch(() => tile.src = this.getTileUrl(coords));
    return tile;
  }

  async setDataUrl(coords) {
    const key = this._getStorageKey(coords);
    const blob = await getBlobByKey(key);
    if (blob && typeof blob === 'object') {
      return URL.createObjectURL(blob);
    }
    throw new Error('tile not found in storage');
  }

  _getStorageKey(coords) {
    return getTileUrl(this._url, {...coords, ...this.options});
  }

  getTileUrls(bounds, zoom) {
    const tiles = [];
    const tilePoints = getTilePoints(bounds, this.getTileSize());
    for (let index = 0; index < tilePoints.length; index += 1) {
      const tilePoint = tilePoints[index];
      const data = {...this.options, x: tilePoint.x, y: tilePoint.y, z: zoom};
      tiles.push({
        key: getTileUrl(this._url, data),
        url: getTileUrl(this._url, data),
        z: zoom,
        x: tilePoint.x,
        y: tilePoint.y,
        urlTemplate: this._url,
        createdAt: Date.now()
      });
    }
    return tiles;
  }

  getTileUrlsCount(bounds) {
    return getTilePointsCount(bounds, this.getTileSize());
  }

}

function tileLayerOffline(url, options) {
  return new TileLayerOffline(url, options);
}

if (window.L) {
  window.L.tileLayer.offline = tileLayerOffline;
}

class ControlSaveTiles {

  constructor(map, baseLayer, options) {
    this.status = {
      _tilesforSave: [],
      lengthToBeSaved: 0,
      lengthLoadErrors: 0,
      lengthLoadedFromNetwork: 0,
      lengthLoadedFromCache: 0,
      lengthSaved: 0
    };
    this._baseLayer = baseLayer;
    this._map = map;
    this.tiles = [];
    this.options = {
      ...{
        saveWhatYouSee: false,
        bounds: null,
        parallel: 50,
        zoomlevels: undefined,
        alwaysDownload: true
      },
      ...options
    };

    document.worker.addEventListener('message', event => {
      const message = event.data;
      if (message == 'OK') {
        this.status.lengthLoadedFromNetwork += 1;
        this.status.lengthSaved += 1;
      }
      if (message == 'DOWNLOADERROR') {
        this.status.lengthLoadErrors += 1;
      }
      this._baseLayer.fire('refreshstatus', this.status);
      if (this.status.lengthSaved === this.status.lengthToBeSaved - this.status.lengthLoadErrors - this.status.lengthLoadedFromCache) {
        this._baseLayer.fire('saveend', this.status);
      }
      this.loadAndSaveTile(this.tiles);
    });
  }

  setLayer(layer) {
    this._baseLayer = layer;
  }

  _calculateTiles() {
    let tiles = [];
    const zoomlevels = this.options.zoomlevels;
    const latlngBounds = this.options.bounds || this._map.getBounds();
    for (let i = 0; i < zoomlevels.length; i += 1) {
      const area = leaflet.bounds(this._map.project(latlngBounds.getNorthWest(), zoomlevels[i]), this._map.project(latlngBounds.getSouthEast(), zoomlevels[i]));
      tiles = tiles.concat(this._baseLayer.getTileUrls(area, zoomlevels[i]));
    }
    return tiles;
  }

  calculateTilesCount() {
    let sum = 0;
    const zoomlevels = this.options.zoomlevels;
    const latlngBounds = this.options.bounds || this._map.getBounds();
    for (let i = 0; i < zoomlevels.length; i += 1) {
      const area = leaflet.bounds(this._map.project(latlngBounds.getNorthWest(), zoomlevels[i]), this._map.project(latlngBounds.getSouthEast(), zoomlevels[i]));
      sum = sum + this._baseLayer.getTileUrlsCount(area);
    }
    return sum;
  }

  _resetStatus(tiles) {
    this.status = {
      _tilesforSave: tiles,
      lengthToBeSaved: tiles.length,
      lengthLoadErrors: 0,
      lengthLoadedFromNetwork: 0,
      lengthLoadedFromCache: 0,
      lengthSaved: 0
    };
  }

  async loadAndSaveTile(tiles) {
    const t1 = Date.now();
    const tile = tiles.pop();
    if (tile === undefined) {
      return Promise.resolve();
    }
    document.worker.postMessage(tile);
    //const t2 = Date.now();
    //const blob = await this._loadTile(tile);
    //const t3 = Date.now();
    //await this._saveTile(tile, blob);
    //const t4 = Date.now();
    //if (blob) {
    //  await saveTileToFile(tile, blob);
    //}
    //const t5 = Date.now();
    //const poptime = t2 - t1;
    //const loadtime = t3 - t2;
    //const savetime = t4 - t3;
    //const savetime2 = t5 - t4;
    //console.log('TILE: ' + tile.url + ' times: ' + poptime + ' ' + loadtime + ' ' + savetime + ' ' + savetime2);
    //return this.loadAndSaveTile(tiles);
  };

  async saveTilesToDatabase(tiles) {
    this._baseLayer.fire('savestart', this.status);
    const parallel = Math.min(tiles.length, this.options.parallel);
    for (let i = 0; i < parallel; i += 1) {
      this.loadAndSaveTile(tiles);
    }
  };

  _saveTiles() {
    this.tiles = this._calculateTiles();
    this._resetStatus(this.tiles);  
    this.saveTilesToDatabase(this.tiles);
  }

  async _loadTile(tile) {
    let blob;
    const isTileInCache = await hasTile(tile.key);
    if ((this.options.alwaysDownload === true) || (isTileInCache === false)) {
      blob = await downloadTile(tile.url);
      if (blob) {
        this.status.lengthLoadedFromNetwork += 1; 
      } else {
        this.status.lengthLoadErrors += 1;
      }
    } else {
      this.status.lengthLoadedFromCache += 1;
    }
    this._baseLayer.fire('refreshstatus', this.status);
    return blob;
  }
  
  async _saveTile(tile, blob) {
    if (blob) {
      await saveTile(tile, blob);
      this.status.lengthSaved += 1;
    }
    this._baseLayer.fire('refreshstatus', this.status);
    if (this.status.lengthSaved === this.status.lengthToBeSaved - this.status.lengthLoadErrors - this.status.lengthLoadedFromCache) {
      this._baseLayer.fire('saveend', this.status);
    }
  }
}

export function createSaveTilesControl(map, baseLayer, options) {
  return new ControlSaveTiles(map, baseLayer, options);
}
