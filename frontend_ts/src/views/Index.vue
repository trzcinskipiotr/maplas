<template>
  <div id="appvue">
    <div class="wrapper">
      <div id="sidebar">
        <div class="card">
          <div class="card-header">
            {{ $t('mainMenu') }}
            <div style="float: right;">
              <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="['far', 'times-circle']"/>
            </div>
          </div>
          <div class="mx-0 px-0 card-body">
            <ul class="nav nav-tabs" id="tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#tabtracks" role="tab">{{ $t('tracks') }}</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="profile-tab" data-toggle="tab" href="#tabsettings" role="tab">{{ $t('settings') }}</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="profile-tab" data-toggle="tab" href="#tabplaces" role="tab">{{ $t('objects') }}</a>
              </li>
            </ul>
            <div class="tab-content" id="tab_content_tracks">
              <div class="tab-pane show active" role="tabpanel" id="tabtracks">
                <div class="card">
                  <div class="card-body p-2">
                    {{ $t('groupBy') }}: <v-select style="display: inline-block; width: 200px; margin-bottom: 15px;" v-model="groupBy" :options="groups" :clearable="false" :searchable="false" >
                      <template slot="option" slot-scope="option">
                        {{ option.label }}
                      </template>
                    </v-select>
                    <br>
                    {{ $t('tracksSelected', [$store.getters.selectedTracks.length, $store.state.tracks.length]) }}<br>
                    {{ $t('tracksSelectedDistance') }}: {{ $store.getters.selectedTracks|sumTracksDistance|roundTrackDistance }}
                    <ul>
                      <li v-if="countTracksByType($store.state.tracks, TrackType.walk) > 0">{{ $t('tracksSelectedDistanceWalk') }}: {{ $store.getters.selectedTracks|sumTracksDistanceWalk|roundTrackDistance }}</li>
                      <li v-if="countTracksByType($store.state.tracks, TrackType.bicycle) > 0">{{ $t('tracksSelectedDistanceBicycle') }}: {{ $store.getters.selectedTracks|sumTracksDistanceBicycle|roundTrackDistance }}</li>
                      <li v-if="countTracksByType($store.state.tracks, TrackType.mushroom) > 0">{{ $t('tracksSelectedDistanceMushroom') }}: {{ $store.getters.selectedTracks|sumTracksDistanceMushroom|roundTrackDistance }}</li>
                    </ul>
                    <div style="font-size: 0.95rem">
                      <div v-if="$store.state.imports.length" class="mb-2">
                        <AppTrackGroup :searchText="''" :trackGroup="importGroup"></AppTrackGroup>
                      </div>
                      <div style="width: 100%" class="form-group">
                        <input class="form-control mr-2" type="text" v-model="searchText" :placeholder="$t('search')" />
                      </div>
                      <div style="margin-bottom: 10px">
                        <button class="btn btn-primary btn-sm btn-nopadding" @click="showAllTracks">{{ $t('showAllTracks') }}</button>&nbsp;
                        <button class="btn btn-primary btn-sm btn-nopadding" @click="hideAllTracks">{{ $t('hideAllTracks') }}</button>&nbsp;
                        <button class="btn btn-primary btn-sm btn-nopadding" @click="expandAllGroups">{{ $t('expandAllGroups') }}</button>&nbsp;
                        <button class="btn btn-primary btn-sm btn-nopadding" @click="hideAllGroups">{{ $t('hideAllGroups') }}</button>&nbsp;
                      </div>
                      <div v-for="(trackGroupGroup, key) in trackGroupsDict" :key="key">
                        <div v-show="groupBy.id === key">
                          <div v-for="trackGroup in trackGroupGroup" :key="trackGroup.label" class="mb-2">
                            <AppTrackGroup :trackGroup="trackGroup" :searchText="searchText"></AppTrackGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openImportFileInput">{{ $t('importGpxFile') }}</button>
                  </div>
                </div>
              </div>
              <div class="tab-pane show" role="tabpanel" id="tabsettings">
                <div class="card">
                  <div class="card-body p-2">
                    <div class="card mb-2">
                      <div class="card-header py-2">
                        {{ $t('loginForm' )}}
                      </div>
                      <div class="card-body p-2">        
                        <div v-if="$store.state.user">
                          <form @submit.prevent="logOutFromApi" class="form-inline">
                            <div style="width: 100%" class="form-group flex-form-group">
                              <div style="width: 66%;">
                                {{ $t('welcome') }}: {{ $store.state.user.username }}
                             </div>
                             <button type="submit" class="btn btn-primary">{{ $t('logOut') }}</button>
                            </div>
                          </form>    
                        </div>
                        <div v-else>
                          <form @submit.prevent="logInToApi" class="form-inline">
                            <div style="width: 100%" class="form-group flex-form-group">
                              <input style="width: 33%" type="text" v-model="login" class="form-control mr-2" :placeholder="$t('login')">
                              <input style="width: 33%" type="password" autocomplete="off" v-model="password" class="form-control mr-2" :placeholder="$t('password')">
                              <button type="submit" class="btn btn-primary">{{ $t('logIn') }}</button>
                            </div>
                          </form> 
                        </div>
                      </div>
                    </div>
                    
                    {{ $t('language') }}: <v-select v-model="language" :options="languages" :clearable="false" :searchable="false" >
                      <template slot="option" slot-scope="option">
                        <flag :iso="option.flag" v-bind:squared=false />
                        {{ option.label }}
                      </template>
                    </v-select>
                    <br>
                    {{ $t('playingSpeed') }}:
                    <font-awesome-icon icon="biking"/> {{ playingSpeed }} km/s&nbsp;&nbsp;
                    <font-awesome-icon icon="shoe-prints"/> {{ playingSpeed / 10 }} km/s 
                    <b-form-slider style="width: 100%;" v-model="playingSpeed" :min=1 :max=20></b-form-slider><br><br>
                    <b-form-checkbox :disabled="locationActive" style="display: inline;" v-model="useHTML5location"></b-form-checkbox>{{ $t('useHTML5location') }}<br>
                    <b-form-checkbox style="display: inline;" v-model="largeButtonsDuringLocation"></b-form-checkbox>{{ $t('largeButtonsDuringLocation') }}<br>
                    <b-form-checkbox style="display: inline;" v-model="showAllButtonsDuringLocation"></b-form-checkbox>{{ $t('showAllButtonsDuringLocation') }}<br><br>
                    <OfflineCard></OfflineCard>
                    <br>
                    <button class="btn btn-primary" @click="noSleepToggle">{{ noSleepActive ? $t('noSleepActive') : $t('noSleepInactive')}}</button>
                    <span v-if="VUE_APP_BUILD_DATE"><br><br>{{ $t('buildDate') }}: {{ VUE_APP_BUILD_DATE | formatDateSecondsEpoch }}<br></span>
                    <br><br>
                  </div>
                </div>
              </div>
              <div class="tab-pane show" role="tabpanel" id="tabplaces">
                <div class="card">
                  <div class="card-body p-2">
                    <ObjectsTab></ObjectsTab>
                  </div>
                </div>    
              </div>  
            </div>
          </div>
        </div>
      </div>  
      <div class="content">
        <div id="main_gallery_div" style="height: 100vh; overflow-y: scroll">
          <div v-for="(trackGroupGroup, key) in trackGroupsDict" :key="key">
            <div v-show="groupBy.id === key">
              <div v-for="trackGroup in trackGroupGroup" :key="trackGroup.label" class="mb-2">
                <b><center><h2>{{ trackGroup.label }}</h2></center></b>
                <div v-for="track in trackGroup.tracks" :key="track.id">
                  <b>{{ track.gpsTrack.name }}</b>&nbsp;
                  <span class="badge badge-dark" style="margin-right: 2px;">{{ track.gpsTrack.start_time|formatDateDay }}</span>
                  <span class="badge badge-success" style="margin-right: 2px;">{{ track.gpsTrack.distance|roundTrackDistance }}</span><br>
                  <template v-if="track.gpsTrack.description">{{ track.gpsTrack.description }}<br></template>
                  <br>
                  <span v-for="(photo, index) in track.gpsTrack.photos" :key="photo.id">
                    <img style="margin: 5px; cursor: pointer" :src="photo.image_thumb" @click="clickOpenGallery(track.gpsTrack.id, index)" />
                  </span>
                  <br><br><br>
                </div>  
              </div>
            </div>
          </div>    
        </div>
        <div id="map">
          <span class="centerloading">
            <font-awesome-icon v-if="tileLoading" class="fa-spin" icon="spinner" size="4x"/>
          </span>
        </div>
      </div>
    </div>
    <div id="cogsdiv" style="display: none;">
      <div id="cogsdivinner" :style="{'width': '48px', 'height': '48px', 'background-color': menuOpened ? 'yellow' : 'white'}" @click="togglePanel" class="leaflet-touch leaflet-bar cogsbutton">
        <b-tooltip v-if="(document.getElementById('cogsdivinner')) && ($store.state.isDesktop)" :target="document.getElementById('cogsdivinner')">{{ menuOpened ? $t('closeMenu') : $t('openMenu') }}</b-tooltip>
        <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="bars" size="lg"/>
      </div>
    </div>
    <div id="rulerdiv" style="display: none;">
      <div id="rulerdivinner" :style="{'width': '48px', 'height': '48px', 'background-color': $store.state.editedTrack ? 'yellow' : 'white'}" @click="rulerClick" class="leaflet-touch leaflet-bar cogsbutton">
        <b-tooltip v-if="(document.getElementById('rulerdivinner')) && ($store.state.isDesktop)" :target="document.getElementById('rulerdivinner')">{{ $store.state.editedTrack ? $t('closeRuler') : $t('openRuler') }}</b-tooltip>
        <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="ruler-horizontal" size="lg"/>
      </div>
    </div>
    <div id="gallerydiv" style="display: none;">
      <div id="gallerydivinner" :style="{'width': '48px', 'height': '48px', 'background-color': galleryOpened ? 'yellow' : 'white'}" @click="toggleGalleryPanel" class="leaflet-touch leaflet-bar cogsbutton">
        <b-tooltip v-if="(document.getElementById('gallerydivinner')) && ($store.state.isDesktop)" :target="document.getElementById('gallerydivinner')">{{ galleryOpened ? $t('closeGallery') : $t('openGallery') }}</b-tooltip>
        <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="images" size="lg"/>
      </div>
    </div>
    <div id="importdiv" style="display: none;">
      <div id="importdivinner" style="width: 48px; height: 48px;" @click="openImportFileInput" class="leaflet-touch leaflet-bar cogsbutton">
        <b-tooltip v-if="(document.getElementById('importdivinner')) && ($store.state.isDesktop)" :target="document.getElementById('importdivinner')">{{ $t('importGpxFile') }}</b-tooltip>
        <input id="importFileInput" multiple type="file" style="display:none;" accept=".gpx" v-on:change="importGpxFile" />
        <font-awesome-icon style="cursor: pointer; width: 28px; height: 28px;" icon="file-upload"/>
      </div>
    </div>
    <div id="locationdiv" style="display: none;">
      <div id="locationdivinner" @click="toggleLocation" class="leaflet-touch leaflet-bar cogsbutton">
        <b-tooltip v-if="(document.getElementById('locationdivinner')) && ($store.state.isDesktop)" :target="document.getElementById('locationdivinner')">{{ locationActive ? $t('hideLocation') : $t('showLocation') }}</b-tooltip>
        <template v-if="locationActive">
          <font-awesome-icon v-if="! currentLocation" class="fa-spin" icon="spinner" size="lg"/>
          <font-awesome-icon v-else style="color: green; cursor: pointer; width: 28px; height: 28px;" icon="map-marker" size="lg"/>
        </template>
        <font-awesome-icon v-else style="color: black; cursor: pointer; width: 28px; height: 28px;" icon="map-marker" size="lg"/>  
      </div>
    </div>
    <div id="speedlegenddiv" style="display: none;">
      <div id="speedlegenddivinner">
        <div style="background-color: white; margin: 2px" v-if="$store.state.speedLegendVisible">
          <div v-for="(color, index) in $store.state.speedColors" :key="color.color" :style="{'text-align': 'center', 'color': 'white', 'width': '16px', 'height': '14px', 'margin': '1px', 'background-color': color.color}">
            <b>{{ $store.state.speedThresholds[index] }}</b>
          </div>
        </div>  
      </div>
    </div>
    <div class="alertmessage">
      <div class="flexcenter"><font-awesome-icon v-if="loading" class="fa-spin" icon="spinner" size="3x"/></div>
      <div v-for="alert in $store.state.alerts" class="alert border border-dark" v-bind:class="{ 'alert-success': isSuccessAlert(alert), 'alert-danger': isDangerAlert(alert) }" v-bind:key="alert.date" role="alert">
        {{ alert.message }}
      </div>
    </div>
    <div id="messageDivTop" class="alertmessage" style="display: none">
      <div id="messageClassTop" class="alert border border-dark" role="alert">
        <span id="messageTop"></span>&nbsp;
        <span style="cursor: pointer" aria-hidden="true" @click="document.getElementById('messageDivTop').style.display = 'none'">&times;</span>
      </div>
    </div>
    <div v-for="language in languages" :key="language.flag" style="position: absolute; left: -10000px">
      <flag :iso="language.flag" v-bind:squared=false />
    </div>
    <template v-if="(document.getElementsByClassName('leaflet-control-locate')[0]) && ($store.state.isDesktop)">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-locate')[0]">{{ $t('showMyLocation') }}</b-tooltip>
    </template>
    <template v-if="(document.getElementsByClassName('leaflet-control-zoom-fullscreen')[0]) && ($store.state.isDesktop)">
      <b-tooltip ref="fullscreenTooltip" :target="document.getElementsByClassName('leaflet-control-zoom-fullscreen')[0]">{{ fullscreenOpened ? $t('exitFullscreen') : $t('enterFullscreen') }}</b-tooltip>
    </template>
    <template v-if="(document.getElementsByClassName('leaflet-control-zoom-in')[0]) && ($store.state.isDesktop)">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-zoom-in')[0]">{{ $t('zoomIn') }}</b-tooltip>
    </template>
    <template v-if="(document.getElementsByClassName('leaflet-control-zoom-out')[0]) && ($store.state.isDesktop)">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-zoom-out')[0]">{{ $t('zoomOut') }}</b-tooltip>
    </template>
    <template v-if="$store.state.isDesktop">
      <span>
        <TrackDetails v-for="track in $store.state.tracks" :track="track" :key="track.gpsTrack.id"></TrackDetails>
      </span>
      <span>
        <TrackDetails v-for="track in $store.state.imports" :track="track" :key="track.gpsTrack.id"></TrackDetails>
      </span>
      <span>  
        <SaveTrackModal v-for="track in $store.state.tracks" :track="track" :key="track.gpsTrack.id"></SaveTrackModal>
      </span>
      <span>  
        <SaveTrackModal v-for="track in $store.state.imports" :track="track" :key="track.gpsTrack.id"></SaveTrackModal>
      </span>
      <span>  
        <SaveTrackModal v-for="track in $store.state.plannedTracks" :track="track" :key="track.gpsTrack.id"></SaveTrackModal>
      </span>
      <span>  
        <SavePlaceModal v-for="place in $store.state.places" :place="place" :key="place.id"></SavePlaceModal>
      </span>
    </template>  
    <SavePlaceModal></SavePlaceModal>
  </div>  
