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
      <div>
      {{ $t('tracksSelectedDistance') }}: {{ checkedTracks|sumTracksDistance|roundTrackDistance }}
      <font-awesome-icon @click="openCalendarModal" style="cursor: pointer; float: right;" :icon="['far', 'calendar']" size="lg" />
      </div>
      <ul>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.walk) > 0">{{ $t('tracksSelectedDistanceWalk') }} {{ countWalkTracks(checkedTracks) }}: {{ checkedTracks|sumTracksDistanceWalk|roundTrackDistance }}</li>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.bicycle) > 0">{{ $t('tracksSelectedDistanceBicycle') }} {{ countBicycleTracks(checkedTracks) }}: {{ checkedTracks|sumTracksDistanceBicycle|roundTrackDistance }}</li>
        <li v-if="countTracksByType(trackGroup.tracks, TrackType.mushroom) > 0">{{ $t('tracksSelectedDistanceMushroom') }} {{ countMushroomTracks(checkedTracks) }}: {{ checkedTracks|sumTracksDistanceMushroom|roundTrackDistance }}</li>
      </ul>
      <div v-for="track in trackGroup.tracks" :key="track.gpsTrack.id">
        <AppTrack v-show="showAppTrack(track)" :track="track" :highlightOnStart="highlightOnStart(track)"></AppTrack>
      </div>
    </div>

    <div ref="calendarModal" class="modal fade" tabindex="-1" role="dialog">
      <info-modal :title="$t('calendar')">
        <div style="display: inline-block;">
        <span v-for="index in monthRange" :key="index" style="float: left; margin: 4px; margin-top: 20px; border: solid 1px; border-color: rgb(240, 240, 240);">
          <center><b>{{ $t('month' + index) }}</b></center>
          <table style="text-align: center" class="table-sm">
            <tr>
              <td><b>pon</b></td>
              <td><b>wto</b></td>
              <td><b>śro</b></td>
              <td><b>czw</b></td>
              <td><b>pią</b></td>
              <td><b>sob</b></td>
              <td><b>nie</b></td>
            </tr>
            <tr v-for="week in getCalendarLabels(index)" :key="week">
              <td style="border: solid 1px white" v-for="day in week" :key="day" :style="{'background-color': day.track ? 'lightgreen' : 'white'}">
                {{ day.label }}
              </td>  
            </tr>    
          </table>  
        </span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="closeCalendarModal">
            <strong>{{ $t('close') }}</strong>
          </button>
        </div>
      </info-modal>
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
import { formatDateDay } from '@/ts/utils';

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

  get reverseTracks() {
    return [...this.trackGroup.tracks].reverse();
  }

  get firstMonth() {
    if (this.reverseTracks.length) {
      if (this.reverseTracks[0].gpsTrack.start_time) {
        return this.reverseTracks[0].gpsTrack.start_time.getMonth(); 
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  get lastMonth() {
    if (this.trackGroup.tracks.length) {
      if (this.trackGroup.tracks[0].gpsTrack.start_time) {
        return this.trackGroup.tracks[0].gpsTrack.start_time.getMonth(); 
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  private range(size:number, startAt:number = 0):ReadonlyArray<number> {
    return [...Array(size).keys()].map(i => i + startAt);
  }

  get monthRange() {
    return this.range(this.lastMonth - this.firstMonth + 1, this.firstMonth);
  }

  private openCalendarModal() {
    this.openModal(this.$refs.calendarModal);
  }

  private closeCalendarModal() {
    this.closeModal(this.$refs.calendarModal);
  }

  private getCalendarLabels(month: number) {
    const weeks = [];
    if ((this.trackGroup.tracks.length > 0) && (this.trackGroup.tracks[0].gpsTrack.start_time)) {
      const firstDayOfMonth = new Date(this.trackGroup.tracks[0].gpsTrack.start_time.getFullYear(), month, 1);
      let week = [];
      let firstDay = firstDayOfMonth.getDay() - 1;
      if (firstDay == -1) {
        firstDay = 6;
      }
      const empty = this.range(firstDay);
      for (let index in empty) {
        week.push({'label': '', 'track': false});
      }
      let loopDay = new Date(this.trackGroup.tracks[0].gpsTrack.start_time.getFullYear(), month, 1);
      while(loopDay.getMonth() == month) {
        let wasTrack = false;
        for(let track of this.trackGroup.tracks) {
          const trackDateWithoutHours = new Date(track.gpsTrack.start_time);
          trackDateWithoutHours.setHours(0, 0, 0, 0);
          if ((loopDay.getMonth() == trackDateWithoutHours.getMonth()) && (loopDay.getDate() == trackDateWithoutHours.getDate()) && (loopDay.getFullYear() == trackDateWithoutHours.getFullYear())) {
            wasTrack = true;
          }
        }
        week.push({'label': loopDay.getDate(), 'track': wasTrack});
        if (week.length == 7) {
          weeks.push(week)
          week = [];
        }
        const newDate = loopDay.setDate(loopDay.getDate() + 1);
        loopDay = new Date(newDate);
      }
      if (week.length > 0) {
        weeks.push(week)
      } 
    }
    return weeks;
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

  private countWalkTracks(tracks: Track[]) {
    let count = 0;
    let countDays = 0;
    let dates: string[] = [];
    for (const track of tracks) {
      if (track.gpsTrack.isWalkTrack()) {
        const dateDay = formatDateDay(track.gpsTrack.start_time);
        if (! (dates.includes(dateDay))) {
          countDays = countDays + 1;
          dates.push(dateDay);
        }
        count = count + 1;
      }
    }
    return '(' + count + '/' + countDays + ')';
  }

  private countBicycleTracks(tracks: Track[]) {
    let count = 0;
    let countDays = 0;
    let dates: string[] = [];
    for (const track of tracks) {
      if (track.gpsTrack.isBicycleTrack()) {
        const dateDay = formatDateDay(track.gpsTrack.start_time);
        if (! (dates.includes(dateDay))) {
          countDays = countDays + 1;
          dates.push(dateDay);
        }
        count = count + 1;
      }
    }
    return '(' + count + '/' + countDays + ')';
  }

  private countMushroomTracks(tracks: Track[]) {
    let count = 0;
    let countDays = 0;
    let dates: string[] = [];
    for (const track of tracks) {
      if (track.gpsTrack.isMushroomTrack()) {
        const dateDay = formatDateDay(track.gpsTrack.start_time);
        if (! (dates.includes(dateDay))) {
          countDays = countDays + 1;
          dates.push(dateDay);
        }
        count = count + 1;
      }
    }
    return '(' + count + '/' + countDays + ')';
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