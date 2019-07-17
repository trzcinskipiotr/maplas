<template>
  <font-awesome-icon :style="{height: height + 'px'}" v-if="isBicycleTrack(track)" icon="biking"/>
  <font-awesome-icon :style="{height: height + 'px'}" v-else-if="isWalkTrack(track)" icon="shoe-prints"/>
</template>

<script>
export default {
  name: 'TrackTypeIcon',
  props: ['track', 'height']
}
</script>
