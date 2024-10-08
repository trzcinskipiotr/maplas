<template>
  <div :style="{'margin-bottom': $store.state.isDesktop ? 0 : '15px'}">
    <div v-on:mouseover="highlightArea()" v-on:mouseleave="unhighlightArea()">
      <div style="display: inline" class="custom-control custom-checkbox" :id="'trackcheckbox' + area.id">
        <input type="checkbox" class="custom-control-input" :id="'acheckbox' + area.id" v-model="checked" />
        <label style="margin-right: 2px;" class="custom-control-label" :for="'acheckbox' + area.id">{{ area.name }}</label>
      </div>
      <span v-if="area === $store.state.editedArea">
        <img v-if="$store.state.isDesktop" @click="setEdited(null)" style="height: 24px; cursor: pointer" :src="icons.unlock" />
      </span>
      <span v-else>
        <img v-if="$store.state.isDesktop" @click="setEdited(area)" style="height: 24px; cursor: pointer" :src="icons.lock" />
      </span>
      &nbsp;
      <template v-if="areaSaving">
        <img style='height: 16px; animation: rotation 2s infinite linear;' :src="icons.spinnerBlack" />&nbsp;
      </template>
        <span v-if="($store.state.user) && ($store.state.isDesktop)" v-b-tooltip.hover :title="$t('saveArea')">
          <img @click="saveArea" style="height: 24px; cursor: pointer;" :src="icons.save" />
        </span>
      <br>
    </div>
  </div>  
</template>

<script lang="ts">
import L, { LatLng } from 'leaflet';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Area from '@/ts/Area';
import BaseComponent from './Base.vue';
import { getCenter } from 'geolib';
import axios from 'axios';
import { AlertStatus } from '@/ts/types';
import * as icons from '@/ts/icons';

@Component
export default class AppArea extends BaseComponent {

  public checked: boolean;
  public polygon: L.Polygon;
  public middleMarkers: any;
  public plannedMarkers: any;

  public areaSaving = false;


  @Prop({ required: true }) private area: Area;

  public constructor() {
    super();
    this.checked = false;
    this.createMapObjects();
  }

  public saveArea() {
    this.areaSaving = true;
    const obj = this.area.convertToApiSave();
    if (! this.area.onServer) {
      const name = prompt(this.$t('pleaseAreaName'));
      if (name) {
        obj.name = name;
        axios.post(this.$store.state.appHost + `api/areas/?full=true`, obj)
        .then((response: object) => {
          this.area.id = response.data.id;
          this.area.onServer = true;
          this.area.name = name;
          this.createAlert(AlertStatus.success, this.$t('areaSaved').toString(), 2000);
        }).catch((response: object) => {
          this.createAlert(AlertStatus.danger, this.$t('areaSavedError').toString(), 2000);
        }).finally(() => {
         this.areaSaving = false;
        });
      } else {
        this.areaSaving = false;
      } 
    } else {
      axios.put(this.$store.state.appHost + `api/areas/${this.area.id}/?full=true`, obj)
      .then((response: object) => {
        this.createAlert(AlertStatus.success, this.$t('areaSaved').toString(), 2000);
      }).catch((response: object) => {
        this.createAlert(AlertStatus.danger, this.$t('areaSavedError').toString(), 2000);
      }).finally(() => {
        this.areaSaving = false;
      });
    }
  }

  public mounted() {
    this.showOrHideArea();
  }


  private highlightArea() {

  }

  private unhighlightArea() {
    
  }

  private removeAllFromMap() {
    this.polygon.removeFrom(this.$store.state.map);
    for (const marker of this.plannedMarkers) {
      marker.removeFrom(this.$store.state.map);
    }
    for (const marker of this.middleMarkers) {
      marker.removeFrom(this.$store.state.map);
    }
  }

  private showOrHideArea() {
    if (this.checked) { 
      this.polygon.addTo(this.$store.state.map);
      if (this.$store.state.editedArea === this.area) {
        for (const marker of this.plannedMarkers) {
          marker.addTo(this.$store.state.map);
        }
        for (const marker of this.middleMarkers) {
          marker.addTo(this.$store.state.map);
        }
      }
    } else {
      this.removeAllFromMap();
    }
  }

  @Watch('checked')
  private onCheckedChanged(value: boolean, oldValue: boolean) {
    this.showOrHideArea();
  }

  private dragEnd(event: L.LeafletMouseEvent, point: L.LatLng) {
    this.area.movePoint(point, event.target.getLatLng())
  }

  public click(event: L.LeafletMouseEvent, point: L.LatLng) {
    if (event.originalEvent.ctrlKey) {
      this.area.removePoint(point);
    }
  }

  private clickNew(event: L.LeafletMouseEvent, point: L.LatLng) {
    this.area.addPointMiddle(point, event.latlng);
    L.DomEvent.stopPropagation(event);
    return false;
  }

  private createMapObjects() {
    this.polygon = new L.Polygon(this.area.points);
    this.middleMarkers = [];
    this.plannedMarkers = [];
    let lastPoint = null;
    const markerIcon = L.icon({
      iconUrl: icons.redCircle,
      iconSize: [13, 13],
      iconAnchor: [6, 6],
    });
    const middleMarkerIcon = L.icon({
      iconUrl: icons.blueCircle,
      iconSize: [9, 9],
      iconAnchor: [4, 4],
    });
    for (const point of this.area.points) {
      const marker = new L.Marker(point, {draggable: true, icon: markerIcon, zIndexOffset: 100000});
      marker.on('dragend', (e: L.LeafletMouseEvent) => {this.dragEnd(e, point)});
      marker.on('click', (e: L.LeafletMouseEvent) => {this.click(e, point)});
      if (lastPoint) {
        const middle = getCenter([{latitude: point.lat, longitude: point.lng}, {latitude: lastPoint.lat, longitude: lastPoint.lng}]);
        const middleMarker = new L.Marker([middle.latitude, middle.longitude], {icon: middleMarkerIcon, zIndexOffset: 50000});
        middleMarker.on('click', (e: L.LeafletMouseEvent) => {this.clickNew(e, point)});
        this.middleMarkers.push(middleMarker);
        lastPoint = point;
      } else {
        lastPoint = point;
      }
      this.plannedMarkers.push(marker);
    }
  }

  @Watch('area.points') 
  private onAreaPointsChanged() {
    this.removeAllFromMap();
    this.createMapObjects();
    this.showOrHideArea();
  }

  private setEdited(area: Area) {
    this.$store.commit('setEditedArea', area);
  }

  @Watch('$store.state.editedArea')
  private onEditedAreaChanged() {
    this.removeAllFromMap();
    this.createMapObjects();
    this.showOrHideArea();
  }

}
</script>