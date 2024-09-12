<template> 
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {AlertStatus, TrackType, TrackStatus} from '@/ts/types';
import Alert from '@/ts/Alert';
import GpsTrack from '@/ts/GpsTrack';
import Track from '@/ts/Track';
import listTranslator, {Transaltor} from '@/ts/list_translator';
import $ from 'jquery';
import * as icons from '@/ts/icons';

@Component
export default class BaseComponent extends Vue {

  public icons = icons;

  private alertId: number = 1;
  // @ts-ignore
  public TrackStatus = TrackStatus;

  public isBicycleTrack(track: GpsTrack) {
    return track.type === TrackType.bicycle;
  }
  public isWalkTrack(track: GpsTrack) {
    return track.type === TrackType.walk;
  }
  public isDoneTrack(track: GpsTrack) {
      return track.status === TrackStatus.done;
  }
  public isPlannedTrack(track: GpsTrack) {
      return track.status === TrackStatus.planned;
  }
  public isDangerAlert(alert: Alert) {
      return alert.status === AlertStatus.danger;
  }
  public isSuccessAlert(alert: Alert) {
      return alert.status === AlertStatus.success;
  }
  public createAlert(status: AlertStatus, message: string, timeout: number) {
    const alert: Alert = new Alert(status, message, this.alertId, timeout);
    this.$store.commit('addAlert', alert);
    this.alertId = this.alertId + 1;
  }
  public closeModal(modalElement: any) {
    // @ts-ignore
    $(modalElement).modal('hide');
  }
  public openModal(modalElement: any) {
    // @ts-ignore
    $(modalElement).modal({
      backdrop: 'static',
      keyboard: false,
    });
  }

  public translateArray(array: Transaltor[]) {
    for (const entry of array) {
      this.translateEntry(entry);
    }
  }
  public translateAndAddArrayToTranslator(array: Transaltor[]) {
    this.translateArray(array);
    listTranslator.push(array);
  }

  private translateEntry(entry: Transaltor) {
    entry.label = this.$t(entry.translate).toString();
  }

  private countTracksByType(tracks: Track[], type: number) {
    let count = 0;
    for (const track of tracks) {
      if (track.gpsTrack.type === type) {
        count = count + 1;
      }
    }
    return count;
  }

  public $t(key: string, array: []) {
    if (key in this.$store.state.translations[this.$i18n.locale]) {
      return this.$store.state.translations[this.$i18n.locale][key];
    } else {
      return this.$i18n.t(key, array);
    }
  }

  public replaceHTTP(url: string) {
    if (window.location.hostname == 'localhost') {
      return url;
    } else {
      return url.replace('http://', 'https://');
    }
  }

  public getDisanseBadgeClasses(gpsTrack: GpsTrack) {
    if(gpsTrack.isBicycleTrack()) {
      if (gpsTrack.distance >= 50000) {
        return ['badge', 'badge-green4'];
      }
      if (gpsTrack.distance >= 40000) {
        return ['badge', 'badge-green3'];
      }
      if (gpsTrack.distance >= 30000) {
        return ['badge', 'badge-green2'];
      }
      return ['badge', 'badge-green1'];
    }
    if((gpsTrack.isMushroomTrack()) || (gpsTrack.isWalkTrack())) {
      if (gpsTrack.distance >= 15000) {
        return ['badge', 'badge-green4'];
      }
      if (gpsTrack.distance >= 10000) {
        return ['badge', 'badge-green3'];
      }
      if (gpsTrack.distance >= 5000) {
        return ['badge', 'badge-green2'];
      }
      return ['badge', 'badge-green1'];
    }
    return ['badge', 'badge-success'];
  }

}
</script>

<style>
</style>
