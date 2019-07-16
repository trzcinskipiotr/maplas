<template>
  <font-awesome-icon :style="{height: height + 'px'}" v-if="track.type === TrackType.bicycle" icon="biking"/>
  <font-awesome-icon :style="{height: height + 'px'}" v-else-if="track.type === TrackType.walk" icon="shoe-prints"/>
</template>

<script>
import {TrackType} from '@/js/const'
export default {
  name: 'TrackTypeIcon',
  props: ['track', 'height'],
  data: function () {
    return {
      TrackType: TrackType
    }
  }
}
</script>
