<template>
  <div>
    <div class="card">
      <div class="card-header py-2">
        {{ $t('offlineMaps' )}}
      </div>
      <div class="card-body p-2">
        <div class="buttongroup">
          {{ $t('zoomFrom') }} <select v-model="$store.state.minimalZoom">
            <option v-for="zoom in allowMinimalZoom" :value="zoom" :key="zoom">{{ zoom }}</option>
          </select>
          {{ $t('zoomTo') }} <select v-model="$store.state.maximalZoom">
            <option v-for="zoom in allowMaximalZoom" :value="zoom" :key="zoom">{{ zoom }}</option>
          </select>
          <!--{{ $t('selectArea') }} <select v-model="area">
            <option :value="null" :key="0">Cała warstwa / widoczny obszar</option>
            <template v-for="area in $store.state.areas">
              <option :value="area" :key="area.unique" v-if="area.tile_indexes">{{ area.name }}</option>
            </template>
          </select><br>
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="activateAreas">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="activatingAreas" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('activateAreas') }}
          </button>&nbsp;-->
        </div>
        <!--<div class="buttongroup">
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="deleteOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="deleting" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('deleteOffline') }}
          </button>&nbsp;
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="countOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="counting" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('countOffline') }}
          </button>&nbsp;
          <button :disabled="operationInProgess || (! area)" class="btn btn-primary btn-sm" @click="addToExport">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="addingToExport" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('addToExport') }}
          </button>
        </div>
        <div class="buttongroup">
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="exportOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="exporting" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('exportOffline') }}
          </button>&nbsp;
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="openImportFileInput">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="importing" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('importOffline') }}
          </button>
          <template v-if="areasToExport.length">
            <br>
            {{ $t('areasToExport') }}:
            <ul style="font-size: 0.8rem">
              <li :key="line" v-for="line of areasToExport">{{ line }}</li>
            </ul>
            {{ $t('sum') }}: {{ keysToExport.length }}
            &nbsp;
            <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="exportOfflineSelection">
              <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="exporting" :src="icons.spinnerWhite" />&nbsp;
              {{ $t('exportOfflineSelection') }}
            </button>
            &nbsp;
            <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="keysToExport = []; areasToExport = []">
              {{ $t('clearSelection') }}
            </button>
          </template>  
        </div>-->
        <div class="buttongroup">
          {{ $t('threads') }} <select v-model="$store.state.downloadThreads">
            <option v-for="thread in allowDownloadThreads" :value="thread" :key="thread">{{ thread }}</option>
          </select>&nbsp;
          <b-form-checkbox style="display: inline;" v-model="useCache"></b-form-checkbox>{{ $t('useCache') }}
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="downloadOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="saving" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('downloadOffline') }}
          </button>&nbsp;
          <span v-b-tooltip.hover :title="$t('corsWarning')">
            <img style="height: 24px; cursor: pointer;" :src="icons.info" />
          </span>
          <template v-if="saving">
            <br>
            <button class="btn btn-danger btn-sm" @click="stopDownloadOffline">
              {{ $t('stopDownloadOffline') }}
            </button>
          </template>  
        </div>
        <!--<div class="buttongroup">
        {{ $t('showZoom') }} <select v-model="showZoom">
          <option v-for="zoom in allowZoomToShow" :value="zoom" :key="zoom">{{ zoom }}</option>
        </select>&nbsp;
        <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="toggleOffline">
          <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="showZoomLoading" :src="icons.spinnerWhite" />&nbsp;
          {{ offlineShowing ? $t('hideOffline') : $t('showOffline') }}
        </button><template v-if="offlineShowing">&nbsp;{{ offlineShowingCount }}</template>
        </div>-->
        <div class="buttongroup">
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="clearOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="clearing" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('clearOffline') }}
          </button>&nbsp;
          <button :disabled="operationInProgess" class="btn btn-primary btn-sm" @click="countGlobalOffline">
            <img style='height: 16px; animation: rotation 2s infinite linear;' v-if="countingGlobal" :src="icons.spinnerWhite" />&nbsp;
            {{ $t('countGlobalOffline') }}
          </button>
        </div>
        <input id="importFileInputOffline" style="display:none;" type="file" accept=".txt" v-on:change="importFile" />
      </div>
    </div>    
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import { formatDateSeconds } from '@/ts/utils';
import { AlertStatus } from '@/ts/types';
import streamSaver from 'streamsaver';
import FileSaver from 'file-saver';
import { TranslateResult } from 'vue-i18n';
import { point } from 'leaflet';
import Area from '@/ts/Area';
import {removeKeyFromDB, clearDBs, countKeysInDBs, countKeysInDBsSum} from '@/ts/utils/db';
import axios from 'axios';
import { getAllKeys, getAllValues } from '@/ts/leafletoffline';

