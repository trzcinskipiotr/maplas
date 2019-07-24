<template>
  <div v-on:mouseover="highlightRow(6)" v-on:mouseleave="unhighlightRow(3)">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.gpstrack.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.gpstrack.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.gpstrack.id">{{ track.gpstrack.name }}</label>
    </div>
    <div style="display: inline">
      <TrackTypeIcon :track="track.gpstrack" height=24></TrackTypeIcon>
      <TrackStatusIcon :track="track.gpstrack" height=24></TrackStatusIcon>
      <TrackDownload :track="track.gpstrack" height=24></TrackDownload>
      <font-awesome-icon @click="centerTrack" style="height: 24px; cursor: pointer" icon="search-location"/>
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.gpstrack.id">
        <b>Name: </b>{{ track.gpstrack.name }}<br>
        <b>Start time: </b>{{ track.gpstrack.start_time|formatDate }}<br>
        <b>Distance: </b>{{ track.gpstrack.distance|roundTrackDistance }}<br>
        <b>Type: </b><TrackTypeIcon :track="track.gpstrack" height=12></TrackTypeIcon><br>
        <b>Status: </b><TrackStatusIcon :track="track.gpstrack" height=12></TrackStatusIcon><br>
        <b>ID: </b>{{ track.gpstrack.id }}
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'
import {AlertStatus} from '@/js/const'
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
        this.track.checked = true
      } else {
        this.gpsTrack.removeFrom(this.$store.getters.map)
        this.track.checked = false
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
      this.track.gpstrack.color = this.color
      axios.put(this.$store.getters.appHost + `api/tracks/${this.track.gpstrack.id}/`, this.track.gpstrack)
        .then((response) => {
          this.createAlert(AlertStatus.success, 'Color saved!', 2000)
        }).catch((response) => {
          this.createAlert(AlertStatus.danger, 'Error during color saving!', 2000)
        })
    },
    'centerTrack': function () {
      this.$store.getters.map.fitBounds(this.gpsTrack.getBounds())
    },
    'highlightRow': function (width) {
      document.getElementById('trackcheckbox' + this.track.gpstrack.id).style.fontWeight = 'bold'
      this.changeWidth(width)
      this.gpsTrack.bringToFront()
    },
    'unhighlightRow': function (width) {
      document.getElementById('trackcheckbox' + this.track.gpstrack.id).style.fontWeight = 'normal'
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
    for (let point of JSON.parse(this.track.gpstrack.points_json_optimized)) {
      let gpsPoint = new L.LatLng(point[0], point[1])
      gpsPointList.push(gpsPoint)
    }
    this.color = this.track.gpstrack.color || '#FF0000'
    this.gpsTrack = new L.Polyline(gpsPointList, {
      color: this.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1
    })
    this.gpsTrack.component = this
    this.gpsTrack.bindTooltip(document.getElementById('tooltip' + this.track.gpstrack.id), {'sticky': true, 'opacity': 0.95})
    this.gpsTrack.on('mouseover', function (e) {
      e.target.component.highlightRow(6)
    })
    this.gpsTrack.on('mouseout', function (e) {
      e.target.component.unhighlightRow(3)
    })
    this.checked = this.track.checked
  }
}
</script>
