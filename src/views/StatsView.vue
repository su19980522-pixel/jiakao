<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBankStore } from '../stores/bank'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../supabase'
import { fetchAllPracticeState } from '../utils/cloudSync'
import { primaryPoint } from '../utils/question'
import { KNOWLEDGE_POINTS, POINT_NAME_BY_ID } from '../data/knowledgePoints'

const router = useRouter()
const bank = useBankStore()
const user = useUserStore()
const auth = useAuthStore()

const subject = ref(1)
const cloudExams = ref(null)
const practiceRows = ref([])
const loaded = ref(false)

const points = computed(() => KNOWLEDGE_POINTS[subject.value])

onMounted(async () => {
  if (auth.isLoggedIn) {
    const [rows, exams] = await Promise.allSettled([
      fetchAllPracticeState(),
      supabase
        .from('exam_records')
        .select('*')
        .eq('user_id', auth.session.user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    ])
    if (rows.status === 'fulfilled') practiceRows.value = rows.value
    const e = exams.status === 'fulfilled' ? exams.value : null
    if (e && !e.error && e.data) {
      cloudExams.value = e.data.map((r) => ({
        subject: r.subject,
        score: r.score,
        passed: r.passed,
        correct: r.correct,
        total: r.total,
        usedSec: r.used_sec,
        time: new Date(r.created_at).getTime()
      }))
    }
  }
  loaded.value = true
})

const toId = (s) => (/^\d+$/.test(String(s)) ? Number(s) : s)

// 各知识点作答统计（来自数据库 practice_state）
const attempts = computed(() => {
  const perP = {}
  for (const r of practiceRows.value) {
    if (r.ok === null || r.ok === undefined) continue
    const q = bank.allQuestions.find((x) => x.id === toId(r.question_id))
    if (!q || q.subject !== subject.value) continue
    const p = primaryPoint(q)
    const rec = perP[p.id] || (perP[p.id] = { point: p, ok: 0, no: 0 })
    if (r.ok) rec.ok++
    else rec.no++
  }
  return Object.values(perP)
})

const totalAttempts = computed(() => attempts.value.reduce((s, r) => s + r.ok + r.no, 0))
const okAttempts = computed(() => attempts.value.reduce((s, r) => s + r.ok, 0))
const totalRate = computed(() => (totalAttempts.value ? Math.round((okAttempts.value / totalAttempts.value) * 100) : null))

const wrongByPoint = computed(() => {
  const perP = {}
  for (const id of user.wrongIds) {
    const q = bank.allQuestions.find((x) => x.id === id)
    if (!q || q.subject !== subject.value) continue
    const p = primaryPoint(q)
    perP[p.id] = (perP[p.id] || 0) + 1
  }
  return perP
})

const pointStats = computed(() => {
  const totalByPoint = {}
  for (const q of bank.questionsBySubject(subject.value)) {
    const p = primaryPoint(q)
    totalByPoint[p.id] = (totalByPoint[p.id] || 0) + 1
  }
  const rows = Object.entries(totalByPoint).map(([pid, total]) => {
    const att = attempts.value.find((a) => a.point.id === pid)
    const done = att ? att.ok + att.no : 0
    return {
      pid,
      name: POINT_NAME_BY_ID[pid] || pid,
      total,
      done,
      ok: att ? att.ok : 0,
      wrong: wrongByPoint.value[pid] || 0,
      rate: done ? Math.round((att.ok / done) * 100) : null
    }
  })
  rows.sort((a, b) => {
    if (a.rate === null && b.rate === null) return 0
    if (a.rate === null) return 1
    if (b.rate === null) return -1
    return a.rate - b.rate
  })
  return rows
})

const weakest = computed(() => pointStats.value.filter((r) => r.rate !== null).slice(0, 8))

const wrongCount = computed(() => user.wrongIds.filter((id) => {
  const q = bank.allQuestions.find((x) => x.id === id)
  return q && q.subject === subject.value
}).length)

const favCount = computed(() => user.favIds.filter((id) => {
  const q = bank.allQuestions.find((x) => x.id === id)
  return q && q.subject === subject.value
}).length)

// 考试记录（云端全量优先，本地兜底），按时间升序
const examList = computed(() => {
  const list = (cloudExams.value !== null ? cloudExams.value : user.examHistory)
    .filter((h) => h.subject === subject.value)
    .slice()
    .sort((a, b) => a.time - b.time)
  return list.slice(-20)
})

const examCount = computed(() => (cloudExams.value !== null ? cloudExams.value.filter((h) => h.subject === subject.value).length : user.examHistory.filter((h) => h.subject === subject.value).length))
const examPassed = computed(() => (cloudExams.value !== null ? cloudExams.value.filter((h) => h.subject === subject.value && h.passed).length : user.examHistory.filter((h) => h.subject === subject.value && h.passed).length))

// SVG 折线图
const CHART_W = 720
const CHART_H = 280
const PAD = 36
const chartPoints = computed(() => {
  const list = examList.value
  if (!list.length) return ''
  return list
    .map((h, i) => {
      const x = list.length === 1 ? CHART_W / 2 : PAD + (i * (CHART_W - PAD * 2)) / (list.length - 1)
      const y = PAD + (1 - h.score / 100) * (CHART_H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function rateColor(rate) {
  if (rate === null) return 'var(--text-3)'
  if (rate >= 80) return 'var(--success)'
  if (rate >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

function goPoint(pid) {
  router.push({ name: 'practice', params: { subject: subject.value, mode: 'point', chapter: pid } })
}
</script>

<template>
  <div class="page stats-page">
    <div v-if="!loaded" class="card loading-card">
      <span class="spinner" />
      正在加载统计数据…
    </div>
    <template v-else>
    <div class="seg seg-main">
      <button v-for="sub in [1, 4]" :key="sub" :class="{ active: subject === sub }" @click="subject = sub">
        {{ sub === 1 ? '科目一' : '科目四' }}
      </button>
    </div>

    <div class="overview">
      <div class="card ov-card">
        <div class="ov-num">{{ totalAttempts }}</div>
        <div class="ov-label">累计答题</div>
      </div>
      <div class="card ov-card">
        <div class="ov-num" :class="rateColor(totalRate)">{{ totalRate === null ? '—' : totalRate + '%' }}</div>
        <div class="ov-label">练习正确率</div>
      </div>
      <div class="card ov-card">
        <div class="ov-num">{{ examCount }}</div>
        <div class="ov-label">模拟考试</div>
      </div>
      <div class="card ov-card">
        <div class="ov-num" :class="examPassed ? 'c-green' : ''">{{ examPassed }}</div>
        <div class="ov-label">通过次数</div>
      </div>
      <div class="card ov-card">
        <div class="ov-num c-red">{{ wrongCount }}</div>
        <div class="ov-label">当前错题</div>
      </div>
      <div class="card ov-card">
        <div class="ov-num c-amber">{{ favCount }}</div>
        <div class="ov-label">收藏</div>
      </div>
    </div>

    <div class="card">
      <div class="panel-title">模拟考试分数趋势（最近 20 次）</div>
      <div v-if="examList.length >= 2" class="chart-wrap">
        <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="chart">
          <line v-for="y in [0, 50, 100]" :key="y" :x1="PAD" :y1="PAD + (1 - y / 100) * (CHART_H - PAD * 2)" :x2="CHART_W - PAD" :y2="PAD + (1 - y / 100) * (CHART_H - PAD * 2)" class="grid-line" />
          <line :x1="PAD" :y1="PAD + (1 - 0.9) * (CHART_H - PAD * 2)" :x2="CHART_W - PAD" :y2="PAD + (1 - 0.9) * (CHART_H - PAD * 2)" class="pass-line" />
          <polyline :points="chartPoints" class="score-line" />
          <circle v-for="(h, i) in examList" :key="i" :cx="examList.length === 1 ? CHART_W / 2 : PAD + (i * (CHART_W - PAD * 2)) / (examList.length - 1)" :cy="PAD + (1 - h.score / 100) * (CHART_H - PAD * 2)" r="4" class="dot" :class="h.passed ? 'ok' : 'no'" />
          <text :x="PAD - 10" :y="PAD + (1 - 1) * (CHART_H - PAD * 2) + 4" class="axis-label">100</text>
          <text :x="PAD - 16" :y="PAD + (1 - 0.9) * (CHART_H - PAD * 2) + 4" class="axis-label pass">90</text>
          <text :x="PAD - 10" :y="PAD + (1 - 0) * (CHART_H - PAD * 2) + 4" class="axis-label">0</text>
          <text :x="PAD" :y="CHART_H - 8" class="axis-label">{{ fmtDate(examList[0].time) }}</text>
          <text :x="CHART_W - PAD - 30" :y="CHART_H - 8" class="axis-label">{{ fmtDate(examList[examList.length - 1].time) }}</text>
        </svg>
      </div>
      <div v-else class="no-chart">考试次数不足 2 次，做几次模拟考试后这里会显示分数趋势图</div>
    </div>

    <div class="card">
      <div class="panel-title">薄弱知识点 TOP8（按正确率从低到高）</div>
      <div v-if="weakest.length" class="weak-list">
        <button v-for="r in weakest" :key="r.pid" class="weak-row" @click="goPoint(r.pid)">
          <span class="weak-name">{{ r.name }}</span>
          <span class="weak-bar-track">
            <span class="weak-bar" :style="{ width: (r.rate ?? 0) + '%', background: rateColor(r.rate) }" />
          </span>
          <span class="weak-rate" :style="{ color: rateColor(r.rate) }">{{ r.rate }}%</span>
          <span class="weak-detail">{{ r.done }}/{{ r.total }}题</span>
        </button>
      </div>
      <div v-else class="no-chart">还没有练习数据，先去刷几道题吧</div>
    </div>

    <div class="card">
      <div class="panel-title">全部知识点掌握度（点击进入专项练习）</div>
      <div class="point-list">
        <button v-for="r in pointStats" :key="r.pid" class="point-row" @click="goPoint(r.pid)">
          <div class="point-row-top">
            <span class="point-name">{{ r.name }}</span>
            <span class="point-detail">
              <template v-if="r.rate !== null">已练 {{ r.done }}/{{ r.total }} · 正确率 <b :style="{ color: rateColor(r.rate) }">{{ r.rate }}%</b> · 错题 {{ r.wrong }}</template>
              <template v-else>未练习（共 {{ r.total }} 题）</template>
            </span>
          </div>
          <div class="point-bar-track">
            <div class="point-bar" :style="{ width: (r.rate ?? 0) + '%', background: rateColor(r.rate) }" />
          </div>
        </button>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 980px;
  margin: 0 auto;
}

.loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: var(--text-2);
  font-size: 14px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid #dbe4ff;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.seg-main {
  max-width: 420px;
  margin: 0 auto 18px;
}

.overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

@media (min-width: 1024px) {
  .overview {
    grid-template-columns: repeat(6, 1fr);
  }
}

.ov-card {
  text-align: center;
  padding: 16px 8px;
}

.ov-num {
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.ov-num.c-red { color: var(--danger); }
.ov-num.c-green { color: var(--success); }
.ov-num.c-amber { color: #c47b04; }

.ov-label {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 2px;
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

.chart-wrap {
  width: 100%;
  overflow-x: auto;
}

.chart {
  width: 100%;
  min-width: 520px;
  height: auto;
}

.grid-line {
  stroke: #e8edf8;
  stroke-width: 1;
}

.pass-line {
  stroke: var(--danger);
  stroke-width: 1.5;
  stroke-dasharray: 6 5;
  opacity: 0.7;
}

.score-line {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dot.ok { fill: var(--success); }
.dot.no { fill: var(--danger); }

.axis-label {
  font-size: 11px;
  fill: var(--text-3);
}

.axis-label.pass {
  fill: var(--danger);
}

.no-chart {
  text-align: center;
  color: var(--text-2);
  font-size: 13.5px;
  padding: 24px 0;
}

.weak-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weak-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 8px;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  transition: background 0.15s;
}

.weak-row:hover {
  background: #f4f7fd;
}

.weak-name {
  width: 130px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
}

.weak-bar-track {
  flex: 1;
  height: 10px;
  background: #eef1f8;
  border-radius: 5px;
  overflow: hidden;
}

.weak-bar {
  display: block;
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s;
}

.weak-rate {
  width: 52px;
  text-align: right;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
}

.weak-detail {
  width: 76px;
  text-align: right;
  font-size: 12px;
  color: var(--text-2);
}

.point-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-row {
  background: transparent;
  text-align: left;
  border-radius: 10px;
  padding: 6px 8px;
  transition: background 0.15s;
}

.point-row:hover {
  background: #f4f7fd;
}

.point-row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}

.point-name {
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.point-detail {
  font-size: 12.5px;
  color: var(--text-2);
}

.point-bar-track {
  height: 8px;
  background: #eef1f8;
  border-radius: 4px;
  overflow: hidden;
}

.point-bar {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
</style>
