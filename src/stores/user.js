import { defineStore } from 'pinia'
import { load, save } from '../utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    wrongIds: load('wrong_ids', []),
    favIds: load('fav_ids', []),
    examHistory: load('exam_history', []),
    practicePos: load('practice_pos', {})
  }),
  getters: {
    isWrong() {
      return (id) => this.wrongIds.includes(id)
    },
    isFav() {
      return (id) => this.favIds.includes(id)
    }
  },
  actions: {
    addWrong(id) {
      if (!this.wrongIds.includes(id)) {
        this.wrongIds.push(id)
        save('wrong_ids', this.wrongIds)
      }
    },
    removeWrong(id) {
      this.wrongIds = this.wrongIds.filter((x) => x !== id)
      save('wrong_ids', this.wrongIds)
    },
    toggleFav(id) {
      if (this.favIds.includes(id)) {
        this.favIds = this.favIds.filter((x) => x !== id)
      } else {
        this.favIds.push(id)
      }
      save('fav_ids', this.favIds)
    },
    addExamRecord(record) {
      this.examHistory = [record, ...this.examHistory].slice(0, 50)
      save('exam_history', this.examHistory)
    },
    clearHistory() {
      this.examHistory = []
      save('exam_history', [])
    },
    setPracticePos(key, index) {
      this.practicePos[key] = index
      save('practice_pos', this.practicePos)
    }
  }
})
