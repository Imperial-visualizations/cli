import Index from './App.vue'
import Vue from 'vue'
import '@impvis/components/dist/impvis-components.css'
new Vue({
    render: h => h(Index)
}).$mount('#app');