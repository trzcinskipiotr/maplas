<template>
<div>
  LAT1: <input type="text" v-model="lat1"><span style="margin-right: 10px"></span>LON1: <input type="text" v-model="lon1"><br>
  LAT2: <input type="text" v-model="lat2"><span style="margin-right: 10px"></span>LON2: <input type="text" v-model="lon2"><br>

  <br><br>
  <b>POINT1</b>: {{ lat1 }}, {{ lon1 }}<br><br>
  <div v-for="zoom in zooms">
    <b>Zoom {{ zoom }}</b> Z/X/Y: {{ zoom }}/{{ lon2tile(Number(lon1), Number(zoom)) }}/{{ lat2tile(Number(lat1), Number(zoom)) }}
  </div>  

  <br><br>
  <b>POINT2</b>: {{ lat2 }}, {{ lon2 }}<br><br>
  <div v-for="zoom in zooms">
    <b>Zoom {{ zoom }}</b> Z/X/Y: {{ zoom }}/{{ lon2tile(Number(lon2), Number(zoom)) }}/{{ lat2tile(Number(lat2), Number(zoom)) }}
  </div>

  <br><br>
  <b>POINT1 POINT2</b>: rectangle tile count<br><br>
  <div v-for="zoom in zooms">
    <b>Zoom {{ zoom }}</b>: X = [{{ tilecount(Number(lat1), Number(lon1), Number(lat2), Number(lon2), Number(zoom))[0] }}-{{ tilecount(Number(lat1), Number(lon1), Number(lat2), Number(lon2), Number(zoom))[1] }}], Y = [{{ tilecount(Number(lat1), Number(lon1), Number(lat2), Number(lon2), Number(zoom))[2] }}-{{ tilecount(Number(lat1), Number(lon1), Number(lat2), Number(lon2), Number(zoom))[3] }}]: <b>{{ tilecount(Number(lat1), Number(lon1), Number(lat2), Number(lon2), Number(zoom))[4] }}</b>
  </div>
  

</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Test extends Vue {

  private lat1 = 51.5;
  private lon1 = 18.5;
  private lat2 = 51.5;
  private lon2 = 18.5;
  private zooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  private lon2tile(lon, zoom) {
    return Math.floor((lon+180)/360*Math.pow(2,zoom))
  }

  private lat2tile(lat, zoom) {
    return Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))
  }

  private tilecount(lat1, lon1, lat2, lon2, zoom) {
    const y1 = this.lat2tile(lat1, zoom);
    const y2 = this.lat2tile(lat2, zoom);
    const x1 = this.lon2tile(lon1, zoom);
    const x2 = this.lon2tile(lon2, zoom);
    let ydiff = 0;
    if (y1 >= y2) {
      ydiff = y1 - y2;
    } else {
      ydiff = y2 - y1;
    }
    let xdiff = 0;
    if (x1 >= x2) {
      xdiff = x1 - x2;
    } else {
      xdiff = x2 - x1;
    }
    return [Math.min(x1, x2), Math.max(x1, x2), Math.min(y1, y2), Math.max(y1,y2), (xdiff + 1) * (ydiff + 1)];
  }



}
</script>