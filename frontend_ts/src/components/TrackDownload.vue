<template>
  <font-awesome-icon @click="saveGPX" :style="{height: height + 'px', cursor: 'pointer'}" icon="download"/>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import {BaseBuilder, buildGPX} from 'gpx-builder';
import FileSaver from 'file-saver';
import { Component, Prop } from 'vue-property-decorator';
import GpsTrack from '@/ts/GpsTrack';

@Component
export default class TrackDownload extends BaseComponent {

  @Prop({ required: true }) private gpstrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;

  private saveGPX() {
      const gpsPointList = [];
      for (const point of JSON.parse(this.gpstrack.pointsJsonOptimized)) {
        const gpsPoint = new BaseBuilder.MODELS.Point(point[0], point[1]);
        gpsPointList.push(gpsPoint);
      }
      const gpxData = new BaseBuilder();
      gpxData.setMetadata(new BaseBuilder.MODELS.Metadata({name: this.gpstrack.name}));
      gpxData.setTracks([new BaseBuilder.MODELS.Track([new BaseBuilder.MODELS.Segment(gpsPointList)], {name: this.gpstrack.name})]);
      const blob = new Blob([buildGPX(gpxData.toObject())], {type: 'text/plain;charset=utf-8'});
      FileSaver.saveAs(blob, this.gpstrack.name + '.gpx');
    }
  }
</script>
