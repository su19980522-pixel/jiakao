import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import * as cloudSync from '../utils/cloudSync'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    syncing: false,
    syncedAt: 0,
    syncError: ''
  }),
  getters: {
    isLoggedIn: (s) => !!s.session,
    email() {
      return this.session?.user?.email || ''
    },
    syncState() {
      if (!this.isLoggedIn) return 'guest'
      if (this.syncing) return 'syncing'
      if (this.syncedAt) return 'synced'
      return 'local'
    }
  },
  actions: {
    async init() {
      supabase.auth.onAuthStateChange((event, s) => {
        this.session = s
        cloudSync.setSession(s)
        if (event === 'SIGNED_IN') {
          cloudSync.afterAuth()
        }
        if (event === 'SIGNED_OUT') {
          this.syncedAt = 0
          this.syncing = false
        }
      })
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      if (data.session) {
        cloudSync.setSession(data.session)
        await cloudSync.afterAuth()
      }
    },
    async register(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        throw new Error(translateError(error.message))
      }
      if (!data.session) {
        throw new Error('注册成功！请查收验证邮件并点击确认链接，然后回到这里登录。')
      }
      this.session = data.session
      cloudSync.setSession(data.session)
      await cloudSync.afterAuth()
    },
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw new Error(translateError(error.message))
      }
      this.session = data.session
      cloudSync.setSession(data.session)
      await cloudSync.afterAuth()
    },
    async logout() {
      await supabase.auth.signOut()
      this.session = null
      cloudSync.setSession(null)
    }
  }
})

function translateError(msg) {
  const m = String(msg || '')
  if (/already registered/i.test(m)) return '该邮箱已注册，请直接登录'
  if (/invalid login credentials/i.test(m)) return '邮箱或密码错误'
  if (/password should be at least/i.test(m)) return '密码至少 6 位'
  if (/email not confirmed/i.test(m)) return '邮箱未确认，请先点击邮件里的确认链接'
  if (/rate limit/i.test(m)) return '操作太频繁，请稍后再试'
  return m
}
