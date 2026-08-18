import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const DIR = 'public/questions-images'
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'))
console.log('png files:', files.length)

let done = 0
const start = Date.now()
for (const f of files) {
  const inPath = path.join(DIR, f)
  const outPath = inPath.replace(/\.png$/, '.webp')
  try {
    await sharp(inPath)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(outPath)
    fs.unlinkSync(inPath)
    done++
  } catch (e) {
    console.log('FAIL', f, e.message)
  }
}

const before = 223
const total = fs.readdirSync(DIR).filter((f) => f.endsWith('.webp')).reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0)
console.log(`done ${done}/${files.length} in ${((Date.now() - start) / 1000).toFixed(0)}s`)
console.log(`new size: ${(total / 1024 / 1024).toFixed(1)} MB (was ~${before} MB)`)

// 更新题库中的图片路径
const bankFile = 'src/data/realQuestions.js'
let content = fs.readFileSync(bankFile, 'utf8')
const beforeCount = (content.match(/\.png/g) || []).length
content = content.replace(/(questions-images\/temp_bank\d+)\.png/g, '$1.webp')
const afterCount = (content.match(/\.png/g) || []).length
fs.writeFileSync(bankFile, content, 'utf8')
console.log(`bank image refs: ${beforeCount} png -> ${afterCount} png left`)
