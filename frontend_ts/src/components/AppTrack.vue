<template>
  <div :style="{'margin-bottom': $store.state.isDesktop ? 0 : '15px'}">
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
        <span v-if="$store.state.isDesktop" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('centerTrack')"><font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/></span>
        <span v-if="(track.gpsTrack.status === TrackStatus.done) && ($store.state.isDesktop)" ref="tooltipSpan" style='margin-right: 3px;'><font-awesome-icon @click="playTrack" style="height: 24px; cursor: pointer" :icon="playing ? 'stop-circle' : 'play'"/></span>
        <span v-if="(track.gpsTrack.status === TrackStatus.done) && ($store.state.isDesktop)" style='margin-right: 3px;' v-b-tooltip.hover :title="$t('maximizeTrack')"><font-awesome-icon @click="track.maximized = true" style="height: 24px; cursor: pointer" :icon="['far', 'window-maximize']" /></span>
        <b-tooltip v-if="(track.gpsTrack.status === TrackStatus.done) && (renderedComponent) && ($store.state.isDesktop)" :target="$refs.tooltipSpan">{{ playing ? $t('stopTrack') : $t('playTrack') }}</b-tooltip>
        <span v-if="($store.state.user) && ($store.state.isDesktop)">
          <span v-if="track.onServer" v-b-tooltip.hover :title="$t('saveTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="save"/></span>
          <span v-else v-b-tooltip.hover :title="$t('uploadTrack')"><font-awesome-icon @click="showUploadModal" style="height: 24px; cursor: pointer" icon="upload"/></span>
          <span style='margin-right: 3px;'></span>
        </span>
        <span style="display: inline-block; margin-right: 3px;" @click="toggleRuler"><font-awesome-icon :style="{'cursor': 'pointer', 'height': $store.state.isDesktop ? '24px' : '32px', 'width': $store.state.isDesktop ? null : '32px'}" :icon="rulerActive ? 'ruler-vertical' : 'ruler-horizontal'"></font-awesome-icon></span>
        <span v-if="(track.gpsTrack.status === TrackStatus.planned) && ($store.state.isDesktop)">
          <span v-if="track === $store.state.editedTrack">
            <font-awesome-icon @click="setEdited(null)" style="height: 24px; cursor: pointer" icon="lock-open"/>
          </span>
          <span v-else>
            <font-awesome-icon @click="setEdited(track)" style="height: 24px; cursor: pointer" icon="lock"/>
          </span>
        </span>
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
import { speedBetweenPoints, roundCoord, distanceBetweenPoints } from '@/ts/utils/coords';
import Photo from '@/ts/Photo';
import { EventBus } from '@/ts/EventBus';

@Component
export default class AppTrack extends BaseComponent {

  public checked: boolean;
  private iconsVisible: boolean = true;
  private renderComponent: boolean = false;
  private renderedComponent: boolean = false;
  private playing: boolean = false;
  private rulerActive = false;

  @Prop({ required: true }) private track: Track;
  @Prop({ required: true }) private highlightOnStart: boolean;

  public constructor() {
    super();
    this.checked = this.track.checked;
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
        mapTrack.on('click', (e) => {
          if (! this.$store.state.editedTrack) {
            this.track.maximized = !this.track.maximized;
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
             marker.bindTooltip((distance / 1000).toFixed(1), {permanent: true, className: 'smallTooltip', direction: 'right'});
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