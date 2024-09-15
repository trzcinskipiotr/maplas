<template>
  <div class="mb-2">
    <AppTrackGroup :trackGroup="plannedGroup" :searchText="''">
      <button v-if="$store.state.isDesktop" class="btn btn-primary btn-sm" @click="newPlannedTrack">{{ $t('newPlannedTrack') }}</button>
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
import { EventBus } from '@/ts/EventBus';

@Component
export default class PlannedTracks extends BaseComponent {

  private plannedGroup: TrackGroup = new TrackGroup();

  @Watch('$store.state.tmpPlannedTracks')
  private onStoreTracksChanged(value: string, oldValue: string) {
    this.plannedGroup.tracks = [];
    for (const plannedTrack of this.$store.state.tmpPlannedTracks) {
      this.plannedGroup.tracks.push(plannedTrack);
    }
  }

  private mounted() {
    this.plannedGroup.label = 'tmpPlannedTracks';
    this.plannedGroup.translate = 'tmpPlannedTracks';
    this.plannedGroup.tracks = [];
    EventBus.$on('newPlannedTrack', this.newPlannedTrack);
  }

  private newPlannedTrack() {
    const newGpstrack: GpsTrack = new GpsTrack(Date.now(), 'Nowa trasa', '', '[]', '#FF0000', 0, TrackStatus.planned, TrackType.bicycle, null, null, '', undefined, 1);
    const track = new Track(newGpstrack, true, false);
    this.$store.commit('addPlannedTrack', track);
    this.plannedGroup.tracks.push(track);
    this.$store.commit('setEditedTrack', track);
  }

}

</script>