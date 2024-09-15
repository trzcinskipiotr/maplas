<template>
  <span>
    <div v-if="$store.state.isDesktop" ref="uploadTrackModal" class="modal fade" tabindex="-1" role="dialog">
      <info-modal :title="$t('trackSaveTitle')">
        <div v-if="renderModal">
          <table class="table table-sm">
            <thead></thead>
            <tbody>
              <tr>
                <th scope="row">{{ $t('name') }}</th>
                <td>
                  <input style="width: 500px" v-model="uploadName" type="text" class="form-control" />
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('startTime') }}</th>
                <td>
                  {{ track.gpsTrack.start_time|formatDate }}
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('endTime') }}</th>
                <td>
                  {{ track.gpsTrack.end_time|formatDate }}
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('distance') }}</th>
                <td>
                  {{ track.gpsTrack.distance|roundTrackDistance }}
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('description') }}</th>
                <td>
                  <textarea v-model="description" class="form-control" rows="2" style="width: 500px"></textarea>
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('type')}}</th>
                <td>
                  <v-select style="width: 500px" v-model="uploadTrackType" :options="uploadTrackTypes" :clearable="false" :searchable="false" >
                    <template slot="option" slot-scope="option">
                      <img v-if="option.imgsrc" style="height: 20px;" :src="option.imgsrc"/>
                      {{ option.label }}
                    </template>
                  </v-select>
                </td>
              </tr>
              <tr v-if="! track.onServer">
                <th scope="row">{{ $t('state')}}</th>
                <td>
                  <v-select style="width: 500px" v-model="uploadTrackStatus" :options="uploadTrackStatuses" :clearable="false" :searchable="false" >
                    <template slot="option" slot-scope="option">
                      <img v-if="option.imgsrc" style="height: 20px;" :src="option.imgsrc"/>
                      {{ option.label }}
                    </template>
                  </v-select>
                </td>
              </tr>
              <tr>
                <th scope="row">{{ $t('region')}}</th>
                <td>
                  <v-select style="width: 500px" v-model="uploadRegion" :options="uploadRegions" :clearable="true" :searchable="false" >
                    <template slot="option" slot-scope="option">
                      {{ option.label }}
                    </template>
                  </v-select>
                </td>
              </tr>
              <tr>
                <th scope="row">{{ $t('style') }}</th>
                <td>
                  <div>
                    <div style="float: left; margin-top: 4px; margin-right: 10px">
                      <color-popover :track="track" type="save"></color-popover>
                    </div>
                    <div style="float: left;">
                      <v-select style="width: 500px" v-model="uploadStyle" :options="uploadStyles" :clearable="true" :searchable="false" >
                        <template slot="option" slot-scope="option">
                          {{ option.label }}
                        </template>
                      </v-select>
                    </div>
                  </div>  
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('photos') }}</th>
                <td>
                  <table v-for="(photo, index) in trackLocalPhotoOrder" :key="photo.id" class="" style="display: inline; margin: 10px;">
                    <tr>
                      <td style="padding: 0px">
                        <img v-if="photo.image_thumb" :src="replaceHTTP(photo.image_thumb)" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                        <img v-else :src="photo.src" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0px">
                        <center>
                          <img v-if="photo.src" @click="removePhoto(photo)" style="cursor: pointer; width: 16px; height: 16px; float: left; margin-top: 4px; margin-right: 4px" :src="icons.trash" />
                          <div v-if="photo.src" style="display: inline; float: left" class="custom-control custom-checkbox" v-b-tooltip.hover :title="$t('setAsPrivate')">
                            <input type="checkbox" class="custom-control-input" :id="'checkbox' + photo.id" v-model="photo.private" />
                            <label style="margin-right: 2px;" class="custom-control-label" :for="'checkbox' + photo.id"></label>
                          </div>
                          <img @click="index != 0 ? moveLeft(photo) : null" :style="{width: '8px', 'cursor': index == 0 ? 'arrow' : 'pointer'}" :src="index == 0 ? icons.arrowLeftDisabled : icons.arrowLeft" />&nbsp;
                          <img @click="index != trackLocalPhotoOrder.length - 1 ? moveRight(photo) : null" :style="{width: '8px', 'cursor': index == trackLocalPhotoOrder.length - 1 ? 'arrow' : 'pointer'}" :src="index == trackLocalPhotoOrder.length - 1 ? icons.arrowRightDisabled : icons.arrowRight" />
                        </center>  
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0px; padding-bottom: 20px;">
                        <img v-if="photo.image_thumb && photo.private" style="width: 16px; height: 16px; margin-right: 2px" :src="icons.privacy" />
                        <span style="font-size: 12px; float: right; color: gray">{{ photo.org_filename }}</span>
                      </td>
                    </tr>
                  </table>
                  <div id="photouploaddivinner2" style="width: 48px; height: 48px;" @click="openPhotoImportFileInput" class="leaflet-touch leaflet-bar cogsbutton" v-b-tooltip.hover :title="$t('importPhotoFile')">
                    <input ref="importPhotoFileInput" type="file" style="display:none;" accept=".jpg" v-on:change="importPhotoFile" multiple />
                    <img style="cursor: pointer; width: 28px; height: 28px;" :src="icons.camera" />
                  </div>
                </td>
              </tr>
            </tbody>    
          </table>
          <div class="modal-footer">
            <div style="width: 50%" v-if="trackSaving"><b-progress :max="100" show-progress animated>
              <b-progress-bar :value="progress" show-progress animated>
                <strong>{{ progress.toFixed(0) }}%</strong>
              </b-progress-bar>
            </b-progress></div>
            <button type="button" class="btn btn-success" :disabled="trackSaving" @click="track.onServer ? saveTrackModal() : saveUploadTrackModal()">
              <strong><template v-if="trackSaving">
                <img style='height: 16px; animation: rotation 2s infinite linear;' :src="icons.spinnerWhite" />&nbsp;</template>{{ $t('save') }}</strong>
            </button>
            <button type="button" class="btn btn-primary" @click="closeUploadTrackModal">
              <strong>{{ $t('close') }}</strong>
            </button>
          </div>
        </div>
      </info-modal>
    </div>  
  </span>  
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {EventBus} from '@/ts/EventBus';
import axios, { AxiosResponse } from 'axios';
import Photo from '@/ts/Photo';
import { AlertStatus, TrackStatus, TrackType } from '@/ts/types';
import Track from '@/ts/Track';
import Region from '@/ts/Region';
import { roundCoord } from '@/ts/utils/coords';
import $ from 'jquery';
import * as icons from '@/ts/icons';