@Component
export default class OfflineCard extends BaseComponent {

  private allowMinimalZoom = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  private exporting = false;
  private importing = false;
  private saving = false;
  private deleting = false;
  private counting = false;
  private clearing = false;
  private countingGlobal = false;
  private addingToExport = false;
  private activatingAreas = false;
  private totalImported = 0;
  private layerName = '';
  private allowDownloadThreads = [1, 3, 5, 10, 20, 30, 40, 50];
  private useCache = true;
  private area: Area = null;

  private CHUNKSIZE = 1024 * 1024 * 100;

  private keysToExport: string[] = [];
  private areasToExport: string[] = [];

  private get operationInProgess() {
    return this.exporting || this.importing || this.deleting || this.saving || this.counting || this.showZoomLoading || this.clearing || this.countingGlobal || this.addingToExport || this.activatingAreas;
  }

  private setMessageClass(className: string) {
    document.getElementById('messageClassTop').className = 'alert border border-dark '+ className;
  }

  private showMessage(message: string | TranslateResult) {
    document.getElementById('messageTop').innerHTML = (message as string);
  }

  private showMessageDiv(message: string | TranslateResult) {
    document.getElementById('messageDivTop').style.display = 'block';
    this.showMessage(message);
    this.setMessageClass('alert-success');
  }

  private showMessageError(message: string | TranslateResult) {
    document.getElementById('messageDivTop').style.display = 'block';
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
    for(let i = this.$store.state.minimalZoom; i <= 18; i++) {
      allow.push(i);
    }
    return allow;
  }

  private get allowZoomToShow() {
    const allow = [];
    for(let i = 5; i <= 18; i++) {
      allow.push(i);
    }
    return allow;
  }


  private downloadOffline() {
    if (this.layerName.endsWith('Offline')) {
      this.saving = true;
      this.$store.state.offlineControl.options.parallel = this.$store.state.downloadThreads;
      this.$store.state.offlineControl.options.alwaysDownload = !this.useCache;
      this.$store.state.offlineControl.options.layerName = this.layerName;
      const firstUrl = this.$store.state.offlineControl.baseLayer._url;
      const countToSave = this.$store.state.offlineControl.calculateTiles(true);
      if (window.confirm(this.$t('saveAllTitles', [countToSave, this.$store.state.offlineControl.options.zoomlevels, firstUrl, this.useCache]))) {
        setTimeout(() => this.$store.state.offlineControl.downloadStart(), 100);
      } else {
        this.saving = false;
      }
    } else {
      this.showMessageError(this.$t('mapNotOffline'));
    }
  }

  private stopDownloadOffline() {
    this.$store.state.offlineControl.downloadCancel();
    this.saving = false;
  }

  private async getTilesForAreaInCache(zoomMin: number, zoomMax: number) {
    const cacheKeysSet = await getAllKeys();
    const set = this.$store.state.offlineControl.baseLayer.getUrlsForAreaZooms(zoomMin, zoomMax, this.area) as Set<any>;
    let count = 0;
    const tiles = [];
    for(const url of set) {
      if (cacheKeysSet.has(url.key)) {
        tiles.push(url.key);
      }
    }
    return tiles;
  }

