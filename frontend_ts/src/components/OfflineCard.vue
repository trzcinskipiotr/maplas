<template>
  <div>
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
        <button :disabled="exporting || importing || saving" class="btn btn-primary btn-sm" @click="exportOfflineAtOnce">
          <font-awesome-icon v-if="exporting" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('exportOffline') }}
        </button>&nbsp;
        <button :disabled="exporting || importing || saving" class="btn btn-primary btn-sm" @click="openImportFileInput">
          <font-awesome-icon v-if="importing" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('importOffline') }}
        </button><br><br>
        <button :disabled="exporting || importing || saving" class="btn btn-primary btn-sm" @click="downloadOffline">
          <font-awesome-icon v-if="saving" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('downloadOffline') }}
        </button>&nbsp;
        <button :disabled="exporting || importing || saving" class="btn btn-primary btn-sm" @click="deleteOffline">
          <font-awesome-icon v-if="saving" class="fa-spin" icon="spinner" />&nbsp;
          {{ $t('deleteOffline') }}
        </button>
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

@Component
export default class OfflineCard extends BaseComponent {

  private allowMinimalZoom = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  private exporting = false;
  private importing = false;
  private saving = false;

  private chunkSize = 1024 * 1024 * 100;

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

  private downloadOffline() {
    this.$store.state.offlineControl._saveTiles();
  }

  private deleteOffline() {
    this.$store.state.offlineControl._rmTiles();
  }

  private async exportOffline() {
    this.exporting = true;
    document.getElementById('saveTitleMessageDiv').style.display = 'block';
    document.getElementById('saveTitleMessageMessage').innerHTML = 'Starting...';
    const encode = TextEncoder.prototype.encode.bind(new TextEncoder)
    const results = await localforage.getItems(null);
    let done = 0;
    let total = 0;
    for (const result in results) {
      total = total + 1;
    }
    const date = formatDateSeconds(new Date());
    const fileStream = streamSaver.createWriteStream('offline_maps_' + date + '.txt');
    const writer = fileStream.getWriter();
    for (const result in results) {
      const data = results[result];
      const reader = new FileReader();
      reader.onload = () => {
        let b64 = reader.result as string;
        let lineToSave = result + '$$$' + b64 + '###';
        writer.write(encode(lineToSave));
        done = done + 1;
        document.getElementById('saveTitleMessageMessage').innerHTML = '' + done + '/' + total;
        if (done === total) {
          writer.close();
          this.exporting = false;
        }
      }
      reader.readAsDataURL(data);
    }
  }

  private async exportOfflineAtOnce() {
    this.exporting = true;
    document.getElementById('saveTitleMessageDiv').style.display = 'block';
    document.getElementById('saveTitleMessageMessage').innerHTML = 'Starting...';
    const date = formatDateSeconds(new Date());
    const results = await localforage.getItems(null);
    let tmpStra = '';
    let done = 0;
    let total = 0;
    for (const result in results) {
      total = total + 1;
    }
    for (const result in results) {
      const data = results[result];
      const reader = new FileReader();
      reader.onload = () => {
        let b64 = reader.result as string
        let lineToSave = result + '$$$' + b64 + '###';
        tmpStra = tmpStra + lineToSave; 
        done = done + 1;
        if (done === total) {
          this.saveFile(tmpStra, 'offline_maps_' + date + '.txt');
          this.exporting = false;
        }
        document.getElementById('saveTitleMessageMessage').innerHTML = '' + done + '/' + total;
      }
      reader.readAsDataURL(data);
    }
  }

  private saveFile(data: any, name: any) {
    const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, name);
  }

  private async importToDB(file: File, chunkIndex: number, result: string) {
    const chunks = Math.floor(file.size / this.chunkSize) + 1;
    const tab = result.split('###');
    let done = 0;
    const total = tab.length;
    for (const el of tab) {
      const tab2 = el.split('$$$');
      if (tab2.length === 2) {
        const key = tab2[0];
        const value = tab2[1];
        try {
          const response = await fetch(value);
          const blob = await response.blob(); 
          const result = await localforage.setItem(key, blob);
          done = done + 1
          const chunkPlus1 = chunkIndex + 1;
          document.getElementById('saveTitleMessageMessage').innerHTML = 'Chunk ' + chunkPlus1 + ' of ' + chunks + '; Bitmap ' + done + ' of '+ total;
        } catch (error) {

        }
      }
    }
    this.processFile(file, chunkIndex + 1);
  }

  private processFile(file: File, chunkIndex: number) {
    const size = file.size;
    const chunks = Math.floor(size / this.chunkSize) + 1;
    if (chunkIndex >= chunks) {
      this.importing = false;
      $('#importFileInputOffline')!.val('');
      return;
    }
    const chunk = file.slice(chunkIndex * this.chunkSize, (chunkIndex + 1) * this.chunkSize);
    const reader = new FileReader();
    reader.onload = (onLoadEvent: Event) => {
      const result = reader.result as string;
      this.importToDB(file, chunkIndex, result);
    }
    reader.readAsText(chunk);
  }

  private importFile(event: Event) {
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      this.createAlert(AlertStatus.danger, this.$t('importNoFiles').toString(), 2000);
      return;
    }
    this.importing = true;
    document.getElementById('saveTitleMessageDiv').style.display = 'block';
    for (const file of files) {
      this.processFile(file, 0);
    }
  }

}

</script>