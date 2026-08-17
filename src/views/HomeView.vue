<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBankStore } from '../stores/bank'
import { useUserStore } from '../stores/user'
import { CHAPTERS, SUBJECT_NAMES } from '../data/chapters'
import { KNOWLEDGE_POINTS } from '../data/knowledgePoints'
import { primaryPoint } from '../utils/question'

const router = useRouter()
const bank = useBankStore()
const user = useUserStore()

const subject = ref(1)
const showChapters = ref(false)
const showPoints = ref(false)

const chapters = computed(() => CHAPTERS[subject.value])
const points = computed(() => KNOWLEDGE_POINTS[subject.value])
const total = computed(() => bank.countBySubject(subject.value))
const wrongCount = computed(() => user.wrongIds.filter((id) => {
  const q = bank.allQuestions.find((x) => x.id === id)
  return q && q.subject === subject.value
}).length)
const favCount = computed(() => user.favIds.filter((id) => {
  const q = bank.allQuestions.find((x) => x.id === id)
  return q && q.subject === subject.value
}).length)
const history = computed(() => user.examHistory.filter((h) => h.subject === subject.value))

const chapterCounts = computed(() => {
  const map = {}
  for (const q of bank.questionsBySubject(subject.value)) {
    map[q.chapter] = (map[q.chapter] || 0) + 1
  }
  return map
})

const pointCounts = computed(() => {
  const map = {}
  for (const q of bank.questionsBySubject(subject.value)) {
    const id = primaryPoint(q).id
    map[id] = (map[id] || 0) + 1
  }
  return map
})

function goPractice(mode, chapter) {
  router.push({ name: 'practice', params: { subject: subject.value, mode, chapter: chapter || 'all' } })
}

function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MODES = [
  {
    key: 'order',
    name: '顺序练习',
    desc: '按顺序逐题精刷',
    color: '#3b6ef6',
    bg: 'rgba(59,110,246,0.1)',
    icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z'
  },
  {
    key: 'random',
    name: '随机练习',
    desc: '随机抽题查漏补缺',
    color: '#0ea5a5',
    bg: 'rgba(14,165,165,0.1)',
    icon: 'M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7'
  },
  {
    key: 'point',
    name: '知识点练习',
    desc: '按知识点分类突破',
    color: '#d946ef',
    bg: 'rgba(217,70,239,0.1)',
    icon: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.5 1 1.3 1 2.1V16h6v-.4c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z'
  },
  {
    key: 'chapter',
    name: '专项练习',
    desc: '按章节分类突破',
    color: '#e8890c',
    bg: 'rgba(232,137,12,0.1)',
    icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'
  },
  {
    key: 'exam',
    name: '模拟考试',
    desc: subject === 1 ? '100题 · 45分钟 · 90分及格' : '50题 · 30分钟 · 90分及格',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    icon: 'M9 5h6a2 2 0 0 1 2 2v12l-4-2-4 2V7a2 2 0 0 1 2-2zM4 9h3M4 13h3M4 17h3'
  },
  {
    key: 'wrong',
    name: '错题本',
    desc: `${wrongCount.value} 道错题待巩固`,
    color: '#e5484d',
    bg: 'rgba(229,72,77,0.1)',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6'
  },
  {
    key: 'favorite',
    name: '收藏夹',
    desc: `${favCount.value} 道收藏题目`,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'
  }
]

function modeAction(key) {
  if (key === 'exam') {
    router.push({ name: 'exam', params: { subject: subject.value } })
  } else if (key === 'chapter') {
    showPoints.value = false
    showChapters.value = !showChapters.value
  } else if (key === 'point') {
    showChapters.value = false
    showPoints.value = !showPoints.value
  } else {
    goPractice(key)
  }
}
</script>