  private async getTilesForLayerInCache() {
    const cacheKeysSet = await getAllKeys();
    return this.getKeysForKeySet(cacheKeysSet);
  }

  private getKeysForKeySet(cacheKeysSet: any) {
    let keys = [];
    for(let zoom = this.$store.state.minimalZoom; zoom <= this.$store.state.maximalZoom; zoom++) {
      let url = this.currentLayer._url;
      const subdomainpos = url.indexOf('{s}');
      if (subdomainpos > 0) {
        url = url.substring(0, subdomainpos) + this.currentLayer.options.subdomains['0'] + url.substring(subdomainpos + 3, url.length);
      }
      url = (url as string).replace('{z}', zoom);
      url = url.replace('{x}', '(.*)');
      url = url.replace('{y}', '(.*)');
      url = url.replace('?', '\\?');
      const regex = url;
      for(const key of cacheKeysSet) {
        const match = key.match(regex);
        if (match) {
          keys.push(key);
        }
      }
    }
    return keys;
  }

  private getMatchesForKeySet(cacheKeysSet: any, zoomMin: number, zoomMax: number) {
    let keys = [];
    for(let zoom = zoomMin; zoom <= zoomMax; zoom++) {
      let url = this.currentLayer._url;
      const subdomainpos = url.indexOf('{s}');
      if (subdomainpos > 0) {
        url = url.substring(0, subdomainpos) + this.currentLayer.options.subdomains['0'] + url.substring(subdomainpos + 3, url.length);
      }
      url = (url as string).replace('{z}', zoom);
      url = url.replace('{x}', '(.*)');
      url = url.replace('{y}', '(.*)');
      url = url.replace('?', '\\?');
      const regex = url;
      for(const key of cacheKeysSet) {
        const match = key.match(regex);
        if (match) {
          keys.push(match);
        }
      }
    }
    return keys;
  }

  private async getMatchesForAreaInCache(zoomMin: number, zoomMax: number) {
    const cacheKeysSet = await this.getTilesForAreaInCache(zoomMin, zoomMax);
    return await this.getMatchesForKeySet(cacheKeysSet, zoomMin, zoomMax);
  }

  private async getMatchesForLayerInCache(zoomMin: number, zoomMax: number) {
    const cacheKeysSet = await getAllKeys();
    return await this.getMatchesForKeySet(cacheKeysSet, zoomMin, zoomMax);
  }

  private async deleteOffline() {
    this.deleting = true;
    let tiles = [];
    if (this.area) {
      tiles = await this.getTilesForAreaInCache(this.$store.state.minimalZoom, this.$store.state.maximalZoom);
    } else {
      tiles = await this.getTilesForLayerInCache();
    }
    if (window.confirm(this.$t('removeTiles', [tiles.length]))) {
      for(const tile of tiles) {
        await removeTile(tile)
      }
      this.deleting = false;
      this.showMessageDiv(this.$t('bitmapsRemoved'));
    } else {
      this.deleting = false;  
    }
  }

  private async clearOffline() {
    this.clearing = true;
    const sum = await this.$store.state.offlineControl.getStorageLength();
    if(window.confirm(this.$t('removeAllTitles', [sum]))) {
      const result = await this.$store.state.offlineControl.storageTruncate();
      this.showMessageDiv(this.$t('allBitmapsRemoved'));
      this.clearing = false;
    } else {
      this.clearing = false;
    }
  }

  private async countGlobalOffline() {
    this.countingGlobal = true;
    const result = await this.$store.state.offlineControl.getStorageLength();
    this.showMessageDiv(result);
    this.countingGlobal = false;
  }

