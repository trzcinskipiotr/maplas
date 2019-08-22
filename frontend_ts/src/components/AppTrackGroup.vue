<template>
  <div class="card">
    <div class="card-header">{{ trackGroup.translate ? $t(trackGroup.translate) : trackGroup.label }}
      <div style="float: right;">
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div>
    <div ref="tracks" class="card-body">
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

@Component
export default class AppTrackGroup extends BaseComponent {

  private iconsVisible: boolean = true;

  @Prop({ required: true }) private trackGroup!: TrackGroup;

  public constructor() {
    super();
  }

  private togglePanel() {
    $(this.$refs.tracks).slideToggle('slow');
    this.iconsVisible = !this.iconsVisible;
  }

}

</script>