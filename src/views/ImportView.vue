<script setup>
import { computed, ref } from 'vue'
import * as XLSX from 'xlsx'
import { useBankStore } from '../stores/bank'

const bank = useBankStore()

const importMode = ref('append')
const message = ref('')
const msgType = ref('info')
const fileInput = ref(null)

const importedCount = computed(() => bank.imported.length)
const totalCount = computed(() => bank.allQuestions.length)

const HEADERS = ['类型', '科目', '章节', '题目', '图片', '选项A', '选项B', '选项C', '选项D', '答案', '解析']
const TYPE_MAP = { 单选: 'single', 判断: 'judge', 多选: 'multi', single: 'single', judge: 'judge', multi: 'multi' }

function show(msg, type = 'info') {
  message.value = msg
  msgType.value = type
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const ext = file.name.split('.').pop().toLowerCase()
  const reader = new FileReader()
  reader.onload = () => {
    try {
      let rawList = []
      if (ext === 'json') {
        const data = JSON.parse(reader.result)
        rawList = Array.isArray(data) ? data : []
      } else if (ext === 'csv' || ext === 'txt') {
        rawList = parseCsv(reader.result)
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawList = parseExcel(reader.result)
      } else {
        show('不支持的文件格式，请使用 JSON / CSV / Excel', 'error')
        return
      }
      if (rawList.length === 0) {
        show('未解析到任何题目，请检查文件格式', 'error')
        return
      }
      const valid = rawList.filter((r) => r.question && r.options && r.options.length >= 2 && r.answer)
      const ok = bank.importQuestions(rawList, importMode.value)
      if (ok) {
        show(`导入成功：有效 ${valid.length} 题，无效 ${rawList.length - valid.length} 题。当前导入题库共 ${bank.imported.length} 题。`, 'success')
      } else {
        show('导入失败：浏览器存储空间不足（localStorage 已满），请减少题库体积或改用图片外链。', 'error')
      }
    } catch (err) {
      show('解析文件失败：' + err.message, 'error')
    }
  }
  if (ext === 'json' || ext === 'csv' || ext === 'txt') {
    reader.readAsText(file, 'utf-8')
  } else {
    reader.readAsArrayBuffer(file)
  }
  e.target.value = ''
}

function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const header = rows[0].map((h) => String(h).trim())
  const map = {}
  header.forEach((h, i) => {
    map[String(h)] = i
  })
  return rows.slice(1).map((r) => rowToQuestion(map, r))
}

function parseCsv(text) {
  const rows = parseCsvRows(text)
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim())
  const map = {}
  header.forEach((h, i) => {
    map[h] = i
  })
  return rows.slice(1).map((r) => rowToQuestion(map, r))
}

