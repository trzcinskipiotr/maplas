<template>
  <span>
    <font-awesome-icon :style="{color: track.gpsTrack.color, height: height, width: width || null}" :id="'colorpopover' + track.gpsTrack.id + type" style="cursor: pointer" icon="circle"></font-awesome-icon>
    <b-popover ref="popover" :target="'colorpopover' + track.gpsTrack.id + type" triggers="focus" placement="top">
      <template v-slot:title>{{ $t('changeColor') }}
        <div style="float: right;">
          <font-awesome-icon style="cursor: pointer;" :icon="['far', 'times-circle']" @click="closePopover"/>
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
