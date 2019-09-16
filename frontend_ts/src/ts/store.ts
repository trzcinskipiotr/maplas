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
  imports: Track[];
  playingSpeed: number;
}

const store: StoreOptions<RootState> = {
  state: {
    map: undefined,
    alerts: Array<Alert>(),
    appHost: '',
    tracks: Array<Track>(),
    imports: Array<Track>(),
    playingSpeed: 10,
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
    setPlayingSpeed(state, playingSpeed: number) {
      state.playingSpeed = playingSpeed;
    },
    addAlert(state, alert: Alert) {
      state.alerts.push(alert);
    },
    removeAlert(state) {
      state.alerts.pop();
    },
    addImportedTrack(state, track) {
      state.imports.push(track);
    },
    setTrackChecked(state, options: {track: Track, checked: boolean}) {
      for (const looptrack of state.tracks) {
        if (looptrack === options.track) {
          looptrack.checked = options.checked;
        }
      }
      for (const looptrack of state.imports) {
        if (looptrack === options.track) {
          looptrack.checked = options.checked;
        }
      }
    },
  },
  actions: {
  },
};

export default new Vuex.Store<RootState>(store);
