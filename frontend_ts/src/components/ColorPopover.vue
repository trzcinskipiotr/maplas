<template>
  <span>
    <svg :id="'colorpopover' + track.gpsTrack.id + type" :style="{color: track.gpsTrack.color, height: height, width: width || null, cursor: 'pointer'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 1000 1000" xml:space="preserve">
      <desc>Created with Fabric.js 3.5.0</desc>
      <defs></defs>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(255,255,255,0)"/>
      <g transform="matrix(7.6923 0 0 7.6923 499.9995 499.9995)" id="75458">
        <path style="stroke: currentColor; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: currentColor; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" transform=" translate(-67.5, -67.5)" d="M 132.5 67.5 C 132.5 103.399 103.399 132.5 67.5 132.5 C 31.6015 132.5 2.5 103.399 2.5 67.5 C 2.5 31.6015 31.6015 2.5 67.5 2.5 C 103.399 2.5 132.5 31.6015 132.5 67.5 Z" stroke-linecap="round"/>
      </g>
    </svg>
    <b-popover ref="popover" :target="'colorpopover' + track.gpsTrack.id + type" triggers="focus" placement="top">
      <template v-slot:title>{{ $t('changeColor') }}
        <div style="float: right;">
          <img @click="closePopover" style="height: 20px; cursor: pointer;" :src="icons.closeIcon" />
        </div>
      </template>
      <sketch-picker :presetColors="['#FF0000', '#09FF00', '#FF00E4', '#0037FF', '#00FFED', '#F6FF00', '#FFB600', '#007FFF', '#50006B', '#0C6E3D', '#9013FE', '#FE1378', '#511212', '#9B9B9B', '#FFFFFF', '#000000']" 
        v-model="color" :disableAlpha="true" :disableFields="true"></sketch-picker>
    </b-popover>
  </span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import Track from '@/ts/Track';
import $ from 'jquery';

@Component
export default class ColorPopover extends BaseComponent {

  @Prop({ required: true }) private track: Track;
  @Prop({ required: false }) private type: string;
  @Prop({ required: false }) private height: string;
  @Prop({ required: false }) private width: string;

  private color = this.track.gpsTrack.color;

  @Watch('color')
  private onCheckedChanged(value: boolean, oldValue: boolean) {
    // @ts-ignore
    this.track.gpsTrack.color = this.color.hex;
  }

  private closePopover() {
    // @ts-ignore
    this.$refs.popover.$emit('close');
  }

}

</script>
