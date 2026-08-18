import { defineStore } from 'pinia'
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions'
import { REAL_QUESTIONS } from '../data/realQuestions'
import { normalizeQuestion } from '../utils/question'
import { load, save } from '../utils/storage'

const toArrayAnswer = (q) => (Array.isArray(q.answer) ? q : { ...q, answer: String(q.answer || '').split(',') })

const BASE_QUESTIONS = [...SAMPLE_QUESTIONS, ...REAL_QUESTIONS].map(toArrayAnswer)

export const useBankStore = defineStore('bank', {
  state: () => ({
    imported: load('imported_questions', []).map(toArrayAnswer)
  }),
  getters: {
    allQuestions(state) {
      return [...BASE_QUESTIONS, ...state.imported]
    },
    questionsBySubject() {
      return (subject) => this.allQuestions.filter((q) => q.subject === subject)
    },
    countBySubject() {
      return (subject) => this.questionsBySubject(subject).length
    }
  },
  actions: {
    importQuestions(rawList, mode) {
      const startId = 100000 + this.imported.length
      const normalized = rawList
        .map((raw, i) => normalizeQuestion(raw, startId + i))
        .filter((q) => q.question && q.options && q.options.length >= 2)
      if (mode === 'replace') {
        this.imported = normalized
      } else {
        this.imported = [...this.imported, ...normalized]
      }
      return save('imported_questions', this.imported)
    },
    clearImported() {
      this.imported = []
      return save('imported_questions', [])
    }
  }
})
