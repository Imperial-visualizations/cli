import Vue from 'vue'
import ImpVis from '@impvis/components'
import '@impvis/components/dist/impvis-components.css'
import {{squash pageName}} from './{{pageName}}.vue'
{{#if katex}}
import ImpVisKatex from "@impvis/components-katex"
import "@impvis/components-katex/dist/impvis-components-katex.css"
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
    render: h => h({{squash pageName}}),
  }).$mount('#app')
  