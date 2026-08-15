import fs from 'fs'

const html = fs.readFileSync('temp_bank_utf8.html', 'utf8')

// ---- 1. tokenize into line stream (keep inline images in order) ----
const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/g
let m
const lines = []
while ((m = pRe.exec(html))) {
  let content = m[1]
  content = content
    .replace(/<img[^>]*src="([^"]+)"[^>]*>/g, '\x00IMG:$1\x00')
    .replace(/<br[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  for (const rawLine of content.split('\n')) {
    const t = rawLine.replace(/[ \t\u3000]+/g, '').trim()
    if (!t) continue
    let rest = t
    const imgs = []
    while (true) {
      const idx = rest.indexOf('\x00IMG:')
      if (idx === -1) break
      const end = rest.indexOf('\x00', idx + 5)
      imgs.push(rest.slice(idx + 5, end).replace(/^temp_bank\.files\//, ''))
      rest = rest.slice(0, idx) + rest.slice(end + 1)
    }
    lines.push({ text: rest, imgs })
  }
}

// ---- 2. split into blocks by question number ----
const isStart = (line) =>
  /^\d+[.．、]/.test(line) || /^\d{1,4}[\u4e00-\u9fa5]/.test(line)

const blocks = []
let cur = null
for (const l of lines) {
  if (isStart(l.text)) {
    cur = { num: Number(l.text.match(/^(\d+)/)[1]), lines: [], imgs: [] }
    blocks.push(cur)
  }
  if (cur) {
    cur.lines.push(l.text)
    cur.imgs.push(...l.imgs)
  }
}

// ---- 3. fix duplicate printed numbers (doc numbering errors) ----
const renumber = {}
const byNum = {}
for (const b of blocks) {
  if (!byNum[b.num]) byNum[b.num] = []
  byNum[b.num].push(b)
}
const dupFix = { 914: 915, 1112: 1113, 1916: 1816, 2223: 2310 }
for (const b of blocks) {
  if (byNum[b.num].length > 1 && dupFix[b.num] !== undefined) {
    const idx = byNum[b.num].indexOf(b)
    if (idx === 1) {
      renumber[b.num] = dupFix[b.num]
      b.num = dupFix[b.num]
    }
  }
}

// ---- 4. parse each block ----
const questions = []
const issues = []
const stat = { single: 0, judge: 0, multi: 0, withImage: 0, withExplain: 0 }
const usedImgs = new Set()

for (const b of blocks) {
  const ls = b.lines.slice()
  const num = b.num

  ls[0] = ls[0].replace(/^\d+[.．、]\s*/, '').replace(/^\d+/, '')
  if (!ls[0]) ls.shift()

  let ansIdx = -1
  let ansRaw = ''
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i]
    let mm = l.match(/^答案[：:；;]?\s*(.+)$/)
    if (mm) { ansIdx = i; ansRaw = mm[1]; break }
    mm = l.match(/^(参考答案)?([YN])[：:]\s*(.+)?$/)
    if (mm) {
      ansIdx = i
      ansRaw = mm[2] === 'Y' ? '正确' : '错误'
      break
    }
  }

  const options = []
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i]
    let mm = l.match(/^([A-D])[.．、]\s*(.+)$/)
    if (mm) { options.push({ letter: mm[1], text: mm[2].trim(), idx: i }); continue }
    mm = l.match(/^([A-D])(正确|错误)$/)
    if (mm) { options.push({ letter: mm[1], text: mm[2], idx: i }) }
  }

  const firstOptIdx = options.length ? options[0].idx : ansIdx >= 0 ? ansIdx : ls.length
  let qText = ''
  for (let i = 0; i < firstOptIdx; i++) {
    if (i === ansIdx) continue
    qText += ls[i]
  }

  let typeHint = null
  qText = qText.replace(/^[（(](判断题|单选题|多选题)[）)]/, (mm, t) => {
    typeHint = t
    return ''
  })

  let answer = null
  let explanation = ''
  if (ansRaw) {
    ansRaw = ansRaw.trim().replace(/[。；;]\s*$/, '')
    let mm = ansRaw.match(/^([A-D]+)\s*[（(]([^）)]*)[）)]/)
    if (mm) {
      answer = mm[1].split('')
      explanation = mm[2].trim()
    } else {
      mm = ansRaw.match(/^([A-D]+)/)
      if (mm) answer = mm[1].split('')
    }
    if (!answer) {
      if (/√|正确|对/.test(ansRaw)) answer = ['A']
      else if (/×|错误|错/.test(ansRaw)) answer = ['B']
    }
  }

  let type = 'single'
  if (!options.length || (options.length === 2 && options.every((o) => ['正确', '错误'].includes(o.text)))) {
    type = 'judge'
  } else if (typeHint === '多选题' || (answer && answer.length > 1)) {
    type = 'multi'
  }

  if (type === 'judge') {
    if (answer && ['对', '正确', '√'].includes(String(answer[0]))) answer = ['A']
    if (answer && ['错', '错误', '×'].includes(String(answer[0]))) answer = ['B']
    if (answer && !['A', 'B'].includes(String(answer[0]))) answer = null
  }

  if (!answer) issues.push({ num, reason: 'no-answer', ansRaw })
  if (answer && type !== 'judge') {
    for (const a of answer) {
      if (!options.some((o) => o.letter === a)) {
        issues.push({ num, reason: 'answer-out-of-range', answer: answer.join(','), opts: options.map((o) => o.letter).join('') })
        break
      }
    }
  }
  if (qText.length === 0) issues.push({ num, reason: 'empty-question' })
  if (type !== 'judge' && options.length < 2) issues.push({ num, reason: 'too-few-options', n: options.length })

  const q = {
    id: num,
    type,
    subject: 1,
    chapter: 'real',
    question: qText,
    options: type === 'judge' ? ['正确', '错误'] : options.map((o) => o.text),
    answer: answer ? answer.join(',') : '',
    explanation: explanation || ''
  }
  const uniqueImgs = [...new Set(b.imgs)]
  if (uniqueImgs.length) {
    q.images = uniqueImgs.map((f) => 'questions-images/' + f)
    uniqueImgs.forEach((f) => usedImgs.add(f))
    stat.withImage++
  }
  if (explanation) stat.withExplain++
  stat[type]++

  questions.push(q)
}

// ---- 5. verify image files exist ----
const imgDir = 'temp_bank.files'
const existing = new Set(fs.readdirSync(imgDir))
const missingImgs = [...usedImgs].filter((f) => !existing.has(f))
console.log('missing image files:', missingImgs.length, missingImgs.slice(0, 10))

// ---- 6. report ----
console.log('parsed questions:', questions.length)
console.log('stat:', stat)
console.log('issues count:', issues.length)
issues.slice(0, 20).forEach((i) => console.log('ISSUE', JSON.stringify(i)))

const nums = questions.map((q) => q.id).sort((a, b) => a - b)
const missing = []
for (let i = 1; i <= 2310; i++) {
  if (!nums.includes(i)) missing.push(i)
}
console.log('missing numbers:', missing)

// option count distribution
const optDist = {}
for (const q of questions) {
  const k = q.type === 'judge' ? 'judge' : q.options.length
  optDist[k] = (optDist[k] || 0) + 1
}
console.log('options distribution:', optDist)

// ---- 7. write output ----
const out = 'export const REAL_QUESTIONS = ' + JSON.stringify(questions, null, 1) + '\n'
fs.writeFileSync('src/data/realQuestions.js', out, 'utf8')
console.log('written src/data/realQuestions.js', (out.length / 1024).toFixed(0) + 'KB')
