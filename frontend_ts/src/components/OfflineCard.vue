<template>
  <div>
    <div ref="messageDiv" class="alertmessage" style="display: none">
      <div ref="messageClass" class="alert border border-dark" role="alert">
        <span ref="message"></span>&nbsp;
        <span style="cursor: pointer" aria-hidden="true" @click="$refs.messageDiv.style.display = 'none'">&times;</span>
      </div>
    </div>
    <div class="card">
      <div class="card-header py-2">
        {{ $t('offlineMaps' )}}
      </div>
      <div class="card-body p-2">
        {{ $t('zoomFrom') }} <select v-model="$store.state.minimalZoom">
          <option v-for="zoom in allowMinimalZoom" :value="zoom" :key="zoom">{{ zoom }}</option>
        </select>
        {{ $t('zoomTo') }} <select v-model="$store.state.maximalZoom">
          <option v-for="zoom in allowMaximalZoom" :value="zoom" :key="zoom">{{ zoom }}</option>
        </select><br><br>  
        <button :disabled="exporting || importing || deleting || saving || counting" class="btn btn-primary btn-sm" @click="exportOffline">
          <font-awesome-icon v-if="exporting" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('exportOffline') }}
        </button>&nbsp;
        <button :disabled="exporting || importing || deleting || saving || counting" class="btn btn-primary btn-sm" @click="openImportFileInput">
          <font-awesome-icon v-if="importing" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('importOffline') }}
        </button><br><br>
        <button :disabled="exporting || importing || deleting || saving || counting" class="btn btn-primary btn-sm" @click="downloadOffline">
          <font-awesome-icon v-if="saving" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('downloadOffline') }}
        </button>&nbsp;
        <button :disabled="exporting || importing || deleting || saving || counting" class="btn btn-primary btn-sm" @click="deleteOffline">
          <font-awesome-icon v-if="deleting" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('deleteOffline') }}
        </button>&nbsp;
        <button :disabled="exporting || importing || deleting || saving || counting" class="btn btn-primary btn-sm" @click="countOffline">
          <font-awesome-icon v-if="counting" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('countOffline') }}
        </button><br><br>
        {{ $t('threads') }} <select v-model="$store.state.downloadThreads">
          <option v-for="thread in allowDownloadThreads" :value="thread" :key="thread">{{ thread }}</option>
        </select>&nbsp;
        {{ $t('selectArea') }} <select v-model="area">
          <option :value="null" :key="0">Widoczny obszar</option>
          <option v-for="area in $store.state.areas" :value="area" :key="area.unique">{{ area.name }}</option>
        </select><br>
        <b-form-checkbox style="display: inline;" v-model="useCache">
        </b-form-checkbox>{{ $t('useCache') }}<br><br>
        {{ $t('showZoom') }} <select v-model="showZoom">
          <option v-for="zoom in allowZoomToShow" :value="zoom" :key="zoom">{{ zoom }}</option>
        </select>&nbsp;
        <font-awesome-icon v-if="showZoomLoading" class="fa-spin" icon="spinner" />&nbsp;<button class="btn btn-primary btn-sm" @click="toggleOffline">
          {{ offlineShowing ? $t('hideOffline') : $t('showOffline') }}
        </button><br><br>
        <input id="importFileInputOffline" style="display:none;" type="file" accept=".txt" v-on:change="importFile" />
      </div>
    </div>    
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import localforage from 'localforage';
import { formatDateSeconds } from '@/ts/utils';
import { AlertStatus } from '@/ts/types';
import streamSaver from 'streamsaver';
import FileSaver from 'file-saver';
import { TranslateResult } from 'vue-i18n';
import { point } from 'leaflet';
import Area from '@/ts/Area';

@Component
export default class OfflineCard extends BaseComponent {

  private allowMinimalZoom = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  private exporting = false;
  private importing = false;
  private saving = false;
  private deleting = false;
  private counting = false;
  private totalImported = 0;
  private layerName = '';
  private allowDownloadThreads = [1, 3, 5, 10, 20, 30, 40, 50];
  private useCache = true;
  private area: Area = null;

