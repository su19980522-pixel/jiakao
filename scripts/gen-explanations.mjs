import fs from 'fs'
import { REAL_QUESTIONS } from '../src/data/realQuestions.js'

const KEY = 'sk-21358e2e5bcd4a6c9f6893fcc17812d7'
const OUT = 'src/data/judgeExplanations.js'
const PROGRESS = 'scripts/judge_progress.json'

const judges = REAL_QUESTIONS.filter((q) => q.type === 'judge' && !q.explanation)
const progress = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, 'utf8')) : {}
const todo = judges.filter((q) => !(q.id in progress))
console.log('judge total:', judges.length, '| already done:', judges.length - todo.length, '| todo:', todo.length)

const BATCH = 25
const CONCURRENCY = 4

async function explainBatch(batch) {
  const items = batch.map((q) => ({
    id: q.id,
    question: q.question,
    answer: q.answer === 'A' ? '正确' : '错误'
  }))
  const prompt =
    '你是中国驾考科目一题库解析编写专家。请为以下判断题各写一条简洁解析（不超过50字）：' +
    '答案"正确"的，简要说明依据；答案"错误"的，指出错误原因并给出正确说法。' +
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

  const missing = judges.filter((q) => !(q.id in progress))
  console.log('missing after run:', missing.length)
  fs.writeFileSync(OUT, 'export const JUDGE_EXPLANATIONS = ' + JSON.stringify(progress, null, 1) + '\n')
  console.log('written', OUT)
}

main()
