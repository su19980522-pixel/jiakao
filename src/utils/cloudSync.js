import { supabase } from '../supabase'
import { load, save } from './storage'

let session = null

const KEYS = ['wrong_ids', 'fav_ids', 'exam_history', 'practice_pos', 'practice_data']

export function setSession(s) {
  session = s
}

function uid() {
  return session?.user?.id
}

async function getAuthStore() {
  const { useAuthStore } = await import('../stores/auth')
  return useAuthStore()
}

async function markSynced() {
  const auth = await getAuthStore()
  auth.syncedAt = Date.now()
  auth.syncError = ''
}

async function markError() {
  const auth = await getAuthStore()
  auth.syncError = '同步失败'
}

async function resolveSubject(qid) {
  try {
    const { useBankStore } = await import('../stores/bank')
    const bank = useBankStore()
    const q = bank.allQuestions.find((x) => x.id === qid)
    return q ? q.subject : 1
  } catch {
    return 1
  }
}

// ============ 推送（按表精细化操作） ============

export async function syncWrong(id, add) {
  if (!session) return
  try {
    if (add) {
      await supabase.from('wrong_questions').upsert(
        {
          user_id: uid(),
          question_id: String(id),
          subject: await resolveSubject(id),
          wrong_count: 1,
          last_wrong_at: new Date().toISOString()
        },
        { onConflict: 'user_id,question_id', ignoreDuplicates: true }
      )
    } else {
      await supabase.from('wrong_questions').delete().eq('user_id', uid()).eq('question_id', String(id))
    }
    markSynced()
  } catch {
    markError()
  }
}

export async function syncFav(id, add) {
  if (!session) return
  try {
    if (add) {
      await supabase.from('favorites').upsert(
        {
          user_id: uid(),
          question_id: String(id),
          subject: await resolveSubject(id),
          created_at: new Date().toISOString()
        },
        { onConflict: 'user_id,question_id', ignoreDuplicates: true }
      )
    } else {
      await supabase.from('favorites').delete().eq('user_id', uid()).eq('question_id', String(id))
    }
    markSynced()
  } catch {
    markError()
  }
}

export async function syncExamRecord(rec) {
  if (!session) return
  try {
    await supabase.from('exam_records').insert({
      user_id: uid(),
      subject: rec.subject,
      score: rec.score,
      passed: rec.passed,
      correct: rec.correct,
      total: rec.total,
      used_sec: rec.usedSec,
      created_at: new Date(rec.time).toISOString()
    })
    markSynced()
  } catch {
    markError()
  }
}

export async function clearExamRecords() {
  if (!session) return
  try {
    await supabase.from('exam_records').delete().eq('user_id', uid())
    markSynced()
  } catch {
    markError()
  }
}

export async function syncPracticePos(key, idx) {
  if (!session) return
  try {
    await supabase.from('practice_positions').upsert(
      { user_id: uid(), pos_key: key, idx, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,pos_key' }
    )
    markSynced()
  } catch {
    markError()
  }
}

export async function syncPracticeState(posKey, qid, ok, sel) {
  if (!session) return
  try {
    await supabase.from('practice_state').upsert(
      {
        user_id: uid(),
        pos_key: posKey,
        question_id: String(qid),
        ok,
        sel: sel && sel.length ? sel.join(',') : null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,pos_key,question_id' }
    )
    markSynced()
  } catch {
    markError()
  }
}

export async function clearPracticeState(posKey) {
  if (!session) return
  try {
    await supabase.from('practice_state').delete().eq('user_id', uid()).eq('pos_key', posKey)
    markSynced()
  } catch {
    markError()
  }
}

// ============ 拉取（登录/启动时全量拉取） ============

const toId = (s) => (/^\d+$/.test(String(s)) ? Number(s) : s)

export async function afterAuth() {
  if (!session) return
  try {
    const [w, f, e, p, st] = await Promise.all([
      supabase.from('wrong_questions').select('question_id').eq('user_id', uid()),
      supabase.from('favorites').select('question_id').eq('user_id', uid()),
      supabase.from('exam_records').select('*').eq('user_id', uid()).order('created_at', { ascending: false }).limit(50),
      supabase.from('practice_positions').select('pos_key,idx').eq('user_id', uid()),
      supabase.from('practice_state').select('pos_key,question_id,ok,sel').eq('user_id', uid())
    ])
    if (w.error || f.error || e.error || p.error || st.error) {
      console.warn('pull failed')
    } else {
      const data = {
        wrong_ids: (w.data || []).map((r) => toId(r.question_id)),
        fav_ids: (f.data || []).map((r) => toId(r.question_id)),
        exam_history: (e.data || []).map((r) => ({
          subject: r.subject,
          score: r.score,
          passed: r.passed,
          correct: r.correct,
          total: r.total,
          usedSec: r.used_sec,
          time: new Date(r.created_at).getTime()
        })),
        practice_pos: {},
        practice_data: {}
      }
      for (const r of p.data || []) data.practice_pos[r.pos_key] = r.idx
      for (const r of st.data || []) {
        const pd = data.practice_data[r.pos_key] || (data.practice_data[r.pos_key] = { sels: {}, ans: {} })
        if (r.sel) pd.sels[toId(r.question_id)] = r.sel.split(',')
        if (r.ok !== null && r.ok !== undefined) pd.ans[toId(r.question_id)] = r.ok ? 'ok' : 'no'
      }
      applyData(data)
    }
  } catch (e) {
    console.warn('pull failed:', e.message)
  }
  await migrateLegacy()
}

function applyData(data) {
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
}

// 旧版 user_data 单表 JSON 的一次性迁移
async function migrateLegacy() {
  if (!session) return
  try {
    const { data: legacy, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', uid())
      .maybeSingle()
    if (error || !legacy || !legacy.data) return
    const b = legacy.data
    const { count } = await supabase
      .from('wrong_questions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid())
    if (count > 0) return
    for (const id of b.wrong_ids || []) await syncWrong(id, true)
    for (const id of b.fav_ids || []) await syncFav(id, true)
    for (const rec of b.exam_history || []) await syncExamRecord(rec)
    for (const [key, idx] of Object.entries(b.practice_pos || {})) await syncPracticePos(key, idx)
    for (const [posKey, pd] of Object.entries(b.practice_data || {})) {
      for (const [qid, sel] of Object.entries(pd.sels || {})) {
        await syncPracticeState(posKey, toId(qid), null, sel)
      }
      for (const [qid, ans] of Object.entries(pd.ans || {})) {
        await syncPracticeState(posKey, toId(qid), ans === 'ok', undefined)
      }
    }
  } catch (e) {
    console.warn('migrate failed:', e.message)
  }
}
