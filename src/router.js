import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PracticeView from './views/PracticeView.vue'
import ExamView from './views/ExamView.vue'
import ImportView from './views/ImportView.vue'
import LoginView from './views/LoginView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/practice/:subject/:mode/:chapter?', name: 'practice', component: PracticeView },
  { path: '/exam/:subject', name: 'exam', component: ExamView },
  { path: '/import', name: 'import', component: ImportView },
  { path: '/login', name: 'login', component: LoginView }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
