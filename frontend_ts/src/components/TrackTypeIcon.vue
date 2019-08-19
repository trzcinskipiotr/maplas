<template>
  <span v-if="isBicycleTrack(gpsTrack)" v-b-tooltip.hover :title="$t('bicycleTrack')"><font-awesome-icon :style="{height: height + 'px'}" icon="biking"/></span>
  <span v-else-if="isWalkTrack(gpsTrack)" v-b-tooltip.hover :title="$t('walkTrack')"><font-awesome-icon :style="{height: height + 'px'}" icon="shoe-prints"/></span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import GpsTrack from '@/ts/GpsTrack';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class TrackTypeIcon extends BaseComponent {
  @Prop({ required: true }) private gpsTrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;
}
</script>
