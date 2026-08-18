import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../src/config.js').catch(() => {
  // fallback: read directly
  const t = fs.readFileSync('src/config.js', 'utf8')
  return {
    SUPABASE_URL: t.match(/SUPABASE_URL = '([^']+)'/)[1],
    SUPABASE_ANON_KEY: t.match(/SUPABASE_ANON_KEY = '([^']+)'/)[1]
  }
})

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 1. signup test user
const email = 'test' + Date.now() + '@gmail.com'
const { data, error } = await sb.auth.signUp({ email, password: 'test123456' })
if (error) {
  console.log('SIGNUP FAIL:', error.message)
  process.exit(1)
}
console.log('signup OK, session:', !!data.session, 'user id:', data.user.id)

// 2. test upsert into user_data
const { error: e2 } = await sb.from('user_data').upsert({
  user_id: data.user.id,
  data: { wrong_ids: [1, 2], test: true },
  updated_at: new Date().toISOString()
})
if (e2) {
  console.log('UPSERT FAIL:', e2.message)
  process.exit(1)
}
console.log('upsert OK')

// 3. test select back
const { data: row, error: e3 } = await sb.from('user_data').select('data').eq('user_id', data.user.id).maybeSingle()
if (e3) {
  console.log('SELECT FAIL:', e3.message)
  process.exit(1)
}
console.log('select OK:', JSON.stringify(row.data))

console.log('ALL GOOD')
