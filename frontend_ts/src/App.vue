<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

</style>