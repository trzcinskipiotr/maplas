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
                <th scope="row">{{ $t('color') }}</th>
                <td>
                  <color-popover :track="track" type="save"></color-popover>
                </td>  
              </tr>
              <tr>
                <th scope="row">{{ $t('photos') }}</th>
                <td>
                  <table v-for="photo in track.gpsTrack.photos" :key="photo.id" class="" style="display: inline; margin: 10px;">
                    <tr><td>
                      <img :src="replaceHTTP(photo.image_thumb)" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                    </td></tr>
                    <tr><td>
                      <img v-if="photo.private" style="width: 16px; height: 16px; margin-right: 2px" :src="icons.privacy" />
                      <span style="font-size: 12px; float: right; color: gray">{{ photo.org_filename }}</span>
                    </td></tr>    
                  </table>
                  <table v-for="photo in photos" :key="photo.id" class="" style="display: inline; margin: 10px;">
                    <tr><td>
                      <img :src="photo.src" style="max-heigth: 180px; max-width: 180px; border: 1px black solid" />
                    </td></tr>
                    <tr><td>
                      <img @click="removePhoto(photo)" style="cursor: pointer; width: 16px; height: 16px; margin-right: 2px" :src="icons.trash" />
                      <div style="display: inline" class="custom-control custom-checkbox" v-b-tooltip.hover :title="$t('setAsPrivate')">
                        <input type="checkbox" class="custom-control-input" :id="'checkbox' + photo.id" v-model="photo.private" />
                        <label style="margin-right: 2px;" class="custom-control-label" :for="'checkbox' + photo.id"></label>
                      </div>
                      <span style="font-size: 12px; float: right; color: gray">{{ photo.org_filename }}</span>
                    </td></tr>    
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
    for (const trackType of this.uploadTrackTypes) {
      if (this.track.gpsTrack.type === trackType.value) {
        this.uploadTrackType = trackType;
      }
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
    this.photos.splice(this.photos.indexOf(photo), 1);
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
      this.photos.push({'src': this.arrayBufferToBase64(buffer), 'buffer': buffer, 'id': now.getTime(), 'org_filename': file.name, 'private': false});
    };
    $(this.$refs.importPhotoFileInput).val('');
  }

  private refreshTrackPhotos() {
    this.track.gpsTrack.photos = [];
    axios.get(this.$store.state.appHost + 'api/tracks/' + this.track.gpsTrack.id + '/').then(
      (response: AxiosResponse) => {
        for (const responsePhoto of response.data.photo_set) {
          const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private);
          this.track.gpsTrack.addPhoto(photo);
        }
      }
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('trackRefreshError').toString(), 2000);
      },
    );
  }

  private async saveTrackModal() {
    this.photosToUpload = this.photos.length;
    this.photosUploaded = 0;
    const obj = this.track.gpsTrack.convertToApiTrackSave();
    obj.name = this.uploadName;
    obj.region = this.uploadRegion ? this.uploadRegion.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.description = this.description;
    if (this.track.gpsTrack.status === TrackStatus.planned) {
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
      for(let photo of this.photos) {
        let form_data = new FormData();
        form_data.append('name', '');
        form_data.append('description', '');
        form_data.append('org_filename', photo.org_filename);
        form_data.append('track', this.track.gpsTrack.id);
        form_data.append('private', photo.private);
        form_data.append('image', new Blob([new Uint8Array(photo.buffer)], {type: 'image/jpeg'}), '1.jpg');
        let headers = {'Accept': 'application/json', 'Content-Type': 'multipart/form-data'}
        let response_photo = await axios.post(this.$store.state.appHost + 'api/photos/', form_data, {headers: headers, onUploadProgress: this.onUploadProgress})
        this.photosUploaded = this.photosUploaded + 1;
      }
      this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
      this.refreshTrackPhotos();
      this.closeUploadTrackModal();
    } catch(response) {
      this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
    } finally {
      this.trackSaving = false;
      this.photos = [];
    }
  }

  private showUploadModal() {
    this.renderModal = true;
    this.description = this.track.gpsTrack.description;
    this.uploadName = this.track.gpsTrack.name;
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
    this.photosToUpload = this.photos.length;
    this.photosUploaded = 0;
    this.progress = 5;
    const obj = this.track.gpsTrack.convertToApiGpxFileSave();
    obj.name = this.uploadName;
    obj.region = this.uploadRegion ? this.uploadRegion.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.description = this.description;
    obj.upload_user = this.$store.state.user.id;
    if (this.track.gpsTrack.status === TrackStatus.planned) {
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
      this.track.gpsTrack.refreshSegments();
      this.track.refreshMapObjects(this.$store.state.map);
      this.track.onServer = true;
      for(let photo of this.photos) {
        let form_data = new FormData();
        form_data.append('name', '');
        form_data.append('description', '');
        form_data.append('org_filename', photo.org_filename);
        form_data.append('track', response.data.id);
        form_data.append('private', photo.private);
        form_data.append('image', new Blob([new Uint8Array(photo.buffer)], {type: 'image/jpeg'}), '1.jpg');
        let headers = {'Accept': 'application/json', 'Content-Type': 'multipart/form-data'}
        let response_photo = await axios.post(this.$store.state.appHost + 'api/photos/', form_data, {headers: headers, onUploadProgress: this.onUploadProgress})
        this.photosUploaded = this.photosUploaded + 1;
      }
      this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
      this.closeUploadTrackModal();
      this.track.gpsTrack.id = response.data.id;
      if (this.track.gpsTrack.status === TrackStatus.done) {
        this.$store.commit('removeImportedTrack', this.track);
        this.$store.commit('addTrack', this.track);
        this.$store.commit('sortTracks');
      }
      this.refreshTrackPhotos();
    } catch(response) {
      this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
    } finally {
      this.trackSaving = false;
      this.track.maximized = false;
      this.photos = [];
    }
  }

  private mounted() {
    for (const region of this.$store.state.regions) {
      // @ts-ignore
      this.uploadRegions.push({translate: region.name, label: '', value: region});
    }
    this.translateAndAddArrayToTranslator(this.uploadRegions);
    this.translateAndAddArrayToTranslator(this.uploadTrackTypes);
    EventBus.$on('openSaveTrackModal' + this.track.gpsTrack.id, this.showUploadModal);
  }

}

</script>