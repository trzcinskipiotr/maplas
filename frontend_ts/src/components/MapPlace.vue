<template>
  <div style="display: none">
    <div ref="tooltip" style="minWidth: 200px">
      {{ place.id }} <b>{{ place.name }}</b> {{ place.lat}}, {{ place.lon }}<br>
      <span v-if="place.photos.length"><img ref="smallImage" :src="place.photos[0].image_thumb" style="cursor: pointer; maxWidth: 300px; maxHeight: 300px" @click="makeGallery"><br></span>
      {{ place.description }}<br>
      <span v-if="(place.marker.getLatLng().lat != place.lat) && (place.marker.getLatLng().lng != place.lon)">
        <font-awesome-icon style="cursor: pointer" icon="undo" @click="undoLocation" />&nbsp;
        <font-awesome-icon style="cursor: pointer" icon="save" @click="saveLocation" />
      </span>  
    </div>
  </div>  
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Place from '@/ts/Place';
import axios from 'axios';
import { AlertStatus } from '@/ts/types';
import {roundCoord} from '@/ts/utils/coords';

@Component
export default class MapPlace extends BaseComponent {

  @Prop({ required: true }) private place: Place;

  private mounted() {
    this.place.marker.bindPopup(this.$refs.tooltip as HTMLElement, {});
  }

  private undoLocation() {
    this.place.marker.setLatLng([this.place.lat, this.place.lon]);
  }

  private async saveLocation() {
    const obj = {lat: roundCoord(this.place.marker.getLatLng().lat), lon: roundCoord(this.place.marker.getLatLng().lng)}
    try {
      const response = await axios.patch(this.$store.state.appHost + `api/places/${this.place.id}/`, obj);
      this.place.lat = obj.lat;
      this.place.lon = obj.lon;
      this.place.marker.setLatLng([this.place.lat, this.place.lon]);
      this.createAlert(AlertStatus.success, this.$t('placeCoordsSave').toString(), 2000);
    } catch {
      this.createAlert(AlertStatus.danger, this.$t('placeCoordsSaveError').toString(), 2000);
    }
  }

  private makeGallery() {
    const dynamicEls: any = [];
    for (const photo of this.place.photos) {
      const dynamicEl = {src: photo.image_fullhd, thumb: photo.image_thumb};
      dynamicEls.push(dynamicEl);
    }
    window.lightGallery(this.$refs.smallImage, {
      dynamic: true,
      autoplay: true,
      pause: 2000,
      galleryId: new Date().getTime(),
      dynamicEl: dynamicEls,
    });
  }

}

</script>