<template>
  <div class="page home">
    <div class="seg seg-main">
      <button v-for="sub in [1, 4]" :key="sub" :class="{ active: subject === sub }" @click="subject = sub">
        {{ SUBJECT_NAMES[sub] }}
      </button>
    </div>

    <div class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-title">{{ SUBJECT_NAMES[subject] }} · 理论题库</div>
          <div class="hero-sub">共 {{ total }} 题 · 冲刺 90 分</div>
        </div>
        <div class="hero-badge">C1</div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <b>{{ total }}</b>
          <span>题目总数</span>
        </div>
        <div class="hero-divider" />
        <div class="hero-stat">
          <b class="c-red">{{ wrongCount }}</b>
          <span>待巩固错题</span>
        </div>
        <div class="hero-divider" />
        <div class="hero-stat">
          <b class="c-amber">{{ favCount }}</b>
          <span>我的收藏</span>
        </div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-lg btn-hero-primary" @click="goPractice('order')">
          开始刷题
        </button>
        <button class="btn btn-lg btn-hero-ghost" @click="router.push({ name: 'exam', params: { subject } })">
          模拟考试
        </button>
      </div>
    </div>

    <div class="section-title">练习模式</div>
    <div class="mode-grid">
      <button v-for="m in MODES" :key="m.key" class="mode-card" @click="modeAction(m.key)">
        <span class="mode-icon" :style="{ background: m.bg, color: m.color }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path :d="m.icon" />
          </svg>
        </span>
        <span class="mode-name">{{ m.name }}</span>
        <span class="mode-desc">{{ m.desc }}</span>
        <span class="mode-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>

    <div v-if="showPoints" class="card chapter-panel">
      <div class="panel-head">
        <span class="panel-title">选择知识点</span>
        <button class="panel-close" @click="showPoints = false">收起</button>
      </div>
      <button
        v-for="p in points"
        :key="p.id"
        class="chapter-item"
        @click="goPractice('point', p.id)"
      >
        <span class="chapter-dot point-dot" />
        <span class="chapter-name">{{ p.name }}</span>
        <span class="chapter-count">{{ pointCounts[p.id] || 0 }} 题</span>
        <span class="chapter-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>

    <div v-if="showChapters" class="card chapter-panel">
      <div class="panel-head">
        <span class="panel-title">选择章节</span>
        <button class="panel-close" @click="showChapters = false">收起</button>
      </div>
      <button
        v-for="c in chapters"
        :key="c.id"
        class="chapter-item"
        @click="goPractice('chapter', c.id)"
      >
        <span class="chapter-dot" />
        <span class="chapter-name">{{ c.name }}</span>
        <span class="chapter-count">{{ chapterCounts[c.id] || 0 }} 题</span>
        <span class="chapter-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>

    <div class="section-title">最近考试</div>
    <div class="card history-card">
      <div v-if="history.length === 0" class="no-record">
        <span class="no-record-icon">📝</span>
        暂无考试记录，去做一次模拟考试吧
      </div>
      <div v-for="(h, i) in history.slice(0, 5)" :key="i" class="record">
        <span class="record-score" :class="h.passed ? 'pass' : 'fail'">{{ h.score }}</span>
        <div class="record-info">
          <div class="record-title">{{ h.passed ? '考试合格' : '未达合格线' }}</div>
          <div class="record-time">{{ fmtDate(h.time) }}</div>
        </div>
        <span class="record-detail">{{ h.correct }}/{{ h.total }} 题 · 用时 {{ Math.floor(h.usedSec / 60) }}分{{ h.usedSec % 60 }}秒</span>
      </div>
    </div>

    <div class="manage-row">
      <button class="card manage-card" @click="router.push('/import')">
        <span class="manage-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
          </svg>
        </span>
        <span class="manage-text">
          <b>题库管理</b>
          <i>导入 / 导出 / 模板下载</i>
        </span>
        <span class="mode-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>

    <p class="footnote">题库来源于文档《科目一新规2309题》，仅供参考学习，正式考试以官方题库为准。</p>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.seg-main {
  max-width: 420px;
  margin: 0 auto;
}

