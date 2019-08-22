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
            </ul>
            <div class="tab-content" id="tab_content_tracks">
              <div class="tab-pane show active" role="tabpanel" id="tabtracks">
                <div class="card">
                  <div class="card-body">
                    {{ $t('groupBy') }}: <v-select v-model="groupBy" :options="groups" :clearable="false" :searchable="false" >
                      <template slot="option" slot-scope="option">
                        {{ option.label }}
                      </template>
                    </v-select>
                    <br>
                    {{ $t('tracksSelected', [$store.getters.selectedTracks.length, $store.state.tracks.length]) }}<br>
                    {{ $t('tracksSelectedDistance') }}: {{ $store.getters.selectedTracks|sumTracksDistance|roundTrackDistance }}
                    <ul>
                      <li>{{ $t('tracksSelectedDistanceWalk') }}: {{ $store.getters.selectedTracks|sumTracksDistanceWalk|roundTrackDistance }}</li>
                      <li>{{ $t('tracksSelectedDistanceBicycle') }}: {{ $store.getters.selectedTracks|sumTracksDistanceBicycle|roundTrackDistance }}</li>
                    </ul>
                    <br>  
                    <div v-for="trackGroup in trackGroups" :key="trackGroup.label">
                      <AppTrackGroup :trackGroup="trackGroup"></AppTrackGroup>
                      <br>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane show" role="tabpanel" id="tabsettings">
                <div class="card">
                  <div class="card-body">
                    {{ $t('language') }}: <v-select v-model="language" :options="languages" :clearable="false" :searchable="false" >
                      <template slot="option" slot-scope="option">
                        <flag :iso="option.flag" v-bind:squared=false />
                        {{ option.label }}
                      </template>
                    </v-select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div id="map">
          <span class="centerloading">
            <font-awesome-icon v-if="tileLoading" class="fa-spin" icon="spinner" size="4x"/>
          </span>
        </div>
      </div>
    </div>
    <div id="cogsdiv" style="display: none;">
      <div id="cogsdivinner" @click="togglePanel" class="leaflet-touch leaflet-bar cogsbutton" v-b-tooltip.hover :title="menuOpened ? $t('closeMenu') : $t('openMenu')">
        <font-awesome-icon style="cursor: pointer;" icon="cogs" size="lg"/>
      </div>
    </div>
    <div class="alertmessage">
      <font-awesome-icon v-if="loading" class="fa-spin" icon="spinner" size="3x"/>
    </div>
    <div class="alertmessage">
      <div v-for="alert in $store.state.alerts" class="alert border border-dark" v-bind:class="{ 'alert-success': isSuccessAlert(alert), 'alert-danger': isDangerAlert(alert) }" v-bind:key="alert.date" role="alert">
        {{ alert.message }}
      </div>
    </div>
    <div v-for="language in languages" :key="language.flag" style="position: absolute; left: -10000px">
      <flag :iso="language.flag" v-bind:squared=false />
    </div>
    <template v-if="document.getElementsByClassName('leaflet-control-locate')[0]">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-locate')[0]">{{ $t('showMyLocation') }}</b-tooltip>
    </template>
    <template v-if="document.getElementsByClassName('leaflet-control-zoom-fullscreen')[0]">
      <b-tooltip ref="fullscreenTooltip" :target="document.getElementsByClassName('leaflet-control-zoom-fullscreen')[0]">{{ fullscreenOpened ? $t('exitFullscreen') : $t('enterFullscreen') }}</b-tooltip>
    </template>
    <template v-if="document.getElementsByClassName('leaflet-control-zoom-in')[0]">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-zoom-in')[0]">{{ $t('zoomIn') }}</b-tooltip>
    </template>
    <template v-if="document.getElementsByClassName('leaflet-control-zoom-out')[0]">
      <b-tooltip :target="document.getElementsByClassName('leaflet-control-zoom-out')[0]">{{ $t('zoomOut') }}</b-tooltip>
    </template>
  </div>  
</template>

/* tslint:disable:no-string-literal */
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet.fullscreen';
import 'leaflet.locatecontrol';
import axios from 'axios';
import $ from 'jquery';
import BaseComponent from '@/components/Base.vue';
import { AlertStatus } from '@/ts/types';
import Track from '@/ts/Track';
import GpsTrack from '@/ts/GpsTrack';
import i18n from '@/plugins/i18n';
import YearTrackGrouper from '@/ts/trackgroupers/year';
import TypeTrackGrouper from '@/ts/trackgroupers/type';
import PlaceTrackGrouper from '@/ts/trackgroupers/place';
import TrackGrouper from '@/ts/TrackGrouper';
import TrackGroup from '@/ts/TrackGroup';

