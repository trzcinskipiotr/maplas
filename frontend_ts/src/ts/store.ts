import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import L from 'leaflet';
import Track from './Track';
import Alert from './Alert';
import Region from './Region';
import Place from './Place';
import PlaceType from './PlaceType';
import axios from 'axios';

Vue.use(Vuex);

export interface RootState {
  map: L.Map | undefined;
  alerts: Alert[];
  zoomLevel: number;
  appHost: string;
  tracks: Track[];
  imports: Track[];
  playingSpeed: number;
  regions: Region[];
  token: string;
  user: any;
  places: Place[];
  placeTypes: PlaceType[];
}

const store: StoreOptions<RootState> = {
  state: {
    map: undefined,
    alerts: Array<Alert>(),
    zoomLevel: null,
    appHost: '',
    tracks: Array<Track>(),
    imports: Array<Track>(),
    playingSpeed: 10,
    regions: Array<Region>(),
    token: '',
    user: null,
    places: Array<Place>(),
    placeTypes: Array<PlaceType>(),
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
    setZoomLevel(state, zoomLevel: number) {
      state.zoomLevel = zoomLevel;
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
      const markersDraggable = !!user;
      for (const place of state.places) {
        place.setDraggable(markersDraggable);
      }
    },
    setTracks(state, tracks: Track[]) {
      state.tracks = tracks;
    },
    setRegions(state, regions: Region[]) {
      state.regions = regions;
    },
    setPlaces(state, places: Place[]) {
      state.places = places;
    },
    setPlaceTypes(state, placeTypes: PlaceType[]) {
      state.placeTypes = placeTypes;
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
    addPlace(state, place) {
      state.places.push(place);
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
