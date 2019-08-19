<template>
  <span v-b-tooltip.hover :title="$t('downloadGPX')"><font-awesome-icon @click="saveGPX" :style="{height: height + 'px', cursor: 'pointer'}" icon="download"/></span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import {BaseBuilder, buildGPX} from 'gpx-builder';
import FileSaver from 'file-saver';
import { Component, Prop } from 'vue-property-decorator';
import GpsTrack from '@/ts/GpsTrack';

@Component
export default class TrackDownload extends BaseComponent {

  @Prop({ required: true }) private gpsTrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;

  private saveGPX() {
      const gpsPointList = [];
      for (const point of this.gpsTrack.pointsArray) {
        const gpsPoint = new BaseBuilder.MODELS.Point(point.lat, point.lng);
        gpsPointList.push(gpsPoint);
      }
      const gpxData = new BaseBuilder();
      gpxData.setMetadata(new BaseBuilder.MODELS.Metadata({name: this.gpsTrack.name}));
      gpxData.setTracks([new BaseBuilder.MODELS.Track([new BaseBuilder.MODELS.Segment(gpsPointList)], {name: this.gpsTrack.name})]);
      const blob = new Blob([buildGPX(gpxData.toObject())], {type: 'text/plain;charset=utf-8'});
      FileSaver.saveAs(blob, this.gpsTrack.name + '.gpx');
    }
  }
</script>
