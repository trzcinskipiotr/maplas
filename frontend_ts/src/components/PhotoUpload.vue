<template>
  <div>
    <div id="photouploaddiv" style="display: none;">
      <div id="photouploaddivinner" style="width: 48px; height: 48px;" @click="openPhotoImportFileInput" class="leaflet-touch leaflet-bar cogsbutton" v-b-tooltip.hover :title="$t('importPhotoFile')">
        <input id="importPhotoFileInput" type="file" style="display:none;" accept=".jpg" v-on:change="importPhotoFile" />
        <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="camera"/>
      </div>
    </div>
    <div ref="uploadPhotoModal" class="modal fade" tabindex="-1" role="dialog">
      <info-modal :title="$t('photoSaveTitle')">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th scope="row">{{ $t('thumbnail') }}</th>
              <td>
                <center><img ref="thumbImg" style="max-height: 200px" /></center>
              </td>  
            </tr>
            <tr>
              <th scope="row">{{ $t('name') }}</th>
              <td>
                <input v-model="name" style="width: 500px" type="text" class="form-control" />
              </td>  
            </tr>
            <tr>
              <th scope="row">{{ $t('coordinates') }}</th>
              <td>
                <input disabled style="width: 500px" type="text" class="form-control" :value="lat + ', ' + lon"/>
              </td>  
            </tr>
            <tr>
              <th scope="row">{{ $t('description') }}</th>
              <td>
                <textarea v-model="description" class="form-control" rows="2" style="width: 500px"></textarea>
              </td>
            </tr>
          </tbody>    
        </table>
        <div class="modal-footer">
          <button type="button" :disabled="! (lat && lon)" class="btn btn-success" @click="addPhotoToMap">
            <strong>{{ $t('addPhotoToMap') }}</strong>
          </button>
          <button type="button" class="btn btn-primary" @click="closeUploadPhotoModal">
            <strong>{{ $t('close') }}</strong>
          </button>
        </div>
      </info-modal>
    </div>  
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BaseComponent from './Base.vue';
import { AlertStatus } from '@/ts/types';
import L from 'leaflet';
import $ from 'jquery';
import EXIF from 'exif-js';
import Photo from '@/ts/Photo';
import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lg-fullscreen.js';
import 'lg-zoom.js';
import 'lg-hash.js';


interface FileReaderEventTarget extends EventTarget {
  result: string;
}

@Component
export default class PhotoUpload extends BaseComponent {

  private lat: number = null;
  private lon: number = null;
  private name: string = '';
  private description: string = '';
  private jpgsrc = null;
  
  private openPhotoImportFileInput() {
    $('#importPhotoFileInput').click();
  }

  private closeUploadPhotoModal() {
    this.closeModal(this.$refs.uploadPhotoModal);
  }

  private addPhotoToMap() {
    const photo = new Photo(this.name, this.description, this.lat, this.lon);
    photo.marker.addTo(this.$store.state.map);
    const smallImage = document.createElement("IMG");
    smallImage.src = this.jpgsrc;
    smallImage.style.maxWidth = '300px';
    smallImage.style.maxHeight = '300px';
    smallImage.style.cursor = 'pointer';
    smallImage.onclick = () => {
      let subHtml = '';
      if (this.name) {
        subHtml = '<h4>' + this.name + '</h4>';
      }
      if (this.description) {
        subHtml = subHtml + '<p>' + this.description + '</p>';
      }
      window.lightGallery(smallImage, {
        dynamic: true,
        galleryId: new Date().getTime(),
        dynamicEl: [{
          "src": smallImage.src,
          'thumb': smallImage.src,
          'subHtml': subHtml,
        }]
    })};
    const div = document.createElement("DIV");
    div.innerHTML = "<b>" + this.name + "</b></span>";
    div.appendChild(smallImage);
    photo.marker.bindPopup(div, {maxWidth: 'auto', maxHeight: 'auto'});
    this.closeUploadPhotoModal();
    this.$store.state.map.setView([this.lat, this.lon], this.$store.state.map.getZoom());
    this.createAlert(AlertStatus.success, this.$t('photoAdded').toString(), 2000);
  }

  @Watch('$store.state.map')
  private onMapChanged(value: string, oldValue: string) {
    const PhotoUploadControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('photouploaddivinner');
      },
    });
    this.$store.state.map.addControl(new PhotoUploadControl());
  }

  private arrayBufferToBase64(buffer) {
    var arrayBufferView = new Uint8Array(buffer);
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  }

  private ConvertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string) {
    var dd = degrees + minutes/60 + seconds/(60*60);
    if (direction == "S" || direction == "W") {
      dd = dd * -1;
    }
    return dd;
  }

  private importPhotoFile(event: Event) {
    this.lon = null;
    this.lat = null;
    this.name = '';
    this.description = '';
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      this.createAlert(AlertStatus.danger, this.$t('importNoFiles').toString(), 2000);
      return;
    }
    const file = files[0];
    this.name = file.name;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (onLoadEvent: Event) => {
      const buffer = (onLoadEvent.target as FileReaderEventTarget).result;
      this.jpgsrc = this.arrayBufferToBase64(buffer);
      this.openModal(this.$refs.uploadPhotoModal);
      this.$refs.thumbImg.src = this.jpgsrc;
      const exifData = EXIF.readFromBinaryFile(buffer);
      this.lon = this.ConvertDMSToDD(exifData.GPSLongitude[0].numerator, exifData.GPSLongitude[1].numerator, exifData.GPSLongitude[2].numerator, exifData.GPSLongitudeRef);
      this.lat = this.ConvertDMSToDD(exifData.GPSLatitude[0].numerator, exifData.GPSLatitude[1].numerator, exifData.GPSLatitude[2].numerator, exifData.GPSLatitudeRef);
      this.lon = Math.round(this.lon * 100000) / 100000;
      this.lat = Math.round(this.lat * 100000) / 100000;
      $('#importPhotoFileInput').val('');
    };
    reader.onerror = (onErrorEvent: Event) => {
      $('#importPhotoFileInput').val('');
      this.createAlert(AlertStatus.danger, this.$t('importError').toString(), 2000);
      this.name = '';
    };
  }

}
</script>