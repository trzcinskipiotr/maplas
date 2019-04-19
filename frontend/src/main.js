// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// eslint-disable-next-line
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.gridlayer.googlemutant'
import loadgoogle from 'load-google-maps-api'
import Vue from 'vue'
import App from '@/App'
import router from '@/js/router'

Vue.config.productionTip = false
loadgoogle()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
