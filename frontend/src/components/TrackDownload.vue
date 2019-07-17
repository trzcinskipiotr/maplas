<template>
  <font-awesome-icon @click="saveGPX" :style="{height: height + 'px', cursor: 'pointer'}" icon="download"/>
</template>

<script>
import {BaseBuilder, buildGPX} from 'gpx-builder'
import FileSaver from 'file-saver'
export default {
  name: 'TrackDownload',
  props: ['track', 'height'],
  methods: {
    'saveGPX': function () {
      let gpsPointList = []
      for (let point of JSON.parse(this.track.points_json)) {
        let gpsPoint = new BaseBuilder.MODELS.Point(point[0], point[1])
        gpsPointList.push(gpsPoint)
      }
      let gpxData = new BaseBuilder()
      gpxData.setSegmentPoints(gpsPointList)
      let blob = new Blob([buildGPX(gpxData.toObject())], {type: 'text/plain;charset=utf-8'})
      FileSaver.saveAs(blob, this.track.name + '.gpx')
    }
  }
}
</script>
