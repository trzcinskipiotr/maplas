<template>
  <div>
  <div v-on:mouseover="highlightMapTrack()" v-on:mouseleave="unhighlightMapTrack()">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpsTrack.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpsTrack.id" v-model="checked" />
      <label style="margin-right: 2px;" class="custom-control-label" :for="'checkbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
      <span class="badge badge-dark" style="margin-right: 2px;">{{ track.gpsTrack.start_time|formatDateDay }}</span>
      <span class="badge badge-success">{{ track.gpsTrack.distance|roundTrackDistance }}</span>
      <div style="float: right;">
        <font-awesome-icon @click="togglePanel(); renderComponent = true;" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div><br>
    <div style="display: none">
      <div :id="'tooltip' + track.gpsTrack.id">
        <b>{{ $t('name') }}: </b>{{ track.gpsTrack.name }}<br>
        <b>{{ $t('startTime') }}: </b>{{ track.gpsTrack.start_time|formatDate }}<br>
        <b>{{ $t('distance') }}: </b>{{ track.gpsTrack.distance|roundTrackDistance }}<br>
        <b>{{ $t('type') }}: </b><TrackTypeIcon :gpsTrack="track.gpsTrack" height=12 imgheight=12 verticalAlign="-2px"></TrackTypeIcon><br>
        <b>{{ $t('status') }}: </b><TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br>
        <b>{{ $t('id') }}: </b>{{ track.gpsTrack.id }}
      </div>
    </div>
    <div v-if="renderComponent">
      <div ref="icons" style="display: block;">
        <div style="display: inline-block; margin-right: 3px;" v-b-tooltip.hover :title="$t('changeColor')"><color-popover :track="track"></color-popover></div>
        <span style='margin-right: 3px;'><TrackTypeIcon :gpsTrack="track.gpsTrack" height=24 imgheight=16 verticalAlign="2px"></TrackTypeIcon></span>
        <span style='margin-right: 3px;'><TrackStatusIcon :gpsTrack="track.gpsTrack" height=24></TrackStatusIcon></span>
        <span style='margin-right: 3px;'><TrackDownload :gpsTrack="track.gpsTrack" height=24></TrackDownload></span>
        <span style='margin-right: 3px;' v-b-tooltip.hover :title="$t('centerTrack')"><font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/></span>
        <span ref="tooltipSpan" style='margin-right: 3px;'><font-awesome-icon @click="playTrack" style="height: 24px; cursor: pointer" :icon="playing ? 'stop-circle' : 'play'"/></span>
        <span style='margin-right: 3px;' v-b-tooltip.hover :title="$t('maximizeTrack')"><font-awesome-icon @click="maximizeTrack" style="height: 24px; cursor: pointer" :icon="['far', 'window-maximize']" /></span>
        <b-tooltip v-if="renderedComponent" :target="$refs.tooltipSpan">{{ playing ? $t('stopTrack') : $t('playTrack') }}</b-tooltip>
        <span v-if="$store.state.user">
          <span v-if="track.onServer" v-b-tooltip.hover :title="$t('saveTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="save"/></span>
          <span v-else v-b-tooltip.hover :title="$t('uploadTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="upload"/></span>
        </span>  
      </div>
      <div ref="uploadTrackModal" class="modal fade" tabindex="-1" role="dialog">
        <info-modal :title="$t('trackSaveTitle')">
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
                      <font-awesome-icon v-if="option.icon" :icon="option.icon"/>
                      <img v-if="option.imgsrc" style="height: 20px;" :src="option.imgsrc"/>
                      {{ option.label }}
                    </template>
                  </v-select>
                </td>
              </tr>
              <tr>
                <th scope="row">{{ $t('place')}}</th>
                <td>
                  <v-select style="width: 500px" v-model="uploadPlace" :options="uploadPlaces" :clearable="true" :searchable="false" >
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
            </tbody>    
          </table>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" @click="track.onServer ? saveTrackModal() : saveUploadTrackModal()">
              <strong><template v-if="trackSaving"><font-awesome-icon class="fa-spin" icon="spinner" />&nbsp;</template>{{ $t('save') }}</strong>
            </button>
            <button type="button" class="btn btn-primary" @click="closeUploadTrackModal">
              <strong>{{ $t('close') }}</strong>
            </button>
          </div>
        </info-modal>
      </div>
    </div>    
  </div>
  <div ref="detailsWindow" class="detailsWindow card" v-show="maximized">
    <div ref="detailsWindowHeader" class="detailsWindowHeader card-header" style="width: 500px">
      {{ track.gpsTrack.name }}
      <span class="badge badge-dark" style="margin-right: 2px; margin-left: 2px;">{{ track.gpsTrack.start_time|formatDateDay }}</span>
      <span class="badge badge-success">{{ track.gpsTrack.distance|roundTrackDistance }}</span>
      <div style="float: right;">
        <font-awesome-icon @click="toggleMaximizedDetails" style="cursor: pointer;" :icon="maximizedDetails ? 'chevron-up' : 'chevron-down'"/>&nbsp;
        <font-awesome-icon @click="maximized = false" style="cursor: pointer;" :icon="['far', 'times-circle']"/>
      </div>
    </div>
    <div ref="maximizedBody" class="card-body">
      <center v-if="trackDetailsLoading"><font-awesome-icon class="fa-spin" icon="spinner" size="4x"/></center>
      <div v-else>
        <b>{{ $t('name') }}: </b>{{ track.gpsTrack.name }}<br>
        <b>{{ $t('startTime') }}: </b>{{ track.gpsTrack.start_time|formatDate }}<br>
        <b>{{ $t('distance') }}: </b>{{ track.gpsTrack.distance|roundTrackDistance }}<br>
        <b>{{ $t('type') }}: </b><TrackTypeIcon :gpsTrack="track.gpsTrack" height=12 imgheight=12 verticalAlign="-2px"></TrackTypeIcon><br>
        <b>{{ $t('status') }}: </b><TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br>
        <b>{{ $t('id') }}: </b>{{ track.gpsTrack.id }}<br>
        <template v-if="track.gpsTrack.gpx_file"><b>{{ $t('gpxFile') }}: </b>{{ track.gpsTrack.gpx_file.length|roundFileBytes }} <button @click="saveGPX" type="button" class="btn btn-primary btn-sm">Download</button><br></template>
      </div>  
    </div>  
  </div>
  </div>
