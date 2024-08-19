import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import L from 'leaflet';
import Track from './Track';
import Alert from './Alert';
import Region from './Region';
import Place from './Place';
import PlaceType from './PlaceType';
import axios from 'axios';
import Area from './Area';

Vue.use(Vuex);

export interface RootState {
  map: L.Map | undefined;
  alerts: Alert[];
  zoomLevel: number;
  appHost: string;
  tracks: Track[];
  imports: Track[];
  plannedTracks: Track[];
  playingSpeed: number;
  regions: Region[];
  token: string;
  user: any;
  places: Place[];
  placeTypes: PlaceType[];
  speedLegendVisible: boolean;
  speedThresholds: number[];
  speedColors: Array<{color: string}>;
  editedTrack: Track;
  editedArea: Area;
  isDesktop: boolean;
  pwa: boolean;
  minimalZoom: number;
  maximalZoom: number;
  offlineControl: any;
  baseMaps: any;
  downloadThreads: number;
  areas: Area[];
  translations: any,
}

const store: StoreOptions<RootState> = {
  state: {
    map: undefined,
    alerts: Array<Alert>(),
    zoomLevel: null,
    appHost: '',
    tracks: Array<Track>(),
    imports: Array<Track>(),
    plannedTracks: Array<Track>(),
    playingSpeed: 10,
    regions: Array<Region>(),
    token: '',
    user: null,
    places: Array<Place>(),
    placeTypes: Array<PlaceType>(),
    speedLegendVisible: false,
    speedThresholds: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    speedColors: [
      {color: 'rgb(229,11,10)'}, {color: 'rgb(231,106,12)'}, {color: 'rgb(231,154,12)'},
      {color: 'rgb(228,201,12)'}, {color: 'rgb(210,230,12)'}, {color: 'rgb(164,231,12)'},
      {color: 'rgb(68,231,12)'}, {color: 'rgb(11,230,143)'}, {color: 'rgb(12,220,230)'},
      {color: 'rgb(12,175,230)'}, {color: 'rgb(12,126,230)'}, {color: 'rgb(11,77,229)'},
      {color: 'rgb(88,12,230)'}, {color: 'rgb(137,12,230)'}, {color: 'rgb(181,11,229)'},
      {color: 'rgb(230,12,229)'}
    ],
    editedTrack: null,
    editedArea: null,
    isDesktop: !process.env.VUE_APP_PWA,
    pwa: process.env.VUE_APP_PWA,
    minimalZoom: 5,
    maximalZoom: 18,
    offlineControl: null,
    baseMaps: null,
    downloadThreads: 10,
    areas: Array<Area>(),
    translations: {'pl': {}, 'en': {}},
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
    setPlannedTracks(state, plannedTracks: Track[]) {
      state.plannedTracks = plannedTracks;
    },
    setSpeedLegendVisible(state, speedLegendVisible: boolean) {
      state.speedLegendVisible = speedLegendVisible;
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
    addPlannedTrack(state, track) {
      state.plannedTracks.push(track);
    },
    setEditedTrack(state, track) {
      state.editedTrack = track;
      state.editedArea = null;
    },
    setEditedArea(state, area) {
      state.editedArea = area;
      state.editedTrack = null;
    },
    addPlace(state, place) {
      let exists = false;
      let index = 0;
      for (const loopPlace of state.places) {
        if (loopPlace.id == place.id) {
          loopPlace.name = place.name;
          loopPlace.description = place.description;
          loopPlace.approved = place.approved;
          loopPlace.photos = place.photos;
          loopPlace.lat = place.lat;
          loopPlace.lon = place.lon;
          loopPlace.type = place.type;
          exists = true;
          break;
        }
        index = index + 1;
      }
      if (! exists) {
        state.places.push(place);
      }
    },
    removeImportedTrack(state, track) {
      const index = state.imports.indexOf(track);
      if (index >= 0) {
        state.imports.splice(index, 1);
      }
    },
    removePlannedTrack(state, track) {
      const index = state.plannedTracks.indexOf(track);
      if (index >= 0) {
        state.plannedTracks.splice(index, 1);
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
      for (const looptrack of state.plannedTracks) {
        if (looptrack === options.track) {
          looptrack.checked = options.checked;
        }
      }
    },
    addTranslation(state, payload) {
      state.translations[payload.lang][payload.key] = payload.value;
    }
  },
  actions: {
  },
};

export default new Vuex.Store<RootState>(store);
