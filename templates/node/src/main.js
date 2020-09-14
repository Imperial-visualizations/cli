import Vue from 'vue'
import App from './App.vue'
import ImpVis from "@impvis/components"
import "@impvis/components/dist/impvis-components.css"
// TODO: Add in automated plugin uses for three + katex
{{#if katex}}
import ImpVisKatex from "@impvis/components-katex"
{{/if}}

{{#if three}}
import ImpVisThree from "@impvis/components-three"
{{/if}}

Vue.config.productionTip = false
Vue.use(ImpVis);
{{#if katex}}
Vue.use(ImpVisKatex)
{{/if}}

{{#if three}}
Vue.use(ImpVisThree)
{{/if}}

new Vue({
  render: h => h(App),
}).$mount('#app')
