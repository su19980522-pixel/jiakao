import { REAL_QUESTIONS } from '../src/data/realQuestions.js'

console.log('total:', REAL_QUESTIONS.length)
const byType = {}
for (const q of REAL_QUESTIONS) byType[q.type] = (byType[q.type] || 0) + 1
console.log('byType:', byType)

const withImg = REAL_QUESTIONS.filter((q) => q.images)
console.log('with images:', withImg.length)
console.log('multi-image questions:', withImg.filter((q) => q.images.length > 1).length)

const withExplain = REAL_QUESTIONS.filter((q) => q.explanation)
console.log('with explanation:', withExplain.length)

// samples
const show = (q) => console.log(JSON.stringify({ id: q.id, type: q.type, q: q.question.slice(0, 40), opts: q.options, ans: q.answer, imgs: q.images?.length || 0 }, null, 1), '\n---')

show(REAL_QUESTIONS.find((q) => q.id === 1))
show(REAL_QUESTIONS.find((q) => q.id === 584))
show(REAL_QUESTIONS.find((q) => q.id === 915))
show(REAL_QUESTIONS.find((q) => q.id === 1816))
show(REAL_QUESTIONS.find((q) => q.id === 2310))
show(withImg[0])
show(REAL_QUESTIONS.find((q) => q.explanation && q.explanation !== '新规题'))

// check no empty question text / options
let bad = 0
for (const q of REAL_QUESTIONS) {
  if (!q.question || !q.options.length || !q.answer) { bad++; console.log('BAD', q.id) }
}
console.log('bad rows:', bad)

// judge answers valid
const judgeBad = REAL_QUESTIONS.filter((q) => q.type === 'judge' && !['A', 'B'].includes(q.answer)).length
console.log('judge with bad answer:', judgeBad)
