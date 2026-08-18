import { defineStore } from 'pinia'
import * as cloudSync from '../utils/cloudSync'

export const useUserStore = defineStore('user', {
  state: () => ({
    wrongIds: [],
    favIds: [],
    examHistory: [],
    practicePos: {}
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
    setAll(data) {
      this.wrongIds = data.wrong_ids || []
      this.favIds = data.fav_ids || []
      this.examHistory = data.exam_history || []
      this.practicePos = data.practice_pos || {}
    },
    clearAll() {
      this.wrongIds = []
      this.favIds = []
      this.examHistory = []
      this.practicePos = {}
    },
    addWrong(id) {
      if (!this.wrongIds.includes(id)) {
        this.wrongIds.push(id)
        cloudSync.syncWrong(id, true)
      }
    },
    removeWrong(id) {
      this.wrongIds = this.wrongIds.filter((x) => x !== id)
      cloudSync.syncWrong(id, false)
    },
    toggleFav(id) {
      const add = !this.favIds.includes(id)
      if (add) {
        this.favIds.push(id)
      } else {
        this.favIds = this.favIds.filter((x) => x !== id)
      }
      cloudSync.syncFav(id, add)
    },
    addExamRecord(record) {
      this.examHistory = [record, ...this.examHistory].slice(0, 50)
      cloudSync.syncExamRecord(record)
    },
    clearHistory() {
      this.examHistory = []
      cloudSync.clearExamRecords()
    },
    setPracticePos(key, index) {
      this.practicePos[key] = index
      cloudSync.syncPracticePos(key, index)
    }
  }
})
