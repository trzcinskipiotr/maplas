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
        </select>  
        <button class="btn btn-primary btn-sm" @click="exportOffline">{{ $t('exportOffline') }}</button>
        <input id="importFileInput" type="file" accept=".txt" v-on:change="importFile" />
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

@Component
export default class ObjectsTab extends BaseComponent {

  private allowMinimalZoom = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

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


  private exportOffline() {
    console.log('export start');
    const encode = TextEncoder.prototype.encode.bind(new TextEncoder)
    localforage.getItems(null).then(results => {
      console.log('get items done');
      const obj: any = {}
      let done = 0;
      let total = 0;
      for (const result in results) {
        total = total + 1;
      }
      console.log(total);
      console.log('total done');
      const date = formatDateSeconds(new Date());
      const fileStream = streamSaver.createWriteStream('offline_maps_' + date + '.txt');
      const writer = fileStream.getWriter();
      for (const result in results) {
        localforage.getItem(result).then(data => {
          var reader = new FileReader();
          reader.onload = () => {
            console.log(reader.result);
            //let b64 = (reader.result as string).replace(/^data:.+;base64,/, '');
            let b64 = (reader.result as string)
            let lineToSave = result + '$$$' + b64 + '###';
            writer.write(encode(lineToSave));
            done = done + 1;
            console.log(done);
            if (done === total) {
              writer.close()
            }
          }
          reader.readAsDataURL(data);
        })
      }
    });
  }

  private async importToDB(file: File, chunkIndex: number, result: string) {
    console.log('Chunk size: ' + result.length);
    const tab = result.split('###');
    let done = 0;
    const total = tab.length;
    for (const el of tab) {
      const tab2 = el.split('$$$');
      if (tab2.length === 2) {
        const key = tab2[0];
        const value = tab2[1];
        const blob = new Blob([value.replace(/^data:.+;base64,/, '')], {type: 'image/png'})
        const result = await localforage.setItem(key, blob);
        done = done + 1
        console.log('Done ' + done + ' of ' + total);
      } else {
        console.error('Bad chunk...');
      }
    }
    this.processFile(file, chunkIndex + 1);
  }

  private processFile(file: File, chunkIndex: number) {
    const size = file.size;
    const chunkSize = 1024 * 1024 * 100;
    const chunks = Math.floor(size / chunkSize);
    if (chunkIndex >= chunks + 1) {
      console.log('File processed!');
      return;
    }
    const chunk = file.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
    const reader = new FileReader();
    reader.onload = (onLoadEvent: Event) => {
      const result = reader.result as string;
      this.importToDB(file, chunkIndex, result);
    }
    reader.readAsText(chunk);
  }

  private importFile(event: Event) {
    console.log('import file');
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      this.createAlert(AlertStatus.danger, this.$t('importNoFiles').toString(), 2000);
      return;
    }
    for (const file of files) {
      this.processFile(file, 0);
    }
  }

}

</script>