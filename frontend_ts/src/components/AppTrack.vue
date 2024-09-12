<template>
  <div :style="{'margin-bottom': $store.state.isDesktop ? 0 : '15px'}">
    <div v-on:mouseover="highlightMapTrack()" v-on:mouseleave="unhighlightMapTrack()">
      <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpsTrack.id">
        <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpsTrack.id" v-model="checked" />
        <label style="margin-right: 2px;" class="custom-control-label" :for="'checkbox' + track.gpsTrack.id">{{ track.gpsTrack.name }}</label>
        <span class="badge badge-dark" style="margin-right: 2px;">{{ track.gpsTrack.start_time|formatDateDay }}</span>
        <span :class="getDisanseBadgeClasses(track.gpsTrack)" style="margin-right: 2px;">{{ track.gpsTrack.distance|roundTrackDistance }}</span>
        <span style="margin-right: 2px;" v-b-tooltip.hover :title="'' + track.gpsTrack.photos.length + ' ' + $t('photos')">
          <img v-if="track.gpsTrack.photos.length" @click="clickOpenGallery" style="height: 20px; cursor: pointer;" :src="icons.images" />
        </span>
        <span v-b-tooltip.hover :title="'' + track.gpsTrack.videos.length + ' ' + $t('videos')">
          <img v-if="track.gpsTrack.videos.length" @click="clickOpenVideos" style="height: 20px; cursor: pointer;" :src="icons.video" />
        </span>
        <div style="float: right;">
          <img @click="togglePanel(); renderComponent = true;" style="height: 13px; cursor: pointer;" :src="iconsVisible ? icons.chevronUp : icons.chevronDown" />
        </div>
      </div><br>
      <div style="display: none">
        <div :id="'tooltip' + track.gpsTrack.id" v-if="$store.state.isDesktop">
          <b>{{ $t('name') }}: </b>{{ track.gpsTrack.name }}<br>
          <b>{{ $t('startTime') }}: </b>{{ track.gpsTrack.start_time|formatDate }}<br>
          <b>{{ $t('distance') }}: </b>{{ track.gpsTrack.distance|roundTrackDistance }}<br>
          <b>{{ $t('type') }}: </b><TrackTypeIcon :gpsTrack="track.gpsTrack" height=12 imgheight=12 verticalAlign="-2px"></TrackTypeIcon><br>
          <b>{{ $t('status') }}: </b><TrackStatusIcon :gpsTrack="track.gpsTrack" height=12></TrackStatusIcon><br>
          <b>{{ $t('id') }}: </b>{{ track.gpsTrack.id }}
        </div>
      </div>
      <div v-if="renderComponent">
        <div ref="icons" style="display: block;" :style="{'margin-top': $store.state.isDesktop ? '0px' : '5px'}">
          <div ref="colorDiv" style="display: inline-block; margin-right: 3px;"><color-popover :track="track" :height="$store.state.isDesktop ? '24px' : '32px'" :width="$store.state.isDesktop ? null : '32px'"></color-popover></div>
          <b-tooltip v-if="(renderedComponent) && ($store.state.isDesktop)" :target="$refs.colorDiv">{{ $t('changeColor') }}</b-tooltip>
          <span v-if="$store.state.isDesktop" style='margin-right: 3px;'><TrackTypeIcon :gpsTrack="track.gpsTrack" height=24 imgheight=16 verticalAlign="2px"></TrackTypeIcon></span>
          <span v-if="$store.state.isDesktop" style='margin-right: 3px;'><TrackStatusIcon :gpsTrack="track.gpsTrack" height=24></TrackStatusIcon></span>
          <span style='margin-right: 3px;'><TrackDownload :gpsTrack="track.gpsTrack" :height="$store.state.isDesktop ? '24' : '32'" :width="$store.state.isDesktop ? null : '32px'"></TrackDownload></span>
          <span v-if="$store.state.isDesktop" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('centerTrack')">
            <img @click="centerTrack" style="height: 24px; cursor: pointer;" :src="icons.center" />
          </span>
          <span v-if="$store.state.isDesktop" ref="tooltipSpan" style='margin-right: 3px;'>
            <img @click="playTrack" style="height: 24px; cursor: pointer;" :src="playing ? icons.stop : icons.play" />
          </span>
          <span v-if="$store.state.isDesktop" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('maximizeTrack')">
            <img @click="track.maximized = true" style="height: 24px; cursor: pointer;" :src="icons.maximize" />
          </span>
          <b-tooltip v-if="(track.gpsTrack.status === TrackStatus.done) && (renderedComponent) && ($store.state.isDesktop)" :target="$refs.tooltipSpan">{{ playing ? $t('stopTrack') : $t('playTrack') }}</b-tooltip>
          <span v-if="($store.state.user) && ($store.state.isDesktop)">
            <span v-if="track.onServer" v-b-tooltip.hover :title="$t('saveTrack')">
              <img @click="showUploadModal" style="height: 24px; cursor: pointer;" :src="icons.save" />
            </span>
            <span v-else v-b-tooltip.hover :title="$t('uploadTrack')">
              <img @click="showUploadModal" style="height: 24px; cursor: pointer;" :src="icons.upload" />
            </span>  
            <span style='margin-right: 3px;'></span>
          </span>
          <span style="display: inline-block; margin-right: 3px;" @click="toggleRuler">
            <img :style="{'cursor': 'pointer', 'height': $store.state.isDesktop ? '24px' : '32px', 'width': $store.state.isDesktop ? null : '32px'}" :src="rulerActive ? icons.rulerVertical : icons.rulerHorizontal" />
          </span>
          <span v-if="(track.gpsTrack.status === TrackStatus.planned) && ($store.state.isDesktop)">
            <span v-if="track === $store.state.editedTrack">
              <img @click="setEdited(null)" style="height: 24px; cursor: pointer" :src="icons.unlock" />
            </span>
            <span v-else>
              <img @click="setEdited(track)" style="height: 24px; cursor: pointer" :src="icons.lock" />
            </span>
          </span>
          <span v-if="! track.onServer" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('removeTrack')">
            <img @click="removeImportedTrack" style="height: 24px; cursor: pointer;" :src="icons.trash" />
          </span>
        </div>
      </div>    
    </div>
  </div>
