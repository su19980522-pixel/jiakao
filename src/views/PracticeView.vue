<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuestionCard from '../components/QuestionCard.vue'
import { useBankStore } from '../stores/bank'
import { useUserStore } from '../stores/user'
import { shuffle, isCorrect, LETTERS, primaryPoint } from '../utils/question'
import { CHAPTER_NAME_BY_ID } from '../data/chapters'
import { POINT_NAME_BY_ID } from '../data/knowledgePoints'
import { syncPracticeState, clearPracticeState, fetchPracticeState } from '../utils/cloudSync'

const route = useRoute()
const router = useRouter()
const bank = useBankStore()
const user = useUserStore()

const subject = computed(() => Number(route.params.subject))
const mode = computed(() => route.params.mode)
const chapter = computed(() => route.params.chapter || 'all')

const list = ref([])
const current = ref(0)
const selectionsMap = reactive({})
const answeredMap = reactive({})
const finished = ref(false)
const cardRef = ref(null)
const gridWrapRef = ref(null)
const loading = ref(false)
let autoTimer = null

const title = computed(() => {
  const map = {
    order: '顺序练习',
    random: '随机练习',
    chapter: '专项练习',
    point: '知识点练习',
    wrong: '错题本',
    favorite: '收藏夹'
  }
  let t = map[mode.value] || '练习'
  if (mode.value === 'chapter') {
    t = CHAPTER_NAME_BY_ID[chapter.value] || t
  }
  if (mode.value === 'point') {
    t = POINT_NAME_BY_ID[chapter.value] || t
  }
  return t
})

const posKey = computed(() => `${subject.value}_${mode.value}_${chapter.value}`)

function resetMaps() {
  Object.keys(selectionsMap).forEach((k) => delete selectionsMap[k])
  Object.keys(answeredMap).forEach((k) => delete answeredMap[k])
}

async function buildList() {
  let qs = bank.questionsBySubject(subject.value)
  if (mode.value === 'chapter') {
    qs = qs.filter((q) => q.chapter === chapter.value)
  } else if (mode.value === 'point') {
    qs = qs.filter((q) => primaryPoint(q).id === chapter.value)
  } else if (mode.value === 'wrong') {
    qs = qs.filter((q) => user.wrongIds.includes(q.id))
  } else if (mode.value === 'favorite') {
    qs = qs.filter((q) => user.favIds.includes(q.id))
  }
  if (mode.value === 'random' || mode.value === 'wrong' || mode.value === 'favorite') {
    qs = shuffle(qs)
  }
  if (mode.value === 'order' || mode.value === 'chapter' || mode.value === 'point') {
    const saved = user.practicePos[posKey.value]
    current.value = saved && saved < qs.length ? saved : 0
  } else {
    current.value = 0
  }
  list.value = qs
  resetMaps()
  clearAuto()
  finished.value = qs.length === 0
  if (!finished.value) {
    loading.value = true
    try {
      const state = await fetchPracticeState(posKey.value)
      Object.assign(selectionsMap, state.sels)
      Object.assign(answeredMap, state.ans)
    } catch (e) {
      console.warn('加载练习记录失败:', e.message)
    }
    loading.value = false
  }
}

buildList()

watch(
  () => route.fullPath,
  () => {
    buildList()
  }
)

const q = computed(() => list.value[current.value])
const total = computed(() => list.value.length)
const answeredCount = computed(() => Object.keys(answeredMap).length)
const progress = computed(() => total.value === 0 ? 0 : (answeredCount.value / total.value) * 100)
const correctCount = computed(() => Object.values(answeredMap).filter((v) => v === 'ok').length)

function clearAuto() {
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
}

function markAnswered(ok) {
  if (!q.value) return
  answeredMap[q.value.id] = ok ? 'ok' : 'no'
  syncPracticeState(posKey.value, q.value.id, ok, selectionsMap[q.value.id] || undefined)
  if (ok) {
    if (mode.value === 'wrong') user.removeWrong(q.value.id)
    clearAuto()
    autoTimer = setTimeout(() => {
      autoTimer = null
      if (!finished.value) next()
    }, 1300)
  } else {
    user.addWrong(q.value.id)
  }
}

function next() {
  clearAuto()
  if (current.value < total.value - 1) {
    user.setPracticePos(posKey.value, current.value + 1)
    current.value++
  } else {
    user.setPracticePos(posKey.value, 0)
    finished.value = true
  }
}

