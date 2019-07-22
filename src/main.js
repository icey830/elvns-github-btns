import Vue from 'vue'
import App from './App.vue'

window.onbeforeunload = function () {}

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
