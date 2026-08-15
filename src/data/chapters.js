export const CHAPTERS = {
  1: [
    { id: 'real', name: '2025新规题库' },
    { id: 'law', name: '道路交通安全法律、法规和规章' },
    { id: 'signal', name: '交通信号' },
    { id: 'safe', name: '安全行车、文明驾驶基础知识' },
    { id: 'operation', name: '机动车驾驶操作相关基础知识' }
  ],
  4: [
    { id: 's1', name: '安全行车常识' },
    { id: 's2', name: '文明行车常识' },
    { id: 's3', name: '恶劣天气和复杂道路条件下驾驶常识' },
    { id: 's4', name: '紧急情况下避险常识' },
    { id: 's5', name: '交通事故救护及常见危化品处置常识' }
  ]
}

export const SUBJECT_NAMES = {
  1: '科目一',
  4: '科目四'
}

export const CHAPTER_NAME_BY_ID = {}
Object.keys(CHAPTERS).forEach((sub) => {
  CHAPTERS[sub].forEach((c) => {
    CHAPTER_NAME_BY_ID[c.id] = c.name
  })
})
