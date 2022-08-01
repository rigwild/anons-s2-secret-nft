import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import ElementSolo from './ElementSolo.vue'
import { loadElementsData } from './utils'

loadElementsData().then(() => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: Home,
        props: route => ({ sortBy: route.query.sortBy || 'id', filterTrait: route.query.filterTrait || '' })
      },
      { path: '/element/:elementId', component: ElementSolo, props: true }
    ]
  })

  createApp(App).use(router).mount('#app')
})