@Component
export default class SaveTrackModal extends BaseComponent {

  @Prop({ required: true }) private track: Track;

  public progress = 0;
  public renderModal = false;
  private photosToUpload = 0;
  private photosUploaded = 0;
  public photos: Photo[] = [];
  private uploadName = this.track.gpsTrack.name;
  private description = '';
  private trackSaving: boolean = false;
  private uploadTrackTypes: Array<{translate: string, label: string, value: number, icon?: string, imgsrc?: string}> = [];
  private uploadTrackType: {translate: string, label: string, value: number, icon?: string, imgsrc?: string};
  private uploadRegion: {translate: string, label: string, value: Region} = null;
  private uploadRegions: Array<{translate: string, label: string, value: Region}> = [];

  private uploadTrackStatuses: Array<{translate: string, label: string, value: number, icon?: string, imgsrc?: string}> = [];
  private uploadTrackStatus: {translate: string, label: string, value: number, icon?: string, imgsrc?: string};

  private uploadStyle: {label: string, value: number} = null;
  private uploadStyles = [{label: 'Linia ciągła', value: 1}, {label: 'Długie kreski gęsto', value: 2}, {label: 'Długie kreski rzadko', value: 3}, {label: 'Krótkie kreski gęsto', value: 4}, {label: 'Krótkie kręski rzadko', value: 5}, {label: 'Kropki gęsto', value: 6}, {label: 'Kropki rzadko', value: 7}];

  @Watch('uploadStyle')
  private onUploadStyleChange() {
    if (this.uploadStyle) {
      this.track.gpsTrack.style = this.uploadStyle.value;
    } else {
      this.track.gpsTrack.style = 1;
    }
  }

  private trackLocalPhotoOrder = [];
  private updatePhotoOrder = false;