function parseCsvRows(text) {
  const rows = []
  let cur = ''
  let row = []
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuote = true
    } else if (ch === ',') {
      row.push(cur)
      cur = ''
    } else if (ch === '\n') {
      row.push(cur)
      rows.push(row)
      row = []
      cur = ''
    } else if (ch !== '\r') {
      cur += ch
    }
  }
  if (cur !== '' || row.length > 0) {
    row.push(cur)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function get(map, row, key) {
  const i = map[key]
  return i !== undefined && i >= 0 ? String(row[i] ?? '').trim() : ''
}

function rowToQuestion(map, row) {
  const typeRaw = get(map, row, '类型')
  const subjectRaw = get(map, row, '科目')
  const options = [1, 2, 3, 4].map((n) => get(map, row, '选项' + 'ABCD'[n - 1])).filter((o) => o !== '')
  let type = TYPE_MAP[typeRaw] || 'single'
  if (typeRaw === '判断' || typeRaw === 'judge') type = 'judge'
  return {
    type,
    subject: /4|四/.test(subjectRaw) ? 4 : 1,
    chapter: get(map, row, '章节') || '其他',
    question: get(map, row, '题目'),
    image: get(map, row, '图片') || null,
    options: type === 'judge' ? ['正确', '错误'] : options,
    answer: get(map, row, '答案'),
    explanation: get(map, row, '解析')
  }
}

function clearImported() {
  if (confirm('确定清空导入的题库吗？内置题库不受影响。')) {
    bank.clearImported()
    show('已清空导入题库', 'success')
  }
}

function exportJson() {
  const data = JSON.stringify(bank.allQuestions, null, 2)
  downloadBlob(data, '驾考题库.json', 'application/json')
}

function downloadTemplate() {
  const rows = [
    HEADERS,
    ['单选', 1, '道路交通安全法律、法规和规章', '驾驶机动车行经人行横道遇行人正在通过时，应当怎样做？', '', 'A. 鸣喇叭催促', 'B. 加速通过', 'C. 停车让行', 'D. 从行人身后绕过', 'C', '行经人行横道遇行人正在通过时，应当停车让行。'],
    ['判断', 1, '交通信号', '黄灯持续闪烁表示车辆、行人在确保安全的原则下可以通行。', '', '', '', '', '', 'A', '黄闪灯警示注意瞭望，确认安全后通行。'],
    ['多选', 4, '安全行车常识', '行车中需要临时停车时，正确的做法有哪些？', '', 'A. 选择不妨碍交通的地点停放', 'B. 开启危险报警闪光灯', 'C. 车辆故障时在车后适当位置设置警告标志', 'D. 随意停在行车道内', 'A,B,C', '临时停车不得妨碍通行。']
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = HEADERS.map((h, i) => ({ wch: i === 3 ? 50 : i >= 5 && i <= 8 ? 30 : 14 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '题库')
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(out, '驾考题库导入模板.xlsx', 'application/octet-stream')
}

function downloadBlob(data, filename, type) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page import-page">
    <div class="card">
      <div class="panel-title">题库概况</div>
      <div class="overview">
        <div class="ov-item">
          <div class="num">{{ totalCount }}</div>
          <div class="label">总题数（内置 + 导入）</div>
        </div>
        <div class="ov-divider" />
        <div class="ov-item">
          <div class="num">{{ importedCount }}</div>
          <div class="label">已导入题数</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="panel-title">导入题库</div>
      <div class="mode-switch">
        <label :class="{ active: importMode === 'append' }">
          <input type="radio" value="append" v-model="importMode" />
          追加导入（推荐）
        </label>
        <label :class="{ active: importMode === 'replace' }">
          <input type="radio" value="replace" v-model="importMode" />
          覆盖导入
        </label>
      </div>
      <input ref="fileInput" type="file" accept=".json,.csv,.txt,.xlsx,.xls" style="display: none" @change="onFileChange" />
      <button class="btn btn-primary import-btn" @click="fileInput.click()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
        </svg>
        选择文件导入
      </button>
      <p class="hint">支持 JSON / Excel(.xlsx) / CSV 文件，格式说明见下方</p>
      <Transition name="msg">
        <div v-if="message" class="msg" :class="msgType">{{ message }}</div>
      </Transition>
    </div>

    <div class="card">
      <div class="panel-title">导出 / 管理</div>
      <div class="btn-row">
        <button class="btn btn-outline" @click="exportJson">导出全部题库（JSON）</button>
        <button class="btn btn-outline" @click="downloadTemplate">下载 Excel 模板</button>
        <button class="btn btn-danger" :disabled="importedCount === 0" @click="clearImported">清空导入题库</button>
      </div>
    </div>

    <div class="card">
      <div class="panel-title">题库格式说明</div>
      <div class="fmt">
        <p><b>JSON</b>：数组，每项字段：<code>type</code>(single/judge/multi)、<code>subject</code>(1/4)、<code>chapter</code>、<code>question</code>、<code>options</code>(选项数组)、<code>answer</code>(如 "A" 或 "A,B")、<code>explanation</code>、<code>image</code>(图片URL，可选)</p>
        <pre>[
  {
    "type": "single",
    "subject": 1,
    "chapter": "交通信号",
    "question": "红灯亮时，机动车应当怎样做？",
    "options": ["A. 停车等候", "B. 加速通过", "C. 缓慢通过", "D. 鸣喇叭通过"],
    "answer": "A",
    "explanation": "红灯亮时应在停止线外等候。"
  }
]</pre>
        <p class="fmt-mt"><b>Excel / CSV</b>：首行为表头：<code>类型</code>(单选/判断/多选)、<code>科目</code>(1或4)、<code>章节</code>、<code>题目</code>、<code>图片</code>、<code>选项A-D</code>、<code>答案</code>(判断题为 A=正确 B=错误)、<code>解析</code>。可先下载模板按格式填写。</p>
        <p class="fmt-mt"><b>章节名</b>建议与内置章节一致（见首页专项练习），也可自定义名称。</p>
        <p class="fmt-mt warn-text">注意：导入数据保存在浏览器 localStorage 中，换浏览器或清除数据会丢失，请定期导出备份。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-page {
  width: 100%;
}

.panel-title {
  font-weight: 700;
  font-size: 15.5px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title::before {
  content: '';
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: var(--grad-primary);
}

.overview {
  display: flex;
  align-items: center;
  text-align: center;
  padding: 6px 0;
}

.ov-item {
  flex: 1;
}

.ov-item .num {
  font-size: 30px;
  font-weight: 800;
  background: var(--grad-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-variant-numeric: tabular-nums;
}

.ov-item .label {
  font-size: 12.5px;
  color: var(--text-2);
}

.ov-divider {
  width: 1px;
  height: 36px;
  background: var(--border);
}

.mode-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.mode-switch label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-2);
  padding: 7px 14px;
  border-radius: 999px;
  background: #eef1f8;
  transition: all 0.15s;
}

.mode-switch label.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.mode-switch input {
  accent-color: var(--primary);
}

.import-btn {
  width: 100%;
  padding: 13px;
  font-size: 15.5px;
}

.import-btn svg {
  width: 19px;
  height: 19px;
}

.hint {
  font-size: 12.5px;
  color: var(--text-2);
  margin-top: 10px;
  text-align: center;
}

.msg {
  margin-top: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.6;
}

.msg.info { background: var(--primary-soft); color: var(--primary-strong); }
.msg.success { background: var(--success-soft); color: var(--success-strong); }
.msg.error { background: var(--danger-soft); color: var(--danger-strong); }

.msg-enter-active {
  transition: all 0.25s ease;
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.btn-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-row .btn {
  width: 100%;
  padding: 12px;
}

.fmt {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.8;
}

.fmt code {
  background: #eef1f8;
  padding: 1.5px 7px;
  border-radius: 5px;
  font-size: 12px;
  color: #7c3aed;
  font-family: 'Cascadia Code', Consolas, monospace;
}

.fmt pre {
  background: #1c2440;
  color: #dbe4ff;
  border-radius: 12px;
  padding: 16px;
  margin: 10px 0;
  overflow-x: auto;
  font-size: 12.5px;
  line-height: 1.7;
  font-family: 'Cascadia Code', Consolas, monospace;
}

.fmt-mt {
  margin-top: 10px;
}

.warn-text {
  color: #c47b04;
}
</style>
