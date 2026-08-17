import { REAL_QUESTIONS } from '../src/data/realQuestions.js'
import { SAMPLE_QUESTIONS } from '../src/data/sampleQuestions.js'
import { primaryPoint, getPoints } from '../src/utils/question.js'

const all = [...REAL_QUESTIONS, ...SAMPLE_QUESTIONS]
const count = {}
let otherCount = 0
for (const q of all) {
  if (q.subject !== 1) continue
  const p = primaryPoint(q)
  count[p.name] = (count[p.name] || 0) + 1
  if (p.id === 'other') otherCount++
}

const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
for (const [name, n] of sorted) {
  console.log(`${name}: ${n}`)
}
console.log('总题数:', all.filter((q) => q.subject === 1).length, '| 未分类(综合知识):', otherCount)

// multi-point display check
const multi = all.filter((q) => q.subject === 1 && getPoints(q).length > 1)
console.log('匹配多个知识点的题:', multi.length)
const s = multi[0]
if (s) console.log('示例:', s.question.slice(0, 40), '->', getPoints(s).map((p) => p.name).join(' | '))
