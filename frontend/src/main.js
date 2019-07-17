// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// eslint-disable-next-line
import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant'
import 'leaflet.locatecontrol'
import loadgoogle from 'load-google-maps-api'
import Vue from 'vue'
import App from '@/App'
import router from '@/js/router'
import BootstrapVue from 'bootstrap-vue'
import '@/js/vue'
import '@/js/mixin'
import store from '@/js/store'

import Verte from 'verte'
import 'verte/dist/verte.css'
import '@/css/style.css'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'leaflet/dist/leaflet.css'
import '@fortawesome/fontawesome-free/css/all.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faShoePrints, faBiking, faCircle, faSave, faDownload } from '@fortawesome/free-solid-svg-icons'
import { faCalendarTimes, faCalendarCheck } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
loadgoogle({key: 'GOOGLE_API_KEY'})

library.add(faShoePrints)
library.add(faBiking)
library.add(faCircle)
library.add(faSave)
library.add(faDownload)
library.add(faCalendarCheck)
library.add(faCalendarTimes)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('verte', Verte)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
