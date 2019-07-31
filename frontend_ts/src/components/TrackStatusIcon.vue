<template>
  <font-awesome-icon :style="{height: height + 'px'}" v-if="isDoneTrack(gpstrack)" :icon="['far', 'calendar-check']"/>
  <font-awesome-icon :style="{height: height + 'px'}" v-else-if="isPlannedTrack(gpstrack)" :icon="['far', 'calendar-times']"/>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import GpsTrack from '@/ts/GpsTrack';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class TrackStatusIcon extends BaseComponent {
  @Prop({ required: true }) private gpstrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;
}
</script>
