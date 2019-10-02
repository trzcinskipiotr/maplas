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

@Component
export default class BaseComponent extends Vue {

  private alertId: number = 1;

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

}
</script>

<style>
</style>