</template>

/* tslint:disable:no-string-literal */
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import L, { LatLngBounds, latLngBounds } from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet.fullscreen';
import 'leaflet.locatecontrol';
import axios from 'axios';
import $ from 'jquery';
import BaseComponent from '@/components/Base.vue';
import { AlertStatus, TrackStatus, TrackType } from '@/ts/types';
import Track from '@/ts/Track';
import Region from '@/ts/Region';
import Place from '@/ts/Place';
import GpsTrack from '@/ts/GpsTrack';
import i18n from '@/plugins/i18n';
import YearTrackGrouper from '@/ts/trackgroupers/year';
import TypeTrackGrouper from '@/ts/trackgroupers/type';
import RegionTrackGrouper from '@/ts/trackgroupers/region';
import TrackGrouper from '@/ts/TrackGrouper';
import TrackGroup from '@/ts/TrackGroup';
// @ts-ignore
import gpxParse from 'gpx-parse';
import listTranslator from '@/ts/list_translator';
import PlaceType from '@/ts/PlaceType';
import Photo from '../ts/Photo';
import NoSleep from 'nosleep.js';
import { EventBus } from '@/ts/EventBus';
import Area from '@/ts/Area';
import VideoLink from '@/ts/VideoLink';
import moment from 'moment';
import { TileLayerOffline, savetiles } from '@/ts/leafletoffline';
import * as kvstore from '@/ts/kvstore';

