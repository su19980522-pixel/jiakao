<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
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
    <span class="spacer" />
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

.spacer {
  width: 38px;
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
</style>
