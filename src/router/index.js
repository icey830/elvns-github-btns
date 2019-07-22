import Vue from 'vue'
import Router from 'vue-router'
import Mybtns from '@/components/Mybtns'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Mybtns',
      component: Mybtns
    }
  ]
})
