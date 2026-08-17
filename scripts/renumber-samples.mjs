import fs from 'fs'

const file = 'src/data/sampleQuestions.js'
let content = fs.readFileSync(file, 'utf8')

let n = 0
content = content.replace(/id:\s*\d+,/g, () => {
  n++
  return `id: ${50000 + n},`
})

fs.writeFileSync(file, content, 'utf8')
console.log('renumbered ids:', n)
