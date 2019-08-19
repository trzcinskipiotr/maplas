<template>
  <span v-if="isDoneTrack(gpsTrack)" v-b-tooltip.hover :title="$t('doneTrack')"><font-awesome-icon :style="{height: height + 'px'}" :icon="['far', 'calendar-check']"/></span>
  <span v-else-if="isPlannedTrack(gpsTrack)" v-b-tooltip.hover :title="$t('plannedTrack')"><font-awesome-icon :style="{height: height + 'px'}" :icon="['far', 'calendar-times']"/></span>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import GpsTrack from '@/ts/GpsTrack';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class TrackStatusIcon extends BaseComponent {
  @Prop({ required: true }) private gpsTrack!: GpsTrack;
  @Prop({ required: true }) private height!: number;
}
</script>
