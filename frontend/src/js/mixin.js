import Vue from 'vue'
import {TrackType, TrackStatus} from '@/js/const'

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
    }
  }
})
