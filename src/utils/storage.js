const PREFIX = 'jsq_'

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn('localStorage 写入失败:', e)
    return false
  }
}
