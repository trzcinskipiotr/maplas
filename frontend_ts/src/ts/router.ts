import Vue from 'vue';
import Router from 'vue-router';
import Index from '@/views/Index.vue';
import Test from '@/views/Test.vue';
import Cache from '@/views/Cache.vue';

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
      path: '/test.html',
      name: 'test',
      component: Test,
    },
    {
      path: '/cache.html',
      name: 'cache',
      component: Cache,
    },
  ],
});
