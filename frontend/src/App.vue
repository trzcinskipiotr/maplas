<template>
  <div id="app">
    <div class="wrapper">
      <div id="sidebar">
      </div>
      <div class="content">
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import $ from 'jquery'

export default {
  name: 'App',
  mounted: function () {
    let map = this.createMap([52.743682, 16.273668], 11)
    this.addLayers(map)
    this.addCogsButton(map)
  },
  data: function () {
    return {
      'mapboxApiToken': 'MAPBOX_API_KEY'
    }
  },
  methods: {
    'createMap': function (center, zoom) {
      let map = L.map('map')
      map.setView(center, zoom)
      return map
    },
    'addLayers': function (map) {
      let mapboxStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      })

      let mapboxSatellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.satellite'
      })

      let mapboxOutdoor = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.outdoors'
      })

      let mapboxSatelliteStreets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapboxApiToken, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets-satellite'
      })

      let esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      let esriWorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      })

      let openStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map)

      let googleRoads = L.gridLayer.googleMutant({
        type: 'roadmap'
      })

      let googleSatellite = L.gridLayer.googleMutant({
        type: 'satellite'
      })

      let googleTerrain = L.gridLayer.googleMutant({
        type: 'terrain'
      })

      let openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })

      let hikeBike = L.tileLayer('https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })

      let baseMaps = {
        'OpenStreetMap': openStreetMap,
        'OpenTopoMap': openTopoMap,
        'Mapbox streets': mapboxStreets,
        'Mapbox satellite': mapboxSatellite,
        'Mapbox outdoor': mapboxOutdoor,
        'Mapbox hybrid': mapboxSatelliteStreets,
        'ESRI imaginary': esriWorldImagery,
        'ESRI topo': esriWorldTopoMap,
        'Hike bike': hikeBike,
        'Google roads': googleRoads,
        'Google satellite': googleSatellite,
        'Google terrain': googleTerrain
      }
      L.control.layers(baseMaps).addTo(map)
    },
    'addCogsButton': function (map) {
      let CogsControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'leaflet-touch leaflet-bar cogsbutton')
          var ima = L.DomUtil.create('i', 'fas fa-cogs fa-lg')
          container.append(ima)
          container.onclick = function () {
            $('#sidebar').toggleClass('active')
          }
          return container
        }
      })
      map.addControl(new CogsControl())
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

  #sidebar {
    min-width: 400px;
    max-width: 400px;
    min-height: 100vh;
    margin-left: -400px;
  }

  #sidebar.active {
    margin-left: 0px;
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

</style>
