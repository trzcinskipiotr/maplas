import Vue from 'vue';
import App from './App.vue';
import router from './ts/router';
import store from './ts/store';
import './registerServiceWorker';

import 'leaflet.gridlayer.googlemutant';
import 'leaflet.locatecontrol';
import 'leaflet/dist/leaflet.css';

import '@fortawesome/fontawesome-free/css/all.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoePrints, faBiking, faCircle, faSave, faDownload, faSearchLocation, faCogs, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faCalendarTimes, faCalendarCheck, faWindowClose, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
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
import TrackStatusIcon from '@/components/TrackStatusIcon.vue';
import TrackTypeIcon from '@/components/TrackTypeIcon.vue';
import TrackDownload from '@/components/TrackDownload.vue';
Vue.component('AppTrack', AppTrack);
Vue.component('TrackStatusIcon', TrackStatusIcon);
Vue.component('TrackTypeIcon', TrackTypeIcon);
Vue.component('TrackDownload', TrackDownload);

import {formatDate, roundTrackDistance, sumTracksDistance} from '@/ts/utils';
Vue.filter('formatDate', formatDate);
Vue.filter('roundTrackDistance', roundTrackDistance);
Vue.filter('sumTracksDistance', sumTracksDistance);

// @ts-ignore
import Verte from 'verte';
import 'verte/dist/verte.css';
Vue.component('verte', Verte);


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