/* ---------- hero ---------- */
.hero {
  margin-top: 18px;
  border-radius: 20px;
  padding: 26px 28px;
  color: #fff;
  background:
    radial-gradient(500px 200px at 90% -30%, rgba(255, 255, 255, 0.16), transparent 60%),
    var(--grad-header);
  box-shadow: 0 14px 34px rgba(47, 92, 240, 0.32);
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero-title {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.hero-sub {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.78;
}

.hero-badge {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 1px;
}

.hero-stats {
  display: flex;
  align-items: center;
  margin-top: 22px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
}

.hero-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hero-stat b {
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.hero-stat .c-red {
  color: #ffd3d4;
}

.hero-stat .c-amber {
  color: #ffe3b0;
}

.hero-stat span {
  font-size: 12px;
  opacity: 0.78;
}

.hero-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.22);
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.hero-actions .btn {
  flex: 1;
}

.btn-hero-primary {
  background: #fff;
  color: #2b57d9;
  box-shadow: 0 6px 18px rgba(12, 28, 82, 0.22);
}

.btn-hero-primary:hover:not(:disabled) {
  background: #f2f5ff;
  filter: none;
}

.btn-hero-ghost {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.34);
}

.btn-hero-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
}

/* ---------- 模式卡片 ---------- */
.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (min-width: 1024px) {
  .mode-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1500px) {
  .mode-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.mode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 20px 18px;
  text-align: left;
  transition: all 0.18s ease;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: #cdd9f7;
}

.mode-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-icon svg {
  width: 24px;
  height: 24px;
}

.mode-name {
  font-size: 16px;
  font-weight: 700;
}

.mode-desc {
  font-size: 12.5px;
  color: var(--text-2);
}

.mode-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-3);
  transition: transform 0.18s ease;
}

.mode-card:hover .mode-arrow {
  transform: translateY(-50%) translateX(3px);
  color: var(--primary);
}

/* ---------- 章节面板 ---------- */
.chapter-panel {
  margin-top: 4px;
  padding: 16px 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-title {
  font-weight: 700;
  font-size: 15px;
}

.panel-close {
  font-size: 13px;
  color: var(--text-2);
  background: #eef1f8;
  padding: 4px 12px;
  border-radius: 999px;
}

.panel-close:hover {
  background: #e2e7f3;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 10px;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  transition: background 0.15s;
}

.chapter-item:hover {
  background: #f4f7fd;
}

.chapter-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--grad-primary);
  flex-shrink: 0;
}

.point-dot {
  background: linear-gradient(135deg, #d946ef, #a21caf);
  border-radius: 3px;
  width: 9px;
  height: 9px;
}

.chapter-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.chapter-count {
  font-size: 12.5px;
  color: var(--text-3);
}

.chapter-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-3);
}

/* ---------- 考试记录 ---------- */
.history-card {
  padding: 8px 20px;
}

.no-record {
  padding: 26px 0;
  text-align: center;
  color: var(--text-2);
  font-size: 13.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.no-record-icon {
  font-size: 30px;
}

.record {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}

.record:last-child {
  border-bottom: none;
}

.record-score {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}

.record-score.pass {
  background: var(--success-soft);
  color: var(--success-strong);
}

.record-score.fail {
  background: var(--danger-soft);
  color: var(--danger-strong);
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 14px;
  font-weight: 700;
}

.record-time {
  font-size: 12.5px;
  color: var(--text-2);
}

.record-detail {
  font-size: 12.5px;
  color: var(--text-2);
}

/* ---------- 题库管理入口 ---------- */
.manage-row {
  margin-top: 18px;
}

.manage-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  text-align: left;
  transition: all 0.18s ease;
}

.manage-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: #cdd9f7;
}

.manage-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(14, 165, 165, 0.1);
  color: #0ea5a5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.manage-icon svg {
  width: 22px;
  height: 22px;
}

.manage-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.manage-text b {
  font-size: 15px;
}

.manage-text i {
  font-style: normal;
  font-size: 12.5px;
  color: var(--text-2);
}

.footnote {
  text-align: center;
  font-size: 12px;
  color: var(--text-3);
  padding: 20px 30px 0;
}
</style>
