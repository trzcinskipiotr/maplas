<template>
  <div style="display: none">
    <div ref="tooltip" style="minWidth: 200px">
      <div v-if="renderPopup">
        <div style="margin-bottom: 5px">
          <span v-if="$store.state.isDesktop">
            {{ place.id }} <b><a v-if="place.link" target="_blank" :href="place.link">{{ place.name }}</a><span v-else>{{ place.name }}</span></b>&nbsp;<a :href="'https://maps.google.com/maps?q=' + place.lat + ',' + place.lon" target="_blank">{{ place.lat}}, {{ place.lon }}</a>
          </span>
          <span v-else>
            <b>{{ place.name }}</b>&nbsp;
            <a :href="'https://maps.google.com/maps?q=' + place.lat + ',' + place.lon" target="_blank">
              <img style="height: 12px; cursor: pointer" :src="icons.locationBlack" />
            </a>
          </span>  
          <span style="float: right; margin-right: 16px;">
            <span :id="'tooltipPlace' + place.id" style='margin-right: 3px;'>
              <img style="height: 12px" :src="place.approved ? icons.approved : icons.question" />
            </span>
            <b-tooltip v-if="$store.state.isDesktop" :target="'tooltipPlace' + place.id">{{ place.approved ? $t('placeApproved') : $t('placeNotApproved') }}</b-tooltip>
            <span v-if="place.photos.length" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('fullRes')">
              &nbsp;<img ref="fullResImage" @click="makeFullResGallery" style="height: 12px; cursor: pointer" :src="icons.fullResolution" />
            </span>
            <br>
          </span>  
        </div>  
        <div v-if="place.photos.length">
          <center>
            <table v-if="((place.photos.length > 1) && ($store.state.isDesktop))">
              <tr>
                <td @click="photoIndex != 0 ? prevPhoto() : null" style="padding: 0px"><img @load="resizePopup" :style="{width: '10px', height: '20px', cursor: photoIndex == 0 ? 'arrow' : 'pointer'}" :src="photoIndex == 0 ? icons.arrowLeftDisabled : icons.arrowLeft"></td>
                <td style="padding-left: 5px; padding-right: 5px;"><img @load="resizePopup" ref="smallImage" :src="replaceHTTP(place.photos[photoIndex].image_thumb)" class="popupimgbigmorephotos" @click="makeGallery"></td>
                <td @click="photoIndex != place.photos.length - 1 ? nextPhoto() : null" style="padding: 0px"><img @load="resizePopup" :style="{width: '10px', height: '20px', cursor: photoIndex == place.photos.length - 1 ? 'arrow' : 'pointer'}" :src="photoIndex == place.photos.length - 1 ? icons.arrowRightDisabled : icons.arrowRight"></td>
              </tr>
            </table>
            <img v-else @load="resizePopup" ref="smallImage" :src="replaceHTTP(place.photos[0].image_thumb)" :class="$store.state.isDesktop ? 'popupimgbig' : 'popupimgsmall'" @click="makeGallery">
          </center>
          <span v-if="$store.state.isDesktop" style="float: right; color: gray"><br>{{ place.photos[0].org_filename }} {{ place.photos[0].exif_time_taken | formatDateSeconds }}<br></span>
        </div>
        <span v-if="place.videos.length">
          <div v-for="video in place.videos" :key="video.id">
            <b>{{ video.name }}</b> {{ video.description }}<br>
            <center><div v-html="video.html"></div></center>
          </div>
        </span> 
        <span v-if="$store.state.isDesktop">{{ place.description }}<br></span>
        <span v-if="(place.marker.getLatLng().lat != place.lat) && (place.marker.getLatLng().lng != place.lon)">
          <img @click="undoLocation" style="height: 20px; cursor: pointer;" :src="icons.undo" />&nbsp;
          <img @click="saveLocation" style="height: 20px; cursor: pointer;" :src="icons.save" />&nbsp;
        </span>
        <span v-if="$store.state.isDesktop" v-b-tooltip.hover :title="$t('editPlace')">
          <img @click="showEditPlaceModal" style="height: 20px; cursor: pointer;" :src="icons.upload" />
        </span>
        <img v-else style="height: 5px; width: 5px;" :src="icons.blankWhite" /> 
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

  private photoIndex = 0;

  private prevPhoto() {
    this.photoIndex = this.photoIndex - 1;
    if (this.photoIndex == -1) {
      this.photoIndex = this.place.photos.length - 1;
    }
  }

  private nextPhoto() {
    this.photoIndex = this.photoIndex + 1;
    if (this.photoIndex == this.place.photos.length) {
      this.photoIndex = 0;
    }
  }

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
    if (window.lgData[this.$refs.smallImage.getAttribute('lg-uid')]) {
      window.lgData[this.$refs.smallImage.getAttribute('lg-uid')].destroy(true);
    }
    window.lightGallery(this.$refs.smallImage, {
      dynamic: true,
      autoplay: false,
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
    if (window.lgData[this.$refs.fullResImage.getAttribute('lg-uid')]) {
      window.lgData[this.$refs.fullResImage.getAttribute('lg-uid')].destroy(true);
    }
    window.lightGallery(this.$refs.fullResImage, {
      dynamic: true,
      autoplay: false,
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
  max-height: 300px;
}

.popupimgbigmorephotos {
  cursor: pointer; 
  max-width: 270px; 
  max-height: 270px;
}

.popupimgsmall {
  cursor: pointer; 
  max-width: 200px; 
  max-height: 200px
}

.leaflet-popup-content {
  margin: 8px !important;
}

</style>