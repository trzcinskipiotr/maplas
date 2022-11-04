<template>
  <span>
    <div ref="newPlaceModal" class="modal fade" tabindex="-1" role="dialog">
      <info-modal :title="$t('newPlace')">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th scope="row">{{ $t('name') }}</th>
              <td>
                <input v-model="name" style="width: 500px" type="text" class="form-control" />
              </td>  
            </tr>
            <tr>
              <th scope="row">{{ $t('type') }}</th>
              <td>
                <v-select style="width: 500px" v-model="savePlaceType" :options="savePlaceTypes" :clearable="true" :searchable="false" >
                  <template slot="option" slot-scope="option">
                    {{ option.label }}
                  </template>
                </v-select>
              </td>
            </tr>
            <tr>
              <th scope="row">{{ $t('isApproved') }}</th>
              <td>
                <div class="custom-control custom-checkbox">
                  <input :id="'isApprovedCheckbox' + (place ? place.id : '')" type="checkbox" class="custom-control-input" v-model="approved" />
                  <label class="custom-control-label" :for="'isApprovedCheckbox' + (place ? place.id : '')"> </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">{{ $t('description') }}</th>
              <td>
                <textarea v-model="description" class="form-control" rows="2" style="width: 500px"></textarea>
              </td>
            </tr>
            <tr>
              <th scope="row">{{ $t('coordinates') }}</th>
              <td>
                <div class="form-check">
                  <input class="form-check-input" type="radio" :name="'coordinatesRadio2_' + (place ? place.id : '')" value=1 :id="'coordsradio1_' + (place ? place.id : '')" v-model="coordinatesRadio">
                  <label class="form-check-label" :for="'coordsradio1_' + (place ? place.id : '')">
                    {{ $t('manually') }}
                  </label>
                </div>
                <input :disabled="coordinatesRadio != 1" style="width: 500px" type="text" class="form-control" v-model="manualCords" />
                <div class="form-check">
                  <input class="form-check-input" type="radio" :name="'coordinatesRadio2_' + (place ? place.id : '')" :id="'coordsradio2_' + (place ? place.id : '')" value=2 v-model="coordinatesRadio">
                  <label class="form-check-label" for="coordsradio2_">
                    {{ fromContextMenu ? $t('fromContextMenuPosition') : $t('fromMapCenter') }}: {{ mapCenterLat }}, {{ mapCenterLon }}
                  </label>
                </div>
                <div class="form-check disabled">
                  <input :disabled="! firstPhotoLat" class="form-check-input" type="radio" :name="'coordinatesRadio2_' + (place ? place.id : '')" :id="'coordsradio3_' + (place ? place.id : '')" value=3 v-model="coordinatesRadio">
                  <label class="form-check-label" :for="'coordsradio3_'+ (place ? place.id : '')">
                    {{ $t('fromFirstPhoto') }}: <span v-if="firstPhotoLat">{{ firstPhotoLat }}, {{ firstPhotoLon }}</span>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">{{ $t('photos') }}</th>
              <td>
                <template v-if="place">
                  <table v-for="photo in place.photos" :key="photo.id" class="" style="display: inline; margin: 10px;">
                    <tr><td>
                      <img :src="photo.image_thumb" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                    </td></tr>
                    <tr><td>
                      <font-awesome-icon v-if="photo.private" style="width: 16px; height: 16px; margin-right: 2px" icon="key" />
                      <span style="font-size: 12px; float: right; color: gray">{{ photo.org_filename }}</span>
                    </td></tr>    
                  </table>
                </template>  
                <table v-for="photo in photos" :key="photo.id" class="" style="display: inline; margin: 10px;">
                  <tr><td>
                    <img :src="photo.src" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                  </td></tr>
                  <tr><td>
                    <font-awesome-icon style="cursor: pointer; width: 16px; height: 16px;" icon="trash" v-on:click="removePhoto(photo)"/>
                    <div style="display: inline" class="custom-control custom-checkbox" v-b-tooltip.hover :title="$t('setAsPrivate')">
                      <input type="checkbox" class="custom-control-input" :id="'checkbox' + photo.id" v-model="photo.private" />
                      <label style="margin-right: 2px;" class="custom-control-label" :for="'checkbox' + photo.id"></label>
                    </div>
                    <span style="font-size: 12px; float: right; color: gray">{{ photo.org_filename }}</span>
                  </td></tr>    
                </table>
                <div id="photouploaddivinner2" style="width: 48px; height: 48px;" @click="openPhotoImportFileInput" class="leaflet-touch leaflet-bar cogsbutton" v-b-tooltip.hover :title="$t('importPhotoFile')">
                  <input ref="importPhotoFileInput" type="file" style="display:none;" accept=".jpg" v-on:change="importPhotoFile" />
                  <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="camera"/>
                </div>
              </td>
            </tr>
          </tbody>    
        </table>
        <div class="modal-footer">
          <div style="width: 50%" v-if="placeSaving"><b-progress :max="100" show-progress animated>
            <b-progress-bar :value="progress" show-progress animated>
              <strong>{{ progress.toFixed(0) }}%</strong>
            </b-progress-bar>
          </b-progress></div>
          <button type="button" class="btn btn-success" :disabled="(((!name) || (!savePlaceType)) || (placeSaving))" @click="saveNewPlaceModal">
            <template v-if="placeSaving"><font-awesome-icon class="fa-spin" icon="spinner" />&nbsp;</template><strong>{{ place ? $t('save') : $t('addPlaceToMap') }}</strong>
          </button>
          <button :disabled="placeSaving" type="button" class="btn btn-primary" @click="closeNewPlaceModal">
            <strong>{{ $t('close') }}</strong>
          </button>
        </div>
      </info-modal>
    </div>
  </span>    
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import PlaceType from '../ts/PlaceType';
import $ from 'jquery';
import EXIF from 'exif-js';
import { AlertStatus } from '@/ts/types';
import axios from 'axios';
import Place from '@/ts/Place';
import Photo from '@/ts/Photo';
import {checkString, splitCoords} from '@/ts/utils/coords';
import {EventBus} from '@/ts/EventBus';

