<template>
  <div class="mb-2">
    <AppTrackGroup :trackGroup="plannedGroup">
      <button v-if="$store.state.user" class="btn btn-primary btn-sm" @click="newPlannedTrack">{{ $t('newPlannedTrack') }}</button>
    </AppTrackGroup>
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

  @Watch('$store.state.plannedTracks')
  private onStoreTracksChanged(value: string, oldValue: string) {
    this.plannedGroup.tracks = [];
    for (const plannedTrack of this.$store.state.plannedTracks) {
      this.plannedGroup.tracks.push(plannedTrack);
    }
  }

  private mounted() {
    this.plannedGroup.label = 'plannedTracks';
    this.plannedGroup.translate = 'plannedTracks';
    this.plannedGroup.tracks = [];
  }

  private newPlannedTrack() {
    const newGpstrack: GpsTrack = new GpsTrack(Date.now(), 'Nowa trasa', '', '[]', '#FF0000', 0, TrackStatus.planned, TrackType.bicycle, null, null, '', undefined);
    const track = new Track(newGpstrack, true, false);
    this.$store.commit('addPlannedTrack', track);
    this.plannedGroup.tracks.push(track);
  }

}

</script>