import L from 'leaflet';
import {isPointInPolygon} from 'geolib';

//localforage.config({
//  name: 'leaflet_offline',
//  version: 1.0,
//  size: 4980736,
//  storeName: 'tiles',
//  description: 'the tiles',
//  driver: localforage.WEBSQL,
//});

/**
 * A layer that uses store tiles when available. Falls back to online.
 * Use this layer directly or extend it
 * @class TileLayerOffline
 */
var TileLayerOffline = L.TileLayer.extend(/** @lends  TileLayerOffline */ {
  /**
  * Create tile HTMLElement
  * @private
  * @param  {array}   coords [description]
  * @param  {Function} done   [description]
  * @return {HTMLElement}          [description]
  */
  createTile: function createTile(coords, done) {
    var tile = L.TileLayer.prototype.createTile.call(this, coords, done);
    var url = tile.src;
    tile.src = '';
    this.setDataUrl(tile, url).then(function (dataurl) {
      tile.src = dataurl;
    }).catch(function () {
      tile.src = url;
    });
    return tile;
  },
  /**
   * dataurl from localstorage
   * @param {DomElement} tile [description]
   * @param {string} url  [description]
   * @return {Promise} resolves to base64 url
   */
  setDataUrl: function setDataUrl(tile, url) {
    var this$1 = this;

    return new Promise(function (resolve, reject) {
      const db = window.getDB(this$1._getStorageKey(url));
      db.getItem(this$1._getStorageKey(url)).then(function (data) {
        if (data && typeof data === 'object') {
          resolve(URL.createObjectURL(data));
        } else {
          reject();
        }
      }).catch(function (e) { reject(e); });
    });
  },
  /**
   * get key to use for storage
   * @private
   * @param  {string} url url used to load tile
   * @return {string} unique identifier.
   */
  _getStorageKey: function _getStorageKey(url) {
    var key;
    var subdomainpos = this._url.indexOf('{s}');
    if (subdomainpos > 0) {
      key = url.substring(0, subdomainpos) +
        this.options.subdomains['0'] +
        url.substring(subdomainpos + 1, url.length);
    }
    return key || url;
  },
  /**
   * @return {number} Number of simultanous downloads from tile server
   */
  getSimultaneous: function getSimultaneous() {
    //return this.options.subdomains.length;
    return this.options.sims;
  },

  getIndexSetForArea: function(bounds, zoom, area) {
    let tileBounds = null;
    if (area) {
      return area.tileZoomIndexes[zoom];
    } else {
      tileBounds = L.bounds(
        bounds.min.divideBy(this.getTileSize().x).floor(),
        bounds.max.divideBy(this.getTileSize().x).floor()
      );
      const indexSet = new Set();
      for (let j = tileBounds.min.y; j <= tileBounds.max.y; j += 1) {
        for (let i = tileBounds.min.x; i <= tileBounds.max.x; i += 1) {
          indexSet.add([i, j]);
        }
      }
      return indexSet;
    }
  },

  getUrlsForAreaZooms: function getUrlsForAreaZooms(zoomMin, zoomMax, area) {
    var this$1 = this;
    var tiles = [];
    var origurl = this._url;
    // getTileUrl uses current zoomlevel, we want to overwrite it
    for(let zoom = zoomMin; zoom <= zoomMax; zoom++) {
      this.setUrl(origurl.replace('{z}', zoom), true);
      const indexSet = this.getIndexSetForArea(null, zoom, area);
      for (const index of indexSet) {
        const tilePoint = new L.Point(index[0], index[1]);
        const url = L.TileLayer.prototype.getTileUrl.call(this$1, tilePoint);
        tiles.push({
          key: this$1._getStorageKey(url),
          url: url,
        });
      }
    }
    // restore url
    this.setUrl(origurl, true);
    return tiles;
  },

  /**
   * getTileUrls for single zoomlevel
   * @param  {object} L.latLngBounds
   * @param  {number} zoom
   * @return {object[]} the tile urls, key, url
   */
  getTileUrls: function getTileUrls(bounds, zoom, area) {
    var this$1 = this;

    var tiles = [];
    var origurl = this._url;
    // getTileUrl uses current zoomlevel, we want to overwrite it
    this.setUrl(this._url.replace('{z}', zoom), true);
    const indexSet = this.getIndexSetForArea(bounds, zoom, area);
    for (const index of indexSet) {
      const tilePoint = new L.Point(index[0], index[1]);
      const url = L.TileLayer.prototype.getTileUrl.call(this$1, tilePoint);
      tiles.push({
        key: this$1._getStorageKey(url),
        url: url,
      });
    }
    // restore url
    this.setUrl(origurl, true);
    return tiles;
  },
});

/**
* Tiles removed event
* @event storagesize
* @memberof TileLayerOffline
* @type {object}
*/

