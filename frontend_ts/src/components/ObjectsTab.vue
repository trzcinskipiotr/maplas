<template>
  <div>
  <div class="card">
    <div class="card-header py-2">
      <b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate">
      </b-form-checkbox>
      {{ $t('places') }}
      <NewPlace></NewPlace>
      <div style="float: right;">
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div>
    <div ref="places" class="card-body p-2">
      <div v-for="placeGroup of placeGroups" :key="placeGroup.name">
        <b-form-checkbox style="display: inline;" v-model="placeGroup.checked" @change="onPlaceGroupsChanged($event, placeGroup.id)">
        </b-form-checkbox>
        {{ $t(placeGroup.name) }}
      </div>
    </div>
    <MapPlace v-for="place of $store.state.places" :key="place.id" :place="place"></MapPlace>
  </div>
  <br>
  <PlannedTracks></PlannedTracks>
  <button class="btn btn-primary btn-sm" @click="exportOffline">{{ $t('exportOffline') }}</button>
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import PlaceType from '../ts/PlaceType';
import $ from 'jquery';
import FileSaver from 'file-saver';
import localforage from 'localforage';
import { formatDateSeconds } from '@/ts/utils';

@Component
export default class ObjectsTab extends BaseComponent {

  private checkedAll: Boolean = false;
  private iconsVisible: boolean = true;
  private placeGroups: any = [];

  @Watch('$store.state.places')
  private onStorePlacesChanged(value: string, oldValue: string) {
    let tmpplaceGroups: any = {}
    for (const place of this.$store.state.places) {
      if (!(place.type.id in tmpplaceGroups)) {
        tmpplaceGroups[place.type.id] = {id: place.type.id, checked: false, name: place.type.name, places: []} 
      }
      tmpplaceGroups[place.type.id].places.push(place)
    }
    if (this.checkedAll) {
      for (let tmpplaceGroup in tmpplaceGroups) {
        tmpplaceGroups[tmpplaceGroup].checked = true;
      }
    } else {
      for (let tmpplaceGroup in tmpplaceGroups) {
        if (tmpplaceGroups[tmpplaceGroup].id in this.placeGroups) {
          tmpplaceGroups[tmpplaceGroup].checked = this.placeGroups[tmpplaceGroup].checked;
        }
      }
    }
    this.placeGroups = tmpplaceGroups;
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  @Watch('checkedAll')
  private onCheckedAllChanged(value: boolean, oldValue: boolean) {
    for (const placeGroup in this.placeGroups) {
      this.placeGroups[placeGroup].checked = this.checkedAll;
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  @Watch('$store.state.zoomLevel')
  private onStoreZoomChanged(value: boolean, oldValue: boolean) {
    for (const place of this.$store.state.places) {
      place.changeMarkerSize(this.$store.state.zoomLevel);
    }
  }

  get allChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    if (oneChecked && !oneUnChecked) {
      return true;
    }
  }

  get allUnChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    if (!oneChecked && oneUnChecked) {
      return true;
    }
  }

  @Watch('allChecked')
  private onallCheckedChanged(value: boolean, oldValue: boolean) {
    if (this.allChecked) {
      this.checkedAll = true;
    }
  }

  @Watch('allUnChecked')
  private onallUnCheckedChanged(value: boolean, oldValue: boolean) {
    if (this.allUnChecked) {
      this.checkedAll = false;
    }
  }

  private onPlaceGroupsChanged(event: boolean, id: number) {
    this.placeGroups[id].checked = event;
    for (const placeGroup in this.placeGroups) {
      this.showOrHidePlaces(this.placeGroups[placeGroup].id)
    }
  }

  private showOrHidePlaces(groupId: number) {
    for (const place of this.placeGroups[groupId].places) {
      if (this.placeGroups[groupId].checked) {
        place.marker.addTo(this.$store.state.map)
      } else {
        place.marker.removeFrom(this.$store.state.map)
      }
    }
  }

  get indeterminate() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeGroups) {
      if (this.placeGroups[placeGroup].checked) {
        oneChecked = true;
      } else {
        oneUnChecked = true;
      }
    }
    return oneChecked && oneUnChecked;
  }

  private togglePanel() {
    $(this.$refs.places).slideToggle('slow');
    this.iconsVisible = !this.iconsVisible;
  }

  private saveFile(string: string) {
    const blob = new Blob([string], {type: 'text/plain;charset=utf-8'});
    const date = formatDateSeconds(new Date());
    FileSaver.saveAs(blob, 'offline_maps_' + date + '.txt');
  }

  private exportOffline() {
    localforage.getItems(null).then(results => {
      const obj: any = {}
      let done = 0;
      let total = 0;
      for (const result in results) {
        total = total + 1;
      }
      for (const result in results) {
        localforage.getItem(result).then(data => {
          var reader = new FileReader();
          reader.onload = () => {
            obj[result] = (reader.result as string).replace(/^data:.+;base64,/, '');
            done = done + 1;
            if (done === total) {
              this.saveFile(JSON.stringify(obj));
            }
          }
          reader.readAsDataURL(data);
        })
      }
    });
  }

}

</script>