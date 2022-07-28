import Vue from 'vue'
import App from './App.vue'

import { BaklavaVuePlugin } from '@baklavajs/plugin-renderer-vue'
import vuetify from './plugins/vuetify'

Vue.use(BaklavaVuePlugin)

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
