<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  auth.init()
})

async function doLogout() {
  if (confirm('确定退出登录吗？本机数据会保留。')) {
    await auth.logout()
  }
}
</script>

<template>
  <header class="topbar">
    <button v-if="route.name !== 'home'" class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
    <span v-else class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </svg>
    </span>
    <h1 class="title">驾考刷题</h1>
    <div class="auth-area">
      <template v-if="auth.isLoggedIn">
        <span class="auth-email" :title="auth.email">{{ auth.email.split('@')[0] }}</span>
        <span class="sync-dot" :class="auth.syncState" :title="auth.syncError || '云同步状态'"></span>
        <button class="auth-btn" @click="doLogout">退出</button>
      </template>
      <button v-else class="auth-btn login-btn" @click="router.push('/login')">登录</button>
    </div>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 22px;
  background: var(--grad-header);
  color: #fff;
  box-shadow: 0 3px 14px rgba(47, 92, 240, 0.28);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.back-btn {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.26);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.logo {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo svg {
  width: 22px;
  height: 22px;
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 38px;
  justify-content: flex-end;
}

.auth-email {
  font-size: 13px;
  opacity: 0.9;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
}

.sync-dot.synced {
  background: #4ade80;
}

.sync-dot.syncing {
  background: #fbbf24;
  animation: pulse 1s infinite;
}

.sync-dot.local {
  background: #fbbf24;
}

@keyframes pulse {
  50% { opacity: 0.35; }
}

.auth-btn {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s;
  white-space: nowrap;
}

.auth-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}
</style>
