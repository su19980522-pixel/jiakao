import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const t = fs.readFileSync('src/config.js', 'utf8')
const SUPABASE_URL = t.match(/SUPABASE_URL = '([^']+)'/)[1]
const SUPABASE_ANON_KEY = t.match(/SUPABASE_ANON_KEY = '([^']+)'/)[1]

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const email = 'test' + Date.now() + '@gmail.com'
const { data, error } = await sb.auth.signUp({ email, password: 'test123456' })
if (error) {
  console.log('SIGNUP FAIL:', error.message)
  process.exit(1)
}
const userId = data.user.id
console.log('signup OK:', userId)

const check = (name, err) => {
  if (err) {
    console.log(name, 'FAIL:', err.message)
    process.exit(1)
  }
  console.log(name, 'OK')
}

// wrong_questions
const { error: e1 } = await sb.from('wrong_questions').upsert(
  { user_id: userId, question_id: '42', subject: 1, wrong_count: 1, last_wrong_at: new Date().toISOString() },
  { onConflict: 'user_id,question_id', ignoreDuplicates: true }
)
check('wrong insert', e1)

const { data: w, error: e2 } = await sb.from('wrong_questions').select('question_id').eq('user_id', userId)
check('wrong select', e2)
console.log('  wrong rows:', w.length)

// favorites
const { error: e3 } = await sb.from('favorites').insert({ user_id: userId, question_id: '42', subject: 1 })
check('fav insert', e3)

// exam_records
const { error: e4 } = await sb.from('exam_records').insert({
  user_id: userId, subject: 1, score: 92, passed: true, correct: 92, total: 100, used_sec: 1500,
  created_at: new Date().toISOString()
})
check('exam insert', e4)

const { data: ex, error: e5 } = await sb.from('exam_records').select('score,passed').eq('user_id', userId)
check('exam select', e5)
console.log('  exam rows:', ex.length, JSON.stringify(ex[0]))

// practice_positions
const { error: e6 } = await sb.from('practice_positions').upsert(
  { user_id: userId, pos_key: '1_order_all', idx: 88, updated_at: new Date().toISOString() },
  { onConflict: 'user_id,pos_key' }
)
check('pos upsert', e6)

// practice_state
const { error: e7 } = await sb.from('practice_state').upsert(
  { user_id: userId, pos_key: '1_order_all', question_id: '42', ok: true, sel: 'A', updated_at: new Date().toISOString() },
  { onConflict: 'user_id,pos_key,question_id' }
)
check('state upsert', e7)

const { data: st, error: e8 } = await sb.from('practice_state').select('*').eq('user_id', userId)
check('state select', e8)
console.log('  state rows:', st.length, JSON.stringify(st[0]))

// RLS isolation test: another user can't see this user's data
const { data: other, error: e9 } = await sb.auth.signUp({ email: 'other' + Date.now() + '@gmail.com', password: 'test123456' })
if (e9) {
  console.log('other signup FAIL:', e9.message)
  process.exit(1)
}
const { data: wOther } = await sb.from('wrong_questions').select('question_id')
check('RLS isolation', wOther ? new Error('should not see rows but got ' + wOther.length) : null)
if (wOther === null || wOther === undefined) {
  console.log('  other user sees no rows (RLS working)')
} else if (Array.isArray(wOther) && wOther.length === 0) {
  console.log('  other user sees 0 rows (RLS working)')
}

console.log('ALL GOOD')
process.exit(0)
