import Vue from 'vue'
import TrackCheckbox from '@/components/TrackCheckbox'
import TrackTypeIcon from '@/components/TrackTypeIcon'
import TrackStatusIcon from '@/components/TrackStatusIcon'
import TrackDownload from '@/components/TrackDownload'
import {formatDate, roundTrackDistance} from '@/js/utils'

Vue.component('TrackCheckbox', TrackCheckbox)
Vue.component('TrackTypeIcon', TrackTypeIcon)
Vue.component('TrackStatusIcon', TrackStatusIcon)
Vue.component('TrackDownload', TrackDownload)

Vue.filter('formatDate', formatDate)
Vue.filter('roundTrackDistance', roundTrackDistance)
