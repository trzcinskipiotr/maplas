<template>
  <div class="card">
    <div class="card-header py-2">
      <b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate" :disabled="trackGroup.tracks.length == 0">
      </b-form-checkbox>
      {{ trackGroup.translate ? $t(trackGroup.translate) : trackGroup.label }}
      <div style="float: right;">
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div>
    <div ref="tracks" class="card-body p-2">
      {{ $t('tracksSelectedDistance') }}: {{ checkedTracks|sumTracksDistance|roundTrackDistance }}
      <ul>
        <li>{{ $t('tracksSelectedDistanceWalk') }}: {{ checkedTracks|sumTracksDistanceWalk|roundTrackDistance }}</li>
        <li>{{ $t('tracksSelectedDistanceBicycle') }}: {{ checkedTracks|sumTracksDistanceBicycle|roundTrackDistance }}</li>
      </ul>
      <div v-for="track in trackGroup.tracks" :key="track.gpsTrack.id">
        <AppTrack :track="track"></AppTrack>
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

@Component
export default class AppTrackGroup extends BaseComponent {

  private checkedAll: boolean;
  private iconsVisible: boolean = true;

  @Prop({ required: true }) private trackGroup!: TrackGroup;

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

}

</script>