@Component
export default class Index extends BaseComponent {
  private mapboxApiToken: string = 'MAPBOX_API_KEY';
  private googleApiToken: string = 'GOOGLE_API_KEY';
  private loading: boolean = true;
  private tileLoading: boolean = true;
  private menuOpened = false;
  private document = document;
  private fullscreenOpened = false;

  private groups = [{label: 'Rok', grouper: new YearTrackGrouper()}, {label: 'Typ', grouper: new TypeTrackGrouper()}, {label: 'Miejsce', grouper: new PlaceTrackGrouper()}];
  private groupBy = this.groups[0];
  private trackGroups: TrackGroup[] = [];

  private languages = [{flag: 'us', language: 'en', label: 'English'}, {flag: 'pl', language: 'pl', label: 'Polski' }];
  private language: {flag: string, language: string, label: string} | null = null;

  @Watch('language')
  private onLanguageChanged(value: string, oldValue: string) {
    i18n.locale = this.language!.language;
  }

  @Watch('groupBy')
  private onGroupByChanged(value: string, oldValue: string) {
    this.trackGroups = this.groupBy!.grouper.groupTracks(this.$store.state.tracks);
  }

  private mounted() {
    this.setLanguage();
    this.setAppHost();
    this.createMap([52.743682, 16.273668], 11);
    this.addLayers();
    this.addScaleControl();
    this.addFullScreenControl();
    this.addCogsButton();
    this.addCurrentLocationControl();
    this.downloadTracks();
  }

  private setLanguage() {
    if (typeof this.$route.query.lang === 'string') {
      for (const lang of this.languages) {
        if (this.$route.query.lang === lang.language) {
          this.language = lang;
        }
      }
      if (! this.language) {
        this.language = this.languages[0];
      }
    } else {
      this.language = this.languages[0];
    }
  }

  private setAppHost() {
    this.$store.commit('setAppHost', window.location.hostname === 'localhost' ? 'http://localhost:8000/djangoapp/' : '/djangoapp/');
  }

  private createMap(center: [number, number], zoom: number) {
    const map = L.map('map', {zoomAnimation: false});
    map.setView(center, zoom);
    this.$store.commit('setMap', map);
  }

