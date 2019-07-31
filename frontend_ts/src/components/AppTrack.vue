<template>
  <div v-on:mouseover="highlightRow(6)" v-on:mouseleave="unhighlightRow(3)">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpstrack.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpstrack.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.gpstrack.id">{{ track.gpstrack.name }}</label>
    </div>
    <div style="display: inline">
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <span style='margin-right: 3px;'><TrackTypeIcon :gpstrack="track.gpstrack" height=24></TrackTypeIcon></span>
      <span style='margin-right: 3px;'><TrackStatusIcon :gpstrack="track.gpstrack" height=24></TrackStatusIcon></span>
      <span style='margin-right: 3px;'><TrackDownload :gpstrack="track.gpstrack" height=24></TrackDownload></span>
      <span style='margin-right: 3px;'><font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/></span>
      <span><font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/></span>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.gpstrack.id">
        <b>Name: </b>{{ track.gpstrack.name }}<br>
        <b>Start time: </b>{{ track.gpstrack.startTime|formatDate }}<br>
        <b>Distance: </b>{{ track.gpstrack.distance|roundTrackDistance }}<br>
        <b>Type: </b><TrackTypeIcon :gpstrack="track.gpstrack" height=12></TrackTypeIcon><br>
        <b>Status: </b><TrackStatusIcon :gpstrack="track.gpstrack" height=12></TrackStatusIcon><br>
        <b>ID: </b>{{ track.gpstrack.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import L from 'leaflet';
import axios from 'axios';
import BaseComponent from '@/components/Base.vue';
import Track from '@/ts/Track';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AlertStatus } from '@/ts/types';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean | null = null;
  public color: string | null = null;
  public gpsTrack: L.Polyline | null = null;

  @Prop({ required: true }) private track!: Track;

  private mounted() {
    const gpsPointList = [];
    for (const point of JSON.parse(this.track.gpstrack.pointsJsonOptimized)) {
      const gpsPoint = new L.LatLng(point[0], point[1]);
      gpsPointList.push(gpsPoint);
    }
    this.color = this.track.gpstrack.color || '#FF0000';
    this.gpsTrack = new L.Polyline(gpsPointList, {
      color: this.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1,
    });
    this.gpsTrack.component = this;
    this.gpsTrack.bindTooltip(document.getElementById('tooltip' + this.track.gpstrack.id)!, {sticky: true, opacity: 0.95});
    this.gpsTrack.on('mouseover', (e) => {
      e.target.component.highlightRow(6);
    });
    this.gpsTrack.on('mouseout', (e) => {
      e.target.component.unhighlightRow(3);
    });
    this.checked = this.track.checked;
  }

  private saveColor() {
    this.track.gpstrack.color = this.color!;
    this.track.gpstrack.points_json_optimized = this.track.gpstrack.pointsJsonOptimized
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpstrack.id}/`, this.track.gpstrack)
      .then((response: object) => {
        this.createAlert(AlertStatus.success, 'Color saved!', 2000);
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, 'Error during color saving!', 2000);
      });
  }

  private centerTrack() {
    if (this.gpsTrack) {
      this.$store.state.map.fitBounds(this.gpsTrack.getBounds());
    }
  }

  private highlightRow(width: number) {
    document.getElementById('trackcheckbox' + this.track.gpstrack.id)!.style.fontWeight = 'bold';
    this.changeWidth(width);
    this.gpsTrack!.bringToFront();
  }

  private unhighlightRow(width: number) {
    document.getElementById('trackcheckbox' + this.track.gpstrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(width);
  }

  private changeWidth(width: number) {
    this.gpsTrack!.setStyle({
      weight: width,
    });
  }

  @Watch('checked')
  private onCheckedChanged(value: string, oldValue: string) {
    if (this.checked) {
      this.gpsTrack!.addTo(this.$store.state.map);
      this.track.checked = true;
    } else {
      this.gpsTrack!.removeFrom(this.$store.state.map);
      this.track.checked = false;
    }
  }

  @Watch('color')
  private onColorChanged(value: string, oldValue: string) {
    this.gpsTrack!.setStyle({
      color: this.color,
    });
  }

}
</script>
