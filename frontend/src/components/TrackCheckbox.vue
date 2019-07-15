<template>
  <div>
    <div style="display: inline" class="custom-control custom-checkbox">
      <input type="checkbox" class="custom-control-input" :id="'checkbox' + track.id" v-model="checked" />
      <label class="custom-control-label" :for="'checkbox' + track.id">{{ track.name }}</label>
    </div>
    <div style="display: inline">
      <font-awesome-icon style="height: 24px;" v-if="track.type === TrackType.bicycle" icon="biking"/>
      <font-awesome-icon style="height: 24px;" v-else-if="track.type === TrackType.walk" icon="shoe-prints"/>
      <div style="display: inline-block"><verte v-model="color" :showHistory="null" model="hex"><font-awesome-icon icon="circle"></font-awesome-icon></verte></div>
      <font-awesome-icon @click="saveColor" style="height: 24px; cursor: pointer" icon="save"/>
    </div>
  </div>
</template>

<script>
import {formatDate} from '@/js/utils'
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
    this.gpsTrack.bindTooltip('<b>Name: </b>' + this.track.name + '<br>' +
                              '<b>Distance: </b>' + Math.round(this.track.distance / 100) / 10 + 'km<br>' +
                              '<b>Start time: </b>' + formatDate(this.track.start_time) + '<br>' +
                              '<b>ID: </b>' + this.track.id, {'sticky': true, 'opacity': 0.95})
    this.gpsTrack.on('mouseover', function (e) {
      e.target.setStyle({
        weight: 6
      })
      e.target.bringToFront()
    })
    this.gpsTrack.on('mouseout', function (e) {
      e.target.setStyle({
        weight: 3
      })
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

<style scoped>
  .verte__menu-origin {
    z-index: 1000000;
  }
</style>
