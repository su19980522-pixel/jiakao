import { supabase } from '../supabase'
import { load, save } from './storage'

let session = null
let applying = false
let dirty = false
let timer = null

const KEYS = ['wrong_ids', 'fav_ids', 'exam_history', 'practice_pos', 'practice_data']

export function setSession(s) {
  session = s
  if (!s) {
    dirty = false
    if (timer) clearTimeout(timer)
    timer = null
  }
}

export function markDirty() {
  if (applying || !session) return
  dirty = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(pushNow, 2500)
}

async function getAuthStore() {
  const { useAuthStore } = await import('../stores/auth')
  return useAuthStore()
}

export async function pullData() {
  if (!session) return null
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error) throw error
  return (data && data.data) || null
}

export async function afterAuth() {
  try {
    const cloudData = await pullData()
    if (cloudData && Object.keys(cloudData).length > 0) {
      applyData(cloudData)
    } else {
      markDirty()
    }
  } catch (e) {
    console.warn('pull data failed:', e.message)
    markDirty()
  }
}

function applyData(data) {
  applying = true
  try {
    for (const key of KEYS) {
      if (data[key] !== undefined) save(key, data[key])
    }
    import('../stores/user').then(({ useUserStore }) => {
      const user = useUserStore()
      user.$patch({
        wrongIds: data.wrong_ids || [],
        favIds: data.fav_ids || [],
        examHistory: data.exam_history || [],
        practicePos: data.practice_pos || {}
      })
    })
  } finally {
    applying = false
  }
}

async function pushNow() {
  if (!session || !dirty) return
  dirty = false
  const state = {}
  for (const k of KEYS) {
    state[k] = load(k, k === 'practice_pos' || k === 'practice_data' ? {} : [])
  }
  const auth = await getAuthStore()
  auth.syncing = true
  try {
    const { error } = await supabase.from('user_data').upsert(
      {
        user_id: session.user.id,
        data: state,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    )
    if (!error) {
      auth.syncedAt = Date.now()
      auth.syncError = ''
    } else {
      dirty = true
      auth.syncError = '同步失败'
    }
  } catch {
    dirty = true
    auth.syncError = '网络异常'
  } finally {
    auth.syncing = false
  }
}