interface FileReaderEventTarget extends EventTarget {
  result: string;
}

@Component
export default class SavePlaceModal extends BaseComponent {

  @Prop({ required: false }) private place: Place;

  public name = '';
  public description = '';
  public photos = [];
  public mapCenterLat = 0;
  public mapCenterLon = 0;
  public approved = true;
  public firstPhotoLat: Number = null;
  public firstPhotoLon: Number = null;
  public placeSaving = false;
  public manualCords = '';

  public progress = 0;
  private photosToUpload = 0;
  private photosUploaded = 0;

  private fromContextMenu = false;

  private firstSwitchToPhotoCoords = false;

  private savePlaceType: {translate: string, label: string, value: PlaceType} = null;
  private savePlaceTypes: Array<{translate: string, label: string, value: PlaceType}> = [];

  private coordinatesRadio = 1;

  @Watch('$store.state.placeTypes')
  private onStorePlaceTypesChanged() {
    this.savePlaceTypes = [];
    for (const placeType of this.$store.state.placeTypes) {
      // @ts-ignore
      this.savePlaceTypes.push({translate: placeType.name, label: '', value: placeType});
    }
    this.translateAndAddArrayToTranslator(this.savePlaceTypes);
  }

  public removePhoto(photo) {
    this.photos.splice(this.photos.indexOf(photo), 1);
    this.refreshFirstPhotoCoords();
  }

  public openNewPlaceModal(local: boolean, contextMenuLatLng: L.LatLng) {
    this.name = '';
    this.description = '';
    this.photos = [];
    this.coordinatesRadio = 2;
    this.savePlaceType = null;
    this.manualCords = '';
    this.approved = true;
    if (local) {
      this.mapCenterLat = Math.round(this.$store.state.map.getCenter().lat * 100000) / 100000;
      this.mapCenterLon = Math.round(this.$store.state.map.getCenter().lng * 100000) / 100000;
      this.fromContextMenu = false;
    } else {
      this.mapCenterLat = Math.round(contextMenuLatLng.lat * 100000) / 100000;
      this.mapCenterLon = Math.round(contextMenuLatLng.lng * 100000) / 100000;
      this.fromContextMenu = true;
    }
    this.firstPhotoLat = null;
    this.firstPhotoLon = null;
    this.firstSwitchToPhotoCoords = false;
    this.openModal(this.$refs.newPlaceModal);
  }

