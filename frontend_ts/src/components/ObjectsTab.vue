<template>
  <div>
  <div class="card">
    <div class="card-header py-2">
      <b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate">
      </b-form-checkbox>
      {{ $t('places') }}
      <button v-if="($store.state.user) && ($store.state.isDesktop)" class="btn btn-primary btn-sm" @click="openNewPlaceModal(true, null)">{{ $t('addPlace') }}</button>
      <div style="float: right;">
        <img @click="togglePanel" style="height: 13px; cursor: pointer;" :src="iconsVisible ? icons.chevronUp : icons.chevronDown" />
      </div>
      <div :style="{'margin-top': $store.state.isDesktop ? '3px' : '15px'}">
        <b-form-checkbox style="display: inline;" v-model="showApproved">
        </b-form-checkbox>{{ $t('showApproved') }}
        <b-form-checkbox style="display: inline;" v-model="showNotApproved">
        </b-form-checkbox>{{ $t('showNotApproved') }}
      </div>  
    </div>
    <div v-if="((placeGroups) && ($store.state.placeTypes.length > 0))" ref="places" class="card-body p-2">
      <div v-for="placeType of $store.state.placeTypes" :key="placeType.name">
        <div :style="{'margin-bottom': $store.state.isDesktop ? 0 : '15px'}">
          <b-form-checkbox style="display: inline;" v-model="placeGroups[placeType.id].checked" @change="onPlaceGroupsChanged($event, placeGroups[placeType.id].id)">
          </b-form-checkbox>
          <i style="color: blue" :class="'maplas-icon icon16px ' + placeType.icon"></i>
          {{ $t(placeType.name) }}
        </div>  
      </div>
    </div>
    <MapPlace v-for="place of $store.state.places" :key="place.id" :place="place"></MapPlace>
  </div>
  <br>
  <AppTrackGroup :searchText="''" :trackGroup="plannedTrackGroup"></AppTrackGroup>
  <br>
  <PlannedTracks></PlannedTracks>
  <br>
  <AppTrackGroup :searchText="''" :trackGroup="otherPeopleTrackGroup"></AppTrackGroup>
  <br>
  <AppTrackGroup :searchText="''" :trackGroup="eventTrackGroup"></AppTrackGroup>
  <br>
  <AppTrackGroup :searchText="''" :trackGroup="trailTrackGroup"></AppTrackGroup>
  <br>
  <AppTrackGroup :searchText="''" :trackGroup="borderTrackGroup"></AppTrackGroup>
  <br>
  <!--<Areas></Areas>-->
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import PlaceType from '../ts/PlaceType';
import $ from 'jquery';
import FileSaver from 'file-saver';
import { formatDateSeconds } from '@/ts/utils';
import { EventBus } from '@/ts/EventBus';
import TrackGroup from '@/ts/TrackGroup';
import Track from '@/ts/Track';

@Component
export default class ObjectsTab extends BaseComponent {

  private checkedAll: Boolean = false;
  private iconsVisible: boolean = true;
  private placeGroups: any = null;
  private showApproved = true;
  private showNotApproved = true;

  private plannedTrackGroup = new TrackGroup();
  private eventTrackGroup = new TrackGroup();
  private otherPeopleTrackGroup = new TrackGroup();
  private borderTrackGroup = new TrackGroup();
  private trailTrackGroup = new TrackGroup();

  private createTrackGroupFromTracks(trackGroup: TrackGroup, tracks: Array<Track>) {
    trackGroup.tracks = [];
    for(const track of tracks) {
      trackGroup.tracks.push(track);
    }
  }