/**
 * Start saving tiles
 * @event savestart
 * @memberof TileLayerOffline
 * @type {object}
 */

/**
 * Tile fetched
 * @event loadtileend
 * @memberof TileLayerOffline
 * @type {object}
 */

/**
 * All tiles fetched
 * @event loadend
 * @memberof TileLayerOffline
 * @type {object}
 */

/**
 * Tile saved
 * @event savetileend
 * @memberof TileLayerOffline
 * @type {object}
 */

/**
 * All tiles saved
 * @event saveend
 * @memberof TileLayerOffline
 * @type {object}
 */

/**
 * Tile removed
 * @event tilesremoved
 * @memberof TileLayerOffline
 * @type {object}
 */


/**
 * @function L.tileLayer.offline
 * @param  {string} url     [description]
 * @param  {object} options {@link http://leafletjs.com/reference-1.2.0.html#tilelayer}
 * @return {TileLayerOffline}      an instance of TileLayerOffline
 */
L.tileLayer.offline = function (url, options) { return new TileLayerOffline(url, options); };

/**
 * Status of ControlSaveTiles, keeps info about process during downloading
 * ans saving tiles. Used internal and as object for events.
 * @typedef {Object} ControlStatus
 * @property {number} storagesize total number of saved tiles.
 * @property {number} lengthToBeSaved number of tiles that will be saved in db
 * during current process
 * @property {number} lengthSaved number of tiles saved during current process
 * @property {number} lengthLoaded number of tiles loaded during current process
 * @property {array} _tilesforSave tiles waiting for processing
 */

/**
 * Shows control on map to save tiles
 * @class ControlSaveTiles
 *
 * @property {ControlStatus} status
 */
