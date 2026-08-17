<script setup>
import { computed, ref } from 'vue'
import { isCorrect, LETTERS, TYPE_NAMES, getPoints } from '../utils/question'

const props = defineProps({
  question: { type: Object, required: true },
  mode: { type: String, default: 'practice' },
  modelValue: { type: Array, default: () => [] },
  reveal: { type: Boolean, default: false },
  autoNext: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'answered'])

const submitted = ref(props.reveal)

const q = computed(() => props.question)
const isMulti = computed(() => q.value.type === 'multi')
const showResult = computed(() => props.reveal || (props.mode === 'practice' && submitted.value))
const answered = computed(() => props.modelValue.length > 0)
const correct = computed(() => answered.value && isCorrect(q.value, props.modelValue))
const imgs = computed(() => (q.value.images && q.value.images.length ? q.value.images : q.value.image ? [q.value.image] : []))
const points = computed(() => getPoints(q.value))

function selectOption(letter) {
  if (showResult.value && props.mode !== 'exam') return
  let next
  if (isMulti.value) {
    next = props.modelValue.includes(letter)
      ? props.modelValue.filter((x) => x !== letter)
      : [...props.modelValue, letter]
  } else {
    next = [letter]
  }
  emit('update:modelValue', next)

  if (props.mode === 'practice' && !isMulti.value) {
    submit(next)
  }
}

function submit(letters) {
  const sel = letters || props.modelValue
  if (props.mode !== 'practice' || sel.length === 0) return
  submitted.value = true
  emit('answered', isCorrect(q.value, sel))
}

defineExpose({ submit })

function selected(letter) {
  return props.modelValue.includes(letter)
}

function optionClass(letter) {
  if (!showResult.value) {
    return { selected: selected(letter) }
  }
  return {
    correct: props.question.answer.includes(letter),
    wrong: !props.question.answer.includes(letter) && selected(letter),
    dim: !props.question.answer.includes(letter) && !selected(letter)
  }
}
</script>

