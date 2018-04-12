import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Rx from 'rxjs'
import VueRx from 'vue-rx'


// 搞定!
Vue.use(VueRx,Rx)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