  public constructor() {
    super();
    this.uploadTrackTypes = [{translate: 'bicycleTrack', label: '', imgsrc: icons.bicycle, value: TrackType.bicycle},
                             {translate: 'walkTrack', label: '', imgsrc: icons.shoe, value: TrackType.walk},
                             {translate: 'mushroomTrack', label: '', imgsrc: icons.mushroomIcon, value: TrackType.mushroom}];
    if (process.env.VUE_APP_BICYCLE_WALK_TRACKS_ONLY) {
      this.uploadTrackTypes = [{translate: 'bicycleTrack', label: '', imgsrc: icons.bicycle, value: TrackType.bicycle},
                               {translate: 'walkTrack', label: '', imgsrc: icons.shoe, value: TrackType.walk}];
    }
    if (process.env.VUE_APP_MUSHROOM_TRACKS_ONLY) {
      this.uploadTrackTypes = [{translate: 'mushroomTrack', label: '', imgsrc: icons.mushroomIcon, value: TrackType.mushroom}];
    }
    this.uploadTrackType = this.uploadTrackTypes[0];
    this.uploadTrackStatuses = [{translate: 'myDone', label: '', imgsrc: null, value: TrackStatus.done},
                                {translate: 'myPlanned', label: '', imgsrc: null, value: TrackStatus.planned},
                                {translate: 'otherPeople', label: '', imgsrc: null, value: TrackStatus.other_people},
                                {translate: 'trial', label: '', imgsrc: null, value: TrackStatus.trail},
                                {translate: 'event', label: '', imgsrc: null, value: TrackStatus.event},
                                {translate: 'border', label: '', imgsrc: null, value: TrackStatus.border}]
    this.uploadTrackStatus = this.uploadTrackStatuses[0];
    for (const trackType of this.uploadTrackTypes) {
      if (this.track.gpsTrack.type === trackType.value) {
        this.uploadTrackType = trackType;
      }
    }
    for (const trackStatus of this.uploadTrackStatuses) {
      if (this.track.gpsTrack.status === trackStatus.value) {
        this.uploadTrackStatus = trackStatus;
      }
    }
    for (const trackStyle of this.uploadStyles) {
      if (this.track.gpsTrack.style === trackStyle.value) {
        this.uploadStyle = trackStyle;
      }
    }
  }

  private findPhotoCurrentPosition(photo: Photo) {
    let index = 0;
    for(const ph of this.trackLocalPhotoOrder) {
      if (ph.id == photo.id) {
        return index;
      }
      index = index + 1;
    }
    return null;
  }

  private swapElements(array, i, j) {
    const origin = array[i];
    array[i] = array[j];
    Vue.set(array, j, origin);
  }

  private moveLeft(photo: Photo) {
    const index = this.findPhotoCurrentPosition(photo);
    if (index > 0) {
      this.swapElements(this.trackLocalPhotoOrder, index, index - 1);
      this.updatePhotoOrder = true;
    }
  }

