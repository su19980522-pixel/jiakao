export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export const TYPE_NAMES = {
  single: '单选题',
  judge: '判断题',
  multi: '多选题'
}

export function normalizeQuestion(raw, fallbackId) {
  const q = { ...raw }
  if (!q.type || !['single', 'judge', 'multi'].includes(q.type)) {
    q.type = 'single'
  }
  if (q.type === 'judge') {
    q.options = ['正确', '错误']
    if (String(q.answer).includes('对') || q.answer === 'A' || q.answer === '1') {
      q.answer = 'A'
    } else {
      q.answer = 'B'
    }
  } else {
    const ans = String(q.answer ?? '')
      .toUpperCase()
      .replace(/[^A-H]/g, '')
    const letters = [...new Set(ans.split('').sort())]
    q.answer = q.type === 'multi' ? letters : [letters[0] || 'A']
  }
  q.subject = q.subject === 4 ? 4 : 1
  q.id = q.id ?? fallbackId
  q.image = q.image || null
  q.explanation = q.explanation || ''
  return q
}

export function isCorrect(q, selected) {
  const sel = [...new Set((selected || []).slice().sort())]
  const ans = [...q.answer].sort()
  return sel.length === ans.length && sel.every((s, i) => s === ans[i])
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
