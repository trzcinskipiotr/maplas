<template>
  <div id="app">
    <div class="wrapper">
      <div id="sidebar">
        <div class="card">
          <div class="card-header">
            Main menu
            <div style="float: right;">
              <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="['far', 'times-circle']"/>
            </div>
          </div>
          <div class="mx-0 px-0 card-body">
            <ul class="nav nav-tabs" id="tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="home-tab" data-toggle="tab" href="#tabtracks" role="tab">Tracks</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="profile-tab" data-toggle="tab" href="#tabsettings" role="tab">Settings</a>
              </li>
            </ul>
            <div class="tab-content" id="tab_content_tracks">
              <div class="tab-pane show active" role="tabpanel" id="tabtracks">
                <div class="card">
                  <div class="card-body">
                    Selected {{ $store.getters.selectedTracks.length }} of {{ $store.getters.tracks.length }} tracks<br>
                    Selected tracks distance {{ $store.getters.selectedTracks|sumTracksDistance|roundTrackDistance }}<br><br>
                    <div v-for="track in $store.getters.tracks" :key="track.gpstrack.id">
                      <TrackCheckbox :track="track"></TrackCheckbox>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane show" role="tabpanel" id="tabsettings">
                <div class="card">
                  <div class="card-body">
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
      <div id="cogsdivinner" @click="togglePanel" class="leaflet-touch leaflet-bar cogsbutton">
        <font-awesome-icon style="cursor: pointer;" icon="cogs" size="lg"/>
      </div>
    </div>
    <div class="alertmessage">
      <font-awesome-icon v-if="loading" class="fa-spin" icon="spinner" size="3x"/>
    </div>
    <div class="alertmessage">
      <div v-for="alert in $store.getters.alerts" class="alert border border-dark" v-bind:class="{ 'alert-success': isSuccessAlert(alert), 'alert-danger': isDangerAlert(alert) }" v-bind:key="alert.date" role="alert">
        {{ alert.message }}
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.fullscreen'
import $ from 'jquery'
import axios from 'axios'
import Track from '@/js/track'
import {AlertStatus} from './js/const'

export default {
  name: 'App',
  mounted: function () {
    this.$store.commit('setAppHost', window.location.hostname === 'localhost' ? 'http://localhost:8000/djangoapp/' : '/djangoapp/')
    this.createMap([52.743682, 16.273668], 11)
    this.addLayers()
    this.addScaleControl()
    this.addFullScreenControl()
    this.addCogsButton()
    this.addCurrentLocationControl()
    this.downloadTracks()
  },
  data: function () {
    return {
      'mapboxApiToken': 'MAPBOX_API_KEY',
      'googleApiToken': 'GOOGLE_API_KEY',
      'loading': true,
      'tileLoading': true
    }
  },
  methods: {
    'createMap': function (center, zoom) {
      let map = L.map('map', {'zoomAnimation': false})
      map.setView(center, zoom)
      this.$store.commit('setMap', map)
    },
    'addLayers': function () {
      let layers = {}
      layers['mapboxStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['mapboxSatellite'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.satellite',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['mapboxOutdoor'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.outdoors',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['mapboxSatelliteStreets'] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets-satellite',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['esriWorldImagery'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['esriWorldTopoMap'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['openStreetMap'] = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['googleRoads'] = L.gridLayer.googleMutant({
        type: 'roadmap',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['googleSatellite'] = L.gridLayer.googleMutant({
        type: 'satellite',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['googleTerrain'] = L.gridLayer.googleMutant({
        type: 'terrain',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['googleHybrid'] = L.gridLayer.googleMutant({
        type: 'hybrid',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['openTopoMap'] = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['hikeBike'] = L.tileLayer('https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      layers['hyddaBase'] = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        errorTileUrl: 'static/tiledownloadfailed.jpg'
      })

      let baseMaps = {
        'OpenStreetMap': layers['openStreetMap'],
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
        'Hydda base': layers['hyddaBase']
      }

      for (let layer in baseMaps) {
        if (baseMaps.hasOwnProperty(layer)) {
          baseMaps[layer].on('loading', event => {
            this.tileLoading = true
          })
          baseMaps[layer].on('load', event => {
            this.tileLoading = false
          })
        }
      }

      L.control.layers(baseMaps).addTo(this.$store.getters.map)
      if (layers.hasOwnProperty(this.$route.query.maplayer)) {
        layers[this.$route.query.maplayer].addTo(this.$store.getters.map)
      } else {
        layers['openStreetMap'].addTo(this.$store.getters.map)
      }
    },
    'addScaleControl': function () {
      L.control.scale({'metric': true, 'position': 'topleft', 'imperial': false, 'maxWidth': 200}).addTo(this.$store.getters.map)
    },
    'addFullScreenControl': function () {
      L.control.fullscreen({
        position: 'topleft',
        title: 'Enter fullscreen',
        titleCancel: 'Exit fullscreen',
        fullscreenElement: document.getElementById('app')
      }).addTo(this.$store.getters.map)
    },
    'addCurrentLocationControl': function () {
      this.$store.getters.map.addControl(L.control.locate({
        locateOptions: {
          enableHighAccuracy: true
        }
      }))
    },
    'addCogsButton': function () {
      let CogsControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function (map) {
          return document.getElementById('cogsdivinner')
        }
      })
      this.$store.getters.map.addControl(new CogsControl())
    },
    'downloadTracks': function () {
      axios.get(this.$store.getters.appHost + 'api/tracks/').then(
        response => {
          let tracks = []
          this.createAlert(AlertStatus.success, response.data.results.length + ' tracks downloaded', 2000)
          for (let gpstrack of response.data.results) {
            let checked
            if (this.$route.query.tracks) {
              let tracksIds = this.$route.query.tracks.split(',')
              checked = tracksIds.includes(String(gpstrack.id))
            } else {
              checked = ((!this.isPlannedTrack(gpstrack)) && (this.isBicycleTrack(gpstrack)))
            }
            let track = new Track(gpstrack, checked)
            tracks.push(track)
          }
          this.$store.commit('setTracks', tracks)
          this.loading = false
          if (this.$route.query.tracks) {
            let minLat = 500
            let maxLat = -500
            let minLon = 500
            let maxLon = -500
            for (let track of this.$store.getters.selectedTracks) {
              for (let point of JSON.parse(track.gpstrack.points_json_optimized)) {
                minLat = point[0] < minLat ? point[0] : minLat
                maxLat = point[0] > maxLat ? point[0] : maxLat
                minLon = point[1] < minLon ? point[1] : minLon
                maxLon = point[1] > maxLon ? point[1] : maxLon
              }
            }
            this.$store.getters.map.fitBounds([[minLat, minLon], [maxLat, maxLon]])
          }
        }
      )
    },
    'togglePanel': function () {
      $('#sidebar').toggleClass('active')
      setTimeout(() => {
        this.$store.getters.map.invalidateSize({pan: false, animate: false})
      }, 1000)
    }
  }
}
</script>

<style>
  #app {
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

  .cogsbutton {
    height: 34px;
    width: 34px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    min-height: 100vh;
    width: 100%;
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

  .leaflet-control-zoom-fullscreen {
    background-image: url(assets/fullscreen_icon.png);
  }

</style>