  private moveRight(photo: Photo) {
    const index = this.findPhotoCurrentPosition(photo);
    if (index < this.trackLocalPhotoOrder.length - 1) {
      this.swapElements(this.trackLocalPhotoOrder, index, index + 1);
      this.updatePhotoOrder = true;
    }
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

  private arrayBufferToBase64(buffer: any) {
    var arrayBufferView = new Uint8Array(buffer);
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  }

  public removePhoto(photo: Photo) {
    this.trackLocalPhotoOrder.splice(this.trackLocalPhotoOrder.indexOf(photo), 1);
  }

  private openPhotoImportFileInput() {
    $(this.$refs.importPhotoFileInput).click();
  }

  private createPromiseFromFileReader(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();  
      reader.onload = (onLoadEvent: Event) => {
        resolve((onLoadEvent.target as FileReaderEventTarget).result)
      };
      reader.onerror = () => {
        reject()
      }
      reader.readAsArrayBuffer(file);
    });
  }

  private async importPhotoFile(event: Event) {
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      return;
    }
    for (const file of files) {
      const buffer = await this.createPromiseFromFileReader(file);
      const now = new Date();
      this.trackLocalPhotoOrder.push({'src': this.arrayBufferToBase64(buffer), 'buffer': buffer, 'id': now.getTime(), 'org_filename': file.name, 'private': false});
      this.updatePhotoOrder = true;
    };
    $(this.$refs.importPhotoFileInput).val('');
  }

  private refreshTrackPhotos() {
    this.track.gpsTrack.photos = [];
    axios.get(this.$store.state.appHost + 'api/tracks/' + this.track.gpsTrack.id + '/').then(
      (response: AxiosResponse) => {
        for (const responsePhoto of response.data.photo_set) {
          const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private, responsePhoto.order, responsePhoto.past);
          this.track.gpsTrack.addPhoto(photo);
        }
      }
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('trackRefreshError').toString(), 2000);
      },
    );
  }

  private newPhotoCount() {
    let count = 0;
    for(const photo of this.trackLocalPhotoOrder) {
      if (photo.src) {
        count = count + 1;
      }
    }
    return count;
  }

  private async saveTrackModal() {
    this.photosToUpload = this.newPhotoCount();
    this.photosUploaded = 0;
    const obj = this.track.gpsTrack.convertToApiTrackSave();
    obj.name = this.uploadName;
    obj.region = this.uploadRegion ? this.uploadRegion.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.status = this.uploadTrackStatus.value;
    obj.description = this.description;
    obj.style = this.uploadStyle.value;
    if ((this.track.gpsTrack.status === TrackStatus.planned) || (this.track.gpsTrack.status === TrackStatus.border)) {
      obj.points_json_optimized = '[[';
      for (const segment of this.track.gpsTrack.segments) {
        for (const point of segment.pointsArray) {
          obj.points_json_optimized = obj.points_json_optimized + '[' + roundCoord(point.lat) + ',' + roundCoord(point.lng) + ']';
          if (point !== segment.pointsArray[segment.pointsArray.length - 1]) {
            obj.points_json_optimized = obj.points_json_optimized + ','
          }
        }
      }
      obj.points_json_optimized = obj.points_json_optimized + ']]';
      obj.points_json = obj.points_json_optimized;
    }
    this.trackSaving = true;
    const nogpx = this.track.gpsTrack.status === TrackStatus.done ? '' : '?nogpx=true';
    try {
      const response = await axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/` + nogpx, obj)
      this.track.gpsTrack.region = this.uploadRegion ? this.uploadRegion.value : undefined;
      this.track.gpsTrack.name = obj.name;
      this.track.gpsTrack.description = obj.description;
      this.track.gpsTrack.color = obj.color;
      this.track.gpsTrack.type = obj.type;
      this.track.gpsTrack.status = obj.status;
      this.track.gpsTrack.style = obj.style;
      if (this.updatePhotoOrder) {
        let order = 1;
        for(const photo of this.trackLocalPhotoOrder) {
          if (photo.image_thumb) {
            const response_photo_order = await axios.patch(this.$store.state.appHost + `api/photos/${photo.id}/`, {order: order});
          } else {
            let form_data = new FormData();
            form_data.append('name', '');
            form_data.append('description', '');
            form_data.append('org_filename', photo.org_filename);
            form_data.append('track', this.track.gpsTrack.id);
            form_data.append('private', photo.private);
            form_data.append('order', order);
            form_data.append('image', new Blob([new Uint8Array(photo.buffer)], {type: 'image/jpeg'}), '1.jpg');
            let headers = {'Accept': 'application/json', 'Content-Type': 'multipart/form-data'}
            let response_photo = await axios.post(this.$store.state.appHost + 'api/photos/', form_data, {headers: headers, onUploadProgress: this.onUploadProgress})
            this.photosUploaded = this.photosUploaded + 1;
          }
          order = order + 1;
        }
      }
      this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
      this.refreshTrackPhotos();
      this.closeUploadTrackModal();
    } catch(response) {
      this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
    } finally {
      this.trackSaving = false;
    }
  }

  private showUploadModal() {
    this.renderModal = true;
    this.description = this.track.gpsTrack.description;
    this.uploadName = this.track.gpsTrack.name;
    this.updatePhotoOrder = false;
    this.trackLocalPhotoOrder = [];
    for(const photo of this.track.gpsTrack.photos) {
      this.trackLocalPhotoOrder.push(photo);
    }
    if (this.track.onServer) {
      for (const uploadRegion of this.uploadRegions) {
        if (this.track.gpsTrack.region && this.track.gpsTrack.region.id === uploadRegion.value.id) {
          this.uploadRegion = uploadRegion;
        }
      }
    }
    this.openModal(this.$refs.uploadTrackModal);
  }

  private closeUploadTrackModal() {
    this.closeModal(this.$refs.uploadTrackModal);
  }

  private async saveUploadTrackModal() {
    this.photosToUpload = this.newPhotoCount();
    this.photosUploaded = 0;
    this.progress = 5;
    const obj = this.track.gpsTrack.convertToApiGpxFileSave();
    obj.name = this.uploadName;
    obj.region = this.uploadRegion ? this.uploadRegion.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.status = this.uploadTrackStatus.value;
    obj.description = this.description;
    obj.upload_user = this.$store.state.user.id;
    obj.style = this.uploadStyle.value;
    if ((this.track.gpsTrack.status === TrackStatus.planned) || (this.track.gpsTrack.status === TrackStatus.border)) {
      obj.points_json_optimized = '[[';
      for (const segment of this.track.gpsTrack.segments) {
        for (const point of segment.pointsArray) {
          obj.points_json_optimized = obj.points_json_optimized + '[' + roundCoord(point.lat) + ',' + roundCoord(point.lng) + ']';
          if (point !== segment.pointsArray[segment.pointsArray.length - 1]) {
            obj.points_json_optimized = obj.points_json_optimized + ','
          }
        }
      }
      obj.points_json_optimized = obj.points_json_optimized + ']]';
      obj.points_json = obj.points_json_optimized;
    }
    this.trackSaving = true;
    const nogpx = this.track.gpsTrack.status === TrackStatus.done ? '' : '?nogpx=true';
    try {
      const response = await axios.post(this.$store.state.appHost + `api/tracks/` + nogpx, obj);
      this.track.gpsTrack.distance = response.data.distance;
      this.track.gpsTrack.points_json_optimized = response.data.points_json_optimized;
      this.track.gpsTrack.region = this.uploadRegion ? this.uploadRegion.value : undefined;
      this.track.gpsTrack.name = obj.name;
      this.track.gpsTrack.description = obj.description;
      this.track.gpsTrack.color = obj.color;
      this.track.gpsTrack.type = obj.type;
      this.track.gpsTrack.status = obj.status;
      this.track.gpsTrack.style = obj.style;
      this.track.gpsTrack.refreshSegments();
      this.track.refreshMapObjects(this.$store.state.map);
      this.track.onServer = true;
      if (this.updatePhotoOrder) {
        let order = 1;
        for(const photo of this.trackLocalPhotoOrder) {
          if (photo.image_thumb) {
            const response_photo_order = await axios.patch(this.$store.state.appHost + `api/photos/${photo.id}/`, {order: order});
          } else {
            let form_data = new FormData();
            form_data.append('name', '');
            form_data.append('description', '');
            form_data.append('org_filename', photo.org_filename);
            form_data.append('track', response.data.id);
            form_data.append('private', photo.private);
            form_data.append('order', order);
            form_data.append('image', new Blob([new Uint8Array(photo.buffer)], {type: 'image/jpeg'}), '1.jpg');
            let headers = {'Accept': 'application/json', 'Content-Type': 'multipart/form-data'}
            let response_photo = await axios.post(this.$store.state.appHost + 'api/photos/', form_data, {headers: headers, onUploadProgress: this.onUploadProgress})
            this.photosUploaded = this.photosUploaded + 1;
          }
          order = order + 1;
        }
      }
      this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
      this.closeUploadTrackModal();
      this.track.gpsTrack.id = response.data.id;
      this.$store.commit('removeImportedTrack', this.track);
      this.$store.commit('removePlannedTrack', this.track);
      this.$store.commit('addTrack', this.track);
      this.$store.commit('sortTracks');
      this.refreshTrackPhotos();
    } catch(response) {
      this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
    } finally {
      this.trackSaving = false;
      this.track.maximized = false;
    }
  }

  private mounted() {
    for (const region of this.$store.state.regions) {
      // @ts-ignore
      this.uploadRegions.push({translate: region.name, label: '', value: region});
    }
    this.translateAndAddArrayToTranslator(this.uploadRegions);
    this.translateAndAddArrayToTranslator(this.uploadTrackTypes);
    this.translateAndAddArrayToTranslator(this.uploadTrackStatuses);
    EventBus.$on('openSaveTrackModal' + this.track.gpsTrack.id, this.showUploadModal);
  }

}

</script>