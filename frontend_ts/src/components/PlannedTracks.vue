<template>
  <div class="mb-2">
    <button v-if="$store.state.user" class="btn btn-primary btn-sm" @click="newPlannedTrack">{{ $t('newPlannedTrack') }}</button>
    <AppTrackGroup :trackGroup="plannedGroup"></AppTrackGroup>
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import TrackGroup from '@/ts/TrackGroup';
import GpsTrack from '@/ts/GpsTrack';
import { TrackStatus, TrackType } from '@/ts/types';
import Track from '@/ts/Track';

@Component
export default class PlannedTracks extends BaseComponent {

  private plannedGroup: TrackGroup = new TrackGroup();

  private mounted() {
    this.plannedGroup.label = 'plannedTracks';
    this.plannedGroup.translate = 'plannedTracks';
    this.plannedGroup.tracks = [];
  }

  private newPlannedTrack() {
    const newGpstrack: GpsTrack = new GpsTrack(Date.now(), '', '', '[]', '#FF0000', 0, TrackStatus.planned, TrackType.bicycle, null, null, '', undefined);
    const track = new Track(newGpstrack, true, false);
    this.$store.commit('addPlannedTrack', track);
    this.plannedGroup.tracks.push(track);
  }

}

</script>