interface FileReaderEventTarget extends EventTarget {
  result: string;
}

interface LayersDictionary {
  [index: string]: L.TileLayer | L.gridLayer.GoogleMutant;
}

@Component
export default class Index extends BaseComponent {
  private mapboxApiToken: string = 'MAPBOX_API_KEY';
  private googleApiToken: string = 'GOOGLE_API_KEY';
  private loading: boolean = true;
  private tileLoading: boolean = true;
  private menuOpened = false;
  private galleryOpened = false;
  private document = document;
  private fullscreenOpened = false;
  private playingSpeed = this.$store.state.playingSpeed;

  private groups = [{id: 'year', translate: 'year', label: '', grouper: new YearTrackGrouper()}, {id: 'type', translate: 'type', label: '', grouper: new TypeTrackGrouper()}, {id: 'region', translate: 'region', label: '', grouper: new RegionTrackGrouper()}];
  private groupBy = this.groups[0];
  private trackGroupsDict: { [key: string]: TrackGroup[] } = {};
  private importGroup: TrackGroup = new TrackGroup();

  private languages = [{flag: 'us', language: 'en', label: 'English'}, {flag: 'pl', language: 'pl', label: 'Polski' }];
  private language: {flag: string, language: string, label: string} | null = null;

  private login: string = '';
  private password: string = '';
  // @ts-ignore
  private TrackType = TrackType;

  private openCycleMapOfflineLayer: L.Layer = null;

  private progress = 0;
  private totalToSave = 0;

  private offlineControl: L.Control = null;

  private layerName: string = null;
  private baseMaps: LayersDictionary = {};

  private noSleepActive = false;
  private noSleep: any = null;

  private locationActive = false;
  private locationMarker: L.CircleMarker = null;

  private lastMouseDownTime: number = null;
  private lastMouseDownPoint: any = null;

  private cache: boolean = false;

  private searchText: string = '';

  private lastClickedGallery = 1;
  private openGalleryHandler: any;

  private tlo = TileLayerOffline;

  private useHTML5location = false;
  private largeButtonsDuringLocation = false;
  private showAllButtonsDuringLocation = false;

  @Watch('language')
  private onLanguageChanged(value: string, oldValue: string) {
    i18n.locale = this.language!.language;
    for (const list of listTranslator) {
      this.translateArray(list);
    }
  }

  @Watch('useHTML5location')
  private async onUseHTML5location(value: string, oldValue: string) {
    if ((this.useHTML5location !== null) && (typeof this.useHTML5location !== "undefined")) {
      await kvstore.set('useHTML5location', this.useHTML5location);
    }
  }

  @Watch('largeButtonsDuringLocation')
  private async onLargeButtonsDuringLocation(value: string, oldValue: string) {
    if ((this.largeButtonsDuringLocation !== null) && (typeof this.largeButtonsDuringLocation !== "undefined")) {
      await kvstore.set('largeButtonsDuringLocation', this.largeButtonsDuringLocation);
      this.changeButtonSizeDuringLocation();
    }
  }

  @Watch('showAllButtonsDuringLocation')
  private async onshowAllButtonsDuringLocation(value: string, oldValue: string) {
    if ((this.showAllButtonsDuringLocation !== null) && (typeof this.showAllButtonsDuringLocation !== "undefined")) {
      await kvstore.set('showAllButtonsDuringLocation', this.showAllButtonsDuringLocation);
      this.changeButtonSizeDuringLocation();
    }
  }

  private changeButtonSizeDuringLocation() {
    if (this.locationActive) {
      if (this.largeButtonsDuringLocation) {
        $(".leaflet-control-layers-toggle").attr('style', 'width: 64px !important; height: 64px !important');
        $(".leaflet-control-zoom-in").attr('style', 'width: 64px !important; height: 64px !important');
        $(".leaflet-control-zoom-out").attr('style', 'width: 64px !important; height: 64px !important');
        $(".leaflet-control-zoom-fullscreen").attr('style', 'width: 64px !important; height: 64px !important');
        $("#cogsdivinner").attr('style', 'width: 64px !important; height: 64px !important');
        $("#locationdivinner").attr('style', 'width: 64px !important; height: 64px !important');
        if (this.showAllButtonsDuringLocation) {
          $("#gallerydivinner").attr('style', 'width: 64px !important; height: 64px !important; visibility: visible');
          $("#rulerdivinner").attr('style', 'width: 64px !important; height: 64px !important; visibility: visible');
        } else {
          $("#gallerydivinner").attr('style', 'width: 64px !important; height: 0px !important; visibility: hidden');
          $("#rulerdivinner").attr('style', 'width: 64px !important; height: 0px !important; visibility: hidden');
        }
      } else {
        $(".leaflet-control-layers-toggle").attr('style', 'width: 48px !important; height: 48px !important');
        $(".leaflet-control-zoom-in").attr('style', 'width: 48px !important; height: 48px !important');
        $(".leaflet-control-zoom-out").attr('style', 'width: 48px !important; height: 48px !important');
        $(".leaflet-control-zoom-fullscreen").attr('style', 'width: 48px !important; height: 48px !important');
        $("#cogsdivinner").attr('style', 'width: 48px !important; height: 48px !important');
        $("#locationdivinner").attr('style', 'width: 48px !important; height: 48px !important');
        if (this.showAllButtonsDuringLocation) {
          $("#gallerydivinner").attr('style', 'width: 48px !important; height: 48px !important; visibility: visible');
          $("#rulerdivinner").attr('style', 'width: 48px !important; height: 48px !important; visibility: visible');
        } else {
          $("#gallerydivinner").attr('style', 'width: 0px !important; height: 0px !important; visibility: hidden');
          $("#rulerdivinner").attr('style', 'width: 0px !important; height: 0px !important; visibility: hidden');
        }
      }
    } else {
      $(".leaflet-control-layers-toggle").attr('style', 'width: 48px !important; height: 48px !important');
      $(".leaflet-control-zoom-in").attr('style', 'width: 48px !important; height: 48px !important');
      $(".leaflet-control-zoom-out").attr('style', 'width: 48px !important; height: 48px !important');
      $(".leaflet-control-zoom-fullscreen").attr('style', 'width: 48px !important; height: 48px !important');
      $("#cogsdivinner").attr('style', 'width: 48px !important; height: 48px !important');
      $("#locationdivinner").attr('style', 'width: 48px !important; height: 48px !important');
      $("#gallerydivinner").attr('style', 'width: 48px !important; height: 48px !important; visibility: visible');
      $("#rulerdivinner").attr('style', 'width: 48px !important; height: 48px !important; visibility: visible');
    }
  }

  @Watch('playingSpeed')
  private onPlayingSpeedChanged(value: string, oldValue: string) {
    this.$store.commit('setPlayingSpeed', this.playingSpeed);
  }

  @Watch('$store.state.tracks')
  private onStoreTracksChanged(value: string, oldValue: string) {
    for (const group of this.groups) {
      this.trackGroupsDict[group.id] = group.grouper.groupTracks(this.$store.state.tracks);
    }
  }

