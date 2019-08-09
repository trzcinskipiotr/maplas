<template>
  <div v-on:mouseover="highlightMapTrack()" v-on:mouseleave="unhighlightMapTrack()">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpsTrack.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpsTrack.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
    </div>
    <div style="display: inline">
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <span style='margin-right: 3px;'><TrackTypeIcon :gpsTrack="track.gpsTrack" height=24></TrackTypeIcon></span>
      <span style='margin-right: 3px;'><TrackStatusIcon :gpsTrack="track.gpsTrack" height=24></TrackStatusIcon></span>
      <span style='margin-right: 3px;'><TrackDownload :gpsTrack="track.gpsTrack" height=24></TrackDownload></span>
      <span style='margin-right: 3px;'><font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/></span>
      <span><font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/></span>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.gpsTrack.id">
        <b>Name: </b>{{ track.gpsTrack.name }}<br>
        <b>Start time: </b>{{ track.gpsTrack.startTime|formatDate }}<br>
        <b>Distance: </b>{{ track.gpsTrack.distance|roundTrackDistance }}<br>
        <b>Type: </b><TrackTypeIcon :gpsTrack="track.gpsTrack" height=12></TrackTypeIcon><br>
        <b>Status: </b><TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br>
        <b>ID: </b>{{ track.gpsTrack.id }}
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

  public checked: boolean;
  public color: string;

  @Prop({ required: true }) private track!: Track;

  public constructor() {
    super();
    this.color = this.track.gpsTrack.color || '#FF0000';
    this.checked = this.track.checked;
  }

  private mounted() {
    this.track.mapTrack.bindTooltip(document.getElementById('tooltip' + this.track.gpsTrack.id)!, {sticky: true, opacity: 0.95});
    this.track.mapTrack.on('mouseover', (e) => {
      this.highlightMapTrack();
    });
    this.track.mapTrack.on('mouseout', (e) => {
      this.unhighlightMapTrack();
    });
    this.showOrHideTrack();
  }

  private saveColor() {
    this.track.gpsTrack.color = this.color;
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/`, this.track.gpsTrack)
      .then((response: object) => {
        this.createAlert(AlertStatus.success, 'Color saved!', 2000);
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, 'Error during color saving!', 2000);
      });
  }

  private centerTrack() {
    this.$store.state.map.fitBounds(this.track.mapTrack.getBounds());
  }

  private highlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'bold';
    this.changeWidth(6);
    this.track.mapTrack.bringToFront();
  }

  private unhighlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(3);
  }

  private changeWidth(width: number) {
    this.track.mapTrack.setStyle({
      weight: width,
    });
  }

  private changeColor() {
    this.track.mapTrack.setStyle({
      color: this.color,
    });
  }

  private showOrHideTrack() {
    if (this.checked) {
      this.track.mapTrack.addTo(this.$store.state.map);
      this.track.checked = true;
    } else {
      this.track.mapTrack.removeFrom(this.$store.state.map);
      this.track.checked = false;
    }
  }

  @Watch('checked')
  private onCheckedChanged(value: boolean, oldValue: boolean) {
    this.showOrHideTrack();
  }

  @Watch('color')
  private onColorChanged(value: string, oldValue: string) {
    this.changeColor();
  }

}
</script>
