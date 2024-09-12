<template>
  <span v-if="gpsTrack.isBicycleTrack()" v-b-tooltip.hover :title="$t('bicycleTrack')">
    <img :style="{height: height + 'px'}" :src="icons.bicycle"/>
  </span>
  <span v-else-if="gpsTrack.isWalkTrack()" v-b-tooltip.hover :title="$t('walkTrack')">
    <img :style="{height: height + 'px'}" :src="icons.shoe"/>
  </span>
  <span v-else-if="gpsTrack.isMushroomTrack()" v-b-tooltip.hover :title="$t('mushroomTrack')">
    <img :style="{height: height + 'px'}" :src="icons.mushroomIcon" />
  </span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import GpsTrack from '@/ts/GpsTrack';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class TrackTypeIcon extends BaseComponent {
  
  @Prop({ required: true }) private gpsTrack: GpsTrack;
  @Prop({ required: true }) private height: number;

}
</script>
