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
        <span v-if="track.gpsTrack.status === TrackStatus.done" ref="tooltipSpan" style='margin-right: 3px;'><font-awesome-icon @click="playTrack" style="height: 24px; cursor: pointer" :icon="playing ? 'stop-circle' : 'play'"/></span>
        <span v-if="track.gpsTrack.status === TrackStatus.done" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('maximizeTrack')"><font-awesome-icon @click="track.maximized = true" style="height: 24px; cursor: pointer" :icon="['far', 'window-maximize']" /></span>
        <b-tooltip v-if="(track.gpsTrack.status === TrackStatus.done) && (renderedComponent)" :target="$refs.tooltipSpan">{{ playing ? $t('stopTrack') : $t('playTrack') }}</b-tooltip>
        <span v-if="$store.state.user">
          <span v-if="track.onServer" v-b-tooltip.hover :title="$t('saveTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="save"/></span>
          <span v-else v-b-tooltip.hover :title="$t('uploadTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="upload"/></span>
          <span style='margin-right: 3px;'></span>
        </span>
        <span v-if="track.gpsTrack.status === TrackStatus.planned">
          <span v-if="track === $store.state.editedTrack">
            <font-awesome-icon @click="setEdited(null)" style="height: 24px; cursor: pointer" icon="lock-open"/>
          </span>
          <span v-else>
            <font-awesome-icon @click="setEdited(track)" style="height: 24px; cursor: pointer" icon="lock"/>
          </span>
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
  </div>
</template>

<script lang="ts">
import L, { LatLng } from 'leaflet';
import axios from 'axios';
import $ from 'jquery';
import BaseComponent from '@/components/Base.vue';
import Track from '@/ts/Track';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AlertStatus, TrackType, TrackStatus } from '@/ts/types';
import Region from '@/ts/Region';
import FileSaver from 'file-saver';
import {formatDate, formatTimeSeconds, formatDateDay, roundTrackDistance, sumTracksDistance, sumTracksDistanceWalk, sumTracksDistanceBicycle, sumTracksDistanceMushroom, roundFileBytes} from '@/ts/utils';
import gpxParse from 'gpx-parse';
import { speedBetweenPoints, roundCoord } from '@/ts/utils/coords';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean;
  private iconsVisible: boolean = true;
  private renderComponent: boolean = false;
  private renderedComponent: boolean = false;
  private playing: boolean = false;
  private uploadTrackTypes: Array<{translate: string, label: string, value: number, icon?: string, imgsrc?: string}> = [];
  private uploadTrackType: {translate: string, label: string, value: number, icon?: string, imgsrc?: string};
  private uploadRegion: {translate: string, label: string, value: Region} = null;
  private uploadRegions: Array<{translate: string, label: string, value: Region}> = [];

  private trackSaving: boolean = false;

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

  private refreshTooltip() {
    for (const mapTrack of this.track.mapTracks) {
      if (this.track.gpsTrack.status === TrackStatus.done) {
        const element = document.getElementById('tooltip' + this.track.gpsTrack.id);
        mapTrack.bindTooltip(element, {sticky: true, opacity: 0.95});
      }
      mapTrack.on('mouseover', (e) => {
        this.highlightMapTrack();
      });
      mapTrack.on('mouseout', (e) => {
        this.unhighlightMapTrack();
      });
      mapTrack.on('click', (e) => {
        if (! this.$store.state.editedTrack) {
          this.track.maximized = !this.track.maximized;
        }
      });
    }
  }

  private mounted() {
    this.refreshTooltip();
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
    for (const region of this.$store.state.regions) {
      // @ts-ignore
      this.uploadRegions.push({translate: region.name, label: '', value: region});
    }
    this.changeColor();
    this.translateAndAddArrayToTranslator(this.uploadRegions);
    this.translateAndAddArrayToTranslator(this.uploadTrackTypes);
    if (this.highlightOnStart) {
      this.highlightMapTrack();
    }
  }

  private setEdited(track: Track) {
    this.$store.commit('setEditedTrack', track);
    if (track) {
      track.checked = true;
    }
  }

  private togglePanel() {
    $(this.$refs.icons).slideToggle('fast');
    this.iconsVisible = !this.iconsVisible;
  }

  private updated() {
    if (this.renderComponent) {
      this.renderedComponent = true;
    }
  }

  private saveTrackModal() {
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
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/` + nogpx, obj)
      .then((response: object) => {
        this.track.gpsTrack.region = this.uploadRegion ? this.uploadRegion.value : undefined;
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

  private showUploadModal() {
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

  private saveUploadTrackModal() {
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
    axios.post(this.$store.state.appHost + `api/tracks/` + nogpx, obj)
      .then((response: any) => {
        this.track.gpsTrack.distance = response.data.distance;
        this.track.gpsTrack.id = response.data.id;
        this.track.gpsTrack.points_json_optimized = response.data.points_json_optimized;
        this.track.gpsTrack.region = this.uploadRegion ? this.uploadRegion.value : undefined;
        this.track.gpsTrack.name = obj.name;
        this.track.gpsTrack.description = obj.description;
        this.track.gpsTrack.color = obj.color;
        this.track.gpsTrack.type = obj.type;
        if (this.track.gpsTrack.status === TrackStatus.done) {
          this.$store.commit('removeImportedTrack', this.track);
          this.$store.commit('addTrack', this.track);
          this.$store.commit('sortTracks');
        }
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
    if (this.track.startMarker) {
      this.track.startMarker.addTo(this.$store.state.map);
    }
    if (this.track.finishMarker) {
      this.track.finishMarker.addTo(this.$store.state.map);
    }
  }

  private unhighlightMapTrack() {
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(3);
    if (this.track.startMarker) {
      this.track.finishMarker.removeFrom(this.$store.state.map);
    }
    if (this.track.finishMarker) {
      this.track.startMarker.removeFrom(this.$store.state.map);
    }
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
      for (const marker of this.track.plannedMarkers) {
        marker.addTo(this.$store.state.map);
      }
      for (const marker of this.track.middleMarkers) {
        marker.addTo(this.$store.state.map);
      }
      this.track.checked = true;
    } else {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.removeFrom(this.$store.state.map);
      }
      for (const marker of this.track.plannedMarkers) {
        marker.removeFrom(this.$store.state.map);
      }
      for (const marker of this.track.middleMarkers) {
        marker.removeFrom(this.$store.state.map);
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

  @Watch('track.lastRefresh')
  private onPointsChanged(value: string, oldValue: string) {
    this.showOrHideTrack();
    this.refreshTooltip();
  }

}
</script>

<style>
.detailsWindow {
  position: fixed;
  z-index: 100000;
}

.lg-backdrop {
  z-index: 1000000;
}

.lg-outer {
  z-index: 2000000;
}

.detailsWindowHeader {
  cursor: move;
}

.smallTooltip {
  padding: 1px;
  margin: 0px;
  margin-left: 10px;
  border: 1px solid black;
  font-size: 0.7rem;
}

.leaflet-layer2 {
  z-index: 1000000 !important;
}

</style>