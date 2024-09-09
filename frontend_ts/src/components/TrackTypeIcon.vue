<template>
  <span v-if="gpsTrack.isBicycleTrack()" v-b-tooltip.hover :title="$t('bicycleTrack')"><font-awesome-icon :style="{height: height + 'px'}" icon="biking"/></span>
  <span v-else-if="gpsTrack.isWalkTrack()" v-b-tooltip.hover :title="$t('walkTrack')"><font-awesome-icon :style="{height: height + 'px'}" icon="shoe-prints"/></span>
  <span v-else-if="gpsTrack.isMushroomTrack()" v-b-tooltip.hover :title="$t('mushroomTrack')"><img :style="{height: imgheight + 'px', verticalAlign: verticalAlign}" :src="icons.mushroomIcon" /></span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import GpsTrack from '@/ts/GpsTrack';
import { Component, Prop } from 'vue-property-decorator';
import * as icons from '@/ts/icons';

@Component
export default class TrackTypeIcon extends BaseComponent {
  @Prop({ required: true }) private gpsTrack: GpsTrack;
  @Prop({ required: true }) private height: number;
  @Prop({ required: true }) private imgheight: number;
  @Prop({ required: true }) private verticalAlign: string;

  private icons = icons;
}
</script>
