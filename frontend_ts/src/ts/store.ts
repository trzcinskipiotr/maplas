import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import L from 'leaflet';
import Track from './Track';
import Alert from './Alert';

Vue.use(Vuex);

export interface RootState {
  map: L.Map | undefined;
  alerts: Alert[];
  appHost: string;
  tracks: Track[];
}

const store: StoreOptions<RootState> = {
  state: {
    map: undefined,
    alerts: Array<Alert>(),
    appHost: '',
    tracks: Array<Track>(),
  },
  getters: {
    selectedTracks: (state): Track[] => {
      const tracks = [];
      for (const track of state.tracks) {
        if (track.checked) {
          tracks.push(track);
        }
      }
      return tracks;
    },
  },
  mutations: {
    setMap(state, map: L.Map) {
      state.map = map;
    },
    setAppHost(state, appHost: string) {
      state.appHost = appHost;
    },
    setTracks(state, tracks: Track[]) {
      state.tracks = tracks;
    },
    addAlert(state, alert: Alert) {
      state.alerts.push(alert);
    },
    removeAlert(state) {
      state.alerts.pop();
    },
  },
  actions: {
  },
};

export default new Vuex.Store<RootState>(store);