  private CHUNKSIZE = 1024 * 1024 * 100;

  private setMessageClass(className: string) {
    (this.$refs.messageClass as HTMLElement).className = 'alert border border-dark '+ className;
  }

  private showMessage(message: string | TranslateResult) {
    (this.$refs.message as HTMLElement).innerHTML = (message as string);
  }

  private showMessageDiv(message: string | TranslateResult) {
    (this.$refs.messageDiv as HTMLElement).style.display = 'block';
    this.showMessage(message);
    this.setMessageClass('alert-success');
  }

  private showMessageError(message: string | TranslateResult) {
    (this.$refs.messageDiv as HTMLElement).style.display = 'block';
    this.showMessage(message);
    this.setMessageClass('alert-danger');
  }

  private openImportFileInput() {
    $('#importFileInputOffline').click();
  }

  @Watch('$store.state.minimalZoom')
  private onMinimalZoomChanged() {
    if (this.$store.state.maximalZoom < this.$store.state.minimalZoom) {
      this.$store.state.maximalZoom = this.$store.state.minimalZoom;
    }
  }

  private get allowMaximalZoom() {
    const allow = [];
    for(let i = this.$store.state.minimalZoom; i <= 19; i++) {
      allow.push(i);
    }
    return allow;
  }

  private get allowZoomToShow() {
    const allow = [];
    for(let i = 5; i <= 19; i++) {
      allow.push(i);
    }
    return allow;
  }


  private downloadOffline() {
    if ((this.layerName == 'OpenStreetMapOffline') || (this.layerName == 'OpenCycleMapOffline') || (this.layerName == 'ESRI imaginary Offline') || (this.layerName == 'Google satellite Offline')) {
      this.saving = true;
      this.$store.state.offlineControl._baseLayer.options.sims = this.$store.state.downloadThreads;
      setTimeout(() => this.$store.state.offlineControl._saveTiles(this.useCache, this.area), 100);
    } else {
      this.showMessageError(this.$t('mapNotOffline'));
    }
  }

  private deleteOffline() {
    this.deleting = true;
    this.$store.state.offlineControl._baseLayer.on('tilesremoved', () => {
      this.deleting = false;
      this.showMessageDiv(this.$t('allBitmapsRemoved'))
    });
    this.$store.state.offlineControl._rmTiles();
  }

  private countOffline() {
    this.counting = true;
    this.$store.state.offlineControl.getStorageSize((size: number) => {
      this.showMessageDiv(this.$t('bitmapInDatabase', [size]));
      this.counting = false;
    });
  }

  private readFile(data: any){
    return new Promise((resolve, reject) => {
      const fr = new FileReader();  
      fr.onload = () => {
        resolve(fr.result)
      };
      fr.readAsDataURL(data);
    });
  }

  private async exportOffline() {
    this.exporting = true;
    this.showMessageDiv(this.$t('starting'));
    const encode = TextEncoder.prototype.encode.bind(new TextEncoder);
    const date = formatDateSeconds(new Date());
    const fileStream = streamSaver.createWriteStream('offline_maps_' + date + '.txt');
    const writer = fileStream.getWriter();
    let dbIndex = 1;
    for(const db of window.dbs) {
      const results = await db.getItems(null);
      let done = 0;
      let total = 0;
      for (const result in results) {
        total = total + 1;
      }
      let lineToSave = '';
      for (const result in results) {
        const data = results[result];
        const reader = new FileReader();
        const b64 = await this.readFile(data) as string;
        lineToSave = lineToSave + result + '$' + b64 + '#';
        done = done + 1;
        if ((lineToSave.length > 1024*1024*50) || (done === total)) {
          writer.write(encode(lineToSave));
          lineToSave = '';
        }
        this.showMessage('' + dbIndex + '/' + window.dbCount + ': ' + done + '/' + total)
      }
      dbIndex = dbIndex + 1;
    }
    writer.close();
    this.exporting = false;
  }

