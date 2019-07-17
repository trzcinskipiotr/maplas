<template>
  <font-awesome-icon :style="{height: height + 'px'}" v-if="isDoneTrack(track)" :icon="['far', 'calendar-check']"/>
  <font-awesome-icon :style="{height: height + 'px'}" v-else-if="isPlannedTrack(track)" :icon="['far', 'calendar-times']"/>
</template>

<script>
export default {
  name: 'TrackStatusIcon',
  props: ['track', 'height']
}
</script>
