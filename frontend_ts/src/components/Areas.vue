<template>
  <div class="card">
    <div class="card-header py-2">
      <!--<b-form-checkbox style="display: inline;" v-model="checkedAll" :indeterminate="indeterminate">
      </b-form-checkbox>-->
      {{ $t('areas') }}
      <div style="float: right;">
        <button v-if="($store.state.user) && ($store.state.isDesktop)" class="btn btn-primary btn-sm" @click="newArea">{{ $t('newArea') }}</button>&nbsp;
        <font-awesome-icon @click="togglePanel" style="cursor: pointer;" :icon="iconsVisible ? 'chevron-up' : 'chevron-down'"/>
      </div>
    </div>
    <div ref="areas" class="card-body p-2">
      <div v-for="area of $store.state.areas" :key="area.unique">
        <AppArea :area="area"></AppArea>
      </div>
    </div>
  </div>    
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import Area from '@/ts/Area';

@Component
export default class Areas extends BaseComponent {

  private checkedAll: Boolean = false;
  private iconsVisible: boolean = true;

  private togglePanel() {
    $(this.$refs.areas).slideToggle('slow');
    this.iconsVisible = !this.iconsVisible;
  }

  private newArea() {
    const newArea: Area = new Area(Date.now(), 'Nowy obszar', '', '[]', '#FF0000', false);
    this.$store.state.areas.push(newArea);
    this.$store.commit('setEditedArea', newArea);
  }

}

</script>