  private addLayers() {
    interface LayersDictionary {
      [index: string]: L.TileLayer | L.gridLayer.GoogleMutant;
    }
    const layers: LayersDictionary = {};

    layers['mapboxStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.streets',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxSatellite'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxOutdoor'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.outdoors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['mapboxSatelliteStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // @ts-ignore
      id: 'mapbox.streets-satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['esriWorldImagery'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['esriWorldTopoMap'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['openStreetMap'] = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['openCycleMap'] = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenCycleMap, ' + 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleRoads'] = L.gridLayer.googleMutant({
      type: 'roadmap',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleSatellite'] = L.gridLayer.googleMutant({
      type: 'satellite',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleTerrain'] = L.gridLayer.googleMutant({
      type: 'terrain',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['googleHybrid'] = L.gridLayer.googleMutant({
      type: 'hybrid',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['openTopoMap'] = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['hikeBike'] = L.tileLayer('https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    layers['hyddaBase'] = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'img/tiledownloadfailed.jpg',
    });

    const baseMaps: LayersDictionary = {
      'OpenStreetMap': layers['openStreetMap'],
      'OpenCycleMap': layers['openCycleMap'],
      'OpenTopoMap': layers['openTopoMap'],
      'Mapbox streets': layers['mapboxStreets'],
      'Mapbox satellite': layers['mapboxSatellite'],
      'Mapbox outdoor': layers['mapboxOutdoor'],
      'Mapbox hybrid': layers['mapboxSatelliteStreets'],
      'ESRI imaginary': layers['esriWorldImagery'],
      'ESRI topo': layers['esriWorldTopoMap'],
      'Hike bike': layers['hikeBike'],
      'Google roads': layers['googleRoads'],
      'Google satellite': layers['googleSatellite'],
      'Google terrain': layers['googleTerrain'],
      'Google hybrid': layers['googleHybrid'],
      'Hydda base': layers['hyddaBase'],
    };

    for (const layer in baseMaps) {
      if (baseMaps.hasOwnProperty(layer)) {
        baseMaps[layer].on('loading', (event) => {
          this.tileLoading = true;
        });
        baseMaps[layer].on('load', (event) => {
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
    L.control.layers(baseMaps).addTo(this.$store.state.map!);
    if (layers.hasOwnProperty(maplayer)) {
      layers[maplayer].addTo(this.$store.state.map!);
    } else {
      if (maplayer.length > 0) {
        this.createAlert(AlertStatus.danger, `Param maplayer ${maplayer} provided, but layer not found in avaliable layers`, 2000);
      }
      layers['openStreetMap'].addTo(this.$store.state.map!);
    }
  }

  private addCogsButton() {
    const CogsControl = L.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd: (map: L.Map) => {
        return document.getElementById('cogsdivinner');
      },
    });
    this.$store.state.map!.addControl(new CogsControl());
  }

  private togglePanel() {
    $('#sidebar').toggleClass('active');
    this.menuOpened = !this.menuOpened;
    setTimeout(() => {
      // @ts-ignore
      this.$store.state.map.invalidateSize({pan: false, animate: false});
    }, 1000);
  }

  private closeFullscreenTooltip() {
    // @ts-ignore
    this.$refs.fullscreenTooltip.$emit('close');
  }

  private addFullScreenControl() {
    L.control.fullscreen({
      position: 'topleft',
      title: '',
      titleCancel: '',
      // @ts-ignore
      fullscreenElement: document.documentElement,
    }).addTo(this.$store.state.map);

    this.$store.state.map!.on('enterFullscreen', () => {this.fullscreenOpened = true; this.closeFullscreenTooltip(); });
    this.$store.state.map!.on('exitFullscreen', () => {this.fullscreenOpened = false; this.closeFullscreenTooltip(); });
  }

  private addScaleControl() {
    L.control.scale({metric: true, position: 'topleft', imperial: false, maxWidth: 200}).addTo(this.$store.state.map!);
  }

  private addCurrentLocationControl() {
    this.$store.state.map!.addControl(L.control.locate({
      locateOptions: {
        enableHighAccuracy: true,
      },
      strings: {
        title: '',
      },
    }));
  }

  private downloadTracks() {
    axios.get(this.$store.state.appHost + 'api/tracks/').then(
      (response) => {
        const tracks = [];
        for (const gpstrack of response.data.results) {
          let checked;
          if (typeof this.$route.query.tracks === 'string') {
            const tracksIds = this.$route.query.tracks.split(',');
            checked = tracksIds.includes(String(gpstrack.id));
          } else {
            checked = ((!this.isPlannedTrack(gpstrack)) && (this.isBicycleTrack(gpstrack)));
          }
          const newGpstrack: GpsTrack = new GpsTrack(gpstrack.id, gpstrack.name, gpstrack.description, gpstrack.points_json_optimized, gpstrack.color, gpstrack.distance, gpstrack.status, gpstrack.type, new Date(gpstrack.start_time), new Date(gpstrack.end_time), gpstrack.place ? gpstrack.place.name : null);
          const track = new Track(newGpstrack, checked);
          if (newGpstrack.isDoneTrack()) {
            tracks.push(track);
          }
        }
        this.$store.commit('setTracks', tracks);
        if (this.$route.query.tracks) {
          let trackBounds: L.LatLngBounds | undefined;
          for (const track of this.$store.getters.selectedTracks as Track[]) {
            if (trackBounds) {
              trackBounds.extend(track.mapTrack.getBounds());
            } else {
              trackBounds = new L.LatLngBounds(track.mapTrack.getBounds().getNorthEast(), track.mapTrack.getBounds().getSouthWest());
            }
          }
          if (trackBounds) {
            this.$store.state.map!.fitBounds(trackBounds);
          }
        }
        this.createAlert(AlertStatus.success, this.$t('tracksDownloaded', [response.data.results.length]).toString(), 2000);
        this.trackGroups = this.groupBy!.grouper.groupTracks(this.$store.state.tracks);
      },
    ).catch(
      (response) => {
        this.createAlert(AlertStatus.danger, this.$t('tracksError').toString(), 2000);
      },
    ).finally(
      () => {
        this.loading = false;
      },
    );
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

  .wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch;
  }

  .content {
    min-height: 100vh;
    width: 100%;
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

</style>
