import Vue from 'vue'
import App from './App.vue'
import ImpVis from "@impvis/components";
import "@impvis/components/dist/impvis-components.css";

Vue.config.productionTip = false
Vue.use(ImpVis);

new Vue({
  render: h => h(App),
}).$mount('#app')