</template>

<script lang="ts">
import L from 'leaflet';
import axios from 'axios';
import $ from 'jquery';
import BaseComponent from '@/components/Base.vue';
import Track from '@/ts/Track';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AlertStatus, TrackType, TrackStatus } from '@/ts/types';
import Place from '@/ts/Place';
import {dragElement} from '@/ts/utils';
import FileSaver from 'file-saver';
import {formatDate, formatDateDay, roundTrackDistance, sumTracksDistance, sumTracksDistanceWalk, sumTracksDistanceBicycle, sumTracksDistanceMushroom, roundFileBytes} from '@/ts/utils';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean;
  private iconsVisible: boolean = true;
  private renderComponent: boolean = false;
  private renderedComponent: boolean = false;
  private playing: boolean = false;
  private uploadTrackTypes: Array<{translate: string, label: string, value: number, icon?: string, imgsrc?: string}> = [];
  private uploadTrackType: {translate: string, label: string, value: number, icon?: string, imgsrc?: string};
  private uploadPlace: {translate: string, label: string, value: Place} = null;
  private uploadPlaces: Array<{translate: string, label: string, value: Place}> = [];

  private trackSaving: boolean = false;
  private maximized: boolean = false;
  private maximizedDetails: boolean = true;

  private trackDetailsLoading: boolean = false;

  @Prop({ required: true }) private track: Track;
  @Prop({ required: true }) private highlightOnStart: boolean;

  private uploadName = this.track.gpsTrack.name;
  private description = '';

  public constructor() {
    super();
    this.checked = this.track.checked;
    this.uploadTrackTypes = [{translate: 'bicycleTrack', label: '', icon: 'biking', value: TrackType.bicycle},
                             {translate: 'walkTrack', label: '', icon: 'shoe-prints', value: TrackType.walk},
                             {translate: 'mushroomTrack', label: '', imgsrc: 'img/mushroom.svg', value: TrackType.mushroom}];
    if (process.env.VUE_APP_BICYCLE_WALK_TRACKS_ONLY) {
      this.uploadTrackTypes = [{translate: 'bicycleTrack', label: '', icon: 'biking', value: TrackType.bicycle},
                               {translate: 'walkTrack', label: '', icon: 'shoe-prints', value: TrackType.walk}];
    }
    if (process.env.VUE_APP_MUSHROOM_TRACKS_ONLY) {
      this.uploadTrackTypes = [{translate: 'mushroomTrack', label: '', imgsrc: 'img/mushroom.svg', value: TrackType.mushroom}];
    }
    this.uploadTrackType = this.uploadTrackTypes[0];
  }

  private mounted() {
    for (const mapTrack of this.track.mapTracks) {
      mapTrack.bindTooltip(document.getElementById('tooltip' + this.track.gpsTrack.id)!, {sticky: true, opacity: 0.95});
      mapTrack.on('mouseover', (e) => {
        this.highlightMapTrack();
      });
      mapTrack.on('mouseout', (e) => {
        this.unhighlightMapTrack();
      });
    }
    this.showOrHideTrack();
    this.togglePanel();
    for (const animateTrack of this.track.animateTracks) {
      // @ts-ignore
      animateTrack.on(L.Motion.Event.Ended, (event: Event) => {
        if (this.playing) {
          // @ts-ignore
          if (event.target.animateTrackIndex === this.track.animateTracks.length - 1) {
            this.playing = false;
            for (const animateTrackIn of this.track.animateTracks) {
              animateTrackIn.removeFrom(this.$store.state.map);
            }
            if (this.checked) {
              for (const mapTrack of this.track.mapTracks) {
                mapTrack.addTo(this.$store.state.map);
              }
            }
          } else {
            // @ts-ignore
            this.track.animateTracks[event.target.animateTrackIndex + 1].addTo(this.$store.state.map);
            // @ts-ignore
            this.track.animateTracks[event.target.animateTrackIndex + 1].motionStart();
          }
        }
      });
    }
    for (const place of this.$store.state.places) {
      // @ts-ignore
      this.uploadPlaces.push({translate: place.name, label: '', value: place});
    }
    this.changeColor();
    this.translateAndAddArrayToTranslator(this.uploadPlaces);
    this.translateAndAddArrayToTranslator(this.uploadTrackTypes);
    if (this.highlightOnStart) {
      this.highlightMapTrack();
    }
    dragElement(this.$refs.detailsWindow, this.$refs.detailsWindowHeader);
  }

  private togglePanel() {
    $(this.$refs.icons).slideToggle('fast');
    this.iconsVisible = !this.iconsVisible;
  }

  private toggleMaximizedDetails() {
    $(this.$refs.maximizedBody).slideToggle('fast');
    this.maximizedDetails = !this.maximizedDetails;
  }

  private updated() {
    if (this.renderComponent) {
      this.renderedComponent = true;
    }
  }

  private saveTrackModal() {
    const obj = this.track.gpsTrack.convertToApiTrackSave();
    obj.name = this.uploadName;
    obj.place = this.uploadPlace ? this.uploadPlace.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.description = this.description;
    this.trackSaving = true;
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/`, obj)
      .then((response: object) => {
        this.track.gpsTrack.place = this.uploadPlace ? this.uploadPlace.value : undefined;
        this.track.gpsTrack.name = obj.name;
        this.track.gpsTrack.description = obj.description;
        this.track.gpsTrack.color = obj.color;
        this.track.gpsTrack.type = obj.type;
        this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
        this.closeUploadTrackModal();
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
      }).finally(() => {
        this.trackSaving = false;
      });
  }

  private saveGPX() {
    const blob = new Blob([this.track.gpsTrack.gpx_file], {type: 'text/plain;charset=utf-8'});
    const date = formatDateDay(this.track.gpsTrack.start_time);
    if (date) {
      FileSaver.saveAs(blob, this.track.gpsTrack.name + ' ' + date + ' source.gpx');
    } else {
      FileSaver.saveAs(blob, this.track.gpsTrack.name + ' source.gpx');
    }
  }

  private maximizeTrack(e: Event) {
    if (this.track.gpsTrack.gpx_file === undefined) {
      this.trackDetailsLoading = true;
      axios.get(this.$store.state.appHost + 'api/tracks/' + this.track.gpsTrack.id + '/').then(
        (response) => {
          this.track.gpsTrack.points_json = response.data.points_json;
          this.track.gpsTrack.gpx_file = response.data.gpx_file;
        },
      ).catch(
        (response) => {
          this.createAlert(AlertStatus.danger, this.$t('trackError').toString(), 2000);
        },
      ).finally(
        () => {
          this.trackDetailsLoading = false;
        },
      );
    }
    this.maximized = true;
    // @ts-ignore
    this.$refs.detailsWindow.style.left = (15 + document.getElementById('map').getBoundingClientRect().left) + 'px';
    // @ts-ignore
    this.$refs.detailsWindow.style.top = '15px';
    if (! this.maximizedDetails) {
      this.toggleMaximizedDetails();
    }
  }

  private showUploadModal() {
    this.description = this.track.gpsTrack.description;
    this.uploadName = this.track.gpsTrack.name;
    if (this.track.onServer) {
      for (const uploadPlace of this.uploadPlaces) {
        if (this.track.gpsTrack.place && this.track.gpsTrack.place.id === uploadPlace.value.id) {
          this.uploadPlace = uploadPlace;
        }
      }
    }
    this.openModal(this.$refs.uploadTrackModal);
  }

  private closeUploadTrackModal() {
    this.closeModal(this.$refs.uploadTrackModal);
  }

  private saveUploadTrackModal() {
    const obj = this.track.gpsTrack.convertToApiGpxFileSave();
    obj.name = this.uploadName;
    obj.place = this.uploadPlace ? this.uploadPlace.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.description = this.description;
    obj.upload_user = this.$store.state.user.id;
    this.trackSaving = true;
    axios.post(this.$store.state.appHost + `api/tracks/`, obj)
      .then((response: any) => {
        this.track.gpsTrack.distance = response.data.distance;
        this.track.gpsTrack.id = response.data.id;
        this.track.gpsTrack.points_json_optimized = response.data.points_json_optimized;
        this.track.gpsTrack.place = this.uploadPlace ? this.uploadPlace.value : undefined;
        this.track.gpsTrack.name = obj.name;
        this.track.gpsTrack.description = obj.description;
        this.track.gpsTrack.color = obj.color;
        this.track.gpsTrack.type = obj.type;
        this.$store.commit('removeImportedTrack', this.track);
        this.$store.commit('addTrack', this.track);
        this.$store.commit('sortTracks');
        this.track.onServer = true;
        this.createAlert(AlertStatus.success, this.$t('trackSaved').toString(), 2000);
        this.closeUploadTrackModal();
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, this.$t('trackSavedError').toString(), 2000);
      }).finally(() => {
        this.trackSaving = false;
      });
  }

  private centerTrack() {
    const trackBounds = new L.LatLngBounds(this.track.mapTracks[0].getBounds().getNorthEast(), this.track.mapTracks[0].getBounds().getSouthWest());
    for (const mapTrack of this.track.mapTracks) {
      trackBounds.extend(mapTrack.getBounds());
    }
    this.$store.state.map.fitBounds(trackBounds);
  }

  private playTrack() {
    if (! this.playing) {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.removeFrom(this.$store.state.map);
      }
      let index = 0;
      for (const loopIndex in Object.keys(this.track.animateTracks)) {
        if (this.track.animateTracks.hasOwnProperty(loopIndex)) {
          const animateTrack = this.track.animateTracks[loopIndex];
          animateTrack.motionOptions.duration = (this.track.gpsTrack.distance / this.$store.state.playingSpeed) * (this.track.gpsTrack.segments[loopIndex].distance / this.track.gpsTrack.distance);
          if (this.track.gpsTrack.isWalkTrack() || this.track.gpsTrack.isMushroomTrack()) {
            animateTrack.motionOptions.duration = animateTrack.motionOptions.duration * 10;
          }
          animateTrack.animateTrackIndex = index;
          index = index + 1;
          animateTrack.options.color = this.track.gpsTrack.color;
        }
      }
      this.track.animateTracks[0].addTo(this.$store.state.map);
      this.track.animateTracks[0].motionStart();
      this.playing = true;
    } else {
      this.track.animateTracks[this.track.animateTracks.length - 1].motionStop();
    }
  }

  private highlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'bold';
    this.changeWidth(6);
    for (const mapTrack of this.track.mapTracks) {
      mapTrack.bringToFront();
    }
    this.track.startMarker.addTo(this.$store.state.map);
    this.track.finishMarker.addTo(this.$store.state.map);
  }

  private unhighlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(3);
    this.track.finishMarker.removeFrom(this.$store.state.map);
    this.track.startMarker.removeFrom(this.$store.state.map);
  }

  private changeWidth(width: number) {
    for (const mapTrack of this.track.mapTracks) {
      mapTrack.setStyle({
        weight: width,
      });
    }
  }

  private changeColor() {
    for (const mapTrack of this.track.mapTracks) {
      mapTrack.setStyle({
        color: this.track.gpsTrack.color,
      });
    }
  }

  private showOrHideTrack() {
    if (this.checked) {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.addTo(this.$store.state.map);
      }
      this.track.checked = true;
    } else {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.removeFrom(this.$store.state.map);
      }
      this.track.checked = false;
    }
  }

  @Watch('track.checked')
  private onPropCheckedChanged(value: boolean, oldValue: boolean) {
    this.checked = this.track.checked;
  }

  @Watch('checked')
  private onCheckedChanged(value: boolean, oldValue: boolean) {
    this.showOrHideTrack();
  }

  @Watch('track.gpsTrack.color')
  private onColorChanged(value: string, oldValue: string) {
    this.changeColor();
  }

}
</script>

<style scoped>
.detailsWindow {
  position: fixed;
  z-index: 1000000;
}

.detailsWindowHeader {
  cursor: move;
}
</style>