  private async countOffline() {
    this.counting = true;
    setTimeout(async () => {
      if (this.area) {
        const tiles = await this.getMatchesForAreaInCache(this.$store.state.minimalZoom, this.$store.state.maximalZoom);
        this.showMessageDiv(this.$t('bitmapInDatabase', [tiles.length]));
      } else {
        const tiles = await this.getMatchesForLayerInCache(this.$store.state.minimalZoom, this.$store.state.maximalZoom);
        this.showMessageDiv(this.$t('bitmapInDatabase', [tiles.length]));
      }
      this.counting = false;
    }, 100);
  }

  private async addToExport() {
    this.addingToExport = true;
    setTimeout(async () => {
      const cacheKeysSet = await getAllKeys();
      const set = this.$store.state.offlineControl.baseLayer.getUrlsForAreaZooms(this.$store.state.minimalZoom, this.$store.state.maximalZoom, this.area) as Set<any>;
      let missing = 0;
      let ok = 0;
      for(const url of set) {
        if (cacheKeysSet.has(url.key)) {
          this.keysToExport.push(url.key);
          ok = ok + 1;
        } else {
          missing = missing + 1;
        }
      }
      if (missing) {
        if (window.confirm(this.$t('someTilesMissing', [missing]))) {
          this.areasToExport.push(this.area.name + ': ' + this.layerName + ' (' + this.$store.state.minimalZoom + '-' + this.$store.state.maximalZoom + '): ' + ok);
          this.addingToExport = false;
        } else {
          this.addingToExport = false;
        }
      } else {
        this.areasToExport.push(this.area.name + ': ' + this.layerName + ' (' + this.$store.state.minimalZoom + '-' + this.$store.state.maximalZoom + '): ' + ok);
        this.addingToExport = false;
      }
    }, 100);
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

  private exportOffline() {
    this.exportOfflineGeneric(null);
  }

  private exportOfflineSelection() {
    this.exportOfflineGeneric(this.keysToExport);
  }

  private async exportOfflineGeneric(keys: string[]) {
    this.exporting = true;
    this.showMessageDiv(this.$t('starting'));
    const encode = TextEncoder.prototype.encode.bind(new TextEncoder);
    const date = formatDateSeconds(new Date());
    const fileStream = streamSaver.createWriteStream('offline_maps_' + date + '.txt');
    const writer = fileStream.getWriter();
    let results = {};
    if (keys) {
      const maxVar = 999;
      const iterNum = Math.floor(keys.length / maxVar) + 1;
      for(let iter = 0; iter <= iterNum; iter++) {
        // IMPLEMENT
        //const loopResults = [await (db as LocalForage).getItems(keys.slice(iter * maxVar, iter * maxVar + maxVar));]
        results = {...results, ...loopResults};
      }
    } else {
      results = await getAllValues();
    }
    let done = 0;
    let total = 0;
    for (const result in results) {
      total = total + 1;
    }
    let lineToSave = '';
    for (const result of results) {
      const data = result['blob'];
      const reader = new FileReader();
      const b64 = await this.readFile(data) as string;
      lineToSave = lineToSave + result['key'] + '$' + result['urlTemplate'] + '$' + result['x'] + '$' + result['y'] + '$' + result['z'] + '$' + result['createdAt'] + '$' + b64 + '#';
      done = done + 1;
      if ((lineToSave.length > 1024*1024*50) || (done === total)) {
        writer.write(encode(lineToSave));
        lineToSave = '';
      }
      this.showMessage('' + done + '/' + total);
    }
    writer.close();
    this.exporting = false;
  }

  private saveFile(data: any, name: any) {
    const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, name);
  }

