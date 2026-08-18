import { defineStore } from 'pinia'
import { load, save } from '../utils/storage'
import * as cloudSync from '../utils/cloudSync'

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
        cloudSync.syncWrong(id, true)
      }
    },
    removeWrong(id) {
      this.wrongIds = this.wrongIds.filter((x) => x !== id)
      save('wrong_ids', this.wrongIds)
      cloudSync.syncWrong(id, false)
    },
    toggleFav(id) {
      const add = !this.favIds.includes(id)
      if (add) {
        this.favIds.push(id)
      } else {
        this.favIds = this.favIds.filter((x) => x !== id)
      }
      save('fav_ids', this.favIds)
      cloudSync.syncFav(id, add)
    },
    addExamRecord(record) {
      this.examHistory = [record, ...this.examHistory].slice(0, 50)
      save('exam_history', this.examHistory)
      cloudSync.syncExamRecord(record)
    },
    clearHistory() {
      this.examHistory = []
      save('exam_history', [])
      cloudSync.clearExamRecords()
    },
    setPracticePos(key, index) {
      this.practicePos[key] = index
      save('practice_pos', this.practicePos)
      cloudSync.syncPracticePos(key, index)
    }
  }
})