  private async exportOfflineAtOnce() {
    this.exporting = true;
    this.showMessageDiv(this.$t('starting'));
    const date = formatDateSeconds(new Date());
    const results = await localforage.getItems(null);
    let tmpStr = '';
    let done = 0;
    let total = 0;
    for (const result in results) {
      total = total + 1;
    }
    if (total > 0) {
      for (const result in results) {
        const data = results[result];
        const reader = new FileReader();
        reader.onload = () => {
          let b64 = reader.result as string
          let lineToSave = result + '$' + b64 + '#';
          tmpStr = tmpStr + lineToSave; 
          done = done + 1;
          if (done === total) {
            this.saveFile(tmpStr, 'offline_maps_' + date + '.txt');
            this.exporting = false;
          }
          this.showMessage('' + done + '/' + total)
        }
        reader.readAsDataURL(data);
      }
    } else {
      this.exporting = false;
      this.showMessageError(this.$t('noBitmapsToExport'));
    }
  }

  private saveFile(data: any, name: any) {
    const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, name);
  }

  private async setOnItem(key: string, value: any) {
    const response = await fetch(value);
    const blob = await response.blob();
    const result = await localforage.setItem(key, blob);
  }

  private async importToDB(file: File, startByte: number, result: string) {
    const obj: any = {}
    for (let index = 0; index < window.dbCount; index++) {
      obj[index] = {};
    }
    const tab = result.split('#');
    if (! result.endsWith('#')) {
      this.showMessageError(this.$t('importToDBError'));
      return;
    }
    const total = tab.length - 1;
    for (const el of tab) {
      const tab2 = el.split('$');
      if (tab2.length === 2) {
        const key = tab2[0];
        const value = tab2[1];
        const blobRegex = value.match('data:(.*);base64,(.*)');
        const dbIndex = window.getDBIndex(key);
        obj[dbIndex][key] = '__lfsc__:blob~~local_forage_type~' + blobRegex[1] + '~' + blobRegex[2];
        this.totalImported = this.totalImported + 1;
        const MBs = Math.round((startByte + result.length) / (1024 * 1024))
        this.showMessage(this.$t('importProgressLine', [MBs, this.totalImported]));
      } else {
        if (! (el.length === 0)) {
          this.showMessageError(this.$t('importToDBError'));
          return;
        }
      }
    }
    const promises = [];
    for (let index = 0; index < window.dbCount; index++) {
      const db = window.dbs[index] as LocalForage;
      const promise = db.setItems(obj[index]);
      promises.push(promise);
    }
    Promise.all(promises).then(() => {
      this.processFile(file, startByte + result.length);
    });
  }

  private processFile(file: File, startByte: number) {
    const size = file.size;
    if (startByte === file.size) {
      this.importing = false;
      $('#importFileInputOffline')!.val('');
      return;
    }
    let chunk = file.slice(startByte, startByte + this.CHUNKSIZE);
    const addedChunk = file.slice(startByte + this.CHUNKSIZE, startByte + this.CHUNKSIZE + (1024 * 1024));
    const addedChunkReader = new FileReader();
    addedChunkReader.onload = (event: Event) => {
      const smallResult = addedChunkReader.result as string;
      const firstHashIndex = smallResult.indexOf('#');
      if (firstHashIndex >= 0) {
        chunk = file.slice(startByte, startByte + this.CHUNKSIZE + firstHashIndex + 1);
      } else {
        chunk = file.slice(startByte, startByte + this.CHUNKSIZE + (1024 * 1024));
      }
      const reader = new FileReader();
      reader.onload = (onLoadEvent: Event) => {
        const result = reader.result as string;
        this.importToDB(file, startByte, result);
      }
      reader.onerror = (event: Event) => {
        this.showMessageError(this.$t('importToDBError'));
      }
      reader.readAsText(chunk);
    };
    addedChunkReader.onerror = (event: Event) => {
      this.showMessageError(this.$t('importToDBError'));
    }
    addedChunkReader.readAsText(addedChunk);
  }

  private importFile(event: Event) {
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      this.createAlert(AlertStatus.danger, this.$t('importNoFiles').toString(), 2000);
      return;
    }
    this.importing = true;
    this.totalImported = 0;
    for (const file of files) {
      this.showMessageDiv(this.$t('starting'));
      this.processFile(file, 0);
    }
  }

  private currentLayer: L.Layer = null;
  private showZoom = 18;

  private onBaseLayerChange(e: L.LayersControlEvent) {
    this.layerName = e.name;
    let progress: number;
    let errors: number;
    let totalToSave: number;
    const offlineControl = this.$store.state.offlineControl;
    this.currentLayer = this.$store.state.baseMaps[this.layerName];
    if (this.offlineShowing) {
      this.removeShowOffline();
      this.showShowOffline();
    }
    if ((this.layerName == 'OpenStreetMapOffline') || (this.layerName == 'OpenCycleMapOffline') || (this.layerName == 'ESRI imaginary Offline') || (this.layerName == 'Google satellite Offline')) {
      offlineControl.setLayer(this.$store.state.baseMaps[this.layerName]);
      offlineControl._baseLayer.on('savestart', (e: any) => {
        progress = 0;
        errors = 0;
        totalToSave = e._tilesforSave.length;
        this.showMessageDiv('' + progress + '/' + totalToSave);
      });
      offlineControl._baseLayer.on('savetileend', () => {
        progress += 1;
        if (errors) {
          this.showMessage('' + progress + '/' + totalToSave + ' (' + this.$t('bitmapDownloadErrors') + ': ' + errors + ')');
        } else {
          this.showMessage('' + progress + '/' + totalToSave);
        }
        if (progress === totalToSave) {
          this.saving = false;
        }
      });
      offlineControl._baseLayer.on('notilestosave', () => {
        this.saving = false;
      });
      offlineControl._baseLayer.on('loadtileenderror', () => {
        errors += 1;
        progress += 1;
        if (errors) {
          this.showMessage('' + progress + '/' + totalToSave + ' (' + this.$t('bitmapDownloadErrors') + ': ' + errors + ')');
        } else {
          this.showMessage('' + progress + '/' + totalToSave);
        }
        if (progress === totalToSave) {
          this.saving = false;
        }
      });
    }
  }

  @Watch('$store.state.map')
  private onStoreMapChanged() {
    this.$store.state.map.on('baselayerchange', this.onBaseLayerChange);
    this.currentLayer = this.$store.state.baseMaps['OpenStreetMap'];
  }

  @Watch('$store.state.offlineControl')
  private onStoreOfflineControlChange() {
    this.$store.state.offlineControl.options.confirm = (layer, succescallback) => {
      const firstUrl = layer._tilesforSave[0] ? layer._tilesforSave[0].key : '';
      if (window.confirm(this.$t('saveAllTitles', [layer._tilesforSave.length, this.$store.state.offlineControl.options.zoomlevels, firstUrl, layer.lengthInDB]))) {
        succescallback();
      } else {
        this.saving = false;
      }
    };
    this.$store.state.offlineControl.options.confirmRemoval = (layer, successCallback) => {
      this.$store.state.offlineControl.getStorageSize((size) => {
        if (window.confirm(this.$t('removeAllTitles', [size]))) {
          successCallback();
        } else {
          this.deleting = false;
        }
      });
    };
  }

  private showOfflineLayer: any = null;
  private offlineShowing = false;
  private rects = [];

  public onDrawLayer(info: any) {
    let ctx = info.canvas.getContext('2d');
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    for(const rect of this.rects) {
      const point1 = (info.layer._map as L.Map).latLngToContainerPoint([rect[0].lat, rect[0].lng]);
      const point2 = info.layer._map.latLngToContainerPoint([rect[1].lat, rect[1].lng]);
      ctx.fillRect(point1.x, point1.y, (point2.x - point1.x), (point2.y - point1.y));
    }
  };

  @Watch('showZoom')
  private onShowZoomChanged() {
    if (this.offlineShowing) {
      this.removeShowOffline();
      this.showShowOffline();
    }
  }

  private removeShowOffline() {
    this.rects = [];
    this.showOfflineLayer.removeFrom(this.$store.state.map);
    this.showOfflineLayer = null;
  }

  private showZoomLoading = false;

  private async showShowOffline() {
    this.rects = [];
    if ((this.currentLayer) && (this.showZoom)) {
      setTimeout(() => {this.showZoomLoading = true}, 0);
      let url = this.currentLayer._url;
      const subdomainpos = url.indexOf('{s}');
      if (subdomainpos > 0) {
        url = url.substring(0, subdomainpos) + this.currentLayer.options.subdomains['0'] + url.substring(subdomainpos + 3, url.length);
      }
      url = (url as string).replace('{z}', this.showZoom);
      url = url.replace('{x}', '(.*)');
      url = url.replace('{y}', '(.*)');
      url = url.replace('?', '\\?');
      const regex = url;
      const promises = [];
      let keys: string[] = [];
      for(const db of window.dbs) {
        promises.push(db.keys());
      }
      const values = await Promise.all(promises);
      for(const value of values) {
        keys = keys.concat(value);
      }
      let indexes: any = [];
      let xindexes: any = {};
      for(const key of keys) {
        const match = key.match(regex);
        if (match) {
          const x = parseInt(match[1]);
          const y = parseInt(match[2]);
          indexes.push([x, y]);
          if (! (x in xindexes)) {
            xindexes[x] = [];
          }
          xindexes[x].push(y);
        }
      }
      for(const index in xindexes) {
        xindexes[index] = xindexes[index].sort()
      }
      const ranges = [];
      for(const index in xindexes) {
        let lastValue = xindexes[index][0];
        let rangeStart = lastValue;
        let rangeEnd = lastValue;
        let firstDone = false;
        for(const y of xindexes[index]) {
          if (firstDone) {
            if (y === lastValue + 1) {
              rangeEnd = y;
              lastValue = y;
            } else {
              ranges.push([parseInt(index), rangeStart, rangeEnd]);
              rangeStart = y;
              rangeEnd = y;
              lastValue = y;
            }
          } else {
            firstDone = true;
          }
        }
        ranges.push([parseInt(index), rangeStart, rangeEnd]);
      }
      this.rects = [];
      //for (const index of indexes) {
      //  const map = this.$store.state.map as L.Map;
      //  const point1 = new L.Point(index[0] * 256, index[1] * 256);
      //  const point2 = new L.Point(index[0] * 256 + 256, index[1] * 256 + 256);
      //  const latlng1 = map.unproject(point1, this.showZoom);
      //  const latlng2 = map.unproject(point2, this.showZoom);
      //  this.rects.push([latlng1, latlng2]);
      //}
      for (const range of ranges) {
        const map = this.$store.state.map as L.Map;
        const point1 = new L.Point(range[0] * 256, range[1] * 256);
        const point2 = new L.Point(range[0] * 256 + 256, range[2] * 256 + 256);
        const latlng1 = map.unproject(point1, this.showZoom);
        const latlng2 = map.unproject(point2, this.showZoom);
        this.rects.push([latlng1, latlng2]);
      }
      this.showZoomLoading = false;
    }
    this.showOfflineLayer = L.canvasLayer();
    this.showOfflineLayer.delegate(this).addTo(this.$store.state.map);
    this.showOfflineLayer._onLayerDidMove();
    this.showOfflineLayer.needRedraw();
  }

  private async toggleOffline() {
    if (this.offlineShowing) {
      this.removeShowOffline();
    } else {
      this.showShowOffline();
    }
    this.offlineShowing = !this.offlineShowing; 
  }

}

</script>