<template>
  <div>
    <div ref="detailsWindow" class="detailsWindow card" v-show="track.maximized">
      <div ref="detailsWindowHeader" class="detailsWindowHeader card-header" style="width: 500px">
        <span v-b-tooltip.hover :title="$t('centerTrack')">
          <img @click="centerTrack" style="height: 24px; cursor: pointer;" :src="icons.center" />
        </span>&nbsp;
        <span v-if="($store.state.user) && ($store.state.isDesktop)">
          <span v-if="track.onServer" v-b-tooltip.hover :title="$t('saveTrack')">
            <img @click="showUploadModal" style="height: 20px; cursor: pointer;" :src="icons.save" />
          </span>
          <span v-else v-b-tooltip.hover :title="$t('uploadTrack')">
            <img @click="showUploadModal" style="height: 20px; cursor: pointer;" :src="icons.upload" />
          </span>
          <span style='margin-right: 3px;'></span>
        </span>
        <div style="display: inline" class="custom-control custom-checkbox" :id="'detailstrackcheckbox' + track.gpsTrack.id">
          <input type="checkbox" class="custom-control-input" :id="'detailscheckbox' + track.gpsTrack.id" v-model="track.checked" />
          <label style="margin-right: 2px;" class="custom-control-label" :for="'detailscheckbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
        </div>
        <span class="badge badge-dark" style="margin-right: 2px; margin-left: 2px;">{{ track.gpsTrack.start_time|formatDateDay }}</span>
        <span :class="getDisanseBadgeClasses(track.gpsTrack)">{{ track.gpsTrack.distance|roundTrackDistance }}</span>
        <div style="float: right;">
          <img @click="toggleMaximizedDetails" style="height: 13px; cursor: pointer;" :src="maximizedDetails ? icons.chevronUp : icons.chevronDown" />&nbsp;
          <img @click="track.maximized = false" style="height: 20px; cursor: pointer;" :src="icons.closeIcon" />
        </div>
      </div>
      <div ref="maximizedBody" class="card-body">
        <center v-if="trackDetailsLoading">
          <img style='height: 32px; animation: rotation 2s infinite linear;' v-if="clearing" :src="icons.spinnerBlack" />&nbsp;
        </center>
        <div v-else>
          <b>{{ $t('name') }}</b>: {{ track.gpsTrack.name }}<br>
          <span v-if="track.gpsTrack.description"><b>{{ $t('description') }}</b>: {{ track.gpsTrack.description }}<br></span>
          <b>{{ $t('startTime') }}</b>: {{ track.gpsTrack.start_time|formatDate }}, {{ $t(dayIndex(track.gpsTrack.start_time)) }}<br>
          <b>{{ $t('distance') }}</b>: {{ track.gpsTrack.distance|roundTrackDistance }}<br>
          <span v-if="track.onServer"><b>{{ $t('type') }}</b>: <TrackTypeIcon :gpsTrack="track.gpsTrack" height=12 imgheight=12 verticalAlign="-2px"></TrackTypeIcon><br></span>
          <span v-if="track.onServer"><b>{{ $t('status') }}</b>: <TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br></span>
          <b>{{ $t('id') }}</b>: {{ track.gpsTrack.id }}<br>
          <span ref="gallerySpan"/>
          <b>{{ $t('photosAndMovies') }}</b>: 
            {{ track.gpsTrack.photos.length }}<img v-if="track.gpsTrack.photos.length" @click="clickOpenGallery" style="height: 20px; cursor: pointer;" :src="icons.images" />&nbsp;
            {{ track.gpsTrack.videos.length }}<img v-if="track.gpsTrack.videos.length" @click="clickOpenVideos" style="height: 20px; cursor: pointer;" :src="icons.video" /><br>
          <template v-if="track.gpsTrack.gpx_file"><b>{{ $t('gpxFile') }}: </b>{{ track.gpsTrack.gpx_file.length|roundFileBytes }} <button @click="saveGPX" type="button" class="btn btn-primary btn-sm">Download</button><br><br></template>
          <template v-if="track.gpsTrack.gpx_file"><button @click="showHideTimeLables" type="button" class="btn btn-primary btn-sm">{{ timeLabelsVisible ? $t('hideTimeLabels') : $t('showTimeLabels') }}</button></template>&nbsp;
          <template v-if="track.gpsTrack.gpx_file"><button @click="showHideSpeedLables" type="button" class="btn btn-primary btn-sm">{{ speedLabelsVisible ? $t('hideSpeedLabels') : $t('showSpeedLabels') }}</button></template>&nbsp;&nbsp;
          <template v-if="track.gpsTrack.gpx_file"><button @click="colorTrackBySpeed" type="button" class="btn btn-primary btn-sm">{{ speedTrackVisible ? $t('hideSpeedTrack') : $t('showSpeedTrack') }}</button></template>&nbsp;
        </div>  
      </div>  
    </div>
    <div style="z-index: 1000000000;" ref="videoModal" class="modal fade" tabindex="-1" role="dialog">
      <info-modal :title="$t('trackVideos')">
        <div v-if="videoModalOpened">
          <div v-for="video in track.gpsTrack.videos" :key="video.id">
            <b>{{ video.name }}</b><br>
            <div v-if="video.description">{{ video.description }}<br></div>
            <br>
            <center><div v-html="video.html"></div><br><br></center>
          </div>
        </div>  
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="closeVideoModal">
            <strong>{{ $t('close') }}</strong>
          </button>
        </div>
      </info-modal>
    </div>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {dragElement, formatDateDay, formatTimeSeconds} from '@/ts/utils';
