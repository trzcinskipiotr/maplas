<template>
<div>
  LAT: <input type="text" v-model="lat"><br>
  LON: <input type="text" v-model="lon"><br><br>
  ZOOM: <input type="text" v-model="zoom"><br><br>

  Z/X/Y: {{ zoom }}/{{ lon2tile(Number(lon), Number(zoom)) }}/{{ lat2tile(Number(lat), Number(zoom)) }}

</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Test extends Vue {

  private lat = 51.5;
  private lon = 18.5;
  private zoom = 10;

  private lon2tile(lon, zoom) {
    return Math.floor((lon+180)/360*Math.pow(2,zoom))
  }

  private lat2tile(lat, zoom) {
    return Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))
  }



}
</script>