import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: undefined,
    appHost: undefined
  },
  mutations: {
    setMap (state, map) {
      state.map = map
    },
    setAppHost (state, appHost) {
      state.appHost = appHost
    }
  },
  getters: {
    map: state => state.map,
    appHost: state => state.appHost
  }
})
