import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import L from 'leaflet';
import Track from './Track';
import Alert from './Alert';
import Place from './Place';
import axios from 'axios';

Vue.use(Vuex);

export interface RootState {
  map: L.Map | undefined;
  alerts: Alert[];
  appHost: string;
  tracks: Track[];
  imports: Track[];
  playingSpeed: number;
  places: Place[];
  token: string;
  user: any;
}

const store: StoreOptions<RootState> = {
  state: {
    map: undefined,
    alerts: Array<Alert>(),
    appHost: '',
    tracks: Array<Track>(),
    imports: Array<Track>(),
    playingSpeed: 10,
    places: Array<Place>(),
    token: '',
    user: null,
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
    setToken(state, payload: any) {
      state.token = payload.token;
      if (payload.token) {
        axios.defaults.headers.common['Authorization'] = 'Token ' + payload.token;
        payload.vue.$session.set('token', payload.token);
      } else {
        delete axios.defaults.headers.common['Authorization'];
        payload.vue.$session.remove('token');
      }
    },
    setUser(state, user: any) {
      state.user = user;
    },
    setTracks(state, tracks: Track[]) {
      state.tracks = tracks;
    },
    setPlaces(state, places: Place[]) {
      state.places = places;
    },
    setPlayingSpeed(state, playingSpeed: number) {
      state.playingSpeed = playingSpeed;
    },
    addAlert(state, alert: Alert) {
      state.alerts.push(alert);
    },
    removeAlert(state, id: number) {
      for (const index in state.alerts) {
        if (state.alerts[index].id === id) {
          state.alerts.splice(Number(index), 1);
        }
      }
    },
    addImportedTrack(state, track) {
      state.imports.push(track);
    },
    removeImportedTrack(state, track) {
      const index = state.imports.indexOf(track);
      if (index >= 0) {
        state.imports.splice(index, 1);
      }
    },
    addTrack(state, track) {
      state.tracks.push(track);
    },
    sortTracks(state) {
      state.tracks.sort((a, b) => a.gpsTrack.start_time < b.gpsTrack.start_time ? 1 : -1);
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
