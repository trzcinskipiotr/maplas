<template>
  <div class="card">
    <div class="card-header py-2">
      <b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate" :disabled="trackGroup.tracks.length == 0">
      </b-form-checkbox>
      {{ trackGroup.translate ? $t(trackGroup.translate) : trackGroup.label }}
      <div style="float: right;">
        <slot></slot>&nbsp;
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div>
    <div ref="tracks" class="card-body p-2">
      {{ $t('tracksSelectedDistance') }}: {{ checkedTracks|sumTracksDistance|roundTrackDistance }}
      <ul>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.walk) > 0">{{ $t('tracksSelectedDistanceWalk') }}: {{ checkedTracks|sumTracksDistanceWalk|roundTrackDistance }}</li>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.bicycle) > 0">{{ $t('tracksSelectedDistanceBicycle') }}: {{ checkedTracks|sumTracksDistanceBicycle|roundTrackDistance }}</li>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.mushroom) > 0">{{ $t('tracksSelectedDistanceMushroom') }}: {{ checkedTracks|sumTracksDistanceMushroom|roundTrackDistance }}</li>
      </ul>
      <div v-for="track in trackGroup.tracks" :key="track.gpsTrack.id">
        <AppTrack v-show="showAppTrack(track)" :track="track" :highlightOnStart="highlightOnStart(track)"></AppTrack>
      </div>
    </div>  
  </div>
</template>

<script lang="ts">
import TrackGroup from '@/ts/TrackGroup';
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import Track from '@/ts/Track';
import {TrackType} from '@/ts/types';
import {EventBus} from '@/ts/EventBus';

@Component
export default class AppTrackGroup extends BaseComponent {

  private checkedAll: boolean;
  private iconsVisible: boolean = true;
  // @ts-ignore
  private TrackType = TrackType;

  @Prop({ required: true }) private trackGroup: TrackGroup;
  @Prop({ required: true }) private searchText: string;

  public constructor() {
    super();
    let oneChecked = false;
    let oneUnChecked = false;
    for (const track of this.trackGroup.tracks) {
      if (track.checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    if (oneChecked && !oneUnChecked) {
      this.checkedAll = true;
    } else {
      this.checkedAll = false;
    }
  }

  private showAppTrack(track: Track) {
    if (this.searchText.trim()) {
      if (track.gpsTrack.name.toLowerCase().includes(this.searchText.toLowerCase().trim())) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  @Watch('checkedAll')
  private onCheckedAllChanged(value: boolean, oldValue: boolean) {
    if (this.checkedAll) {
      for (const track of this.trackGroup.tracks) {
        this.$store.commit('setTrackChecked', {track, checked: true});
      }
    } else {
      for (const track of this.trackGroup.tracks) {
        this.$store.commit('setTrackChecked', {track, checked: false});
      }
    }
  }

  get allChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const track of this.trackGroup.tracks) {
      if (track.checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    if (oneChecked && !oneUnChecked) {
      return true;
    }
  }

  get allUnChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const track of this.trackGroup.tracks) {
      if (track.checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    if (!oneChecked && oneUnChecked) {
      return true;
    }
  }

  @Watch('allChecked')
  private onallCheckedChanged(value: boolean, oldValue: boolean) {
    if (this.allChecked) {
      this.checkedAll = true;
    }
  }

  @Watch('allUnChecked')
  private onallUnCheckedChanged(value: boolean, oldValue: boolean) {
    if (this.allUnChecked) {
      this.checkedAll = false;
    }
  }

  get checkedTracks() {
    const tracks: Track[] = [];
    for (const track of this.trackGroup.tracks) {
      if (track.checked) {
        tracks.push(track);
      }
    }
    return tracks;
  }

  get indeterminate() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const track of this.trackGroup.tracks) {
      if (track.checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    return oneChecked && oneUnChecked;
  }

  private togglePanel() {
    $(this.$refs.tracks).slideToggle('slow');
    this.iconsVisible = !this.iconsVisible;
  }

  private highlightOnStart(track: Track) {
    return ! track.onServer;
  }

  private mounted() {
    EventBus.$on('expandAllGroups', () => {
      if (! this.iconsVisible) {
        this.togglePanel();
      }
    })
    EventBus.$on('hideAllGroups', () => {
      if (this.iconsVisible) {
        this.togglePanel();
      }
    })
  }

}

</script>