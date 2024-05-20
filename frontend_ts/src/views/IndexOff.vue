<template>
  <div>
    <div id="butt" style="height: 25vh"></div>
    Progress: {{ progress }} / {{ total }}
    <div id="map" style="height: 75vh"></div>
  </div>  
</template>

/* tslint:disable:no-string-literal */
<script lang="ts">
import BaseComponent from "@/components/Base.vue";
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { TileLayerOffline, savetiles } from '@/ts/leafletoffline';
import { Control, Map } from 'leaflet';

@Component
export default class Index extends BaseComponent {

    private urlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    private progress = 0;
    private total = 0;

    private mounted() {
        const leafletMap = new Map('map');
        const baseLayer = new TileLayerOffline(this.urlTemplate, {
            attribution: 'Map data {attribution.OpenStreetMap}',
            minZoom: 8,
            maxZoom: 18,
        }).addTo(leafletMap);
        leafletMap.setView({lat: 52.809699, lng: 16.1748232}, 18);

        const saveControl = savetiles(baseLayer, {
            zoomlevels: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            alwaysDownload: false,
            parallel: 5,
            confirm(layer, successCallback) {
                // eslint-disable-next-line no-alert
                if (window.confirm(`Save ${layer._tilesforSave.length}`)) {
                successCallback();
                }
            },
            confirmRemoval(layer, successCallback) {
                // eslint-disable-next-line no-alert
                if (window.confirm('Remove all the tiles?')) {
                successCallback();
                }
            },
            saveText: '<i class="fa fa-download" title="Save tiles"></i>',
            rmText: '<i class="fa fa-trash" title="Remove tiles"></i>',
        });
        saveControl.addTo(leafletMap);
        baseLayer.on('savestart', (e) => {
            this.progress = 0;
            this.total = e._tilesforSave.length;
            });
        baseLayer.on('loadtileend', () => {
            this.progress += 1;
        });
    }

}
</script>

<style>

</style>
