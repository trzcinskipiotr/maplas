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
        <button hidden class="btn btn-primary btn-sm" @click="exportOffline">{{ $t('exportOffline') }}</button>
      </div>
    </div>    
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import localforage from 'localforage';

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

  private saveFile(string: string) {
    const blob = new Blob([string], {type: 'text/plain;charset=utf-8'});
    const date = formatDateSeconds(new Date());
    FileSaver.saveAs(blob, 'offline_maps_' + date + '.txt');
  }

  private exportOffline() {
    localforage.getItems(null).then(results => {
      const obj: any = {}
      let done = 0;
      let total = 0;
      for (const result in results) {
        total = total + 1;
      }
      for (const result in results) {
        localforage.getItem(result).then(data => {
          var reader = new FileReader();
          reader.onload = () => {
            obj[result] = (reader.result as string).replace(/^data:.+;base64,/, '');
            done = done + 1;
            if (done === total) {
              this.saveFile(JSON.stringify(obj));
            }
          }
          reader.readAsDataURL(data);
        })
      }
    });
  }

}

</script>