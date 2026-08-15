import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/practice/:subject/:mode/:chapter?', name: 'practice', component: () => import('./views/PracticeView.vue') },
  { path: '/exam/:subject', name: 'exam', component: () => import('./views/ExamView.vue') },
  { path: '/import', name: 'import', component: () => import('./views/ImportView.vue') }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