  @Watch('$store.state.imports')
  private onStoreImportsChanged(value: string, oldValue: string) {
    this.importGroup.tracks = [];
    for (const track of this.$store.state.imports) {
      this.importGroup.tracks.push(track);
    }
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  private clickOpenGallery(id: number, index: number) {
    const now = Date.now();
    if (now - this.lastClickedGallery > 250) {
      this.openGalleryHandler = setTimeout(() => this.openGallery(false, id, index), 250);
    } else {
      clearTimeout(this.openGalleryHandler);
      this.openGallery(true, id, index);
    }
    this.lastClickedGallery = now;
  }

  private openGallery(fullRes: boolean, id: number, index: number) {
    if (fullRes) {
      EventBus.$emit('openSlideShowFullTrack' + id, index);
    } else {
      EventBus.$emit('openSlideShowTrack' + id, index);
    }
  }

  private noSleepToggle() {
    if (this.noSleepActive) {
      this.noSleep.disable();
      this.noSleepActive = false;
    } else {
      this.noSleep.enable();
      this.noSleepActive = true;
    }
  }

  private getOfflineZooms() {
    const zooms = [];
    for (let i = this.$store.state.minimalZoom; i <= this.$store.state.maximalZoom; i++) {
      zooms.push(i);
    }
    return zooms;
  }

  private offlineControlZoomChange() {
    if ((this.$store.state.minimalZoom) && (this.$store.state.maximalZoom) && (this.$store.state.minimalZoom <= this.$store.state.maximalZoom)) {
      this.offlineControl.options.zoomlevels = this.getOfflineZooms();
    }
  }

  @Watch('$store.state.minimalZoom')
  private onStoreMinimalZoomChanged() {
    this.offlineControlZoomChange();
  }

  @Watch('$store.state.maximalZoom')
  private onStoreMaximalZoomChanged() {
    this.offlineControlZoomChange();
  }

  private logInToApi() {
    axios.post(this.$store.state.appHost + 'api/auth/token/login/', {username: this.login, password: this.password}).then(
      (response) => {
        this.createAlert(AlertStatus.success, this.$t('logInSuccess').toString(), 2000);
        this.$store.commit('setToken', {token: response.data.auth_token, vue: this});
        this.refreshLoginInfo(false);
        this.refreshPhotos();
      },
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('logInError').toString(), 2000);
      },
    ).finally(() => {
      this.login = '';
      this.password = '';
    });
  }

  private logOutFromApi() {
    axios.post(this.$store.state.appHost + 'api/auth/token/logout/').then(
      (response) => {
        
        /* empty */
      },
    ).catch(
      (response) => {
        /* empty */
      },
    ).finally(
      () => {
        this.createAlert(AlertStatus.success, this.$t('logOutSuccess').toString(), 2000);
        this.$store.commit('setToken', {token: '', vue: this});
        this.$store.commit('setUser', null);
        this.refreshPhotos();
      },
    );
  }

  private setStoreToken() {
    // @ts-ignore
    const token = this.$session.get('token');
    if (token) {
      this.$store.commit('setToken', {token, vue: this});
      this.refreshLoginInfo(true);
    }
  }

  private refreshLoginInfo(showAllerts: boolean) {
    axios.get(this.$store.state.appHost + 'api/auth/users/me/').then(
      (response) => {
        if (showAllerts) {
          this.createAlert(AlertStatus.success, this.$t('welcome').toString() + ': ' + response.data.username, 2000);
        }
        this.$store.commit('setUser', response.data);
      },
    ).catch(
      (response) => {
        this.$store.commit('setToken', {token: '', vue: this});
        this.createAlert(AlertStatus.danger, this.$t('logInSessionExpired').toString(), 2000);
      },
    );
  }

  private node: any = null;
  private VUE_APP_BUILD_DATE: string = null;

  private async loadKVsettings() {
    this.largeButtonsDuringLocation = await kvstore.get('largeButtonsDuringLocation');
    this.showAllButtonsDuringLocation = await kvstore.get('showAllButtonsDuringLocation');
  }

  private async mounted() {
    this.VUE_APP_BUILD_DATE = process.env.VUE_APP_BUILD_DATE;
    this.loadKVsettings();
    this.setLanguage();
    this.setAppHost();
    this.setStoreToken();
    this.createMap([52.743682, 16.273668], 11);
    await this.downloadAndAddLayers();
    this.addZoomControl();
    this.createSpeedLegendControl();
    this.addScaleControl();
    this.addFullScreenControl();
    this.addCogsButton();
    this.addGalleryButton();
    this.addRulerButton();
    this.addImportButton();
    this.addLocationButton();
    //this.addCurrentLocationControl();
    this.addOffline();
    this.downloadTracks();
    this.downloadRegions();
    this.downloadPlaces();
    this.downloadPlaceTypes();
    this.downloadAreas();
    this.noSleep = new NoSleep();
    setTimeout(() => {
      this.noSleepToggle();
    }, 15000);
    this.changeButtonSizeDuringLocation();
  }

  private addZoomControl() {
    L.control.zoom({
      position: 'topright'
    }).addTo(this.$store.state.map);
  }

  private rulerClick(e: Event) {
    if (this.$store.state.editedTrack) {
      this.$store.commit('setEditedTrack', null);
    } else {
      EventBus.$emit('newPlannedTrack');
    }
    e.stopPropagation();
  }

  private showAllTracks() {
    for(const track of this.$store.state.tracks) {
      track.checked = true;
    }
  }

  private hideAllTracks() {
    for(const track of this.$store.state.tracks) {
      track.checked = false;
    }
  }

  private expandAllGroups() {
    EventBus.$emit('expandAllGroups');
  }

  private hideAllGroups() {
    EventBus.$emit('hideAllGroups');
  }

  private setLanguage() {
    if (typeof this.$route.query.lang === 'string') {
      for (const lang of this.languages) {
        if (this.$route.query.lang === lang.language) {
          this.language = lang;
        }
      }
      if (! this.language) {
        this.language = this.languages[1];
      }
    } else {
      this.language = this.languages[1];
    }
    this.translateAndAddArrayToTranslator(this.groups);
  }

  private setAppHost() {
    this.$store.commit('setAppHost', window.location.hostname === 'localhost' ? 'http://localhost:8000/djangoapp/' : '/djangoapp/');
  }

  private mapClicked(e) {
    if (this.$store.state.editedTrack) {
      this.$store.state.editedTrack.addPoint(e.latlng.lat, e.latlng.lng, this.$store.state.map)
    } else if (this.$store.state.editedArea) {
      this.$store.state.editedArea.addPoint(e.latlng)
    } else {
      this.followLocation = true;
      if (this.currentLocation) {
        this.$store.state.map.panTo(this.currentLocation);
      }
    }
  }

  private mapMoveEnd(e) {
    if (! document.getElementById('currentZoomId')) {
      this.node = document.createElement("span");
      this.node.id = 'currentZoomId';
      this.node.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      this.node.style.border = '2px solid #777';
      this.node.style.paddingLeft = '4px';
      this.node.style.paddingRight = '4px';
      this.node.style.borderTop = '0px';
      const scale = document.getElementsByClassName('leaflet-control-scale leaflet-control');
      if (scale.length) {
        scale[0].appendChild(this.node);
      }
    }
    this.node.innerHTML = '' + this.$store.state.map.getZoom();
    //$('.leaflet-control-scale-line').html($('.leaflet-control-scale-line').html() + '<span style="float: right">(Zoom: ' + this.$store.state.map.getZoom() + ')</span>');
  }

  private openNewPlaceModal (e: L.LeafletMouseEvent) {
    if (this.$store.state.user) {
      EventBus.$emit('NewPlaceRequested', false, e.latlng);
    } else {
      this.createAlert(AlertStatus.danger, this.$t('notLoggedToAddPlace') as string, 2000);
    }
  }

  private createMap(center: [number, number], zoom: number) {
    const map = L.map('map', {
      zoomAnimation: false,
      contextmenu: true,
      contextmenuWidth: 140,
	  contextmenuItems: [{
	    text: this.$t('addPlace'),
	    callback: this.openNewPlaceModal
	  }],
    });
    map.setView(center, zoom);
    map.on('zoomend', () => {
      this.$store.commit('setZoomLevel', map.getZoom())
    })
    this.$store.commit('setMap', map);
    this.$store.commit('setZoomLevel', zoom);
    map.on('click', this.mapClicked);
    map.on('moveend', this.mapMoveEnd);
    map.on('dragstart', () => {this.followLocation = false});

    //Obejście na złe zachowanie zoomu na mobile, na desktopie niestety zostają tooltipy po kliknięciu, więc if tylko na mobile
    if (! this.$store.state.isDesktop) {
      $('.leaflet-control-zoom-in').replaceWith($('.leaflet-control-zoom-in').clone());
      (document.getElementsByClassName('leaflet-control-zoom-in')[0]).addEventListener('click', (e) => {map.setZoom(Math.round(map.getZoom() + 1)); e.stopPropagation()});
      $('.leaflet-control-zoom-out').replaceWith($('.leaflet-control-zoom-out').clone());
      (document.getElementsByClassName('leaflet-control-zoom-out')[0]).addEventListener('click', (e) => {map.setZoom(Math.round(map.getZoom() - 1)); e.stopPropagation()});
      map.off('dblclick');
      map.on('dblclick', (e) => {map.setZoom(Math.round(map.getZoom() + 1))});
    }

    map.on('mousedown', (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      this.lastMouseDownTime = now; 
      this.lastMouseDownPoint = e.containerPoint
    });
    map.on('mouseup', (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      if ((now - this.lastMouseDownTime > 400) && (Math.abs(e.containerPoint.x - this.lastMouseDownPoint.x) <= 3) && (Math.abs(e.containerPoint.y - this.lastMouseDownPoint.y) <= 3)) {
        map.setZoom(Math.round(map.getZoom() - 1));
      } 
    });
    map.zoomControl.remove();
  }

  private processMapLayers(result: {dict_key: string, javascript_code: string, display_name: string}[]) {
    const layers: LayersDictionary = {};
    let firstLayer = '';
    this.baseMaps = {}
    if (result.length > 0) {
      for (const layer of result) {
        layers[layer.dict_key] = eval(layer.javascript_code);
        this.baseMaps[layer.display_name] = layers[layer.dict_key];
        if (! firstLayer) {
          firstLayer = layer.dict_key;
        }
      }
    } else {
      layers['openStreetMap'] = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'c',
      });
      this.baseMaps['OpenStreetMap'] = layers['openStreetMap'];
      firstLayer = 'openStreetMap';
    }

    this.$store.state.baseMaps = this.baseMaps;

    for (const layer in this.baseMaps) {
      if (this.baseMaps.hasOwnProperty(layer)) {
        this.baseMaps[layer].on('loading', (event) => {
          this.tileLoading = true;
        });
        this.baseMaps[layer].on('load', (event) => {
          this.tileLoading = false;
        });
      }
    }

    let availableLayers: string = '';
    for (const layer in layers) {
      if (layers.hasOwnProperty(layer)) {
        availableLayers = availableLayers + layer + ', ';
      }
    }
    /* tslint:disable-next-line */
    console.log(`Available layers: ${availableLayers}`);

    const maplayer: string = (typeof this.$route.query.maplayer === 'string') ? this.$route.query.maplayer : '';
    L.control.layers(this.baseMaps).addTo(this.$store.state.map!);
    if (layers.hasOwnProperty(maplayer)) {
      layers[maplayer].addTo(this.$store.state.map!);
    } else {
      if (maplayer.length > 0) {
        this.createAlert(AlertStatus.danger, `Param maplayer ${maplayer} provided, but layer not found in avaliable layers`, 2000);
      }
      layers[firstLayer].addTo(this.$store.state.map!);
    }
  }

  private async downloadAndAddLayers() {
    const layers: LayersDictionary = {};

    let attributionString: string = '';
    const noattr: string = (typeof this.$route.query.noattr === 'string') ? this.$route.query.noattr : '';
    if (noattr) {
      attributionString = '.';
    }

    const endPoint = this.$store.state.appHost + 'api/maplayers/';
    try {
      const response = await axios.get(endPoint);
      this.processMapLayers(response.data.results);
      this.createAlert(AlertStatus.success, this.$t('layersDownloaded', [response.data.results.length]).toString(), 2000);
    } catch {
      this.createAlert(AlertStatus.danger, this.$t('layersError').toString(), 2000);
    };

    /* layers['mapboxStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: attributionString || 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.streets',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxSatellite'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: attributionString || 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxOutdoor'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: attributionString || 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.outdoors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxSatelliteStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: attributionString || 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.streets-satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['esriWorldImagery'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: attributionString || 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['esriWorldImageryOffline'] = L.tileLayer.offline('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: attributionString || 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['esriWorldTopoMap'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: attributionString || 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['openStreetMap'] = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attributionString || '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
      subdomains: 'c',
    });

    layers['openStreetMapOffline'] = L.tileLayer.offline('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attributionString || '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
      subdomains: 'c',
    });

    layers['openCycleMap'] = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attributionString || '&copy; OpenCycleMap, ' + 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
      subdomains: 'abc',
    });

    layers['openCycleMapOffline'] = L.tileLayer.offline('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attributionString || '&copy; OpenCycleMap, ' + 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
      subdomains: 'abc',
    });

    layers['googleRoads'] = L.gridLayer.googleMutant({
      maxZoom: 21,
      type: 'roadmap',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleSatellite'] = L.gridLayer.googleMutant({
      maxZoom: 21,
      type: 'satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleSatelliteOffline'] = L.tileLayer.offline('https://khms1.googleapis.com/kh?v=871&hl=en-US&z={z}&x={x}&y={y}', {
      maxZoom: 21,
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleTerrain'] = L.gridLayer.googleMutant({
      maxZoom: 21,
      type: 'terrain',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleHybrid'] = L.gridLayer.googleMutant({
      maxZoom: 21,
      type: 'hybrid',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['openTopoMap'] = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: attributionString || 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['hikeBike'] = L.tileLayer('https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: attributionString || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['hyddaBase'] = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: attributionString || 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapaTurystycznaPL'] = L.tileLayer('https://m0.mapa-turystyczna.pl/map-xhdpi/{z}/{x}/{y}.v3311.png', {
      maxZoom: 18,
      attribution: attributionString || '<a target="_blank" href="https://mapa-turystyczna.pl" title="Serwis mapa-turystyczna.pl"><img alt="Serwis mapa-turystyczna.pl" src="https://mapa-turystyczna.pl/images/mapa-turystyczna-baner.png" width="100" height="36" /></a>',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapaTurystycznaPLOffline'] = L.tileLayer.offline('https://m0.mapa-turystyczna.pl/map-xhdpi/{z}/{x}/{y}.v3311.png', {
      maxZoom: 18,
      attribution: attributionString || '<a target="_blank" href="https://mapa-turystyczna.pl" title="Serwis mapa-turystyczna.pl"><img alt="Serwis mapa-turystyczna.pl" src="https://mapa-turystyczna.pl/images/mapa-turystyczna-baner.png" width="100" height="36" /></a>',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    this.baseMaps = {
      'OpenStreetMap': layers['openStreetMap'],
      'OpenStreetMapOffline': layers['openStreetMapOffline'],
      'OpenCycleMap': layers['openCycleMap'],
      'OpenCycleMapOffline': layers['openCycleMapOffline'],
      'OpenTopoMap': layers['openTopoMap'],
      'Mapbox streets': layers['mapboxStreets'],
      'Mapbox satellite': layers['mapboxSatellite'],
      'Mapbox outdoor': layers['mapboxOutdoor'],
      'Mapbox hybrid': layers['mapboxSatelliteStreets'],
      'ESRI imaginary': layers['esriWorldImagery'],
      'ESRI imaginary Offline': layers['esriWorldImageryOffline'],
      'ESRI topo': layers['esriWorldTopoMap'],
      'Hike bike': layers['hikeBike'],
      'Google roads': layers['googleRoads'],
      'Google satellite': layers['googleSatellite'],
      'Google satellite Offline': layers['googleSatelliteOffline'],
      'Google terrain': layers['googleTerrain'],
      'Google hybrid': layers['googleHybrid'],
      'Hydda base': layers['hyddaBase'],
      'mapa-turystyczna.pl': layers['mapaTurystycznaPL'],
      'mapa-turystyczna.pl Offline': layers['mapaTurystycznaPLOffline'],
    };

    //const corner1 = new L.LatLng(50.654115, 15.421577);
    //const corner2 = new L.LatLng(50.882941, 15.873678);
    //layers['karkonosze2016'] = L.imageOverlay('karkonosze2016.png', new L.LatLngBounds(corner1, corner2)).addTo(this.$store.state.map);

    */
  }

  private addOffline() {
    this.offlineControl = savetiles(this.baseMaps['OpenStreetMapOffline'], {
            zoomlevels: this.getOfflineZooms(),
            alwaysDownload: true,
            parallel: 5,
            saveText: '<i class="fa fa-download" title="Save tiles"></i>',
            rmText: '<i class="fa fa-trash" title="Remove tiles"></i>',
        });
    this.$store.state.offlineControl = this.offlineControl;
    this.offlineControl.addTo(this.$store.state.map);
  }

  private addCogsButton() {
    const CogsControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('cogsdivinner');
      },
    });
    this.$store.state.map!.addControl(new CogsControl());
  }

  private addGalleryButton() {
    const GalleryControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('gallerydivinner');
      },
    });
    this.$store.state.map!.addControl(new GalleryControl());
  }
  
  private addRulerButton() {
    const RulerControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('rulerdivinner');
      },
    });
    this.$store.state.map!.addControl(new RulerControl());
  }

  private createSpeedLegendControl() {
    const LegendControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('speedlegenddivinner');
      },
    });
    this.$store.state.map.addControl(new LegendControl());
  }

  private addImportButton() {
    const ImportControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('importdivinner');
      },
    });
    if (this.$store.state.isDesktop) {
      this.$store.state.map.addControl(new ImportControl());
    }
    this.importGroup.translate = 'imports';
  }

  private currentLocation: [number, number] = null;
  private followLocation = false;

  private currentLocationTrack: any = [];
  private currentLocationTrackOnMap: L.Polyline;
  private locationInterval = 0;
  private lastTime = 0;

  private locationWatchID: number;

  private formatDateMs(date: any) {
    return moment(date).format('DD.MM.YYYY H:mm:ss.SSS');
  }

  private toggleLocationWithDebug(e) {
    if (this.locationActive) {
      if (this.locationMarker) {
        this.locationMarker.removeFrom(this.$store.state.map);
      }
      if (this.currentLocationTrackOnMap) {
        this.currentLocationTrackOnMap.removeFrom(this.$store.state.map);
      }
      this.currentLocation = null;
      this.locationActive = false;
      this.followLocation = false;
      this.currentLocationTrack = [];
      this.lastTime = 0;
      clearInterval(this.locationInterval);
    } else {
      if (! this.locationMarker) {
        this.locationMarker = new L.CircleMarker([0, 0], {radius: 11, fill: true, fillOpacity: 0.5});
      }
      this.locationMarker.setLatLng([0, 0]);
      this.locationMarker.addTo(this.$store.state.map);
      this.followLocation = true;
      this.currentLocation = null;
      this.currentLocationTrack = [];
      this.lastTime = 0;
      this.locationInterval = setInterval(() => {
        const date = Date.now();
        console.log('Running setInterval function with since = ' + this.lastTime + ' ('+ this.formatDateMs(this.lastTime) + ') at ' + date + ' (' + this.formatDateMs(date) + ')');
        axios.get('http://localhost:10000/?since=' + this.lastTime).then((response) => {
          const data = response.data;
          const date2 = Date.now();
          console.log('Running axios.get then function with since = ' + data.since + ' (' + this.formatDateMs(data.since) + '), responseTimestamp = ' + data.responseTimestamp + ', responseDate = ' + data.responseDate + ' at ' + date2 + ' (' + this.formatDateMs(date2) + '), points: ' + data.trackPoints.length);
          for(const point of data.trackPoints) {
            this.currentLocation = [point.lat, point.lon];  
            this.currentLocationTrack.push(this.currentLocation);
            this.lastTime = point.time;
          }
          if (this.currentLocationTrackOnMap) {
            this.currentLocationTrackOnMap.removeFrom(this.$store.state.map);
          }
          if (this.currentLocation) {
            this.currentLocationTrackOnMap = new L.Polyline(this.currentLocationTrack, {
              color: 'red',
              weight: 5,
              opacity: 1,
              smoothFactor: 1,
            });
            this.currentLocationTrackOnMap.addTo(this.$store.state.map);
            this.locationMarker.setLatLng(this.currentLocation);
            if (this.followLocation) {
              this.$store.state.map.panTo(this.currentLocation);
            }
          }
        }).catch(() => {
          console.log('Running axios.get catch function at ' + Date.now());
        })
        const date3 = Date.now();
        console.log('Ending setInterval function with since = ' + this.lastTime + ' ('+ this.formatDateMs(this.lastTime) + ') at ' + date3 + ' (' + this.formatDateMs(date3) + ')');
      }, 1000)
      this.locationActive = true;
    }
    e.stopPropagation();
  }

  //private processingLocationInterval = false;

  private updateGPSPosition(position: Position) {
     this.currentLocation = [position.coords.latitude, position.coords.longitude];
     this.currentLocationTrack.push(this.currentLocation);
     if (this.currentLocationTrackOnMap) {
       this.currentLocationTrackOnMap.removeFrom(this.$store.state.map);
     }
     this.currentLocationTrackOnMap = new L.Polyline(this.currentLocationTrack, {
        color: 'red',
        weight: 5,
        opacity: 1,
        smoothFactor: 1,
      });
     this.currentLocationTrackOnMap.addTo(this.$store.state.map);
     this.locationMarker.setLatLng(this.currentLocation);
     if (this.followLocation) {
       this.$store.state.map.panTo(this.currentLocation);
     }
  }

  private toggleLocation(e) {
    if (this.locationActive) {
      if (this.locationMarker) {
        this.locationMarker.removeFrom(this.$store.state.map);
      }
      if (this.currentLocationTrackOnMap) {
        this.currentLocationTrackOnMap.removeFrom(this.$store.state.map);
      }
      this.currentLocation = null;
      this.locationActive = false;
      this.followLocation = false;
      this.currentLocationTrack = [];
      this.lastTime = 0;
      clearInterval(this.locationInterval);
      navigator.geolocation.clearWatch(this.locationWatchID);
    } else {
      if (! this.locationMarker) {
        this.locationMarker = new L.CircleMarker([0, 0], {radius: 11, fill: true, fillOpacity: 0.5});
      }
      this.locationMarker.setLatLng([0, 0]);
      this.locationMarker.addTo(this.$store.state.map);
      this.followLocation = true;
      this.currentLocation = null;
      this.currentLocationTrack = [];
      this.lastTime = 0;
      if (this.useHTML5location) {
        this.locationWatchID = navigator.geolocation.watchPosition(this.updateGPSPosition);
      } else {
        this.locationInterval = setInterval(() => {
          //if (this.processingLocationInterval == false) {
          //  this.processingLocationInterval = true;
            const date = Date.now();
            console.log('Running setInterval function with since = ' + this.lastTime + ' ('+ this.formatDateMs(this.lastTime) + ') at ' + date + ' (' + this.formatDateMs(date) + ')');
            const rand = this.getRandomInt(1000000);
            axios.get('http://127.0.0.1:10000/?since=' + this.lastTime + '&rand=' + rand, {timeout: 5000}).then((response) => {
              const data = response.data;
              const date2 = Date.now();
              console.log('Running axios.get then function with since = ' + data.since + ' (' + this.formatDateMs(data.since) + '), responseTimestamp = ' + data.responseTimestamp + ', responseDate = ' + data.responseDate + ' at ' + date2 + ' (' + this.formatDateMs(date2) + '), points: ' + data.trackPoints.length);
              for(const point of data.trackPoints) {
                if (point.time > this.lastTime) {
                  this.currentLocation = [point.lat, point.lon];  
                  this.currentLocationTrack.push(this.currentLocation);
                  this.lastTime = point.time;
                } else {
                  const date3 = Date.now();
                  console.log('Skipping adding point (current lastTime = ' + this.lastTime + ') with time = ' + point.time + ' ('+ this.formatDateMs(point.time) + ') at ' + date3 + ' (' + this.formatDateMs(date3) + ')');
                }
              }
              if (this.currentLocationTrackOnMap) {
                this.currentLocationTrackOnMap.removeFrom(this.$store.state.map);
              }
              if (this.currentLocation) {
                this.currentLocationTrackOnMap = new L.Polyline(this.currentLocationTrack, {
                  color: 'red',
                  weight: 5,
                  opacity: 1,
                  smoothFactor: 1,
                });
                this.currentLocationTrackOnMap.addTo(this.$store.state.map);
                this.locationMarker.setLatLng(this.currentLocation);
                if (this.followLocation) {
                  this.$store.state.map.panTo(this.currentLocation);
                }
              }
            }).catch(() => {
              console.log('Running axios.get catch function at ' + Date.now());
            })
            //.finally(() => {
            //  this.processingLocationInterval = false;
            //})
            const date3 = Date.now();
            console.log('Ending setInterval function with since = ' + this.lastTime + ' ('+ this.formatDateMs(this.lastTime) + ') at ' + date3 + ' (' + this.formatDateMs(date3) + ')');
          //} else {
          //  const date3 = Date.now();
          //  console.log('Skipping...');
          //  console.log('Skipping setInterval function with since = ' + this.lastTime + ' ('+ this.formatDateMs(this.lastTime) + ') at ' + date3 + ' (' + this.formatDateMs(date3) + ')');
          //}
        }, 1000)
      }
      this.locationActive = true;
    }
    e.stopPropagation();
    this.changeButtonSizeDuringLocation();
  }

  private async addLocationButton() {
    this.useHTML5location = await kvstore.get('useHTML5location');
    const locationControl = L.Control.extend({
      options: {
        position: this.$store.state.isDesktop ? 'topleft' : 'topright'
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('locationdivinner');
      },
    });
    this.$store.state.map.addControl(new locationControl());
  }

  private togglePanel(e) {
    $('#sidebar').toggleClass('active');
    this.menuOpened = !this.menuOpened;
    setTimeout(() => {
      // @ts-ignore
      this.$store.state.map.invalidateSize({pan: false, animate: false});
    }, 1000);
    e.stopPropagation();
  }

  private toggleGalleryPanel(e) {
    $('#main_gallery_div').toggleClass('active');
    $('#map').toggleClass('small');
    this.galleryOpened = !this.galleryOpened;
    setTimeout(() => {
      // @ts-ignore
      this.$store.state.map.invalidateSize({pan: false, animate: false});
    }, 1000);
    e.stopPropagation();
  }

  private closeFullscreenTooltip() {
    // @ts-ignore
    this.$refs.fullscreenTooltip.$emit('close');
  }

  private addFullScreenControl() {
    if (this.$store.state.isDesktop) {
      L.control.fullscreen({
        position: this.$store.state.isDesktop ? 'topleft' : 'topright',
        title: '',
        titleCancel: '',
        // @ts-ignore
        fullscreenElement: document.documentElement,
      }).addTo(this.$store.state.map);

      this.$store.state.map.on('enterFullscreen', () => {this.fullscreenOpened = true; this.closeFullscreenTooltip(); });
      this.$store.state.map.on('exitFullscreen', () => {this.fullscreenOpened = false; this.closeFullscreenTooltip(); });
    }
  }

  private addScaleControl() {
    L.control.scale({metric: true, position: 'topleft', imperial: false, maxWidth: 200}).addTo(this.$store.state.map!);
  }

  private addCurrentLocationControl() {
    this.$store.state.map.addControl(L.control.locate({
      flyTo: true,
      setView: 'untilPan',
      keepCurrentZoomLevel: true,
      locateOptions: {
        enableHighAccuracy: true,
      },
      strings: {
        title: '',
      },
    }));
  }

  private openImportFileInput(e) {
    $('#importFileInput').click();
    e.stopPropagation();
  }

  private updated() {
    for (const alert of this.$store.state.alerts) {
      if (! alert.startTimeout) {
        alert.startTimeout = true;
        window.setTimeout(() => {
          this.$store.commit('removeAlert', alert.id);
        }, alert.timeout);
      }
    }
  }

  private importGpxFile(event: Event) {
    let trackIndex = 0;
    const startIndex = new Date().getTime();
    const files = (event.target! as HTMLInputElement).files;
    if (!files || !files.length) {
      this.createAlert(AlertStatus.danger, this.$t('importNoFiles').toString(), 2000);
      return;
    }
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (onLoadEvent: Event) => {
        const gpxFileString = (onLoadEvent.target! as FileReaderEventTarget).result;
        gpxParse.parseGpx(gpxFileString, (error: string, data: any) => {
          if (error) {
            this.createAlert(AlertStatus.danger, this.$t('importError').toString(), 2000);
          } else {
            let atLeasyOneTrack = false;
            for (const fileTrack of data.tracks) {
              atLeasyOneTrack = true;
              trackIndex = trackIndex + 1;
              const distance = Math.round(fileTrack.length() * 1000);
              let startTime = '';
              let endTime = '';
              const segments = [];
              for (const segment of fileTrack.segments) {
                const pointsArray = [];
                for (const point of segment) {
                  pointsArray.push([point.lat, point.lon]);
                  if (! startTime) {
                    startTime = point.time;
                  }
                  endTime = point.time;
                }
                segments.push(pointsArray);
              }
              const newGpstrack: GpsTrack = new GpsTrack(startIndex + trackIndex, fileTrack.name, data.metadata.description, JSON.stringify(segments), '#FF0000', distance, TrackStatus.done, TrackType.bicycle, startTime ? new Date(startTime) : null, endTime ? new Date(endTime) : null, gpxFileString, undefined);
              const track = new Track(newGpstrack, true, false);
              this.$store.commit('addImportedTrack', track);
              const trackBounds = new L.LatLngBounds(track.mapTracks[0].getBounds().getNorthEast(), track.mapTracks[0].getBounds().getSouthWest());
              for (const mapTrack of track.mapTracks) {
                trackBounds.extend(mapTrack.getBounds());
              }
              this.$store.state.map.fitBounds(trackBounds);
            }
            $('#importFileInput')!.val('');
            if (atLeasyOneTrack) {
              this.createAlert(AlertStatus.success, this.$t('importSuccess').toString(), 2000);
            } else {
              this.createAlert(AlertStatus.danger, this.$t('importNoTracks').toString(), 2000);
            }
          }
        });
      };
      reader.onerror = (onErrorEvent: Event) => {
        $('#importFileInput')!.val('');
        this.createAlert(AlertStatus.danger, this.$t('importError').toString(), 2000);
      };
    }
  }

  private downloadRegions() {
    axios.get(this.$store.state.appHost + 'api/regions/').then(
      (response) => {
        const regions = [];
        for (const responseRegion of response.data.results) {
          const region = new Region(responseRegion.id, responseRegion.name);
          this.$store.commit('addTranslation', {lang: 'pl', key: responseRegion.name, value: responseRegion.pl})
          this.$store.commit('addTranslation', {lang: 'en', key: responseRegion.name, value: responseRegion.en})
          regions.push(region);
        }
        this.$store.commit('setRegions', regions);
        this.createAlert(AlertStatus.success, this.$t('regionsDownloaded', [response.data.results.length]).toString(), 2000);
      },
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('regionsError').toString(), 2000);
      },
    );
  }

  private processPlaces(results: any) {
    const places = [];
    for (const responsePlace of results) {
      const placetype = new PlaceType(responsePlace.type.id, responsePlace.type.name, responsePlace.type.icon);
      const place = new Place(responsePlace.id, responsePlace.name, responsePlace.description, responsePlace.lat, responsePlace.lon, placetype, responsePlace.approved, this.$store.state.map.getZoom(), !!this.$store.state.user);
      for (const responsePhoto of responsePlace.photo_set) {
        const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private);
        place.addPhoto(photo);
      }
      for (const responseVideoLink of responsePlace.videolink_set) {
        const video = new VideoLink(responseVideoLink.id, responseVideoLink.name, responseVideoLink.description, responseVideoLink.link, responseVideoLink.html);
        place.addVideo(video);
      }
      places.push(place);
    }
    this.$store.commit('setPlaces', places);
  } 

  private downloadPlaces() {
    const endPoint = this.$store.state.appHost + 'api/places/';
    axios.get(endPoint).then((response) => {
      this.processPlaces(response.data.results);
      this.createAlert(AlertStatus.success, this.$t('placesDownloaded', [response.data.results.length]).toString(), 2000);
    }).catch((response) => {
      this.createAlert(AlertStatus.danger, this.$t('placesError').toString(), 2000);
    });
  }

  private downloadPlaceTypes() {
    axios.get(this.$store.state.appHost + 'api/placetypes/').then(
      (response) => {
        const placeTypes = [];
        for (const responsePlaceType of response.data.results) {
          const placeType = new PlaceType(responsePlaceType.id, responsePlaceType.name, responsePlaceType.icon);
          this.$store.commit('addTranslation', {lang: 'pl', key: responsePlaceType.name, value: responsePlaceType.pl})
          this.$store.commit('addTranslation', {lang: 'en', key: responsePlaceType.name, value: responsePlaceType.en})
          placeTypes.push(placeType);
        }
        this.$store.commit('setPlaceTypes', placeTypes);
        this.createAlert(AlertStatus.success, this.$t('placeTypesDownloaded', [response.data.results.length]).toString(), 2000);
      },
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('placeTypesError').toString(), 2000);
      },
    );
  }

  private downloadAreas() {
    axios.get(this.$store.state.appHost + 'api/areas/').then(
      (response) => {
        const areas = [];
        for (const responseAreas of response.data.results) {
          const area = new Area(responseAreas.id, responseAreas.name, responseAreas.description, responseAreas.points_json, responseAreas.color, true);
          areas.push(area);
        }
        this.$store.state.areas = areas;
        this.createAlert(AlertStatus.success, this.$t('areasDownloaded', [response.data.results.length]).toString(), 2000);
      },
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('areasError').toString(), 2000);
      },
    );
  }

  private refreshPhotos() {
    const endPoint = this.$store.state.appHost + 'api/tracks/' + (process.env.VUE_APP_TRACKS_QUERY || '');
    axios.get(endPoint).then((response) => {
      for (const gpstrack of response.data.results) {
        for (const currentTrack of this.$store.state.tracks) {
          if (gpstrack.id === currentTrack.gpsTrack.id) {
            currentTrack.gpsTrack.photos = [];
            for (const responsePhoto of gpstrack.photo_set) {
              const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private);
              currentTrack.gpsTrack.addPhoto(photo);
            }
          }
        }
      }
    })
  }

  private processTracks(results: any) {
    const tracks = [];
    const plannedTracks = [];
    for (const gpstrack of results) {
      try {
        const region: Region = gpstrack.region ? new Region(gpstrack.region.id, gpstrack.region.name) : undefined;
        const newGpstrack: GpsTrack = new GpsTrack(gpstrack.id, gpstrack.name, gpstrack.description, gpstrack.points_json_optimized, gpstrack.color ? gpstrack.color : '#ff0000', gpstrack.distance, gpstrack.status, gpstrack.type, gpstrack.start_time ? new Date(gpstrack.start_time) : null, gpstrack.end_time ? new Date(gpstrack.end_time) : null, undefined, region);
        let checked = false;
        if (typeof this.$route.query.tracks === 'string') {
          const tracksIds = this.$route.query.tracks.split(',');
          checked = tracksIds.includes(String(gpstrack.id));
        } else {
          if (newGpstrack.status === TrackStatus.done) {
            checked = true;
          } else {
            checked = false;
          }
        }
        const track = new Track(newGpstrack, checked, true);
        for (const responsePhoto of gpstrack.photo_set) {
          const photo = new Photo(responsePhoto.id, responsePhoto.name, responsePhoto.description, responsePhoto.org_filename, responsePhoto.exif_time_taken, responsePhoto.image, responsePhoto.image_fullhd, responsePhoto.image_thumb, responsePhoto.private);
          newGpstrack.addPhoto(photo);
        }
        for (const responseVideoLink of gpstrack.videolink_set) {
          const video = new VideoLink(responseVideoLink.id, responseVideoLink.name, responseVideoLink.description, responseVideoLink.link, responseVideoLink.html);
          newGpstrack.addVideo(video);
        }
        if (newGpstrack.isDoneTrack()) {
          tracks.push(track);
        } else {
          plannedTracks.push(track);
        }
      } catch (error) {
        this.createAlert(AlertStatus.danger, this.$t('oneTrackError').toString(), 2000);
      }
    }
    this.$store.commit('setTracks', tracks);
    this.$store.commit('setPlannedTracks', plannedTracks);
    if (this.$route.query.tracks) {
      let trackBounds: L.LatLngBounds | undefined;
      for (const track of this.$store.getters.selectedTracks as Track[]) {
        if (trackBounds) {
          for (const mapTrack of track.mapTracks) {
            trackBounds.extend(mapTrack.getBounds());
          }
        } else {
          trackBounds = new L.LatLngBounds(track.mapTracks[0].getBounds().getNorthEast(), track.mapTracks[0].getBounds().getSouthWest());
          for (const mapTrack of track.mapTracks) {
            trackBounds.extend(mapTrack.getBounds());
          }
        }
      }
      if (trackBounds) {
        this.$store.state.map!.fitBounds(trackBounds);
      }
    }
  }

  private downloadTracks() {
    const endPoint = this.$store.state.appHost + 'api/tracks/' + (process.env.VUE_APP_TRACKS_QUERY || '');
    axios.get(endPoint).then((response) => {
      this.processTracks(response.data.results);
      this.createAlert(AlertStatus.success, this.$t('tracksDownloaded', [response.data.results.length]).toString(), 2000);
    }).catch((response) => {
      this.createAlert(AlertStatus.danger, this.$t('tracksError').toString(), 2000);
    }).finally(() => {
      this.loading = false;
    });
  }

}
</script>