function prev() {
  clearAuto()
  if (current.value > 0) current.value--
}

function jumpTo(i) {
  if (i >= 0 && i < total.value) {
    clearAuto()
    current.value = i
    window.scrollTo({ top: 0 })
  }
}

function scrollGridToCurrent() {
  nextTick(() => {
    const wrap = gridWrapRef.value
    const cell = wrap?.querySelector('.grid-cell.current')
    if (wrap && cell) {
      wrap.scrollTop = cell.offsetTop - wrap.clientHeight / 2 + cell.clientHeight / 2
    }
  })
}

watch(current, scrollGridToCurrent)

function toggleFav() {
  if (q.value) user.toggleFav(q.value.id)
}

function setSel(v) {
  if (!q.value) return
  selectionsMap[q.value.id] = v
  syncPracticeState(posKey.value, q.value.id, null, v)
}

function restart() {
  clearPracticeState(posKey.value)
  buildList()
}

function selectByKey(k) {
  if (!q.value || answeredMap[q.value.id] !== undefined) return
  const idx = LETTERS.indexOf(k)
  if (idx < 0 || idx >= q.value.options.length) return
  let next
  if (q.value.type === 'multi') {
    const cur = selectionsMap[q.value.id] || []
    next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]
  } else {
    next = [k]
  }
  selectionsMap[q.value.id] = next
  if (q.value.type !== 'multi') {
    markAnswered(isCorrect(q.value, next))
  }
}

function onKey(e) {
  if (finished.value || !q.value) return
  const k = e.key.toUpperCase()
  if (k === 'ARROWRIGHT') {
    e.preventDefault()
    next()
  } else if (k === 'ARROWLEFT') {
    e.preventDefault()
    prev()
  } else if (e.key === 'Enter') {
    if (q.value.type === 'multi' && answeredMap[q.value.id] === undefined) {
      cardRef.value?.submit()
    } else if (answeredMap[q.value.id] !== undefined) {
      next()
    }
  } else if (/^[A-D1-4]$/.test(k)) {
    selectByKey(/^\d$/.test(k) ? LETTERS[Number(k) - 1] : k)
  } else if (k === 'F') {
    toggleFav()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearAuto()
})

function cellClass(id, i) {
  return {
    current: i === current.value,
    ok: answeredMap[id] === 'ok',
    no: answeredMap[id] === 'no'
  }
}
</script>

