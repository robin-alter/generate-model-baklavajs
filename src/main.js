import Vue from 'vue'
import App from './App.vue'

import { BaklavaVuePlugin } from '@baklavajs/plugin-renderer-vue'
import "./styles.scss"

Vue.use(BaklavaVuePlugin)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
