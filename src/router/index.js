import Vue from 'vue'
import Router from 'vue-router'
import AppBase from '@/components/AppBase'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'AppBase',
      component: AppBase
    }
  ]
})
