<template>
  <div v-on:mouseover="highlightRow(6)" v-on:mouseleave="unhighlightRow(3)">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.id">{{ track.name }}</label>
    </div>
    <div style="display: inline">
      <TrackTypeIcon :track="track" height=24></TrackTypeIcon>
      <TrackStatusIcon :track="track" height=24></TrackStatusIcon>
      <TrackDownload :track="track" height=24></TrackDownload>
      <font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/>
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.id">
        <b>Name: </b>{{ track.name }}<br>
        <b>Start time: </b>{{ track.start_time|formatDate }}<br>
        <b>Distance: </b>{{ track.distance|roundTrackDistance }}<br>
        <b>Type: </b><TrackTypeIcon :track="track" height=12></TrackTypeIcon><br>
        <b>Status: </b><TrackStatusIcon :track="track" height=12></TrackStatusIcon><br>
        <b>ID: </b>{{ track.id }}
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'
export default {
  name: 'TrackCheckbox',
  props: ['track'],
  data: function () {
    return {
      'checked': undefined,
      'gpxTrack': undefined,
      'color': undefined
    }
  },
  watch: {
    'checked': function () {
      if (this.checked) {
        this.gpsTrack.addTo(this.$store.getters.map)
      } else {
        this.gpsTrack.removeFrom(this.$store.getters.map)
      }
    },
    'color': function () {
      this.gpsTrack.setStyle({
        color: this.color
      })
    }
  },
  methods: {
    'saveColor': function () {
      this.track.color = this.color
      axios.put(this.$store.getters.appHost + `api/tracks/${this.track.id}/`, this.track)
        .then((response) => {

        })
    },
    'centerTrack': function () {
      let minLat = 500
      let maxLat = -500
      let minLon = 500
      let maxLon = -500
      for (let point of JSON.parse(this.track.points_json_optimized)) {
        minLat = point[0] < minLat ? point[0] : minLat
        maxLat = point[0] > maxLat ? point[0] : maxLat
        minLon = point[1] < minLon ? point[1] : minLon
        maxLon = point[1] > maxLon ? point[1] : maxLon
      }
      this.$store.getters.map.fitBounds([[minLat, minLon], [maxLat, maxLon]])
    },
    'highlightRow': function (width) {
      document.getElementById('trackcheckbox' + this.track.id).style.fontWeight = 'bold'
      this.changeWidth(width)
      this.gpsTrack.bringToFront()
    },
    'unhighlightRow': function (width) {
      document.getElementById('trackcheckbox' + this.track.id).style.fontWeight = 'normal'
      this.changeWidth(width)
    },
    'changeWidth': function (width) {
      this.gpsTrack.setStyle({
        weight: width
      })
    }
  },
  mounted () {
    let gpsPointList = []
    for (let point of JSON.parse(this.track.points_json_optimized)) {
      let gpsPoint = new L.LatLng(point[0], point[1])
      gpsPointList.push(gpsPoint)
    }
    this.color = this.track.color || '#FF0000'
    this.gpsTrack = new L.Polyline(gpsPointList, {
      color: this.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1
    })
    this.gpsTrack.component = this
    this.gpsTrack.bindTooltip(document.getElementById('tooltip' + this.track.id), {'sticky': true, 'opacity': 0.95})
    this.gpsTrack.on('mouseover', function (e) {
      e.target.component.highlightRow(6)
    })
    this.gpsTrack.on('mouseout', function (e) {
      e.target.component.unhighlightRow(3)
    })
    if (this.$route.query.tracks) {
      let tracksIds = this.$route.query.tracks.split(',')
      this.checked = tracksIds.includes(String(this.track.id))
    } else {
      if (this.isPlannedTrack(this.track)) {
        this.checked = false
      } else {
        this.checked = true
      }
    }
  }
}
</script>
