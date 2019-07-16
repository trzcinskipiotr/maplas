import Vue from 'vue'
import TrackCheckbox from '@/components/TrackCheckbox'
import TrackTypeIcon from '@/components/TrackTypeIcon'
import {formatDate, roundTrackDistance} from '@/js/utils'

Vue.component('TrackCheckbox', TrackCheckbox)
Vue.component('TrackTypeIcon', TrackTypeIcon)

Vue.filter('formatDate', formatDate)
Vue.filter('roundTrackDistance', roundTrackDistance)
