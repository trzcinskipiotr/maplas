import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: undefined,
    appHost: undefined,
    tracks: [],
    alerts: []
  },
  mutations: {
    setMap (state, map) {
      state.map = map
    },
    setAppHost (state, appHost) {
      state.appHost = appHost
    },
    setTracks (state, tracks) {
      state.tracks = tracks
    },
    addAlert (state, alert) {
      state.alerts.push(alert)
    },
    removeAlert (state) {
      state.alerts.pop()
    }
  },
  getters: {
    map: state => state.map,
    appHost: state => state.appHost,
    tracks: state => state.tracks,
    selectedTracks: state => {
      let tracks = []
      for (let track of state.tracks) {
        if (track.checked) {
          tracks.push(track)
        }
      }
      return tracks
    },
    alerts: state => state.alerts
  }
})