<style>
  
  body {
    margin: 0;
  }

  #appvue {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  #map {
    position: relative;
    height: 100%;
    width: 100%;
  }

  #map.small {
    width: 20% !important;
  }

  .wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch;
  }

  .content {
    min-height: 100vh;
    width: 100%;
    display: flex;
  }

  @media (min-width: 400px) {
    #sidebar {
      min-width: 400px;
      max-width: 400px;
      min-height: 100vh;
      max-height: 100vh;
      margin-left: -400px;
      transition: margin-left 0.5s linear;
      background-color: white;
      overflow: scroll;
    }
  }

  @media (max-width: 400px) {
    #sidebar {
      min-width: 100%;
      max-width: 100%;
      min-height: 100vh;
      max-height: 100vh;
      margin-left: -100%;
      transition: margin-left 0.5s linear;
      background-color: white;
      overflow: scroll;
    }
  }

  #sidebar.active {
    margin-left: 0;
  }

  #main_gallery_div {
    display: none;
  }

  #main_gallery_div.active {
    display: block !important;
    padding: 20px;
    height: 100%;
    width: 100%;
    background-image: url(../assets/gallery_background.jpg);
    background-size: 100% auto;
  }

  .saveMessage {
    position: fixed;
    left: 50%;
    top: 10px;
    z-index: 100000;
    background-color: white;
    -webkit-transform: translate(-50%, 0);
    -moz-transform: translate(-50%, 0);
    -o-transform: translate(-50%, 0);
    transform: translate(-50%, 0);
  }

  .centerloading {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 100000;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .cogsbutton {
    height: 34px;
    width: 34px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .leaflet-control-zoom-fullscreen {
    background-image: url(../assets/fullscreen_icon.png);
  }

  .leaflet-control-scale-line {
    background-color: rgba(255, 255, 255, 0.95) !important;
  }

  .leaflet-control-layers-toggle {
    width: 48px !important;
    height: 48px !important;
  }

  @media (min-width: 700px) {
    .leaflet-control-zoom-in, #locationdivinner, .leaflet-control-zoom-out, .leaflet-control-zoom-fullscreen, .leaflet-bar a, .leaflet-control-locate {
      width: 32px !important;
      height: 32px !important;
    }
  }

  @media (max-width: 700px) {
    .leaflet-control-zoom-in, #locationdivinner, .leaflet-control-zoom-out, .leaflet-control-zoom-fullscreen, .leaflet-bar a, .leaflet-control-locate {
      width: 48px !important;
      height: 48px !important;
    }

    .leaflet-control-zoom-in, .leaflet-control-zoom-out {
      margin-bottom: 7px !important;
    }
  }

  .alertmessage {
    position: fixed;
    top: 10px;
    left: 50%;
    z-index: 100000;
    -webkit-transform: translate(-50%, 0);
    -moz-transform: translate(-50%, 0);
    -o-transform: translate(-50%, 0);
    transform: translate(-50%, 0);
  }

  .flexcenter {
    justify-content: center;
    display: flex;
  }

  .slider {
    width: 98% !important;
  }

  .btn-nopadding {
    padding-left: 0.1rem !important;
    padding-right: 0.1rem !important;
  }

  .flex-form-group {
    display: flex !important;
  }

</style>
