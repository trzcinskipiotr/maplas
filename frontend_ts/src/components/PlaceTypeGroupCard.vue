<template>
  <div>
    <div class="card">
      <div class="card-header py-2">
        <b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate">
        </b-form-checkbox>
        {{ $t(placeTypeGroup.name) }}
        <!--<button v-if="($store.state.user) && ($store.state.isDesktop)" class="btn btn-primary btn-sm" @click="openNewPlaceModal(true, null)">{{ $t('addPlace') }}</button>-->
        <div style="float: right;">
          <b-form-checkbox style="display: inline;" v-model="showApproved">
          </b-form-checkbox><img style="width: 16px; height: 16px" :src="icons.approved">&nbsp;&nbsp;
          <b-form-checkbox style="display: inline;" v-model="showNotApproved">
          </b-form-checkbox><img style="width: 16px; height: 16px" :src="icons.question">&nbsp;&nbsp;&nbsp;
          <img @click="togglePanel" style="height: 13px; cursor: pointer;" :src="iconsVisible ? icons.chevronUp : icons.chevronDown" />
        </div>
      </div>
      <div ref="places" class="card-body p-2">
        <div v-for="placeType of placeTypeGroup.placeGroups" :key="placeType.name">
          <div :style="{'margin-bottom': $store.state.isDesktop ? 0 : '15px'}">
            <b-form-checkbox style="display: inline;" v-model="placeType.checked" @change="onPlaceGroupsChanged($event, placeType.id)"></b-form-checkbox>
            <img style="width: 16px; height: 16px" :src="markerIcons[placeType.icon.replaceAll('-', '_')]" />
            {{ $t(placeType.name) }}
          </div>  
        </div>
      </div>
    </div>
    <br>
  </div>  
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import { EventBus } from '@/ts/EventBus';

@Component
export default class ObjectsTab extends BaseComponent {

  @Prop({ required: false }) private placeTypeGroup: any;
  @Prop({ required: false }) private refresh: number;

  private checkedAll: Boolean = false;
  private iconsVisible: boolean = true;
  private showApproved = true;
  private showNotApproved = true;

  @Watch('checkedAll')
  private onCheckedAllChanged(value: boolean, oldValue: boolean) {
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      this.placeTypeGroup.placeGroups[placeGroup].checked = this.checkedAll;
      this.showOrHidePlaces(this.placeTypeGroup.placeGroups[placeGroup].id)
    }
  }

  get allChecked() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      if (this.placeTypeGroup.placeGroups[placeGroup].checked) {
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
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      if (this.placeTypeGroup.placeGroups[placeGroup].checked) {
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

  @Watch('showApproved')
  private refreshApproved() {
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      this.showOrHidePlaces(this.placeTypeGroup.placeGroups[placeGroup].id)
    }
  }

  @Watch('showNotApproved')
  private refreshNotApproved() {
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      this.showOrHidePlaces(this.placeTypeGroup.placeGroups[placeGroup].id)
    }
  }

  private onPlaceGroupsChanged(event: boolean, id: number) {
    this.placeTypeGroup.placeGroups[id].checked = event;
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      this.showOrHidePlaces(this.placeTypeGroup.placeGroups[placeGroup].id)
    }
  }

  private showOrHidePlaces(groupId: number) {
    for (const place of this.placeTypeGroup.placeGroups[groupId].places) {
      if ((this.placeTypeGroup.placeGroups[groupId].checked) && (((place.approved) && (this.showApproved)) || ((!place.approved) && (this.showNotApproved)))) {
        place.marker.addTo(this.$store.state.map)
      } else {
        place.marker.removeFrom(this.$store.state.map)
      }
    }
  }

  @Watch('refresh')
  private showOrHideAllPlaces() {
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      this.showOrHidePlaces(this.placeTypeGroup.placeGroups[placeGroup].id);
    }
  }

  get indeterminate() {
    let oneChecked = false;
    let oneUnChecked = false;
    for (const placeGroup in this.placeTypeGroup.placeGroups) {
      if (this.placeTypeGroup.placeGroups[placeGroup].checked) {
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

  private openNewPlaceModal() {
    EventBus.$emit('NewPlaceRequested', true, null);
  }

}

</script>