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
  <div ref="detailsWindow" class="detailsWindow card" v-show="maximized">
    <div ref="detailsWindowHeader" class="detailsWindowHeader card-header" style="width: 500px">
      <span v-b-tooltip.hover :title="$t('centerTrack')"><font-awesome-icon @click="centerTrack" style="cursor: pointer" icon="search-location"/></span>&nbsp;
      <div style="display: inline" class="custom-control custom-checkbox" :id="'detailstrackcheckbox' + track.gpsTrack.id">
        <input type="checkbox" class="custom-control-input" :id="'detailscheckbox' + track.gpsTrack.id" v-model="checked" />
        <label style="margin-right: 2px;" class="custom-control-label" :for="'detailscheckbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
      </div>
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
        <template v-if="track.gpsTrack.gpx_file"><b>{{ $t('gpxFile') }}: </b>{{ track.gpsTrack.gpx_file.length|roundFileBytes }} <button @click="saveGPX" type="button" class="btn btn-primary btn-sm">Download</button><br><br></template>
        <template v-if="track.gpsTrack.gpx_file"><button @click="showHideTimeLables" type="button" class="btn btn-primary btn-sm">{{ timeLabelsVisible ? $t('hideTimeLabels') : $t('showTimeLabels') }}</button></template>&nbsp;
        <template v-if="track.gpsTrack.gpx_file"><button @click="showHideSpeedLables" type="button" class="btn btn-primary btn-sm">{{ speedLabelsVisible ? $t('hideSpeedLabels') : $t('showSpeedLabels') }}</button></template>&nbsp;&nbsp;
        <template v-if="track.gpsTrack.gpx_file"><button @click="colorTrackBySpeed" type="button" class="btn btn-primary btn-sm">{{ speedTrackVisible ? $t('hideSpeedTrack') : $t('showSpeedTrack') }}</button></template>&nbsp;
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
import {dragElement} from '@/ts/utils';
import FileSaver from 'file-saver';
import {formatDate, formatTimeSeconds, formatDateDay, roundTrackDistance, sumTracksDistance, sumTracksDistanceWalk, sumTracksDistanceBicycle, sumTracksDistanceMushroom, roundFileBytes} from '@/ts/utils';
import gpxParse from 'gpx-parse';

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
  private maximized: boolean = false;
  private maximizedDetails: boolean = true;

  private trackDetailsLoading: boolean = false;

  @Prop({ required: true }) private track: Track;
  @Prop({ required: true }) private highlightOnStart: boolean;

  private uploadName = this.track.gpsTrack.name;
  private description = '';

  private speedTrackVisible = false;
  private speedTrack: any = null;

  private timeLabelsVisible = false;
  private timePoints: {lat: number, lon: number, time: string}[] = [];
  private canvasTimeLayer: any = null;

  private speedLabelsVisible = false;
  private speedPoints: {lat: number, lon: number, speed: number}[] = [];
  private canvasSpeedLayer: any = null;

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
      mapTrack.bindTooltip(document.getElementById('tooltip' + this.track.gpsTrack.id), {sticky: true, opacity: 0.95});
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
    dragElement(this.$refs.detailsWindow, this.$refs.detailsWindowHeader);
  }

  public onDrawLayer(info: any) {
    let ctx = info.canvas.getContext('2d');
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
    ctx.font = "12px Arial";
    ctx.textAlign = 'center';
    for (let i = 0; i < this.timePoints.length; i++) {
      let timePoint = this.timePoints[i];
      if (info.bounds.contains([timePoint.lat, timePoint.lon])) {
        const dot = info.layer._map.latLngToContainerPoint([timePoint.lat, timePoint.lon]);
        const text = ctx.measureText(timePoint.time);
        ctx.fillStyle = 'white';
        ctx.fillRect(dot.x - text.width / 2 - 1, dot.y - 11, text.width + 2, 14);
        ctx.fillStyle = 'black';
        ctx.fillText(timePoint.time, dot.x, dot.y);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(dot.x - text.width / 2 - 1, dot.y - 11, text.width + 2, 14);
      }
    }
    for (let i = 0; i < this.speedPoints.length; i++) {
      let speedPoint = this.speedPoints[i];
      if (info.bounds.contains([speedPoint.lat, speedPoint.lon])) {
        const dot = info.layer._map.latLngToContainerPoint([speedPoint.lat, speedPoint.lon]);
        const text = ctx.measureText(speedPoint.speed.toFixed(1));
        ctx.fillStyle = 'white';
        ctx.fillRect(dot.x - text.width / 2 - 1, dot.y - 11, text.width + 2, 14);
        ctx.fillStyle = 'black';
        ctx.fillText(speedPoint.speed.toFixed(1), dot.x, dot.y);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(dot.x - text.width / 2 - 2, dot.y - 11, text.width + 4, 14);
      }
    }
  };

  private showHideTimeLables() {
    if (this.timeLabelsVisible) {
      this.timePoints = [];
      this.canvasTimeLayer.removeFrom(this.$store.state.map);
      this.canvasTimeLayer = null;
    } else {
      this.timePoints = [];
      let index = 0;
      gpxParse.parseGpx(this.track.gpsTrack.gpx_file, (error: string, data: any) => {
        if (error) {
          this.createAlert(AlertStatus.danger, this.$t('gpxParsingError').toString(), 2000);
        } else {
          for (const fileTrack of data.tracks) {
            for (const segment of fileTrack.segments) {
              for (const point of segment) {
                if (index % 10 == 0) {
                  this.timePoints.push({lat: point.lat, lon: point.lon, time: formatTimeSeconds(point.time)});
                }
                index = index + 1;
              }
            }
          }
          this.canvasTimeLayer = L.canvasLayer();
          this.canvasTimeLayer.delegate(this).addTo(this.$store.state.map);
          this.canvasTimeLayer._onLayerDidMove();
          this.canvasTimeLayer.needRedraw();
        }
      });
    }
    this.timeLabelsVisible = !this.timeLabelsVisible;
  }

  private showHideSpeedLables() {
    if (this.speedLabelsVisible) {
      this.speedPoints = [];
      this.canvasSpeedLayer.removeFrom(this.$store.state.map);
      this.canvasSpeedLayer = null;
    } else {
      this.speedPoints = [];
      let index = 0;
      gpxParse.parseGpx(this.track.gpsTrack.gpx_file, (error: string, data: any) => {
        if (error) {
          this.createAlert(AlertStatus.danger, this.$t('gpxParsingError').toString(), 2000);
        } else {
          let last_point = null;
          for (const fileTrack of data.tracks) {
            for (const segment of fileTrack.segments) {
              for (const point of segment) {
                if (! last_point) {
                  last_point = point;
                } else if (index % 10 == 0) {
                  const speed = this.speedBetweenPoints(point, last_point);
                  last_point = point;
                  this.speedPoints.push({lat: point.lat, lon: point.lon, speed: speed});
                }
                index = index + 1;
              }
            }
          }
          this.canvasSpeedLayer = L.canvasLayer();
          this.canvasSpeedLayer.delegate(this).addTo(this.$store.state.map);
          this.canvasSpeedLayer._onLayerDidMove();
          this.canvasSpeedLayer.needRedraw();
        }
      });
    }
    this.speedLabelsVisible = !this.speedLabelsVisible;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }

  private distanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number) {
    let R = 6371;
    let dLat = this.deg2rad(lat2-lat1);
    let dLon = this.deg2rad(lon2-lon1); 
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c * 1000; // Distance in meters
    return d;
  }

  private speedBetweenPoints(p2: any, p1: any) {
    let dist = this.distanceBetweenPoints(p1.lat, p1.lon, p2.lat, p2.lon);
    let time_s = (p2.time - p1.time) / 1000.0;
    let speed_mps = dist / time_s;
    let speed_kph = (speed_mps * 3600.0) / 1000.0;
    return speed_kph;
  }

  private colorTrackBySpeed() {
    if (! this.speedTrack) {
      const points: {lat: number, lon: number, speed: number}[] = [];
      let index = 0;
      gpxParse.parseGpx(this.track.gpsTrack.gpx_file, (error: string, data: any) => {
        if (error) {
          this.createAlert(AlertStatus.danger, this.$t('gpxParsingError').toString(), 2000);
        } else {
          let last_point = null;
          for (const fileTrack of data.tracks) {
            for (const segment of fileTrack.segments) {
              for (const point of segment) {
                if (! last_point) {
                  last_point = point;
                } else if (index % 10 == 0) {
                  const speed = this.speedBetweenPoints(point, last_point);
                  last_point = point;
                  points.push({lat: point.lat, lon: point.lon, speed: speed});
                }
                index = index + 1;
              }
            }
          }
        }
      });
      this.speedTrack = L.multiOptionsPolyline(points as unknown as LatLng[], {
        multiOptions: {
          optionIdxFn: (latLng) => {
            const altThresholds = this.$store.state.speedThresholds;
            for (let i = 0; i < altThresholds.length; ++i) {
                if (latLng.speed <= altThresholds[i]) {
                    return i;
                }
            }
            return altThresholds.length;
          },
          options: this.$store.state.speedColors,
        },
      weight: 5,
      lineCap: 'butt',
      opacity: 0.75,
      smoothFactor: 1})
    }
    if (this.speedTrackVisible) {
      this.speedTrack.removeFrom(this.$store.state.map);
      this.$store.commit('setSpeedLegendVisible', false);
      this.checked = true;
    } else {
      this.speedTrack.addTo(this.$store.state.map);
      this.$store.commit('setSpeedLegendVisible', true);
      this.checked = false;
    }
    this.speedTrackVisible = !this.speedTrackVisible;
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
    obj.region = this.uploadRegion ? this.uploadRegion.value.id : undefined;
    obj.type = this.uploadTrackType.value;
    obj.description = this.description;
    this.trackSaving = true;
    axios.put(this.$store.state.appHost + `api/tracks/${this.track.gpsTrack.id}/`, obj)
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
    this.$refs.detailsWindow.style.left = (window.detailsX + document.getElementById('map').getBoundingClientRect().left) + 'px';
    // @ts-ignore
    this.$refs.detailsWindow.style.top = '' + window.detailsY + 'px';
    window.detailsX = window.detailsX + 50;
    window.detailsY = window.detailsY + 50;
    if (window.detailsX > 400) {
      window.detailsX = 50;
    }
    if (window.detailsY > 400) {
      window.detailsY = 50;
    }
    if (! this.maximizedDetails) {
      this.toggleMaximizedDetails();
    }
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
    this.trackSaving = true;
    axios.post(this.$store.state.appHost + `api/tracks/`, obj)
      .then((response: any) => {
        this.track.gpsTrack.distance = response.data.distance;
        this.track.gpsTrack.id = response.data.id;
        this.track.gpsTrack.points_json_optimized = response.data.points_json_optimized;
        this.track.gpsTrack.region = this.uploadRegion ? this.uploadRegion.value : undefined;
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

<style>
.detailsWindow {
  position: fixed;
  z-index: 1000000;
}

.detailsWindowHeader {
  cursor: move;
}

.smallTooltip {
  padding: 1px;
  margin: 0px;
  border: 1px solid black;
  font-size: 0.6rem;
}

.leaflet-layer2 {
  z-index: 1000000 !important;
}

</style>