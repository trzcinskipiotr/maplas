<template>
  <div v-on:mouseover="highlightRow(6)" v-on:mouseleave="unhighlightRow(3)">
    <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + track.id">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.id">{{ track.name }}</label>
    </div>
    <div style="display: inline">
      <TrackTypeIcon :track="track" height=24></TrackTypeIcon>
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/>
    </div>
    <div style="display: none">
      <div :id="'tooltip' + track.id">
        <b>Name: </b>{{ track.name }}<br>
        <b>Start time: </b>{{ track.start_time|formatDate }}<br>
        <b>Distance: </b>{{ track.distance|roundTrackDistance }}<br>
        <b>Type: </b><TrackTypeIcon :track="track" height=12></TrackTypeIcon><br>
        <b>ID: </b>{{ track.id }}
      </div>
    </div>
  </div>
</template>

<script>
import {TrackType} from '@/js/const'
import L from 'leaflet'
import axios from 'axios'
export default {
  name: 'TrackCheckbox',
  props: ['track', 'map'],
  data: function () {
    return {
      'checked': undefined,
      'gpxTrack': undefined,
      'TrackType': TrackType,
      'color': undefined,
      'appHost': window.location.hostname === 'localhost' ? 'http://localhost:8000/djangoapp/' : '/djangoapp/'
    }
  },
  watch: {
    'checked': function () {
      if (this.checked) {
        this.gpsTrack.addTo(this.map)
      } else {
        this.gpsTrack.removeFrom(this.map)
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
      axios.put(this.appHost + `api/tracks/${this.track.id}/`, this.track)
        .then((response) => {

        })
    },
    'highlightRow': function (width) {
      document.getElementById('trackcheckbox' + this.track.id).style.fontWeight = 'bold'
      this.changeWidth(width)
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
    for (let point of JSON.parse(this.track.points_json)) {
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
      e.target.bringToFront()
    })
    this.gpsTrack.on('mouseout', function (e) {
      e.target.component.unhighlightRow(3)
    })
    if (this.$route.query.tracks) {
      let tracksIds = this.$route.query.tracks.split(',')
      this.checked = tracksIds.includes(String(this.track.id))
    } else {
      this.checked = true
    }
  }
}
</script>
