<template> 
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {AlertStatus, TrackType, TrackStatus} from '@/ts/types';
import Alert from '@/ts/Alert';
import GpsTrack from '@/ts/GpsTrack';

@Component
export default class BaseComponent extends Vue {
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
    const alert: Alert = new Alert(status, message);
    this.$store.commit('addAlert', alert);
    window.setTimeout(() => {
      this.$store.commit('removeAlert');
    }, timeout);
  }
}
</script>

<style>
</style>
