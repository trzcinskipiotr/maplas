import Vue from 'vue';
import App from './App.vue';
import router from './ts/router';
import store from './ts/store';
// import './registerServiceWorker';
import './unregisterServiceWorker';

import 'leaflet.gridlayer.googlemutant';
import 'leaflet.locatecontrol';
import 'leaflet-hotline';
import 'Leaflet.MultiOptionsPolyline';
import 'leaflet/dist/leaflet.css';
import 'leaflet.motion/dist/leaflet.motion.min';
import 'localforage';
import './ts/leaflet.offline';
import './ts/leaflet.contextmenu';
import './ts/leaflet.contextmenu.css';

import 'localforage-getitems';
import 'localforage-setitems';

import './ts/L.CanvasLayer';

import '@fortawesome/fontawesome-free/css/all.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoePrints, faBiking, faCircle, faSave, faDownload, faSearchLocation, faCogs, faSpinner, faChevronDown, faChevronUp, faPlay, faStopCircle, faFileUpload, faBars, faUpload, faCamera, faTrash, faUndo, faSearchPlus, faLock, faLockOpen, faMapMarker, faQuestion, faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faCalendarTimes, faCalendarCheck, faWindowClose, faTimesCircle, faWindowMaximize } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faShoePrints);
library.add(faBiking);
library.add(faCircle);
library.add(faSave);
library.add(faDownload);
library.add(faCalendarCheck);
library.add(faCalendarTimes);
library.add(faSearchLocation);
library.add(faCogs);
library.add(faSpinner);
library.add(faWindowClose);
library.add(faTimesCircle);
library.add(faChevronDown);
library.add(faChevronUp);
library.add(faPlay);
library.add(faStopCircle);
library.add(faFileUpload);
library.add(faBars);
library.add(faUpload);
library.add(faWindowMaximize);
library.add(faCamera);
library.add(faTrash);
library.add(faUndo);
library.add(faSearchPlus);
library.add(faLock);
library.add(faLockOpen);
library.add(faMapMarker);
library.add(faCheck);
library.add(faQuestionCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon);

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

import loadgoogle from 'load-google-maps-api';
loadgoogle({key: 'GOOGLE_API_KEY'});

Vue.config.productionTip = false;

import AppTrack from '@/components/AppTrack.vue';
import AppTrackGroup from '@/components/AppTrackGroup.vue';
import TrackStatusIcon from '@/components/TrackStatusIcon.vue';
import TrackTypeIcon from '@/components/TrackTypeIcon.vue';
import TrackDownload from '@/components/TrackDownload.vue';
import InfoModal from '@/components/InfoModal.vue';
import PhotoUpload from '@/components/PhotoUpload.vue';
import ColorPopover from '@/components/ColorPopover.vue';
import ObjectsTab from '@/components/ObjectsTab.vue';
import NewPlace from '@/components/NewPlace.vue';
import MapPlace from '@/components/MapPlace.vue';
import PlannedTracks from '@/components/PlannedTracks.vue';
import TrackDetails from '@/components/TrackDetails.vue';
import OfflineCard from '@/components/OfflineCard.vue';
Vue.component('AppTrack', AppTrack);
Vue.component('AppTrackGroup', AppTrackGroup);
Vue.component('TrackStatusIcon', TrackStatusIcon);
Vue.component('TrackTypeIcon', TrackTypeIcon);
Vue.component('TrackDownload', TrackDownload);
Vue.component('InfoModal', InfoModal);
Vue.component('PhotoUpload', PhotoUpload);
Vue.component('ColorPopover', ColorPopover);
Vue.component('ObjectsTab', ObjectsTab);
Vue.component('NewPlace', NewPlace);
Vue.component('MapPlace', MapPlace);
Vue.component('PlannedTracks', PlannedTracks);
Vue.component('TrackDetails', TrackDetails);
Vue.component('OfflineCard', OfflineCard);

import {formatDate, formatDateSeconds, formatDateDay, roundTrackDistance, sumTracksDistance, sumTracksDistanceWalk, sumTracksDistanceBicycle, sumTracksDistanceMushroom, roundFileBytes, formatDateSecondsEpoch} from '@/ts/utils';
Vue.filter('formatDate', formatDate);
Vue.filter('formatDateSeconds', formatDateSeconds);
Vue.filter('formatDateDay', formatDateDay);
Vue.filter('roundTrackDistance', roundTrackDistance);
Vue.filter('roundFileBytes', roundFileBytes);
Vue.filter('sumTracksDistance', sumTracksDistance);
Vue.filter('sumTracksDistanceWalk', sumTracksDistanceWalk);
Vue.filter('sumTracksDistanceBicycle', sumTracksDistanceBicycle);
Vue.filter('sumTracksDistanceMushroom', sumTracksDistanceMushroom);
Vue.filter('formatDateSecondsEpoch', formatDateSecondsEpoch);

import { Sketch } from 'vue-color';
Vue.component('sketch-picker', Sketch);

// @ts-ignore
import i18n from '@/plugins/i18n';

// @ts-ignore
import FlagIcon from 'vue-flag-icon';
Vue.use(FlagIcon);

// @ts-ignore
import bFormSlider from 'vue-bootstrap-slider';
Vue.use(bFormSlider);
import 'bootstrap-slider/dist/css/bootstrap-slider.css';

// @ts-ignore
import vSelect from 'vue-select';
Vue.component('v-select', vSelect);
import 'vue-select/dist/vue-select.css';

// @ts-ignore
import VueSession from 'vue-session';
Vue.use(VueSession, {persist: true});

window.detailsX = 50;
window.detailsY = 50;
window.detailsLastZIndex = 1;

import localforage from 'localforage';

window.dbCount = 1;
window.dbs = [];

window.cacheDB = localforage.createInstance({name: 'leaflet_cache', version: 1.0, storeName: 'cache', driver: localforage.INDEXEDDB});

if (document.documentElement.clientWidth >= 700) {
  window.dbCount = 1;
  const db = localforage.createInstance({name: 'leaflet_offline', version: 1.0, storeName: 'tiles', driver: localforage.WEBSQL});
  window.dbs.push(db);
} else {
  window.dbCount = 50;
  for (let index = 0; index < window.dbCount; index++) {
    const db = localforage.createInstance({name: 'leaflet_offline' + index, version: 1.0, storeName: 'tiles', driver: localforage.WEBSQL});
    window.dbs.push(db);
  }
}

window.charCodeZero = '0'.charCodeAt(0);
window.charCodeNine = '9'.charCodeAt(0);

window.isDigit = function(key: string) {
  return(key >= window.charCodeZero && key <= window.charCodeNine);
};

window.getDBIndex = function(key) {
  let lastDigit: number = null;
  let preLastDigit: number = null;
  for (let index = key.length - 1; index >= 0; index--) {
    const keyCode = key.charCodeAt(index);
    if (window.isDigit(keyCode)) {
      if (lastDigit === null) {
        lastDigit = keyCode - window.charCodeZero;
      } else {
        preLastDigit = keyCode - window.charCodeZero;
        break;
      }
    }
  }
  const sum = preLastDigit * 10 + lastDigit;
  const dbIndex = sum % (window.dbCount);
  return dbIndex;
};

window.getDB = function(key: string) {
  return window.dbs[window.getDBIndex(key)];
};

window.GLOBALVUE = new Vue({
  // @ts-ignore
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
