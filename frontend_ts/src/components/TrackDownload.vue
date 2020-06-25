<template>
  <span>
    <span ref="icon"><font-awesome-icon @click="saveGPX" :style="{height: height + 'px', width: width || null, cursor: 'pointer'}" icon="download"/></span>
    <b-tooltip v-if="rendered" :target="$refs.icon">{{ $t('downloadGPX') }}</b-tooltip>
  </span>  
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import {BaseBuilder, buildGPX} from 'gpx-builder';
import FileSaver from 'file-saver';
import { Component, Prop, Watch } from 'vue-property-decorator';
import GpsTrack from '@/ts/GpsTrack';

@Component
export default class TrackDownload extends BaseComponent {

  @Prop({ required: true }) private gpsTrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;
  @Prop({ required: true }) private width: string;

  private rendered = false;

  private mounted() {
    this.$nextTick(() => {
      this.rendered = true;
    })
  }

  private saveGPX() {
    console.log(this.$refs.icons);
    const segments = [];
    for (const segment of this.gpsTrack.segments) {
      const gpsPointList = [];
      for (const point of segment.pointsArray) {
        const gpsPoint = new BaseBuilder.MODELS.Point(point.lat, point.lng);
        gpsPointList.push(gpsPoint);
      }
      const gpxSegment = new BaseBuilder.MODELS.Segment(gpsPointList);
      segments.push(gpxSegment);
    }
    const gpxData = new BaseBuilder();
    gpxData.setMetadata(new BaseBuilder.MODELS.Metadata({name: this.gpsTrack.name}));
    gpxData.setTracks([new BaseBuilder.MODELS.Track(segments, {name: this.gpsTrack.name})]);
    const blob = new Blob([buildGPX(gpxData.toObject())], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, this.gpsTrack.name + '.gpx');
  }
}
</script>
