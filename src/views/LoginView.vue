<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (!email.value.trim()) {
    error.value = '请输入邮箱'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  if (mode.value === 'register' && password.value !== confirm.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    if (mode.value === 'register') {
      await auth.register(email.value.trim(), password.value)
    } else {
      await auth.login(email.value.trim(), password.value)
    }
    router.replace('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function switchMode(m) {
  mode.value = m
  error.value = ''
  confirm.value = ''
}
</script>

<template>
  <div class="page login-page">
    <div class="login-card card">
      <div class="login-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.6" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
        </svg>
      </div>
      <h2 class="login-title">驾考刷题 · 账号</h2>
      <p class="login-sub">登录后错题、收藏、进度自动同步到云端，换电脑继续刷</p>

      <div class="seg login-seg">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <div class="field">
        <label>邮箱</label>
        <input v-model="email" type="email" placeholder="you@example.com" @keyup.enter="submit" />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="至少 6 位" @keyup.enter="submit" />
      </div>
      <div v-if="mode === 'register'" class="field">
        <label>确认密码</label>
        <input v-model="confirm" type="password" placeholder="再次输入密码" @keyup.enter="submit" />
      </div>

      <div v-if="error" class="err">{{ error }}</div>

      <button class="btn btn-primary submit-btn" :disabled="loading" @click="submit">
        {{ loading ? '请稍候…' : mode === 'login' ? '登录' : '注册并登录' }}
      </button>

      <p class="tip">所有数据（错题、收藏、进度、考试记录）保存在云端数据库，换设备登录同一账号即可继续。</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding-top: 5vh;
}

.login-card {
  width: 420px;
  padding: 30px 32px;
  text-align: center;
}

.login-logo {
  width: 58px;
  height: 58px;
  margin: 0 auto 12px;
  border-radius: 16px;
  background: var(--grad-header);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo svg {
  width: 30px;
  height: 30px;
}

.login-title {
  font-size: 19px;
  font-weight: 800;
}

.login-sub {
  font-size: 13px;
  color: var(--text-2);
  margin: 6px 0 18px;
}

.login-seg {
  margin-bottom: 18px;
}

.field {
  text-align: left;
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 6px;
}

.field input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--primary);
}

.err {
  text-align: left;
  font-size: 13px;
  color: var(--danger-strong);
  background: var(--danger-soft);
  border-radius: 8px;
  padding: 9px 12px;
  margin-bottom: 14px;
}

.submit-btn {
  width: 100%;
  padding: 13px;
  font-size: 15.5px;
}

.tip {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-3);
}
</style>
