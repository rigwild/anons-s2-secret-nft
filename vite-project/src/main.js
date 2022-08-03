import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import { loadElementsData } from './utils'

loadElementsData().then(() => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: Home
      },
      { path: '/element/:elementId', redirect: to => ({ path: '/', query: { id: to.params.elementId } }) }
    ]
  })

  createApp(App).use(router).mount('#app')
})
