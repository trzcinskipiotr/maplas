import Vue from 'vue';
import Router from 'vue-router';
import Index from '@/views/Index.vue';
import IndexOff from '@/views/IndexOff.vue';
import Test from '@/views/Test.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/off.html',
      name: 'indexoff',
      component: IndexOff,
    },
    {
      path: '/test.html',
      name: 'test',
      component: Test,
    },
  ],
});
