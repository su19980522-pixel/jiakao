<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'
import { useBankStore } from '../stores/bank'
import { useUserStore } from '../stores/user'
import { shuffle, isCorrect, formatTime, LETTERS } from '../utils/question'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const user = useUserStore()

const subject = computed(() => Number(route.params.subject))
const EXAM_CONFIG = {
  1: { count: 100, minutes: 45, mix: { judge: 40, single: 60 }, mixLabel: '判断题 40 · 单选题 60' },
  4: { count: 50, minutes: 30, mix: { single: 20, judge: 20, multi: 10 }, mixLabel: '单选 20 · 判断 20 · 多选 10' }
}
const config = computed(() => EXAM_CONFIG[subject.value])

const questions = ref([])
const answers = ref({})
const current = ref(0)
const remainSec = ref(config.value.minutes * 60)
const phase = ref('exam')
const score = ref(0)
const passed = ref(false)
const usedSec = ref(0)
let timer = null

function init() {
  const pool = bank.questionsBySubject(subject.value)
  const cfg = config.value
  const byType = {
    single: pool.filter((q) => q.type === 'single'),
    judge: pool.filter((q) => q.type === 'judge'),
    multi: pool.filter((q) => q.type === 'multi')
  }
  const picked = []
  for (const t of ['single', 'judge', 'multi']) {
    const want = cfg.mix[t] || 0
    if (want > 0) {
      picked.push(...shuffle(byType[t]).slice(0, want))
    }
  }
  const target = Math.min(cfg.count, pool.length)
  if (picked.length < target) {
    const pickedIds = new Set(picked.map((q) => q.id))
    const rest = shuffle(pool.filter((q) => !pickedIds.has(q.id)))
    picked.push(...rest.slice(0, target - picked.length))
  }
  questions.value = shuffle(picked).slice(0, target)
  answers.value = {}
  current.value = 0
  remainSec.value = cfg.minutes * 60
  phase.value = 'exam'
  score.value = 0
  passed.value = false
  startTimer()
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    remainSec.value--
    if (remainSec.value <= 0) {
      remainSec.value = 0
      submit(true)
    }
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onBeforeUnmount(stopTimer)

init()

const q = computed(() => questions.value[current.value])
const total = computed(() => questions.value.length)
const answeredCount = computed(() => Object.values(answers.value).filter((a) => a.length > 0).length)
const sheetCols = computed(() => (subject.value === 1 ? 10 : 5))
const correctNum = computed(() => questions.value.filter((x) => isCorrect(x, answers.value[x.id] || [])).length)
const examName = computed(() => (subject.value === 1 ? '科目一' : '科目四'))

function submit(auto = false) {
  if (!auto && !confirm(`已作答 ${answeredCount.value}/${total.value} 题，确定交卷吗？`)) return
  stopTimer()
  usedSec.value = config.value.minutes * 60 - remainSec.value
  score.value = Math.round((correctNum.value / total.value) * 100)
  passed.value = score.value >= 90
  phase.value = 'result'
  user.addExamRecord({
    subject: subject.value,
    score: score.value,
    passed: passed.value,
    correct: correctNum.value,
    total: total.value,
    usedSec: usedSec.value,
    time: Date.now()
  })
}

function goTo(i) {
  current.value = i
  window.scrollTo({ top: 0 })
}

function restart() {
  init()
}

function selectByKey(k) {
  const qu = q.value
  if (!qu) return
  const idx = LETTERS.indexOf(k)
  if (idx < 0 || idx >= qu.options.length) return
  const cur = answers.value[qu.id] || []
  let next
  if (qu.type === 'multi') {
    next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]
  } else {
    next = [k]
  }
  answers.value[qu.id] = next
}

