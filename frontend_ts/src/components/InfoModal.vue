<template>
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">{{ title }}</h4>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BaseComponent from './Base.vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class TrackDownload extends BaseComponent {

  @Prop({ required: true }) private title!: string;

}

</script>