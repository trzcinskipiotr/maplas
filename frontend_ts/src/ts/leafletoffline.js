import leaflet from 'leaflet';

export async function getAllKeys() {
  // Przepisac
  //const db = await openTilesDataBase();
  //const result = await db.getAllFromIndex(tileStoreName, urlTemplateIndex);
  //const arr = [];
  //for(const row of result) {
  //    arr.push(row.key);
  //}
  //return new Set(arr);
}

export async function getAllValues() {
  // Przepisac
  //const db = await openTilesDataBase();
  //const result = await db.getAllFromIndex(tileStoreName, urlTemplateIndex);
  //return result;
}

export class TileLayerOffline extends leaflet.TileLayer {

  createTile(coords, done) {
    const tile = document.createElement('img');
    leaflet.DomEvent.on(tile, 'load', leaflet.Util.bind(this._tileOnLoad, this, done, tile));
    leaflet.DomEvent.on(tile, 'error', leaflet.Util.bind(this._tileOnError, this, done, tile));
    this.setDataUrl(coords).then((dataurl) => {
      tile.src = dataurl;
    }).catch(() => {
      tile.src = this.getTileUrl(coords);
    });
    return tile;
  }

  async openDirectory() {
    if (! this.directoryHandle) {
      this.opfsRoot = await navigator.storage.getDirectory();
      this.directoryHandle = await this.opfsRoot.getDirectoryHandle("leafletoffline", {create: true});
    }
  }
  
  createFileName(tileInfo) {
    return tileInfo.layerName + '_' + tileInfo.z + '_' + tileInfo.x + '_' + tileInfo.y;
  }

  async setDataUrl(coords) {
    coords['layerName'] = this.options.layerName;
    await this.openDirectory();
    try {
      const fileHandle = await this.directoryHandle.getFileHandle(this.createFileName(coords), { create: false });
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (error) {
      console.log(error);
      throw new Error('tile not found in storage');
    }
  }

  getAreaTilePoints(area, tileSize, countOnly) {
    const points = [];
    if (!area.min || !area.max) {
      return points;
    }
    const topLeftTile = area.min.divideBy(tileSize.x).floor();
    const bottomRightTile = area.max.divideBy(tileSize.x).floor();
    if (countOnly) {
      return (bottomRightTile.y - topLeftTile.y + 1) * (bottomRightTile.x - topLeftTile.x + 1);
    } else {
      for (let j = topLeftTile.y; j <= bottomRightTile.y; j += 1) {
        for (let i = topLeftTile.x; i <= bottomRightTile.x; i += 1) {
          points.push(new leaflet.Point(i, j));
        }
      }
      return points;
    }
  }

  getAreaTileUrls(bounds, zoom, countOnly, alwaysDownload, timestamp) {
    if (countOnly) {
      return this.getAreaTilePoints(bounds, this.getTileSize(), true);
    } else {
      const tiles = [];
      const tilePoints = this.getAreaTilePoints(bounds, this.getTileSize(), false);
      for (let index = 0; index < tilePoints.length; index += 1) {
        const tilePoint = tilePoints[index];
        const data = {x: tilePoint.x, y: tilePoint.y, z: zoom};
        console.log(data);
        console.log(leaflet.Util.template(this._url, data));
        tiles.push({url: leaflet.Util.template(this._url, data), z: zoom, x: tilePoint.x, y: tilePoint.y, layerName: this.options.layerName, alwaysDownload: alwaysDownload, timestamp: timestamp});
      }
      return tiles;
    }
  }
}

class ControlSaveTiles {

  constructor(map, baseLayer, options) {
    this.status = {tilesforSave: [], lengthToBeSaved: 0, lengthLoadErrors: 0, lengthLoadedFromNetwork: 0, lengthLoadedFromCache: 0, lengthSaved: 0};
    this.baseLayer = baseLayer;
    this.map = map;
    this.options = options;

    document.worker.addEventListener('message', event => {
      const eventType = event.data.event;
      const timestamp = event.data.timestamp;
      if (timestamp == this.processTimestamp) {
        if (eventType == 'OK') {
          this.status.lengthLoadedFromNetwork += 1;
          this.status.lengthSaved += 1;
        }
        if (eventType == 'TILEINCACHE') {
          this.status.lengthLoadedFromCache += 1;
        }
        if (eventType == 'DOWNLOADERROR') {
          this.status.lengthLoadErrors += 1;
        }
        this.baseLayer.fire('refreshstatus', this.status);
        if (this.status.lengthSaved === this.status.lengthToBeSaved - this.status.lengthLoadErrors - this.status.lengthLoadedFromCache) {
          this.baseLayer.fire('saveend', this.status);
        }
        this.loadAndSaveTile();
      }
    });
  }

  setLayer(layer) {
    this.baseLayer = layer;
  }

  calculateTiles(countOnly) {
    let tiles = [];
    let sum = 0;
    const zoomlevels = this.options.zoomlevels;
    const latlngBounds = this.map.getBounds();
    for (let i = 0; i < zoomlevels.length; i += 1) {
      const area = leaflet.bounds(this.map.project(latlngBounds.getNorthWest(), zoomlevels[i]), this.map.project(latlngBounds.getSouthEast(), zoomlevels[i]));
      if (countOnly) {
        sum = sum + this.baseLayer.getAreaTileUrls(area, zoomlevels[i], true, this.options.alwaysDownload, this.processTimestamp);
      } else {
        tiles = tiles.concat(this.baseLayer.getAreaTileUrls(area, zoomlevels[i], false, this.options.alwaysDownload, this.processTimestamp));
      }
    }
    if (countOnly) {
      return sum;
    } else {
      return tiles;
    }
  }

  resetStatus(tiles) {
    this.status = {tilesforSave: tiles, lengthToBeSaved: tiles.length, lengthLoadErrors: 0, lengthLoadedFromNetwork: 0, lengthLoadedFromCache: 0, lengthSaved: 0};
  }

  async loadAndSaveTile() {
    const tile = this.status.tilesforSave.pop();
    if (tile === undefined) {
      return Promise.resolve();
    }
    document.worker.postMessage(tile);
  };

  async saveTilesToCache() {
    this.baseLayer.fire('savestart', this.status);
    const parallel = Math.min(this.status.lengthToBeSaved, this.options.parallel);
    for (let i = 0; i < parallel; i += 1) {
      this.loadAndSaveTile();
    }
  };

  downloadStart() {
    this.processTimestamp = Date.now();
    const tiles = this.calculateTiles();
    this.resetStatus(tiles);  
    this.saveTilesToCache();
  }

  downloadCancel() {
    this.processTimestamp = null;
  }

  async openDirectory() {
    if (! this.directoryHandle) {
      this.opfsRoot = await navigator.storage.getDirectory();
      this.directoryHandle = await this.opfsRoot.getDirectoryHandle("leafletoffline", {create: true});
    }
  }

  async getStorageLength() {
    await this.openDirectory();
    const entries = await this.directoryHandle.values();
    let sum = 0;
    for await (const entry of entries) {
      sum = sum + 1;
    }
    return sum;
  }

  async storageTruncate() {
    await this.openDirectory();
    await this.directoryHandle.remove({recursive: true});
    this.directoryHandle = null;
    document.worker.postMessage({type: 'REOPEN'});
  }
}

function tileLayerOffline(url, options) {
  return new TileLayerOffline(url, options);
}

if (window.L) {
  window.L.tileLayer.offline = tileLayerOffline;
}

export function createSaveTilesControl(map, baseLayer, options) {
  return new ControlSaveTiles(map, baseLayer, options);
}