<template>
  <div class="card q-card">
    <div class="q-head">
      <span class="type-pill" :class="q.type">{{ TYPE_NAMES[q.type] }}</span>
      <span v-if="isMulti" class="q-note">漏选、多选均不得分</span>
      <span v-if="imgs.length" class="q-note img-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="M21 14l-4.5-4.5L8 18" />
        </svg>
        图片题
      </span>
    </div>

    <div class="q-text">{{ q.question }}</div>

    <div v-if="imgs.length" class="q-images">
      <img v-for="(img, i) in imgs" :key="i" :src="img" alt="题目图片" loading="lazy" />
    </div>

    <div class="options">
      <button
        v-for="(opt, i) in q.options"
        :key="i"
        class="option"
        :class="optionClass(LETTERS[i])"
        @click="selectOption(LETTERS[i])"
      >
        <span class="opt-letter">{{ LETTERS[i] }}</span>
        <span class="opt-text">{{ opt.replace(/^[A-H][.、]\s*/, '') }}</span>
        <span v-if="showResult && q.answer.includes(LETTERS[i])" class="opt-mark correct-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <span v-else-if="showResult && selected(LETTERS[i])" class="opt-mark wrong-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
        <span v-else-if="selected(LETTERS[i])" class="opt-mark pick-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      </button>
    </div>

    <button
      v-if="mode === 'practice' && isMulti && answered && !submitted"
      class="btn btn-primary submit-btn"
      @click="submit()"
    >
      确认答案
    </button>

    <Transition name="explain">
      <div v-if="showResult" class="explain" :class="correct ? 'ok' : 'no'">
        <div class="explain-head">
          <span class="explain-status" :class="correct ? 'ok' : 'no'">
            {{ correct ? '回答正确' : '回答错误' }}
          </span>
          <span v-if="!correct" class="answer-key">正确答案：{{ q.answer.join('、') }}</span>
          <span v-if="correct && autoNext && mode === 'practice'" class="auto-next-tip">稍后自动进入下一题</span>
        </div>
        <div v-if="q.explanation" class="explain-body">
          <span class="exp-tag">解析</span>
          {{ q.explanation }}
        </div>
        <div v-if="points.length" class="points">
          <span class="points-label">相关知识点</span>
          <span v-for="p in points" :key="p.id" class="point-chip">{{ p.name }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.q-card {
  padding: 22px 24px;
}

.q-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.type-pill {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 1px;
}

.type-pill.single {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-pill.judge {
  background: var(--warning-soft);
  color: #c47b04;
}

.type-pill.multi {
  background: #f3ecfe;
  color: #7c3aed;
}

.q-note {
  font-size: 12px;
  color: var(--text-2);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.img-note svg {
  width: 14px;
  height: 14px;
}

.q-text {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.75;
  margin-bottom: 14px;
  white-space: pre-wrap;
}

.q-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.q-images img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #f8fafd;
  padding: 6px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: var(--radius-sm);
  background: #fff;
  border: 1.5px solid var(--border);
  text-align: left;
  transition: all 0.16s ease;
}

.option:hover:not(.correct):not(.wrong) {
  border-color: #b9cbf7;
  background: #f8faff;
}

.option:active {
  transform: scale(0.995);
}

.option.selected {
  background: var(--primary-soft);
  border-color: var(--primary);
}

.option.selected .opt-letter {
  background: var(--primary);
  color: #fff;
}

.option.correct {
  background: var(--success-soft);
  border-color: #8fd9b4;
}

.option.correct .opt-letter {
  background: var(--success);
  color: #fff;
}

.option.wrong {
  background: var(--danger-soft);
  border-color: #f4b6b8;
}

.option.wrong .opt-letter {
  background: var(--danger);
  color: #fff;
}

.option.dim {
  opacity: 0.55;
}

.opt-letter {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: #eef1f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-2);
  transition: all 0.16s ease;
}

.opt-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
}

.opt-mark {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opt-mark svg {
  width: 20px;
  height: 20px;
}

.correct-mark {
  color: var(--success);
}

.wrong-mark {
  color: var(--danger);
}

.pick-mark {
  color: var(--primary);
}

.submit-btn {
  width: 100%;
  margin-top: 16px;
  padding: 13px;
  font-size: 15.5px;
}

.explain {
  margin-top: 16px;
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  font-size: 14px;
}

.explain.ok {
  background: var(--success-soft);
  border: 1px solid #bfe8d2;
}

.explain.no {
  background: var(--danger-soft);
  border: 1px solid #f6c9cb;
}

.explain-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.explain-status {
  font-weight: 800;
  font-size: 14.5px;
}

.explain-status.ok {
  color: var(--success-strong);
}

.explain-status.no {
  color: var(--danger-strong);
}

.answer-key {
  font-size: 13px;
  font-weight: 600;
  color: var(--danger-strong);
  background: rgba(255, 255, 255, 0.6);
  padding: 1px 10px;
  border-radius: 999px;
}

.explain-body {
  color: #54617e;
  line-height: 1.7;
}

.exp-tag {
  display: inline-block;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
  padding: 0 7px;
  margin-right: 8px;
  font-weight: 700;
  color: var(--text-2);
}

.auto-next-tip {
  margin-left: auto;
  font-size: 12px;
  color: var(--success-strong);
  opacity: 0.8;
  animation: fadeInOut 1.2s ease infinite;
}

@keyframes fadeInOut {
  50% { opacity: 0.4; }
}

.points {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.points-label {
  font-size: 12px;
  color: var(--text-2);
  font-weight: 600;
}

.point-chip {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-strong);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #b9cbf7;
  padding: 1px 10px;
  border-radius: 999px;
}

.explain-enter-active {
  transition: all 0.25s ease;
}

.explain-leave-active {
  transition: all 0.15s ease;
}

.explain-enter-from,
.explain-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
