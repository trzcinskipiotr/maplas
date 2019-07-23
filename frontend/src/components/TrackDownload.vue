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
      for (let point of JSON.parse(this.track.points_json_optimized)) {
        let gpsPoint = new BaseBuilder.MODELS.Point(point[0], point[1])
        gpsPointList.push(gpsPoint)
      }
      let gpxData = new BaseBuilder()
      gpxData.setMetadata(new BaseBuilder.MODELS.Metadata({name: this.track.name}))
      gpxData.setTracks([new BaseBuilder.MODELS.Track([new BaseBuilder.MODELS.Segment(gpsPointList)], {'name': this.track.name})])
      let blob = new Blob([buildGPX(gpxData.toObject())], {type: 'text/plain;charset=utf-8'})
      FileSaver.saveAs(blob, this.track.name + '.gpx')
    }
  }
}
</script>
