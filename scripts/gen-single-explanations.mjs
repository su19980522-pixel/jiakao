import fs from 'fs'
import { REAL_QUESTIONS } from '../src/data/realQuestions.js'

const KEY = 'sk-21358e2e5bcd4a6c9f6893fcc17812d7'
const OUT = 'src/data/singleExplanations.js'
const PROGRESS = 'scripts/single_progress.json'

const targets = REAL_QUESTIONS.filter((q) => q.type === 'single' && !q.explanation)
const progress = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, 'utf8')) : {}
const todo = targets.filter((q) => !(q.id in progress))
console.log('single total:', targets.length, '| already done:', targets.length - todo.length, '| todo:', todo.length)

const BATCH = 20
const CONCURRENCY = 5

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

async function explainBatch(batch) {
  const items = batch.map((q) => {
    const options = q.options.map((o, i) => `${LETTERS[i]}. ${o.replace(/^[A-H][.、]\s*/, '')}`).join('；')
    return {
      id: q.id,
      question: q.question,
      options,
      answer: q.answer
    }
  })
  const prompt =
    '你是中国驾考科目一题库解析编写专家。请为以下单选题各写一条简洁解析（不超过50字）：' +
    '说明为什么选该正确答案（必要时指出错误选项错在哪）。' +
    '直接输出 JSON 数组，不要输出代码块标记或其他任何文字，每个元素格式：{"id":题号,"explanation":"解析"}\n' +
    '题目列表：' + JSON.stringify(items)

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 8192
        })
      })
      const data = await res.json()
      if (!res.ok || !data.choices) throw new Error(JSON.stringify(data).slice(0, 200))
      const content = data.choices[0].message.content
      const m = content.match(/\[[\s\S]*\]/)
      if (!m) throw new Error('no json array in response')
      const arr = JSON.parse(m[0])
      if (!Array.isArray(arr)) throw new Error('not array')
      return arr
    } catch (e) {
      console.log(`  batch retry ${attempt}:`, e.message)
      await new Promise((r) => setTimeout(r, 3000 * attempt))
    }
  }
  return null
}

async function main() {
  let cursor = 0
  while (cursor < todo.length) {
    const wave = todo.slice(cursor, cursor + BATCH * CONCURRENCY)
    const groups = []
    for (let i = 0; i < wave.length; i += BATCH) groups.push(wave.slice(i, i + BATCH))
    const results = await Promise.all(groups.map((g) => explainBatch(g)))
    let okCount = 0
    results.forEach((arr) => {
      if (!arr) return
      for (const item of arr) {
        if (item && item.id != null && item.explanation) {
          progress[item.id] = String(item.explanation).trim()
          okCount++
        }
      }
    })
    fs.writeFileSync(PROGRESS, JSON.stringify(progress))
    cursor += wave.length
    console.log(`progress: ${cursor}/${todo.length} (+${okCount} this wave)`)
  }

  const missing = targets.filter((q) => !(q.id in progress))
  console.log('missing after run:', missing.length)
  fs.writeFileSync(OUT, 'export const SINGLE_EXPLANATIONS = ' + JSON.stringify(progress, null, 1) + '\n')
  console.log('written', OUT)
}

main()
