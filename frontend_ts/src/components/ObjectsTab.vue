<template>
  <div>
    <PlaceTypeGroupCard v-for="placeTypeGroup in placeTypeGroups" :placeTypeGroup="placeTypeGroup" :key="placeTypeGroup.id" :refresh="refresh"></PlaceTypeGroupCard>
    <MapPlace v-for="place of $store.state.places" :key="place.id" :place="place"></MapPlace>
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
import { Component, Watch } from 'vue-property-decorator';
import { EventBus } from '@/ts/EventBus';
import TrackGroup from '@/ts/TrackGroup';
import Track from '@/ts/Track';

@Component
export default class ObjectsTab extends BaseComponent {

  private plannedTrackGroup = new TrackGroup();
  private eventTrackGroup = new TrackGroup();
  private otherPeopleTrackGroup = new TrackGroup();
  private borderTrackGroup = new TrackGroup();
  private trailTrackGroup = new TrackGroup();

  private placeTypeGroups: any = null;
  private refresh = 1;

  private createTrackGroupFromTracks(trackGroup: TrackGroup, tracks: Array<Track>) {
    trackGroup.tracks = [];
    for(const track of tracks) {
      trackGroup.tracks.push(track);
    }
  }

  @Watch('$store.state.places')
  @Watch('$store.state.placeTypes')
  private onStorePlacesChanged(value: string, oldValue: string) {
    if ((this.$store.state.places) && (this.$store.state.placeTypes)) {
      const placeTypeGroups: any = {};
      for (const placeType of this.$store.state.placeTypes) {
        if (! (placeType.group.id in placeTypeGroups)) {
          placeTypeGroups[placeType.group.id] = {'id': placeType.group.id, 'name': placeType.group.name, 'placeGroups': {}};
        }
      }
      for (const placeType of this.$store.state.placeTypes) {
        placeTypeGroups[placeType.group.id]['placeGroups'][placeType.id] = {'id': placeType.id, 'name': placeType.name, 'icon': placeType.icon, places: [], 'checked': false};
      }
      for (const place of this.$store.state.places) {
        placeTypeGroups[place.type.group.id]['placeGroups'][place.type.id].places.push(place);
      }
      if (this.placeTypeGroups) {
        for (const placeType of this.$store.state.placeTypes) {
          placeTypeGroups[placeType.group.id]['placeGroups'][placeType.id]['checked'] = this.placeTypeGroups[placeType.group.id]['placeGroups'][placeType.id]['checked'];
        }
      }
      this.placeTypeGroups = placeTypeGroups;
      this.refresh = this.refresh + 1;
    }
  }

  @Watch('$store.state.zoomLevel')
  private onStoreZoomChanged(value: boolean, oldValue: boolean) {
    for (const place of this.$store.state.places) {
      place.changeMarkerSize(this.$store.state.zoomLevel);
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

}

</script>