  public openEditPlaceModal() {
    this.name = this.place.name;
    this.description = this.place.description;
    this.photos = [];
    this.manualCords = this.place.lat + ' ' + this.place.lon;
    this.coordinatesRadio = 1;
    this.savePlaceType = null;
    for (const type of this.savePlaceTypes) {
      if (type.value.id == this.place.type.id) {
        this.savePlaceType = type;
      }
    }
    this.approved = this.place.approved;
    this.firstPhotoLat = null;
    this.firstPhotoLon = null;
    this.firstSwitchToPhotoCoords = false;
    this.openModal(this.$refs.newPlaceModal);
  }

  public closeNewPlaceModal() {
    this.closeModal(this.$refs.newPlaceModal);
  }

  private openPhotoImportFileInput() {
    $(this.$refs.importPhotoFileInput).click();
  }

  private arrayBufferToBase64(buffer) {
    var arrayBufferView = new Uint8Array(buffer);
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  }

  private ConvertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string) {
    let dd = degrees + minutes/60 + seconds/(60*60);
    if (direction == "S" || direction == "W") {
      dd = dd * -1;
    }
    return dd;
  }

  public refreshFirstPhotoCoords() {
    if (this.photos.length > 0) {
      const exifData = EXIF.readFromBinaryFile(this.photos[0].buffer);
      if (exifData.GPSLongitude && exifData.GPSLatitude) {
        let lon = this.ConvertDMSToDD(exifData.GPSLongitude[0].numerator, exifData.GPSLongitude[1].numerator, exifData.GPSLongitude[2].numerator / exifData.GPSLongitude[2].denominator, exifData.GPSLongitudeRef);
        let lat = this.ConvertDMSToDD(exifData.GPSLatitude[0].numerator, exifData.GPSLatitude[1].numerator, exifData.GPSLatitude[2].numerator / exifData.GPSLatitude[2].denominator, exifData.GPSLatitudeRef);
        this.firstPhotoLon = Math.round(lon * 100000) / 100000;
        this.firstPhotoLat = Math.round(lat * 100000) / 100000;
      } else {
        this.firstPhotoLon = null;
        this.firstPhotoLat = null;  
      }
    } else {
      this.firstPhotoLon = null;
      this.firstPhotoLat = null;
    }
    if (((this.firstPhotoLat === null) || (this.firstPhotoLon === null)) && (this.coordinatesRadio === 3)) {
      this.coordinatesRadio = 2;
    }
    if ((this.firstPhotoLon) && (this.firstPhotoLat) && (! this.firstSwitchToPhotoCoords)) {
      this.coordinatesRadio = 3;
      this.firstSwitchToPhotoCoords = true;
    }
  }

  private importPhotoFile(event: Event) {
    let lon = null;
    let lat = null;
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (onLoadEvent: Event) => {
      const buffer = (onLoadEvent.target as FileReaderEventTarget).result;
      const now = new Date();
      this.photos.push({'src': this.arrayBufferToBase64(buffer), 'buffer': buffer, 'id': now.getTime(), 'org_filename': file.name, 'private': false});
      this.refreshFirstPhotoCoords()
      $(this.$refs.importPhotoFileInput).val('');
    };
    reader.onerror = (onErrorEvent: Event) => {
      $(this.$refs.importPhotoFileInput).val('');
      this.createAlert(AlertStatus.danger, this.$t('importError').toString(), 2000);
    };
  }

  private downloadNewPlace(id: number) {
    axios.get(this.$store.state.appHost + 'api/places/' + id + '/').then(
      (response) => {
        let responsePlace = response.data;
        const placetype = new PlaceType(responsePlace.type.id, responsePlace.type.name, responsePlace.type.icon);
        const place = new Place(responsePlace.id, responsePlace.name, responsePlace.description, responsePlace.lat, responsePlace.lon, placetype, responsePlace.approved, this.$store.state.map.getZoom(), !!this.$store.state.user);
        for (const responsePhoto of responsePlace.photo_set) {
          const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private);
          place.addPhoto(photo);
        }
        this.$store.commit('addPlace', place);
        EventBus.$emit('RefreshPlacesGroups');
      }
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('placeRefreshError').toString(), 2000);
      },
    );
  }

  private onUploadProgress(progressEvent: ProgressEvent) {
    if (this.photosToUpload == 0) {
      this.progress = 100;
    } else {
      let part = this.photosUploaded / this.photosToUpload;
      let currentPart = ((progressEvent.loaded / progressEvent.total) / this.photosToUpload)
      this.progress = (part + currentPart) * 100
    }
  }

  private async saveNewPlaceModal() {
    this.photosToUpload = this.photos.length;
    this.photosUploaded = 0;
    let obj = {}
    obj.name = this.name;
    obj.description = this.description;
    obj.type = this.savePlaceType.value.id;
    obj.approved = this.approved;
    obj.photo_set = [];
    if (this.coordinatesRadio == 1) {
      if (! checkString(this.manualCords)) {
        this.createAlert(AlertStatus.danger, this.$t('coordsError').toString(), 2000);
        return;
      } else {
        const parts = splitCoords(this.manualCords);
        obj.lat = parts[0];
        obj.lon = parts[1];
      }
    }
    if (this.coordinatesRadio == 2) {
      obj.lat = this.mapCenterLat;
      obj.lon = this.mapCenterLon;
    }
    if (this.coordinatesRadio == 3) {
      obj.lat = this.firstPhotoLat;
      obj.lon = this.firstPhotoLon;
    }
    this.placeSaving = true;
    let placeSaved = false;
    let photosSaved = false;
    try {
      let response = null;
      if (this.place) {
        response = await axios.patch(this.$store.state.appHost + `api/places/${this.place.id}/`, obj);
        this.place.lat = obj.lat;
        this.place.lon = obj.lon;
        this.place.marker.setLatLng([this.place.lat, this.place.lon]);
      } else {
        response = await axios.post(this.$store.state.appHost + `api/places/`, obj);
      }
      placeSaved = true;
      for(let photo of this.photos) {
        let form_data = new FormData();
        form_data.append('name', '');
        form_data.append('description', '');
        form_data.append('org_filename', photo.org_filename);
        form_data.append('place', response.data.id);
        form_data.append('private', photo.private);
        form_data.append('image', new Blob([new Uint8Array(photo.buffer)], {type: 'image/jpeg'}), '1.jpg');
        let headers = {'Accept': 'application/json', 'Content-Type': 'multipart/form-data'}
        let response_photo = await axios.post(this.$store.state.appHost + 'api/photos/', form_data, {headers: headers, onUploadProgress: this.onUploadProgress})
        this.photosUploaded = this.photosUploaded + 1;
      }
      photosSaved = true;
      this.downloadNewPlace(response.data.id);
      setTimeout(() => {
        if (this.place) {
          this.place.changeMarkerSize(this.$store.state.zoomLevel);
        }
      }, 500);
      this.createAlert(AlertStatus.success, this.$t('placeSaved').toString(), 2000);
      this.closeNewPlaceModal();
      this.$store.state.map.setView([obj.lat, obj.lon], this.$store.state.map.getMaxZoom());
    } catch(err) {
      if (! placeSaved) {
        this.createAlert(AlertStatus.danger, this.$t('placeSavedError').toString(), 2000);
      } else if (! photosSaved) {
        this.createAlert(AlertStatus.danger, this.$t('photoSavedError').toString(), 2000);
        this.$store.state.map.setView([obj.lat, obj.lon], this.$store.state.map.getMaxZoom());
        this.closeNewPlaceModal();
      } else {
        this.createAlert(AlertStatus.danger, this.$t('placeRefreshError').toString(), 2000);
        this.$store.state.map.setView([obj.lat, obj.lon], this.$store.state.map.getMaxZoom());
        this.closeNewPlaceModal();
      }
    } finally {
      this.placeSaving = false;
    }
  }

  private mounted() {
    if (this.place) {
      EventBus.$on('openSavePlaceModal' + this.place.id, this.openEditPlaceModal)
    } else {
      EventBus.$on('NewPlaceRequested', (local: boolean, latlng: L.LatLng) => {
        this.openNewPlaceModal(local, latlng);
      });
    }
    this.onStorePlaceTypesChanged();
  }

}

</script>