  private async importToDB(file: File, startByte: number, result: string) {
    if (! result.endsWith('#')) {
      this.showMessageError(this.$t('importToDBError'));
      return;
    }
    const tab = result.split('#');
    const valuesToAdd = [];
    for (const el of tab) {
      const tab2 = el.split('$');
      if (tab2.length === 7) {
        const key = tab2[0];
        const template = tab2[1];
        const x = Number(tab2[2]);
        const y = Number(tab2[3]);
        const z = Number(tab2[4]);
        const createdAt = Number(tab2[5]);
        const value = tab2[6];
        const blob = await (await fetch(value)).blob(); 
        valuesToAdd.push({'blob': blob, 'tile': {key: key, url: key, createdAt: createdAt, urlTemplate: template, x: x, y: y, z: z}})
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
    for(const value of valuesToAdd) {
      saveTile(value['tile'], value['blob']);
    }
    this.processFile(file, startByte + result.length);
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

  private showProgressMessage(status: any) {
    if (status.lengthLoadErrors) {
      const processed = status.lengthSaved + status.lengthLoadedFromCache + status.lengthLoadErrors;
      this.showMessageError('' + processed + '/' + status.lengthToBeSaved + ' (cache: ' + status.lengthLoadedFromCache + ') (' + this.$t('bitmapDownloadErrors') + ': ' + status.lengthLoadErrors + ')');
    } else {
      const processed = status.lengthSaved + status.lengthLoadedFromCache;
      this.showMessage('' + processed + '/' + status.lengthToBeSaved + ' (cache: ' + status.lengthLoadedFromCache + ')');
    }
  }

  private onBaseLayerChange(e: L.LayersControlEvent) {
    this.layerName = e.name;
    const offlineControl = this.$store.state.offlineControl;
    this.currentLayer = this.$store.state.baseMaps[this.layerName];
    if (this.offlineShowing) {
      this.removeShowOffline();
      this.offlineShowing = false;
    }
    if (this.layerName.endsWith('Offline')) {
      offlineControl.setLayer(this.$store.state.baseMaps[this.layerName]);
      offlineControl.baseLayer.on('savestart', (status: any) => {
        this.showMessageDiv('' + status.lengthSaved + '/' + status.lengthToBeSaved);
      });
      offlineControl.baseLayer.on('refreshstatus', (status) => {
        this.showProgressMessage(status);
      });
      offlineControl.baseLayer.on('saveend', (status) => {
        this.showProgressMessage(status);
        this.saving = false;
      });
    }
  }

  @Watch('$store.state.map')
  private onStoreMapChanged() {
    this.$store.state.map.on('baselayerchange', this.onBaseLayerChange);
  }

  private showOfflineLayer: any = null;
  private offlineShowing = false;
  private offlineShowingCount = 0;
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

  @Watch('area')
  private onShowAreaChanged() {
    if (this.offlineShowing) {
      this.removeShowOffline();
      this.offlineShowing = false;
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
      setTimeout(() => {this.showZoomLoading = true; this.offlineShowingCount = 0}, 0);
      let matches: any;
      if (this.area) {
        matches = await this.getMatchesForAreaInCache(this.showZoom, this.showZoom);
      } else {
        matches = await this.getMatchesForLayerInCache(this.showZoom, this.showZoom);
      }
      let indexes: any = [];
      let xindexes: any = {};
      const xFirst = this.currentLayer._url.indexOf('{x}') < this.currentLayer._url.indexOf('{y}');
      for(const match of matches) {
        this.offlineShowingCount = this.offlineShowingCount + 1;
        let x = 0;
        let y = 0;
        if (xFirst) {
          x = parseInt(match[1]);
          y = parseInt(match[2]);
        } else {
          x = parseInt(match[2]);
          y = parseInt(match[1]);
        }
        indexes.push([x, y]);
        if (! (x in xindexes)) {
          xindexes[x] = [];
        }
        xindexes[x].push(y);
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

  private async activateArea(area: Area) {
    const response = await axios.get(this.$store.state.appHost + 'api/areas/' + area.id + '/?full=true')
    area.tile_indexes = response.data.tile_indexes;
    area.parseTileIndexes();
  }

  private async activateAreas() {
    this.activatingAreas = true;
    for(const area of this.$store.state.areas) {
      await this.activateArea(area);
    }
    this.activatingAreas = false;
  }

}

</script>

<style>

.buttongroup {
  border-radius: 5px 5px 5px;
  border: 1px solid gray;
  padding: 8px;
  margin-bottom: 10px;
}

</style>