import Track from '@/ts/Track';
import axios from 'axios';
import { AlertStatus } from '@/ts/types';
import FileSaver from 'file-saver';
import { speedBetweenPoints } from '@/ts/utils/coords';
import gpxParse from 'gpx-parse';
import $ from 'jquery';
import { EventBus } from '@/ts/EventBus';

@Component
export default class TrackDetails extends BaseComponent {

  private maximizedDetails: boolean = true;
  private trackDetailsLoading: boolean = false;

  private speedTrackVisible = false;
  private speedTrack: any = null;

  private timeLabelsVisible = false;
  private timePoints: {lat: number, lon: number, time: string}[] = [];
  private canvasTimeLayer: any = null;

  private speedLabelsVisible = false;
  private speedPoints: {lat: number, lon: number, speed: number}[] = [];
  private canvasSpeedLayer: any = null;

  private videoModalOpened = false;
  
  @Prop({ required: true }) private track: Track;

  private centerTrack() {
    const trackBounds = new L.LatLngBounds(this.track.mapTracks[0].getBounds().getNorthEast(), this.track.mapTracks[0].getBounds().getSouthWest());
    for (const mapTrack of this.track.mapTracks) {
      trackBounds.extend(mapTrack.getBounds());
    }
    this.$store.state.map.fitBounds(trackBounds);
  }

  private showUploadModal() {
    EventBus.$emit('openSaveTrackModal' + this.track.gpsTrack.id);
    this.track.maximized = false;
  }

  private dayIndex(date: Date) {
    if (date) {
      return 'day' + date.getDay()
    } else {
      return '';
    }
  }

  private lastClickedGallery = 1;
  private openGalleryHandler: any;

  private clickOpenGallery() {
    const now = Date.now();
    if (now - this.lastClickedGallery > 250) {
      this.openGalleryHandler = setTimeout(() => this.makeGallery(false, 0), 250);
    } else {
      clearTimeout(this.openGalleryHandler);
      this.makeGallery(true, 0);
    }
    this.lastClickedGallery = now;
  }


  private makeGallery(fullRes: boolean, index: number) {
    const fullRess: Array<{src: string, thumb: string}> = [];
    for (const photo of this.track.gpsTrack.photos) {
      let photoToAdd = null;
      if (fullRes) {
        photoToAdd = {src: this.replaceHTTP(photo.image), thumb: this.replaceHTTP(photo.image_thumb)};
      } else {
        photoToAdd = {src: this.replaceHTTP(photo.image_fullhd), thumb: this.replaceHTTP(photo.image_thumb)};
      }
      fullRess.push(photoToAdd)
    }
    const time = new Date().getTime();
    if (window.lgData[this.$refs.gallerySpan.getAttribute('lg-uid')]) {
      window.lgData[this.$refs.gallerySpan.getAttribute('lg-uid')].destroy(true);
    }
    window.lightGallery(this.$refs.gallerySpan, {
      index: index,
      dynamic: true,
      autoplay: true,
      pause: 2000,
      galleryId: time,
      dynamicEl: fullRess,
    });
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
                  const speed = speedBetweenPoints(point, last_point);
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
                  const speed = speedBetweenPoints(point, last_point);
                  last_point = point;
                  points.push({lat: point.lat, lon: point.lon, speed: speed});
                }
                index = index + 1;
              }
            }
          }
        }
      });
      this.speedTrack = L.multiOptionsPolyline(points as unknown as L.LatLng[], {
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
      this.track.checked = true;
    } else {
      this.speedTrack.addTo(this.$store.state.map);
      this.$store.commit('setSpeedLegendVisible', true);
      this.track.checked = false;
    }
    this.speedTrackVisible = !this.speedTrackVisible;
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

  public newZIndexForDetails(event) {
    this.$refs.detailsWindow.style.zIndex = 100000 + window.detailsLastZIndex;
    window.detailsLastZIndex = window.detailsLastZIndex + 1;
  }
  
  public mounted() {
    dragElement(this.$refs.detailsWindow, this.$refs.detailsWindowHeader);
    this.$refs.detailsWindowHeader.addEventListener('click', this.newZIndexForDetails);
    EventBus.$on('openSlideShowTrack' + this.track.gpsTrack.id, (index: number) => this.makeGallery(false, index));
    EventBus.$on('openSlideShowFullTrack' + this.track.gpsTrack.id, (index: number) => this.makeGallery(true, index));
    EventBus.$on('openTrackVideoModal' + this.track.gpsTrack.id, this.clickOpenVideos);
  }

  private clickOpenVideos() {
    this.videoModalOpened = true;
    this.openModal(this.$refs.videoModal);
  }

  private closeVideoModal() {
    this.videoModalOpened = false;
    this.closeModal(this.$refs.videoModal);
  }

  public beforeDestroy() {
    if (this.timeLabelsVisible) {
      this.showHideTimeLables();
    }
    if (this.speedLabelsVisible) {
      this.showHideSpeedLables();
    }
    if (this.speedTrackVisible) {
      this.colorTrackBySpeed();
    }
  }

  private toggleMaximizedDetails() {
    $(this.$refs.maximizedBody).slideToggle('fast');
    this.maximizedDetails = !this.maximizedDetails;
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
    this.$refs.detailsWindow.style.zIndex = 100000 + window.detailsLastZIndex;
    window.detailsLastZIndex = window.detailsLastZIndex + 1;
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

  @Watch('track.maximized')
  private onMaximizeChanged() {
    if (this.track.maximized) {
      this.maximizeTrack(null);
    }
  }

}

</script>