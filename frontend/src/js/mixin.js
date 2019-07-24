import Vue from 'vue'
import {TrackType, TrackStatus, AlertStatus} from '@/js/const'

Vue.mixin({
  methods: {
    'isBicycleTrack': function (track) {
      return track.type === TrackType.bicycle
    },
    'isWalkTrack': function (track) {
      return track.type === TrackType.walk
    },
    'isDoneTrack': function (track) {
      return track.status === TrackStatus.done
    },
    'isPlannedTrack': function (track) {
      return track.status === TrackStatus.planned
    },
    'isDangerAlert': function (alert) {
      return alert.status === AlertStatus.danger
    },
    'isSuccessAlert': function (alert) {
      return alert.status === AlertStatus.success
    },
    'createAlert': function (status, message, timeout) {
      let alert = {'status': status, 'message': message, 'date': Date.now()}
      this.$store.commit('addAlert', alert)
      window.setTimeout(() => {
        this.$store.commit('removeAlert')
      }, timeout)
    }
  }
})
