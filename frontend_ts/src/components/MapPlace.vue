<template>
  <div style="display: none">
    <div ref="tooltip" style="minWidth: 200px">
      <div v-if="renderPopup">
        {{ place.id }} <b>{{ place.name }}</b> {{ place.lat}}, {{ place.lon }}
        <span style="float: right">
          <span :id="'tooltipPlace' + place.id" style='margin-right: 3px;'><font-awesome-icon style="height: 24px; cursor: pointer" :icon="place.approved ? 'check' : 'question-circle'"/></span>
          <b-tooltip v-if="$store.state.isDesktop" :target="'tooltipPlace' + place.id">{{ place.approved ? $t('placeApproved') : $t('placeNotApproved') }}</b-tooltip>
          <span v-if="place.photos.length" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('fullRes')"><font-awesome-icon ref="fullResImage" @click="makeFullResGallery" style="height: 24px; cursor: pointer" icon="search-plus"/></span>
        </span>  
        <span v-if="place.photos.length">
          <br><img @load="resizePopup" ref="smallImage" :src="replaceHTTP(place.photos[0].image_thumb)" :class="$store.state.isDesktop ? 'popupimgbig' : 'popupimgsmall'" @click="makeGallery"><br>
          <span style="float: right; color: gray">{{ place.photos[0].org_filename }} {{ place.photos[0].exif_time_taken | formatDateSeconds }}</span><br>
        </span>
        <span v-if="place.videos.length">
          <div v-for="video in place.videos" :key="video.id">
            <b>{{ video.name }}</b> {{ video.description }}<br>
            <center><div v-html="video.html"></div></center>
          </div>
        </span> 
        {{ place.description }}<br>
        <span v-if="(place.marker.getLatLng().lat != place.lat) && (place.marker.getLatLng().lng != place.lon)">
          <font-awesome-icon style="cursor: pointer" icon="undo" @click="undoLocation" />&nbsp;
          <font-awesome-icon style="cursor: pointer" icon="save" @click="saveLocation" />
        </span>
        <span v-b-tooltip.hover :title="$t('editPlace')"><font-awesome-icon @click="showEditPlaceModal" style="cursor: pointer" icon="upload"/></span>
      </div>  
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
import { EventBus } from '@/ts/EventBus';

@Component
export default class MapPlace extends BaseComponent {

  @Prop({ required: true }) private place: Place;

  private renderPopup = false;

  private mounted() {
    this.place.marker.bindPopup(this.$refs.tooltip as HTMLElement, {}).on("popupopen", (event) => {
      this.renderPopup = true;
    });
  }

  private resizePopup() {
    this.place.marker._popup.update();
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

  private showEditPlaceModal() {
    EventBus.$emit('openSavePlaceModal' + this.place.id);
  }

  private makeGallery() {
    const fullHDs: Array<{src: string, thumb: string}> = [];
    for (const photo of this.place.photos) {
      const fullHD = {src: this.replaceHTTP(photo.image_fullhd), thumb: this.replaceHTTP(photo.image_thumb)};
      fullHDs.push(fullHD);
    }
    const time = new Date().getTime();
    window.lightGallery(this.$refs.smallImage, {
      dynamic: true,
      autoplay: true,
      pause: 2000,
      galleryId: time,
      dynamicEl: fullHDs,
    });
  }

  private makeFullResGallery() {
    const fullRess: Array<{src: string, thumb: string}> = [];
    for (const photo of this.place.photos) {
      const fullRes = {src: this.replaceHTTP(photo.image), thumb: this.replaceHTTP(photo.image_thumb)};
      fullRess.push(fullRes);
    }
    const time = new Date().getTime();
    window.lightGallery(this.$refs.fullResImage, {
      dynamic: true,
      autoplay: true,
      pause: 2000,
      galleryId: time,
      dynamicEl: fullRess,
    });
  }

}

</script>

<style>

.popupimgbig {
  cursor: pointer; 
  max-width: 300px; 
  max-height: 300px
}

.popupimgsmall {
  cursor: pointer; 
  max-width: 200px; 
  max-height: 200px
}

</style>