function onKey(e) {
  if (phase.value !== 'exam') return
  const k = e.key.toUpperCase()
  if (k === 'ARROWRIGHT') {
    e.preventDefault()
    if (current.value < total.value - 1) current.value++
  } else if (k === 'ARROWLEFT') {
    e.preventDefault()
    if (current.value > 0) current.value--
  } else if (e.key === 'Enter') {
    submit(false)
  } else if (/^[A-D1-4]$/.test(k)) {
    selectByKey(/^\d$/.test(k) ? LETTERS[Number(k) - 1] : k)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function sheetClass(i) {
  return {
    current: i === current.value,
    answered: (answers.value[questions.value[i].id] || []).length > 0
  }
}
</script>

<template>
  <div class="page exam-page">
    <template v-if="phase === 'exam'">
      <div class="layout">
        <div class="main">
          <div class="exam-head card mobile-only">
            <div class="timer" :class="{ warn: remainSec <= 300 }">{{ formatTime(remainSec) }}</div>
            <div class="exam-info">
              <span>{{ examName }} · {{ total }} 题</span>
              <span class="dot">·</span>
              <span>已答 {{ answeredCount }}</span>
            </div>
            <div class="mix-info">{{ config.mixLabel }}</div>
          </div>

          <div v-if="q">
            <div class="q-index-row">
              <span class="q-index">第 {{ current + 1 }} 题 / 共 {{ total }} 题</span>
            </div>
            <QuestionCard
              :key="q.id + current"
              :question="q"
              mode="exam"
              :model-value="answers[q.id] || []"
              @update:model-value="(v) => (answers[q.id] = v)"
            />
          </div>

          <div class="exam-nav mobile-only">
            <button class="btn btn-plain" :disabled="current === 0" @click="current--">上一题</button>
            <button class="btn btn-danger" @click="submit(false)">交卷</button>
            <button class="btn btn-primary" :disabled="current === total - 1" @click="current++">下一题</button>
          </div>
        </div>

        <aside class="side-col">
          <div class="side card">
            <div class="timer-panel" :class="{ warn: remainSec <= 300 }">
              <div class="timer-label">剩余时间</div>
              <div class="timer">{{ formatTime(remainSec) }}</div>
            </div>

            <div class="exam-info">
              <span>{{ examName }} · {{ total }} 题</span>
              <span class="dot">·</span>
              <span>已答 {{ answeredCount }}</span>
            </div>
            <div class="mix-info">{{ config.mixLabel }}</div>

            <div class="sheet-title">
              <span>答题卡</span>
              <span class="sheet-progress">{{ Math.round((answeredCount / total) * 100) }}%</span>
            </div>

            <div class="sheet-toggle" :style="{ gridTemplateColumns: `repeat(${sheetCols}, 1fr)` }">
              <button
                v-for="(_, i) in questions"
                :key="i"
                class="sheet-cell"
                :class="sheetClass(i)"
                @click="goTo(i)"
              >
                {{ i + 1 }}
              </button>
            </div>

            <div class="sheet-legend">
              <span><i class="s-dot answered" />已答</span>
              <span><i class="s-dot pending" />未答</span>
            </div>

            <button class="btn btn-danger submit-btn" @click="submit(false)">
              交 卷
            </button>

            <div class="kbd-hint">
              快捷键：<b>A</b>-<b>D</b> 选择 · <b>←</b><b>→</b> 翻题 · <b>Enter</b> 交卷
            </div>
          </div>
        </aside>
      </div>
    </template>

    <template v-else>
      <div class="result card">
        <div class="result-ring" :class="passed ? 'pass' : 'fail'" :style="{ '--p': score }">
          <div class="ring-inner">
            <div class="score-num">{{ score }}</div>
            <div class="score-unit">分</div>
          </div>
        </div>
        <div class="result-verdict" :class="passed ? 'pass' : 'fail'">
          {{ passed ? '恭喜，考试合格！' : '未达到 90 分，继续加油！' }}
        </div>
        <div class="result-detail">
          答对 <b>{{ correctNum }}</b>/{{ total }} 题 · 用时 {{ Math.floor(usedSec / 60) }}分{{ usedSec % 60 }}秒
          <span v-if="total < (subject === 1 ? 100 : 50)">· 题库不足，已用全部题目</span>
        </div>
        <div class="result-btns">
          <button class="btn btn-primary btn-lg" @click="restart">再考一次</button>
          <button class="btn btn-plain btn-lg" @click="router.push('/')">返回首页</button>
        </div>
      </div>

      <div class="review-title">错题回顾</div>
      <template v-for="(qu, i) in questions" :key="qu.id">
        <div v-if="!isCorrect(qu, answers[qu.id] || [])" class="review-item">
          <div class="review-tag">
            第 {{ i + 1 }} 题
            <span class="review-your">你的答案：{{ (answers[qu.id] || []).join('、') || '未作答' }}</span>
          </div>
          <QuestionCard
            :question="qu"
            mode="review"
            :model-value="answers[qu.id] || []"
            reveal
          />
        </div>
      </template>
      <div v-if="total > 0 && correctNum === total" class="card empty">
        <div class="icon">🎉</div>
        全部答对，没有错题！
      </div>
    </template>
  </div>
</template>

<style scoped>
.exam-page {
  width: 100%;
}

.layout {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.main {
  flex: 1;
  min-width: 0;
}

.exam-head {
  padding: 14px 18px;
}

.side {
  width: 350px;
  position: sticky;
  top: 78px;
  padding: 18px;
}

/* ---------- 计时器 ---------- */
.timer-panel {
  text-align: center;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  margin-bottom: 10px;
}

.timer-panel.warn {
  background: var(--danger-soft);
}

.timer-label {
  font-size: 12px;
  color: var(--text-2);
  font-weight: 600;
  letter-spacing: 2px;
}

.timer {
  font-size: 30px;
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

.timer.warn,
.timer-panel.warn .timer {
  color: var(--danger);
}

.timer-panel.warn {
  animation: pulse 1.2s ease infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.7;
  }
}

.exam-info {
  text-align: center;
  font-size: 13px;
  color: var(--text-2);
  margin: 4px 0 14px;
}

.dot {
  margin: 0 6px;
}

.mix-info {
  text-align: center;
  font-size: 12px;
  color: var(--text-3);
  margin-top: -8px;
  margin-bottom: 12px;
}

.sheet-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
}

.sheet-progress {
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.sheet-toggle {
  display: grid;
  gap: 6px;
}

.sheet-cell {
  aspect-ratio: 1;
  border-radius: 7px;
  background: #f0f3fa;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.13s ease;
}

.sheet-cell:hover {
  transform: translateY(-1px);
  background: #e4e9f5;
}

.sheet-cell.answered {
  background: #dbe7ff;
  color: var(--primary-strong);
}

.sheet-cell.current {
  outline: 2.5px solid var(--primary);
  outline-offset: 1px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(59, 110, 246, 0.3);
}

.sheet-legend {
  display: flex;
  gap: 14px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-2);
}

.s-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
  margin-right: 5px;
}

.s-dot.answered { background: #9dbcf7; }
.s-dot.pending { background: #e0e6f3; }

.submit-btn {
  width: 100%;
  margin-top: 16px;
  padding: 13px;
  font-size: 16px;
  letter-spacing: 4px;
}

.q-index-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.q-index {
  font-size: 12.5px;
  color: var(--text-2);
  background: #e9edf7;
  padding: 3px 12px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.exam-nav {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.exam-nav .btn {
  flex: 1;
  padding: 12px 10px;
}

/* ---------- 成绩 ---------- */
.result {
  text-align: center;
  padding: 44px 28px;
  max-width: 620px;
  margin: 0 auto;
}

.result-ring {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--ring-color) calc(var(--p) * 1%), #edf0f9 0);
  animation: ringIn 0.7s ease;
}

.result-ring.pass {
  --ring-color: #17a45c;
}

.result-ring.fail {
  --ring-color: #e5484d;
}

@keyframes ringIn {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.ring-inner {
  width: 152px;
  height: 152px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 10px rgba(26, 36, 64, 0.06);
}

.score-num {
  font-size: 56px;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.score-unit {
  font-size: 14px;
  color: var(--text-2);
  margin-top: 4px;
  letter-spacing: 2px;
}

.result-verdict {
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 8px;
}

.result-verdict.pass {
  color: var(--success-strong);
}

.result-verdict.fail {
  color: var(--danger-strong);
}

.result-detail {
  font-size: 13.5px;
  color: var(--text-2);
  margin-bottom: 22px;
}

.result-detail b {
  color: var(--text);
}

.result-btns {
  display: flex;
  gap: 12px;
}

.result-btns .btn {
  flex: 1;
}

/* ---------- 错题回顾 ---------- */
.review-title {
  font-weight: 800;
  font-size: 17px;
  margin: 26px 4px 12px;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-title::before {
  content: '';
  width: 4px;
  height: 17px;
  border-radius: 2px;
  background: var(--grad-primary);
}

.review-item {
  max-width: 620px;
  margin: 0 auto 16px;
}

.review-tag {
  font-size: 12.5px;
  color: var(--text-2);
  margin-bottom: 6px;
}

.review-your {
  color: var(--danger-strong);
  margin-left: 8px;
}
</style>