</template>

<script lang="ts">
import L, { LatLng, LeafletMouseEvent } from 'leaflet';
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
import { speedBetweenPoints, roundCoord, distanceBetweenPoints } from '@/ts/utils/coords';
import Photo from '@/ts/Photo';
import { EventBus } from '@/ts/EventBus';
import GpsTrack from '@/ts/GpsTrack';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean;
  private iconsVisible: boolean = true;
  private renderComponent: boolean = false;
  private renderedComponent: boolean = false;
  private playing: boolean = false;
  private rulerActive = false;
  private highlighted = false;

  @Prop({ required: true }) private track: Track;
  @Prop({ required: true }) private highlightOnStart: boolean;

  public constructor() {
    super();
    this.checked = this.track.checked;
  }

  private lastClickedGallery = 1;
  private openGalleryHandler: any;

  private clickOpenGallery() {
    const now = Date.now();
    if (now - this.lastClickedGallery > 250) {
      this.openGalleryHandler = setTimeout(() => this.openGallery(false), 250);
    } else {
      clearTimeout(this.openGalleryHandler);
      this.openGallery(true);
    }
    this.lastClickedGallery = now;
  }

  private openGallery(fullRes: boolean) {
    if (fullRes) {
      EventBus.$emit('openSlideShowFullTrack' + this.track.gpsTrack.id, 0);
    } else {
      EventBus.$emit('openSlideShowTrack' + this.track.gpsTrack.id, 0);
    }
  }

  private showUploadModal() {
    EventBus.$emit('openSaveTrackModal' + this.track.gpsTrack.id);
  }

  private refreshTooltip() {
    if (this.$store.state.isDesktop) {
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
        mapTrack.off('click');
        mapTrack.on('click', (e: LeafletMouseEvent) => {
          if (! this.$store.state.editedTrack) {
            if (this.track.gpsTrack.status == TrackStatus.planned) {
              if (e.originalEvent.ctrlKey) {
                if (! this.track.onServer) {
                  this.$store.commit('removePlannedTrack', this.track);
                }
              } else {
                this.$store.commit('setEditedTrack', this.track);
              }
              L.DomEvent.stopPropagation(e);
              return false;
            } else {
              this.track.maximized = !this.track.maximized;
            }
          }
        });
      }
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
    this.changeColor();
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
    this.highlighted = true;
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'bold';
    this.changeWidth(6);
    for (const mapTrack of this.track.mapTracks) {
      mapTrack.bringToFront();
    }
    if (this.track.checked) {
      if (this.track.startMarker) {
        this.track.startMarker.addTo(this.$store.state.map);
      }
      if (this.track.finishMarker) {
        this.track.finishMarker.addTo(this.$store.state.map);
      }
    }
  }

  private unhighlightMapTrack() {
    this.highlighted = false;
    document.getElementById('trackcheckbox' + this.track.gpsTrack.id)!.style.fontWeight = 'normal';
    this.changeWidth(3);
    if (this.track.startMarker) {
      this.track.startMarker.removeFrom(this.$store.state.map);
    }
    if (this.track.finishMarker) {
      this.track.finishMarker.removeFrom(this.$store.state.map);
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

  @Watch('$store.state.editedTrack')
  private onEditedTrackChanged() {
    if (this.$store.state.editedTrack === this.track) {
      for (const marker of this.track.plannedMarkers) {
        marker.addTo(this.$store.state.map);
      }
      for (const marker of this.track.middleMarkers) {
        marker.addTo(this.$store.state.map);
      }
    } else {
      for (const marker of this.track.plannedMarkers) {
        marker.removeFrom(this.$store.state.map);
      }
      for (const marker of this.track.middleMarkers) {
        marker.removeFrom(this.$store.state.map);
      }
    }
  }

  private rulerMarkers: L.CircleMarker[] = [];

  private createRulerMarkers() {
    this.rulerMarkers = [];
    for (const segment of this.track.gpsTrack.segments) {
      let lastDistance = -2000;
      let lastPoint: L.LatLng = null;
      let distance = 0;
      for (const point of segment.pointsArray) {
        if (lastPoint) {
           distance = distance + distanceBetweenPoints(point.lat, point.lng, lastPoint.lat, lastPoint.lng);
           if (distance >= lastDistance + 1000) {
             lastDistance = distance;
             const marker = new L.CircleMarker(point, {radius: 5});
             let decimalPlaces = 1;
             if ((distance > 0) && (distance < 1000)) {
               decimalPlaces = 3;
             }
             marker.bindTooltip((distance / 1000).toFixed(decimalPlaces), {permanent: true, className: 'smallTooltip', direction: 'right'});
             this.rulerMarkers.push(marker);
           }
           lastPoint = point;
        } else {
          lastPoint = point;
        }
      }
    }
  }

  private toggleRuler() {
    if (this.rulerMarkers.length === 0) {
      this.createRulerMarkers();
    }
    this.rulerActive = ! this.rulerActive;
    this.showOrHideTrack();
  }

  private showOrHideTrack() {
    if (this.checked) {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.addTo(this.$store.state.map);
      }
      if (this.highlighted) {
        if (this.track.startMarker) {
          this.track.startMarker.addTo(this.$store.state.map);
        }
        if (this.track.finishMarker) {
          this.track.finishMarker.addTo(this.$store.state.map);
        }
      }
      if (this.rulerActive) {
        for (const marker of this.rulerMarkers) {
          marker.addTo(this.$store.state.map);
        }
      } else {
        for (const marker of this.rulerMarkers) {
          marker.removeFrom(this.$store.state.map);
        }
      }
      if (this.$store.state.editedTrack === this.track) {
        for (const marker of this.track.plannedMarkers) {
          marker.addTo(this.$store.state.map);
        }
        for (const marker of this.track.middleMarkers) {
          marker.addTo(this.$store.state.map);
        }
      }
      this.track.checked = true;
    } else {
      for (const mapTrack of this.track.mapTracks) {
        mapTrack.removeFrom(this.$store.state.map);
      }
      if (this.track.startMarker) {
        this.track.startMarker.removeFrom(this.$store.state.map);
      }
      if (this.track.finishMarker) {
        this.track.finishMarker.removeFrom(this.$store.state.map);
      }
      for (const marker of this.track.plannedMarkers) {
        marker.removeFrom(this.$store.state.map);
      }
      for (const marker of this.track.middleMarkers) {
        marker.removeFrom(this.$store.state.map);
      }
      for (const marker of this.rulerMarkers) {
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

  private removeImportedTrack() {
    if (this.rulerActive) {
      this.toggleRuler();
    }
    this.track.removeMapObjects(this.$store.state.map);
    this.$store.commit('removeImportedTrack', this.track);
  }

  public beforeDestroy() {
    if (this.rulerActive) {
      this.toggleRuler();
    }
    if (this.track.gpsTrack.status == TrackStatus.planned) {
      this.track.removeMapObjects(this.$store.state.map);
    }
  }

  private clickOpenVideos() {
    EventBus.$emit('openTrackVideoModal' + this.track.gpsTrack.id);
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

.badge-green1 {
  color: white;
  background-color: rgb(108, 217, 98)
}

.badge-green2 {
  color: white;
  background-color: rgb(60, 179, 49);
}

.badge-green3 {
  color: white;
  background-color: rgb(44, 145, 35);
}

.badge-green4 {
  color: white;
  background-color: rgb(7, 79, 0);
}

</style>