<template>
  <div class="page practice-page">
    <div class="p-head card mobile-only">
      <div class="p-title-row">
        <span class="p-title">{{ title }}</span>
        <span class="p-count">{{ current + 1 }} / {{ total }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-bar" :style="{ width: progress + '%' }" />
      </div>
    </div>

    <div v-if="finished" class="card summary">
      <div class="sum-icon">{{ correctCount === total && total > 0 ? '🎉' : '📋' }}</div>
      <div class="sum-title">练习完成</div>
      <div class="sum-stats">
        <span>共 {{ total }} 题</span>
        <span class="ok">答对 {{ correctCount }}</span>
        <span class="no">答错 {{ total - correctCount }}</span>
      </div>
      <p v-if="mode === 'wrong'" class="sum-tip">答对的错题已自动移出错题本</p>
      <button class="btn btn-primary" style="width: 100%" @click="restart">再来一轮</button>
      <button class="btn btn-plain" style="width: 100%; margin-top: 10px" @click="router.push('/')">返回首页</button>
    </div>

    <div v-else class="layout">
      <div class="main">
        <div v-if="loading" class="card loading-card">
          <span class="spinner" />
          正在加载练习记录…
        </div>
        <template v-else>
          <div class="q-index-row">
            <span class="q-index">{{ current + 1 }} / {{ total }}</span>
          </div>
          <QuestionCard
            ref="cardRef"
            :key="q.id + '-' + current"
            :question="q"
            mode="practice"
            :model-value="selectionsMap[q.id] || []"
            :reveal="answeredMap[q.id] !== undefined"
            :auto-next="true"
            @update:model-value="setSel"
            @answered="markAnswered"
          />
        </template>

        <div class="actions mobile-only">
          <button class="btn btn-plain" :disabled="current === 0" @click="prev">上一题</button>
          <button class="btn btn-outline" :class="{ faved: user.isFav(q.id) }" @click="toggleFav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
            </svg>
            {{ user.isFav(q.id) ? '已收藏' : '收藏' }}
          </button>
          <button class="btn btn-primary" @click="next">
            {{ current === total - 1 ? '完成' : '下一题' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <aside class="side-col">
        <div class="side card">
          <div class="p-title-row">
            <span class="p-title">{{ title }}</span>
            <span class="p-count">{{ current + 1 }} / {{ total }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: progress + '%' }" />
          </div>
          <div class="progress-nums">
            <span>已完成 {{ answeredCount }} / {{ total }}</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>

          <div class="grid-wrap" ref="gridWrapRef">
            <div class="grid">
              <button
                v-for="(qu, i) in list"
                :key="qu.id"
                class="grid-cell"
                :class="cellClass(qu.id, i)"
                @click="jumpTo(i)"
              >
                {{ i + 1 }}
              </button>
            </div>
          </div>

          <div class="grid-legend">
            <span><i class="dot ok" />答对 {{ correctCount }}</span>
            <span><i class="dot no" />答错 {{ answeredCount - correctCount }}</span>
            <span><i class="dot pending" />未做 {{ total - answeredCount }}</span>
          </div>

          <div class="side-actions">
            <button class="btn btn-plain" :disabled="current === 0" @click="prev">上一题</button>
            <button class="btn btn-outline side-fav" :class="{ faved: user.isFav(q.id) }" @click="toggleFav">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
              </svg>
            </button>
            <button class="btn btn-primary" @click="next">
              {{ current === total - 1 ? '完成' : '下一题' }}
            </button>
          </div>

          <div class="kbd-hint">
            快捷键：<b>A</b>-<b>D</b> 选择 · <b>←</b><b>→</b> 翻题 · <b>Enter</b> 确认/下一题 · <b>F</b> 收藏
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.practice-page {
  width: 100%;
}

.p-head {
  padding: 14px 18px;
}

.p-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.p-title {
  font-weight: 700;
  font-size: 15px;
}

.p-count {
  color: var(--text-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.progress-track {
  height: 7px;
  background: #e8edf8;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--grad-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-nums {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-2);
  margin-top: 8px;
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

.q-index-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
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

.q-index {
  font-size: 12.5px;
  color: var(--text-2);
  background: #e9edf7;
  padding: 3px 12px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.side {
  width: 350px;
  position: sticky;
  top: 78px;
  padding: 18px;
}

.grid-wrap {
  max-height: calc(100vh - 400px);
  min-height: 180px;
  overflow-y: auto;
  margin-top: 14px;
  padding-right: 4px;
  border-radius: 8px;
  scroll-behavior: smooth;
}

.grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 7px;
}

.grid-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  background: #f0f3fa;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.13s ease;
}

.grid-cell:hover {
  transform: translateY(-1px);
  background: #e4e9f5;
}

.grid-cell.current {
  outline: 2.5px solid var(--primary);
  outline-offset: 1px;
  color: var(--primary);
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(59, 110, 246, 0.3);
}

.grid-cell.ok {
  background: var(--success-soft);
  color: var(--success-strong);
}

.grid-cell.no {
  background: var(--danger-soft);
  color: var(--danger-strong);
}

.grid-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-2);
  align-items: center;
}

.grid-legend .dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
  margin-right: 5px;
}

.dot.ok { background: #8fd9b4; }
.dot.no { background: #f4b6b8; }
.dot.pending { background: #e0e6f3; }

.side-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.side-actions .btn {
  flex: 1;
  padding: 10px 8px;
  font-size: 13.5px;
}

.side-fav {
  flex: 0 0 46px !important;
  padding: 10px 0 !important;
}

.side-fav svg {
  width: 17px;
  height: 17px;
}

.faved {
  background: var(--warning-soft) !important;
  border-color: #f0c470 !important;
  color: #c47b04 !important;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.actions .btn {
  flex: 1;
  padding: 12px 10px;
}

.actions svg {
  width: 18px;
  height: 18px;
}

.summary {
  text-align: center;
  padding: 40px 24px;
  max-width: 620px;
  margin: 0 auto;
}

.sum-icon {
  font-size: 52px;
  margin-bottom: 10px;
}

.sum-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
}

.sum-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 20px;
}

.sum-stats .ok {
  color: var(--success-strong);
  font-weight: 700;
}

.sum-stats .no {
  color: var(--danger-strong);
  font-weight: 700;
}

.sum-tip {
  font-size: 12.5px;
  color: #c47b04;
  margin-bottom: 16px;
}
</style>
