import Vue from 'vue';
import App from './App.vue';
import router from './ts/router';
import store from './ts/store';

import './registerServiceWorker';

import 'leaflet.gridlayer.googlemutant';
import 'leaflet.locatecontrol';
import 'leaflet-hotline';
import 'Leaflet.MultiOptionsPolyline';
import 'leaflet/dist/leaflet.css';
import 'leaflet.motion/dist/leaflet.motion.min';
import './ts/leaflet.contextmenu';
import './ts/leaflet.contextmenu.css';

import './ts/L.CanvasLayer';

import '@fortawesome/fontawesome-free/css/all.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoePrints, faBiking, faCircle, faInfo, faSave, faDownload, faSearchLocation, faCogs, faSpinner, faChevronDown, faChevronUp, faPlay, faStopCircle, faFileUpload, faBars, faUpload, faCamera, faTrash, faUndo, faSearchPlus, faLock, faLockOpen, faMapMarker, faQuestion, faCheck, faQuestionCircle, faRulerHorizontal, faRulerVertical, faKey, faImages, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faCalendarTimes, faCalendarCheck, faWindowClose, faTimesCircle, faWindowMaximize, faCalendar } from '@fortawesome/free-regular-svg-icons';
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
library.add(faRulerHorizontal);
library.add(faRulerVertical);
library.add(faKey);
library.add(faImages);
library.add(faCalendar);
library.add(faVideo);
library.add(faInfo);
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
import MapPlace from '@/components/MapPlace.vue';
import PlannedTracks from '@/components/PlannedTracks.vue';
import TrackDetails from '@/components/TrackDetails.vue';
import OfflineCard from '@/components/OfflineCard.vue';
import AppArea from '@/components/AppArea.vue';
import Areas from '@/components/Areas.vue';
import SaveTrackModal from '@/components/SaveTrackModal.vue';
import SavePlaceModal from '@/components/SavePlaceModal.vue';
Vue.component('AppTrack', AppTrack);
Vue.component('AppTrackGroup', AppTrackGroup);
Vue.component('TrackStatusIcon', TrackStatusIcon);
Vue.component('TrackTypeIcon', TrackTypeIcon);
Vue.component('TrackDownload', TrackDownload);
Vue.component('InfoModal', InfoModal);
Vue.component('PhotoUpload', PhotoUpload);
Vue.component('ColorPopover', ColorPopover);
Vue.component('ObjectsTab', ObjectsTab);
Vue.component('MapPlace', MapPlace);
Vue.component('PlannedTracks', PlannedTracks);
Vue.component('TrackDetails', TrackDetails);
Vue.component('OfflineCard', OfflineCard);
Vue.component('AppArea', AppArea);
Vue.component('Areas', Areas);
Vue.component('SaveTrackModal', SaveTrackModal);
Vue.component('SavePlaceModal', SavePlaceModal);

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

declare global {
  interface Window {
    GLOBALVUE: Vue;
    unique: number;
  }
}

// @ts-ignore
import VueSession from 'vue-session';
Vue.use(VueSession, {persist: true});

window.detailsX = 50;
window.detailsY = 50;
window.detailsLastZIndex = 1;

window.charCodeZero = '0'.charCodeAt(0);
window.charCodeNine = '9'.charCodeAt(0);

window.isDigit = function(key: string) {
  return(key >= window.charCodeZero && key <= window.charCodeNine);
};

window.unique = 0;

window.getUnique = function() {
  window.unique = window.unique + 1;
  return window.unique;
};

window.GLOBALVUE = new Vue({
  // @ts-ignore
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
