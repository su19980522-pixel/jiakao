import { REAL_QUESTIONS } from '../src/data/realQuestions.js'
import { primaryPoint } from '../src/utils/question.js'

const un = REAL_QUESTIONS.filter((q) => primaryPoint(q).id === 'other')
console.log('unclassified:', un.length)
const samples = new Set()
for (const q of un) {
  const t = q.question.slice(0, 26)
  samples.add(t)
}
let i = 0
for (const s of samples) {
  if (i++ >= 45) break
  console.log(s)
}
