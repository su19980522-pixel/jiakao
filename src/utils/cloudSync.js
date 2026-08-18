import { supabase } from '../supabase'

let session = null

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

const toId = (s) => (/^\d+$/.test(String(s)) ? Number(s) : s)

// ============ 推送（写数据库） ============

export async function syncWrong(id, add) {
  if (!session) return
  try {
    if (add) {
      const { error } = await supabase.rpc('add_wrong', {
        qid: String(id),
        subj: await resolveSubject(id)
      })
      if (error) {
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
      }
    } else {
      await supabase.from('wrong_questions').delete().eq('user_id', uid()).eq('question_id', String(id))
    }
    markSynced()
  } catch {
    markError()
  }
}

export async function clearWrongAll() {
  if (!session) return
  try {
    await supabase.from('wrong_questions').delete().eq('user_id', uid())
    markSynced()
  } catch {
    markError()
  }
}

export async function fetchWrongWithCounts() {
  if (!session) return {}
  const map = {}
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('wrong_questions')
      .select('question_id,wrong_count')
      .eq('user_id', uid())
      .order('id')
      .range(from, from + 999)
    if (error) throw error
    for (const r of data || []) map[toId(r.question_id)] = r.wrong_count
    if ((data || []).length < 1000) break
    from += 1000
  }
  return map
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

// ============ 拉取（读数据库） ============

export async function fetchExamRecords(limit = 100) {
  if (!session) return []
  const { data, error } = await supabase
    .from('exam_records')
    .select('*')
    .eq('user_id', uid())
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((r) => ({
    subject: r.subject,
    score: r.score,
    passed: r.passed,
    correct: r.correct,
    total: r.total,
    usedSec: r.used_sec,
    time: new Date(r.created_at).getTime()
  }))
}

// 某个练习模式的作答状态（分页拉取）
export async function fetchPracticeState(posKey) {
  if (!session) return { sels: {}, ans: {} }
  const sels = {}
  const ans = {}
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('practice_state')
      .select('question_id,ok,sel')
      .eq('user_id', uid())
      .eq('pos_key', posKey)
      .order('id')
      .range(from, from + 999)
    if (error) throw error
    for (const r of data || []) {
      const id = toId(r.question_id)
      if (r.sel) sels[id] = r.sel.split(',')
      if (r.ok !== null && r.ok !== undefined) ans[id] = r.ok ? 'ok' : 'no'
    }
    if ((data || []).length < 1000) break
    from += 1000
  }
  return { sels, ans }
}

// 全部作答记录（供统计用，含时间）
export async function fetchAllPracticeState() {
  if (!session) return []
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('practice_state')
      .select('question_id,ok,updated_at')
      .eq('user_id', uid())
      .order('id')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data || []))
    if ((data || []).length < 1000) break
    from += 1000
  }
  return rows
}

// 登录/启动后全量加载用户数据到内存
export async function afterAuth() {
  if (!session) return
  try {
    const [w, f, e, p] = await Promise.all([
      supabase.from('wrong_questions').select('question_id').eq('user_id', uid()),
      supabase.from('favorites').select('question_id').eq('user_id', uid()),
      fetchExamRecords(50),
      supabase.from('practice_positions').select('pos_key,idx').eq('user_id', uid())
    ])
    if (w.error || f.error || p.error) {
      console.warn('pull failed')
    } else {
      const practice_pos = {}
      for (const r of p.data || []) practice_pos[r.pos_key] = r.idx
      const { useUserStore } = await import('../stores/user')
      useUserStore().setAll({
        wrong_ids: (w.data || []).map((r) => toId(r.question_id)),
        fav_ids: (f.data || []).map((r) => toId(r.question_id)),
        exam_history: e,
        practice_pos
      })
      const auth = await getAuthStore()
      auth.syncedAt = Date.now()
      auth.syncError = ''
    }
  } catch (e) {
    console.warn('pull failed:', e.message)
  }
  await migrateLegacy()
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
