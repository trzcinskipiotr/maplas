<template>
  <div>
    <div class="card">
      <div class="card-header py-2">
        <b-form-checkbox style="display: inline;" v-model="checkedAll">
        </b-form-checkbox>
        Komoot Trail View
      </div>
    </div>    
    <MapPlace v-for="place of $store.state.placesKomootTrailView" :key="place.id" :place="place"></MapPlace>
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Watch } from 'vue-property-decorator';

@Component
export default class KomootTrailViewCard extends BaseComponent {

  private checkedAll: boolean = false;

  @Watch('checkedAll')
  private onCheckedAllChanged(value: boolean, oldValue: boolean) {
    for(const place of this.$store.state.placesKomootTrailView) {
      if (this.checkedAll) {
        place.marker.addTo(this.$store.state.map);
      } else {
        place.marker.removeFrom(this.$store.state.map);
      }
    }
  }

}

</script>