  @Watch('$store.state.places')
  @Watch('$store.state.placeTypes')
  private onStorePlacesChanged(value: string, oldValue: string) {
    let tmpplaceGroups: any = {}
    for (const placeType of this.$store.state.placeTypes) {
      tmpplaceGroups[placeType.id] = {id: placeType.id, checked: false, name: placeType.name, places: []};
    }
    for (const place of this.$store.state.places) {
      if (!(place.type.id in tmpplaceGroups)) {
        tmpplaceGroups[place.type.id] = {id: place.type.id, checked: false, name: place.type.name, places: []};
      }
      tmpplaceGroups[place.type.id].places.push(place)
    }
    if (this.checkedAll) {
      for (let tmpplaceGroup in tmpplaceGroups) {
        tmpplaceGroups[tmpplaceGroup].checked = true;
      }
    } else {
      for (let tmpplaceGroup in tmpplaceGroups) {
        if ((this.placeGroups) && (tmpplaceGroups[tmpplaceGroup].id in this.placeGroups)) {
          tmpplaceGroups[tmpplaceGroup].checked = this.placeGroups[tmpplaceGroup].checked;
        }
      }
    }
    this.placeGroups = tmpplaceGroups;
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  @Watch('$store.state.plannedTracks')
  private onPlannedTracksChange() {
    this.createTrackGroupFromTracks(this.plannedTrackGroup, this.$store.state.plannedTracks);
  }

  @Watch('$store.state.eventTracks')
  private onEventTracksChange() {
    this.createTrackGroupFromTracks(this.eventTrackGroup, this.$store.state.eventTracks);
  }

  @Watch('$store.state.otherPeopleTracks')
  private onOtherPeopleTracksChange() {
    this.createTrackGroupFromTracks(this.otherPeopleTrackGroup, this.$store.state.otherPeopleTracks);
  }

  @Watch('$store.state.borderTracks')
  private onBorderTracksChange() {
    this.createTrackGroupFromTracks(this.borderTrackGroup, this.$store.state.borderTracks);
  }

  @Watch('$store.state.trailTracks')
  private onTrailTracksChange() {
    this.createTrackGroupFromTracks(this.trailTrackGroup, this.$store.state.trailTracks);
  }

  public mounted() {
    this.plannedTrackGroup.label = 'plannedTracks';
    this.plannedTrackGroup.translate = 'plannedTracks';
    this.eventTrackGroup.label = 'eventTracks';
    this.eventTrackGroup.translate = 'eventTracks';
    this.otherPeopleTrackGroup.label = 'otherPeopleTracks';
    this.otherPeopleTrackGroup.translate = 'otherPeopleTracks';
    this.borderTrackGroup.label = 'borderTracks';
    this.borderTrackGroup.translate = 'borderTracks';
    this.trailTrackGroup.label = 'trailTracks';
    this.trailTrackGroup.translate = 'trailTracks';
    this.createTrackGroupFromTracks(this.plannedTrackGroup, this.$store.state.plannedTracks);
    this.createTrackGroupFromTracks(this.eventTrackGroup, this.$store.state.eventTracks);
    this.createTrackGroupFromTracks(this.otherPeopleTrackGroup, this.$store.state.otherPeopleTracks);
    this.createTrackGroupFromTracks(this.borderTrackGroup, this.$store.state.borderTracks);
    this.createTrackGroupFromTracks(this.trailTrackGroup, this.$store.state.trailTracks);
    EventBus.$on('RefreshPlacesGroups', this.onStorePlacesChanged);
  }

  @Watch('checkedAll')
  private onCheckedAllChanged(value: boolean, oldValue: boolean) {
    for (const placeGroup in this.placeGroups) {
      this.placeGroups[placeGroup].checked = this.checkedAll;
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  @Watch('$store.state.zoomLevel')
  private onStoreZoomChanged(value: boolean, oldValue: boolean) {
    for (const place of this.$store.state.places) {
      place.changeMarkerSize(this.$store.state.zoomLevel);
    }
  }

  get allChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
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
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
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

  @Watch('showApproved')
  private refreshApproved() {
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  @Watch('showNotApproved')
  private refreshNotApproved() {
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  private onPlaceGroupsChanged(event: boolean, id: number) {
    this.placeGroups[id].checked = event;
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  private showOrHidePlaces(groupId: number) {
    for (const place of this.placeGroups[groupId].places) {
      if ((this.placeGroups[groupId].checked) && (((place.approved) && (this.showApproved)) || ((!place.approved) && (this.showNotApproved)))) {
        place.marker.addTo(this.$store.state.map)
      } else {
        place.marker.removeFrom(this.$store.state.map)
      }
    }
  }

  get indeterminate() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    return oneChecked && oneUnChecked;
  }

  private togglePanel() {
    $(this.$refs.places).slideToggle('slow');
    this.iconsVisible = !this.iconsVisible;
  }

  private openNewPlaceModal() {
    EventBus.$emit('NewPlaceRequested', true, null);
  }

}

</script>