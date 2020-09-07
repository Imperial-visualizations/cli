import Vue from 'vue';
import ImpVis from '@impvis/components';
import '@impvis/components/dist/impvis-components.css';
import {{squash pageName}} from './{{pageName}}.vue';


Vue.use(ImpVis);


new Vue({
    render: h => h({{squash pageName}}),
  }).$mount('#app')
  