<template>
  <div v-on:mouseover="highlightMapTrack()" v-on:mouseleave="unhighlightMapTrack()">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpsTrack.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpsTrack.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
      <div style="float: right;">
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div><br>
    <div ref="icons" style="display: block;">
      <div style="display: inline-block; margin-right: 3px;" v-b-tooltip.hover :title="$t('changeColor')"><verte :enableAlpha="false" menuPosition="left" v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <span style='margin-right: 3px;'><TrackTypeIcon :gpsTrack="track.gpsTrack" height=24></TrackTypeIcon></span>
      <span style='margin-right: 3px;'><TrackStatusIcon :gpsTrack="track.gpsTrack" height=24></TrackStatusIcon></span>
      <span style='margin-right: 3px;'><TrackDownload :gpsTrack="track.gpsTrack" height=24></TrackDownload></span>
      <span style='margin-right: 3px;' v-b-tooltip.hover :title="$t('centerTrack')"><font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/></span>
      <span ref="tooltipSpan" style='margin-right: 3px;'><font-awesome-icon @click="playTrack" style="height: 24px; cursor: pointer" :icon="playing ? 'stop-circle' : 'play'"/></span>
      <b-tooltip :target="$refs.tooltipSpan">{{ playing ? $t('stopTrack') : $t('playTrack') }}</b-tooltip>
      <span v-b-tooltip.hover :title="$t('saveTrack')"><font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/></span>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.gpsTrack.id">
        <b>{{ $t('name') }}: </b>{{ track.gpsTrack.name }}<br>
        <b>{{ $t('startTime') }}: </b>{{ track.gpsTrack.startTime|formatDate }}<br>
        <b>{{ $t('distance') }}: </b>{{ track.gpsTrack.distance|roundTrackDistance }}<br>
        <b>{{ $t('type') }}: </b><TrackTypeIcon :gpsTrack="track.gpsTrack" height=12></TrackTypeIcon><br>
        <b>{{ $t('status') }}: </b><TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br>
        <b>{{ $t('id') }}: </b>{{ track.gpsTrack.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import L from 'leaflet';
import axios from 'axios';
import $ from 'jquery';
import BaseComponent from '@/components/Base.vue';
import Track from '@/ts/Track';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AlertStatus } from '@/ts/types';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean;
  public color: string;
  private iconsVisible: boolean = true;
  private playing: boolean = false;

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
    this.togglePanel();
    this.track.animateTrack.on(L.Motion.Event.Ended, (event) => {
      if (this.playing) {
        this.playing = false;
        this.track.animateTrack.removeFrom(this.$store.state.map!);
        if (this.checked) {
          this.track.mapTrack.addTo(this.$store.state.map!);
        }
      }
    });
  }

  private togglePanel() {
    $(this.$refs.icons).slideToggle('fast');
    this.iconsVisible = !this.iconsVisible;
  }

  private saveColor() {
    this.track.gpsTrack.color = this.color;
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/`, this.track.gpsTrack)
      .then((response: object) => {
        this.createAlert(AlertStatus.success, this.$t('colorSaved').toString(), 2000);
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, this.$t('colorError').toString(), 2000);
      });
  }

  private centerTrack() {
    this.$store.state.map!.fitBounds(this.track.mapTrack.getBounds());
  }

  private playTrack() {
    if (! this.playing) {
      this.track.mapTrack.removeFrom(this.$store.state.map!);
      this.track.animateTrack.motionOptions.duration = (this.track.gpsTrack.distance / this.$store.state.playingSpeed);
      if (this.track.gpsTrack.isWalkTrack()) {
        this.track.animateTrack.motionOptions.duration = this.track.animateTrack.motionOptions.duration * 10;
      }
      this.track.animateTrack.options.color = this.color;
      this.track.animateTrack.addTo(this.$store.state.map!);
      this.track.animateTrack.motionStart();
      this.playing = true;
    } else {
      this.track.animateTrack.motionStop();
    }
  }

  private highlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'bold';
    this.changeWidth(6);
    this.track.mapTrack.bringToFront();
    this.track.startMarker.addTo(this.$store.state.map!);
    this.track.finishMarker.addTo(this.$store.state.map!);
  }

  private unhighlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(3);
    this.track.finishMarker.removeFrom(this.$store.state.map!);
    this.track.startMarker.removeFrom(this.$store.state.map!);
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
      this.track.mapTrack.addTo(this.$store.state.map!);
      this.track.checked = true;
    } else {
      this.track.mapTrack.removeFrom(this.$store.state.map!);
      this.track.checked = false;
    }
  }

  @Watch('track.checked')
  private onPropCheckedChanged(value: boolean, oldValue: boolean) {
    this.checked = this.track.checked;
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

<style>
  .verte__guide {
    width: 16px !important;
  }
  .verte__menu-origin--left {
    bottom: 25px !important;
    left: 0 !important;
  }
</style>