var ControlSaveTiles = L.Control.extend(
  /** @lends ControlSaveTiles */ {
    options: {
      position: 'topleft',
      saveText: '+',
      rmText: '-',
      maxZoom: 19,
      saveWhatYouSee: false,
      bounds: null,
      confirm: null,
      confirmRemoval: null,
    },
    status: {
      storagesize: null,
      lengthToBeSaved: null,
      lengthInDB: null,
      lengthSaved: null,
      lengthLoaded: null,
      _tilesforSave: null,
    },
    obj: {},
    /**
     * @private
     * @param  {Object} baseLayer
     * @param  {Object} options
     * @return {void}
     */
    initialize: function initialize(baseLayer, options) {
      this._baseLayer = baseLayer;
      this.setStorageSize();
      L.setOptions(this, options);
    },
    /**
     * Set storagesize prop on object init
     * @param {Function} [callback] receives arg number of saved files
     * @private
     */
    setStorageSize: function setStorageSize(callback) {
      var self = this;
      if (this.status.storagesize) {
        callback(this.status.storagesize);
        return;
      }
      self.status.storagesize = 0;
      const promises = [];
      for(const db of window.dbs) {
        promises.push(db.length());
      }
      Promise.all(promises).then((values) => {
        let sum = 0;
        for(const value of values) {
          sum = sum + value;
        }
        self.status.storagesize = sum;
        self._baseLayer.fire('storagesize', self.status);
        if (callback) {
          callback(sum);
        }
      });
    },
    /**
     * get number of saved files
     * @param  {Function} callback [description]
     * @private
     */
    getStorageSize: function getStorageSize(callback) {
      this.setStorageSize(callback);
    },
    /**
     * Change baseLayer
     * @param {TileLayerOffline} layer
     */
    setLayer: function setLayer(layer) {
      this._baseLayer = layer;
    },
    /**
     * set the bounds of the area to save
     * @param {L.latLngBounds} bounds
     */
    setBounds: function setBounds(bounds) {
      this.options.bounds = bounds;
    },
    /**
     * set saveWhatYouSee
     * @param {boolean} saveWhatYouSee
     */
    setSaveWhatYouSee: function setSaveWhatYouSee(saveWhatYouSee) {
      this.options.saveWhatYouSee = saveWhatYouSee;
    },
    /**
     * set the maxZoom
     * @param {number} zoom
     */
    setMaxZoom: function setMaxZoom(zoom) {
      this.options.maxZoom = zoom;
    },
    /**
     * set the zoomLevels
     * @param {array} zoomlevels min,max
     */
    setZoomlevels: function setZoomlevels(zoomlevels) {
      this.options.zoomlevels = zoomlevels;
    },
    onAdd: function onAdd() {
      //var container = L.DomUtil.create('div', 'savetiles leaflet-bar');
      var container = L.DomUtil.create('span');
      var ref = this;
      var options = ref.options;
      //this._createButton(options.saveText, 'savetiles', container, this._saveTiles);
      //this._createButton(options.rmText, 'rmtiles', container, this._rmTiles);
      return container;
    },
    _createButton: function _createButton(html, className, container, fn) {
      var link = L.DomUtil.create('a', className, container);
      link.innerHTML = html;
      link.href = '#';

      L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
        .on(link, 'click', L.DomEvent.stop)
        .on(link, 'click', fn, this)
        .on(link, 'click', this._refocusOnMap, this);
      // TODO enable disable on layer change map

      return link;
    },
    /**
     * starts processing tiles
     * @private
     * @return {void}
     */
    _saveTiles: async function _saveTiles(useCache, area) {
      this.obj = {};
      const sim = this._baseLayer.getSimultaneous();
      for(let i = 0; i < sim; i++) {
        this.obj[i] = {};
        for (let index = 0; index < window.dbCount; index++) {
          this.obj[i][index] = {};
        }
      }
      var this$1 = this;

      var bounds;
      var tiles = [];
      // minimum zoom to prevent the user from saving the whole world
      var minZoom = 5;
      // current zoom or zoom options
      var zoomlevels = [];

      if (this.options.saveWhatYouSee) {
        var currentZoom = this._map.getZoom();
        if (currentZoom < minZoom) {
          throw new Error("It's not possible to save with zoom below level 5.");
        }
        var ref = this.options;
        var maxZoom = ref.maxZoom;

        for (var zoom = currentZoom; zoom <= maxZoom; zoom += 1) {
          zoomlevels.push(zoom);
        }
      } else {
        zoomlevels = this.options.zoomlevels || [this._map.getZoom()];
      }

      var latlngBounds = this.options.bounds || this._map.getBounds();

      for (var i = 0; i < zoomlevels.length; i += 1) {
        bounds = L.bounds(
          this$1._map.project(latlngBounds.getNorthWest(), zoomlevels[i]),
          this$1._map.project(latlngBounds.getSouthEast(), zoomlevels[i])
        );
        tiles = tiles.concat(this$1._baseLayer.getTileUrls(bounds, zoomlevels[i], area));
      }
      if (useCache) {
        let lengthInDB = 0;
        const promises = [];
        let keys = [];
        for(const db of window.dbs) {
          promises.push(db.keys());
        }
        const values = await Promise.all(promises);
        for(const value of values) {
          keys = keys.concat(value);
        }
        const newTiles = [];
        const cacheKeysSet = new Set(keys);
        for (const tile of tiles) {
          if (cacheKeysSet.has(tile.key)) {
            lengthInDB += 1;
          } else {
            newTiles.push(tile);
          }
        }
        this._resetStatus(newTiles);
        this.status.lengthInDB = lengthInDB;
      } else {
        this._resetStatus(tiles);
      }
      var succescallback = function () {
        this$1._baseLayer.fire('savestart', this$1.status);
        var subdlength = this$1._baseLayer.getSimultaneous();
        let atLeastOne = false;
        for (var i = 0; i < Math.min(subdlength, this$1.status._tilesforSave.length); i += 1) {
          this$1._loadTile(this$1.obj[i]);
          atLeastOne = true;
        }
        if (atLeastOne === false) {
          this$1._baseLayer.fire('saveend', this$1.status);
          this$1._baseLayer.fire('loadend', this$1.status);
          this$1._baseLayer.fire('notilestosave', this$1.status);
        }
      };
      if (this.options.confirm) {
        this.options.confirm(this.status, succescallback);
      } else {
        succescallback();
      }
    },
    /**
     * set status prop on save init
     * @param {string[]} tiles [description]
     * @private
     */
    _resetStatus: function _resetStatus(tiles) {
      this.status = {
        lengthLoaded: 0,
        lengthToBeSaved: tiles.length,
        lengthInDB: 0,
        lengthSaved: 0,
        _tilesforSave: tiles,
      };
    },
    _readFile: function _readFile(data){
      return new Promise((resolve, reject) => {
        const fr = new FileReader();  
        fr.onload = () => {
          resolve(fr.result)
        };
        fr.readAsDataURL(data);
      });
    },
    /**
     * Loop over status._tilesforSave prop till all tiles are downloaded
     * Calls _saveTile for each download
     * @private
     * @param  {string} tileUrl
     * @return {void}
     */
    _loadTile: function _loadTile(data) {
      var self = this;
      var tileUrl = self.status._tilesforSave.shift();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', tileUrl.url);
      xhr.responseType = 'blob';
      xhr.send();
      xhr.onreadystatechange = async function () {
        if (xhr.readyState === XMLHttpRequest.DONE && (xhr.status >= 200 && xhr.status <= 300)) {
          self.status.lengthLoaded += 1;
          const toSave = await self._readFile(xhr.response);
          const blobRegex = toSave.match('data:(.*);base64,(.*)');
          const dbIndex = window.getDBIndex(tileUrl.key);
          data[dbIndex][tileUrl.key] = '__lfsc__:blob~~local_forage_type~' + blobRegex[1] + '~' + blobRegex[2];
          //self._saveTile(tileUrl.key, xhr.response);
          if (Object.keys(data[dbIndex]).length >= 100) {
            const db = window.getDB(tileUrl.key);
            await db.setItems(data[dbIndex]);
            self.status.lengthSaved += Object.keys(data[dbIndex]).length;
            for(let i = 0; i < Object.keys(data[dbIndex]).length; i++) {
              self._baseLayer.fire('savetileend', self.status);
            }
            if (self.status.lengthSaved === self.status.lengthToBeSaved) {
              self._baseLayer.fire('saveend', self.status);
              self.setStorageSize();
            }
            data[dbIndex] = {};
          }
          if (self.status._tilesforSave.length > 0) {
            self._baseLayer.fire('loadtileend', self.status);
            self._loadTile(data);
          } else {
            self._baseLayer.fire('loadtileend', self.status);
            if (self.status.lengthLoaded === self.status.lengthToBeSaved) {
              self._baseLayer.fire('loadend', self.status);
            }
            for (let index = 0; index < window.dbCount; index++) {
              const db = window.dbs[index];
              await db.setItems(data[index]);
              self.status.lengthSaved += Object.keys(data[index]).length;
              for(let i = 0; i < Object.keys(data[index]).length; i++) {
                self._baseLayer.fire('savetileend', self.status);
              }
              if (self.status.lengthSaved === self.status.lengthToBeSaved) {
                self._baseLayer.fire('saveend', self.status);
                self.setStorageSize();
              }
              data[index] = {};
            }
          }
          return;
        }
        if (xhr.readyState === XMLHttpRequest.DONE) {
          self._baseLayer.fire('loadtileenderror', self.status);
          for (let index = 0; index < window.dbCount; index++) {
            const db = window.dbs[index];
            await db.setItems(data[index]);
            self.status.lengthSaved += Object.keys(data[index]).length;
            for(let i = 0; i < Object.keys(data[index]).length; i++) {
              self._baseLayer.fire('savetileend', self.status);
            }
            if (self.status.lengthSaved === self.status.lengthToBeSaved) {
              self._baseLayer.fire('saveend', self.status);
              self.setStorageSize();
            }
            data[index] = {};
          }
          console.error(("Request failed with status " + (xhr.status)));
          self._loadTile(data);
        }
      };
    },
    /**
     * [_saveTile description]
     * @private
     * @param  {string} tileUrl save key
     * @param  {blob} blob    [description]
     * @return {void}         [description]
     */
    _saveTile: function _saveTile(tileUrl, blob) {
      var self = this;
      const db = window.getDB(tileUrl);
      db
        .removeItem(tileUrl)
        .then(function () {
          db
            .setItem(tileUrl, blob)
            .then(function () {
              self.status.lengthSaved += 1;
              self._baseLayer.fire('savetileend', self.status);
              if (self.status.lengthSaved === self.status.lengthToBeSaved) {
                self._baseLayer.fire('saveend', self.status);
                self.setStorageSize();
              }
            })
            .catch(function (err) {
              throw new Error(err);
            });
        })
        .catch(function (err) {
          throw new Error(err);
        });
    },
    _rmTiles: function _rmTiles() {
      var self = this;
      var successCallback = function () {
        const promises = [];
        for(const db of window.dbs) {
          promises.push(db.clear());
        }
        Promise.all(promises).then((values) => {
          self.status.storagesize = 0;
          self._baseLayer.fire('tilesremoved');
          self._baseLayer.fire('storagesize', self.status);
        });
      };
      if (this.options.confirmRemoval) {
        this.options.confirmRemoval(this.status, successCallback);
      } else {
        successCallback();
      }
    },
  });
/**
 * @function L.control.savetiles
 * @param  {object} baseLayer     {@link http://leafletjs.com/reference-1.2.0.html#tilelayer}
 * @property {Object} options
 * @property {string} [options.position] default topleft
 * @property {string} [options.saveText] html for save button, default +
 * @property {string} [options.rmText] html for remove button, deflault -
 * @property {number} [options.maxZoom] maximum zoom level that will be reached
 * when saving tiles with saveWhatYouSee. Default 19
 * @property {boolean} [options.saveWhatYouSee] save the tiles that you see
 * on screen plus deeper zooms, ignores zoomLevels options. Default false
 * @property {function} [options.confirm] function called before confirm, default null.
 * Args of function are ControlStatus and callback.
 * @property {function} [options.confirmRemoval] function called before confirm, default null
 * @return {ControlSaveTiles}
 */
L.control.savetiles = function (baseLayer, options) { return new ControlSaveTiles(baseLayer, options); };