<template>
  <font-awesome-icon :style="{height: height + 'px'}" v-if="isBicycleTrack(gpsTrack)" icon="biking"/>
  <font-awesome-icon :style="{height: height + 'px'}" v-else-if="isWalkTrack(gpsTrack)" icon="shoe-prints"/>
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
