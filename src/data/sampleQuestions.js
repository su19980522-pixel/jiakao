// 样例题库：type 为 single(单选)/judge(判断)/multi(多选)
// subject: 1=科目一, 4=科目四
// chapter: 见 chapters.js 中的章节 id
// answer: 单选/判断为单个字母(A/B/C/D)，多选为逗号分隔如 "A,C,D"
export const SAMPLE_QUESTIONS = [
  // ==================== 科目一 · 道路交通安全法律、法规和规章 ====================
  {
    id: 1, type: 'judge', subject: 1, chapter: 'law',
    question: '驾驶机动车在道路上违反道路交通安全法律、法规的行为，属于违法行为。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '违反道路交通安全法律法规的行为统称为违法行为，都会受到相应处罚。'
  },
  {
    id: 2, type: 'single', subject: 1, chapter: 'law',
    question: '初次申领小型汽车驾驶证（C1）的年龄条件是多少周岁以上？',
    options: ['A. 16周岁', 'B. 18周岁', 'C. 20周岁', 'D. 22周岁'], answer: 'B',
    explanation: '申请小型汽车、小型自动挡汽车驾驶证，年龄应在18周岁以上。'
  },
  {
    id: 3, type: 'single', subject: 1, chapter: 'law',
    question: '机动车驾驶证有效期分为6年、10年和下列哪项？',
    options: ['A. 12年', 'B. 15年', 'C. 20年', 'D. 长期'], answer: 'D',
    explanation: '驾驶证有效期分为6年、10年和长期三种，期满换证。'
  },
  {
    id: 4, type: 'judge', subject: 1, chapter: 'law',
    question: '饮酒后驾驶机动车的，一次记12分。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '饮酒后驾驶机动车的一次记12分；醉酒驾驶的还要追究刑事责任。'
  },
  {
    id: 5, type: 'single', subject: 1, chapter: 'law',
    question: '驾驶人未取得驾驶资格或醉酒驾驶发生交通事故，保险公司在交强险责任限额内垫付抢救费用后，可以怎样做？',
    options: ['A. 放弃追偿', 'B. 向侵权人追偿', 'C. 自行承担损失', 'D. 要求受害人返还'], answer: 'B',
    explanation: '保险公司垫付后有权向致害人追偿，最终责任由违法驾驶人承担。'
  },
  {
    id: 6, type: 'single', subject: 1, chapter: 'law',
    question: '驾驶拼装的机动车上道路行驶，公安机关交通管理部门应如何处理？',
    options: ['A. 罚款后放行', 'B. 收缴车辆强制报废，罚款200元以上2000元以下并吊销驾驶证', 'C. 仅口头警告', 'D. 扣留驾驶证3个月'], answer: 'B',
    explanation: '拼装车安全无保障，上路行驶应收缴强制报废，并处200元以上2000元以下罚款、吊销驾驶证。'
  },
  {
    id: 7, type: 'judge', subject: 1, chapter: 'law',
    question: '在道路上临时停车时，驾驶人不得离开车辆，上下人员或装卸物品后应立即驶离。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '临时停车驾驶人不能离车，妨碍通行时应立即驶离。'
  },
  {
    id: 8, type: 'single', subject: 1, chapter: 'law',
    question: '驾驶机动车在高速公路上行驶，遇能见度低于50米的雾天，最高车速不得超过多少？',
    options: ['A. 20公里/小时', 'B. 40公里/小时', 'C. 60公里/小时', 'D. 80公里/小时'], answer: 'A',
    explanation: '能见度小于50米时，车速不得超过20公里/小时，并从最近的出口尽快驶离高速公路。'
  },
  {
    id: 9, type: 'single', subject: 1, chapter: 'law',
    question: '机动车在道路上发生故障需要停车排除故障时，驾驶人应当怎样做？',
    options: ['A. 直接停在原地修理', 'B. 开启危险报警闪光灯，将车移至不妨碍交通的地方停放', 'C. 在车内等待救援', 'D. 通知保险公司即可'], answer: 'B',
    explanation: '应开启危险报警闪光灯，将机动车移至不妨碍交通的地点；难以移动的应设警告标志。'
  },
  {
    id: 10, type: 'judge', subject: 1, chapter: 'law',
    question: '交通肇事逃逸构成犯罪的，吊销机动车驾驶证，且终生不得重新取得机动车驾驶证。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '造成交通事故后逃逸构成犯罪的，吊销驾驶证且终生禁驾。'
  },
  {
    id: 11, type: 'single', subject: 1, chapter: 'law',
    question: '驾驶机动车在高速公路上行驶，车速超过每小时100公里时，应与同车道前车保持多少米以上的距离？',
    options: ['A. 50米', 'B. 100米', 'C. 150米', 'D. 200米'], answer: 'B',
    explanation: '车速超过100公里/小时时，与前车保持100米以上距离；低于100公里/小时时，距离可适当缩短但不得少于50米。'
  },
  {
    id: 12, type: 'single', subject: 1, chapter: 'law',
    question: '机动车驾驶证被依法扣留期间驾驶机动车的，属于什么行为？',
    options: ['A. 合法行为', 'B. 违法行为', 'C. 犯罪行为', 'D. 无责任行为'], answer: 'B',
    explanation: '驾驶证被扣留期间不得驾驶机动车，否则属于无有效证件驾驶的违法行为。'
  },
  // ==================== 科目一 · 交通信号 ====================
  {
    id: 13, type: 'judge', subject: 1, chapter: 'signal',
    question: '交通信号包括交通信号灯、交通标志、交通标线和交通警察的指挥。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '交通信号由信号灯、标志、标线和交警指挥四部分组成。'
  },
  {
    id: 14, type: 'single', subject: 1, chapter: 'signal',
    question: '红灯亮时，右转弯的车辆在不妨碍被放行的车辆、行人通行的情况下，可以通行吗？',
    options: ['A. 可以', 'B. 不可以', 'C. 视天气而定', 'D. 仅大型车可以'], answer: 'A',
    explanation: '在没有特别禁止右转标志的情况下，红灯亮时右转车辆在不妨碍放行车辆和行人时可以通行。'
  },
  {
    id: 15, type: 'single', subject: 1, chapter: 'signal',
    question: '圆形红灯亮时，机动车应当怎样做？',
    options: ['A. 在确保安全情况下右转', 'B. 停在停止线以外', 'C. 缓慢通过路口', 'D. 鸣喇叭后通过'], answer: 'B',
    explanation: '红灯亮时车辆应停在停止线以外等候，不得越过停止线。'
  },
  {
    id: 16, type: 'judge', subject: 1, chapter: 'signal',
    question: '黄灯持续闪烁表示车辆、行人在确保安全的原则下可以通行。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '黄闪灯警示车辆、行人注意瞭望，确认安全后通行。'
  },
  {
    id: 17, type: 'single', subject: 1, chapter: 'signal',
    question: '红色圆形边框、内部有斜杠的标志属于哪类标志？',
    options: ['A. 警告标志', 'B. 禁令标志', 'C. 指示标志', 'D. 指路标志'], answer: 'B',
    explanation: '禁令标志一般为红圈、白底、黑图案，表示禁止或限制某种行为。'
  },
  {
    id: 18, type: 'judge', subject: 1, chapter: 'signal',
    question: '警告标志的作用是警告车辆、行人注意前方危险地点。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '警告标志为黄底、黑边、黑图案的三角形，用于警告前方有危险。'
  },
  {
    id: 19, type: 'single', subject: 1, chapter: 'signal',
    question: '黄色底色、黑色图案、三角形边框的标志属于哪类标志？',
    options: ['A. 警告标志', 'B. 禁令标志', 'C. 指示标志', 'D. 旅游区标志'], answer: 'A',
    explanation: '黄底黑图三角形的标志是警告标志。'
  },
  {
    id: 20, type: 'single', subject: 1, chapter: 'signal',
    question: '蓝底白图案的圆形标志属于哪类标志？',
    options: ['A. 警告标志', 'B. 禁令标志', 'C. 指示标志', 'D. 指路标志'], answer: 'C',
    explanation: '指示标志为蓝底白图案，指示车辆、行人按规定方向、地点行驶。'
  },
  {
    id: 21, type: 'judge', subject: 1, chapter: 'signal',
    question: '机动车在交叉路口遇到交通警察发出的手势信号与信号灯不一致时，应按信号灯通行。',
    options: ['正确', '错误'], answer: 'B',
    explanation: '交通警察的现场指挥优先于信号灯，应按交警指挥通行。'
  },
  {
    id: 22, type: 'single', subject: 1, chapter: 'signal',
    question: '机动车遇有交通警察现场指挥时，应当按照什么通行？',
    options: ['A. 交通信号灯', 'B. 交通标志', 'C. 交通警察的指挥', 'D. 其他车辆'], answer: 'C',
    explanation: '遇现场指挥时，一律服从交通警察的指挥。'
  },
  {
    id: 23, type: 'judge', subject: 1, chapter: 'signal',
    question: '驾驶机动车在高速公路或城市快速路上倒车、逆行、穿越中央分隔带掉头的，一次记12分。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '在高速公路、城市快速路上倒车、逆行、穿越中央分隔带掉头，均一次记12分。'
  },
  {
    id: 24, type: 'single', subject: 1, chapter: 'signal',
    question: '驾驶机动车不按交通信号灯指示通行的，一次记几分？',
    options: ['A. 3分', 'B. 6分', 'C. 9分', 'D. 12分'], answer: 'B',
    explanation: '闯红灯（不按信号灯指示通行）一次记6分，并处200元罚款。'
  },
  // ==================== 科目一 · 安全行车、文明驾驶基础知识 ====================
  {
    id: 25, type: 'single', subject: 1, chapter: 'safe',
    question: '驾驶机动车行经人行横道遇行人正在通过时，应当怎样做？',
    options: ['A. 鸣喇叭催促', 'B. 加速通过', 'C. 停车让行', 'D. 从行人身后绕过'], answer: 'C',
    explanation: '行经人行横道遇行人正在通过时，应当停车让行，否则记3分罚款200元。'
  },
  {
    id: 26, type: 'judge', subject: 1, chapter: 'safe',
    question: '通过没有交通信号灯控制也没有交通警察指挥的交叉路口时，转弯的机动车应当让直行的车辆先行。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '转弯让直行，是交叉路口通行的基本原则。'
  },
  {
    id: 27, type: 'single', subject: 1, chapter: 'safe',
    question: '驾驶机动车在道路上超车时，应当提前开启什么灯？',
    options: ['A. 左转向灯', 'B. 右转向灯', 'C. 危险报警闪光灯', 'D. 前照灯'], answer: 'A',
    explanation: '超车应提前开启左转向灯、鸣喇叭（夜间交替远近光灯）示意前车。'
  },
  {
    id: 28, type: 'judge', subject: 1, chapter: 'safe',
    question: '驾驶机动车在夜间会车时，应当在距相对方向来车150米以外改用近光灯。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '夜间会车应在距来车150米以外改用近光灯，避免眩目。'
  },
  {
    id: 29, type: 'single', subject: 1, chapter: 'safe',
    question: '机动车在狭窄的坡路会车时，正确的会车方法是什么？',
    options: ['A. 下坡车让上坡车先行', 'B. 上坡车让下坡车先行', 'C. 谁先到谁先行', 'D. 靠山体一方先行'], answer: 'A',
    explanation: '狭窄坡路会车，下坡车让上坡车先行；下坡车已行至中途而上坡车未上坡时，上坡车让下坡车。'
  },
  {
    id: 30, type: 'single', subject: 1, chapter: 'safe',
    question: '驾驶机动车遇到前方车辆停车排队等候或缓慢行驶时，应当怎样做？',
    options: ['A. 借道超车', 'B. 穿插等候的车辆', 'C. 依次排队', 'D. 从右侧超越'], answer: 'C',
    explanation: '遇排队等候应依次排队，借道超车或穿插等候车辆属违法行为。'
  },
  {
    id: 31, type: 'judge', subject: 1, chapter: 'safe',
    question: '夜间行车，驾驶人视距变短、观察能力下降，同时注意力高度集中，容易产生疲劳。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '夜间行车视野受限、视距变短，长时间驾驶易疲劳，应适当休息。'
  },
  {
    id: 32, type: 'single', subject: 1, chapter: 'safe',
    question: '行车中遇到执行任务的消防车时，应当怎样做？',
    options: ['A. 让行', 'B. 不让行', 'C. 减速即可', 'D. 视情况而定'], answer: 'A',
    explanation: '遇到执行紧急任务的消防车、救护车、警车等特种车辆，应当主动让行。'
  },
  {
    id: 33, type: 'judge', subject: 1, chapter: 'safe',
    question: '驾驶机动车时可以向车外抛撒物品。',
    options: ['正确', '错误'], answer: 'B',
    explanation: '向车外抛撒物品不仅不文明，还可能危及他人安全，属违法行为。'
  },
  {
    id: 34, type: 'single', subject: 1, chapter: 'safe',
    question: '驾驶人在行车中经过积水路面时，应当怎样做？',
    options: ['A. 加速通过', 'B. 减速慢行，观察水情后通过', 'C. 高速冲过', 'D. 原地掉头'], answer: 'B',
    explanation: '经过积水路面应减速慢行，观察情况后匀速通过，防止溅水和车辆失控。'
  },
  {
    id: 35, type: 'judge', subject: 1, chapter: 'safe',
    question: '安全带的作用是在发生碰撞或紧急制动时，将驾乘人员固定在座位上，减轻伤害。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '安全带是最基本的安全防护装置，上车必须系好。'
  },
  {
    id: 36, type: 'single', subject: 1, chapter: 'safe',
    question: '驾驶机动车变更车道时，应当提前开启什么灯？',
    options: ['A. 转向灯', 'B. 前照灯', 'C. 示廓灯', 'D. 雾灯'], answer: 'A',
    explanation: '变更车道前应提前开启转向灯，观察确认安全后变更。'
  },
  // ==================== 科目一 · 机动车驾驶操作相关基础知识 ====================
  {
    id: 37, type: 'single', subject: 1, chapter: 'operation',
    question: '机动车仪表板上机油压力过低指示灯亮起时，应当怎样做？',
    options: ['A. 继续行驶', 'B. 立即停车检查', 'C. 加速行驶', 'D. 鸣喇叭提醒'], answer: 'B',
    explanation: '机油压力过低继续行驶会损坏发动机，应立即停车检查。'
  },
  {
    id: 38, type: 'judge', subject: 1, chapter: 'operation',
    question: '机动车在起步前应观察周围交通情况，确认安全后再起步。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '起步前应观察车辆周围和侧后方情况，确认安全后再平稳起步。'
  },
  {
    id: 39, type: 'single', subject: 1, chapter: 'operation',
    question: '驾驶机动车下长坡时，应当怎样控制车速？',
    options: ['A. 挂空挡滑行', 'B. 利用发动机制动配合行车制动', 'C. 持续踩刹车', 'D. 熄火滑行'], answer: 'B',
    explanation: '下长坡应挂低挡利用发动机制动，避免长时间踩刹车导致制动过热失效。'
  },
  {
    id: 40, type: 'judge', subject: 1, chapter: 'operation',
    question: '行车前应检查机油、冷却液、制动液等是否充足。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '出车前安全检查是安全行车的基本要求。'
  },
  {
    id: 41, type: 'single', subject: 1, chapter: 'operation',
    question: '驾驶自动挡汽车起步时，变速杆应置于什么位置？',
    options: ['A. P挡', 'B. R挡', 'C. N挡', 'D. D挡'], answer: 'D',
    explanation: '自动挡起步时踩住制动踏板，挂入D挡，松开驻车制动平稳起步。'
  },
  {
    id: 42, type: 'single', subject: 1, chapter: 'operation',
    question: '驾驶机动车在冰雪路面行驶时，应当怎样做？',
    options: ['A. 猛踩油门', 'B. 低速平稳行驶，避免急加速急制动', 'C. 挂高档高速行驶', 'D. 急打方向'], answer: 'B',
    explanation: '冰雪路面附着力小，应低速平稳行驶，避免急加速、急制动、急转向。'
  },
  {
    id: 43, type: 'judge', subject: 1, chapter: 'operation',
    question: '轮胎气压不足时继续行驶，容易导致爆胎。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '气压不足会使胎壁过度屈挠发热，高速行驶易爆胎。'
  },
  {
    id: 44, type: 'single', subject: 1, chapter: 'operation',
    question: '行车中发动机突然熄火，应当怎样处置？',
    options: ['A. 借助惯性滑行至路边停车检查', 'B. 立即急刹车停在路中', 'C. 反复踩油门', 'D. 不做处理继续滑行'], answer: 'A',
    explanation: '发动机熄火后应利用惯性靠边停车，开启危险报警闪光灯后检查原因。'
  },
  // ==================== 科目四 · 安全行车常识 ====================
  {
    id: 45, type: 'single', subject: 4, chapter: 's1',
    question: '驾驶机动车在高速公路上遇前方事故需临时停车时，应开启什么灯？',
    options: ['A. 危险报警闪光灯', 'B. 远光灯', 'C. 近光灯', 'D. 雾灯'], answer: 'A',
    explanation: '高速公路临时停车应开启危险报警闪光灯，并在来车方向150米外设置警告标志。'
  },
  {
    id: 46, type: 'judge', subject: 4, chapter: 's1',
    question: '驾驶机动车在隧道内行驶时，应当开启近光灯。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '进入隧道前应开启近光灯，保证照明和自身可见性。'
  },
  {
    id: 47, type: 'multi', subject: 4, chapter: 's1',
    question: '驾驶机动车在高速公路行车，遇能见度低于200米的雾天，正确的做法有哪些？',
    options: ['A. 开启雾灯、近光灯、示廓灯和前后位灯', 'B. 车速不超过60公里/小时', 'C. 与同车道前车保持100米以上的距离', 'D. 开启远光灯'], answer: 'A,B,C',
    explanation: '能见度小于200米时，开启雾灯等灯光，车速不超60公里/小时，车距保持100米以上；雾天开远光灯会造成漫反射，更看不清。'
  },
  {
    id: 48, type: 'single', subject: 4, chapter: 's1',
    question: '驾驶机动车通过没有交通信号的铁路道口时，应当怎样做？',
    options: ['A. 加速通过', 'B. 一停、二看、三通过', 'C. 鸣喇叭快速通过', 'D. 跟随前车通过'], answer: 'B',
    explanation: '通过无人看守的铁路道口，应停车瞭望，确认安全后通过。'
  },
  {
    id: 49, type: 'judge', subject: 4, chapter: 's1',
    question: '驾驶人下车前，应观察侧后方交通情况，确认安全后再开启车门。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '开车门前应观察侧后方，防止"开门杀"，可用远离车门的手开门（荷式开门法）。'
  },
  {
    id: 50, type: 'multi', subject: 4, chapter: 's1',
    question: '关于"防御性驾驶"，下列说法正确的有哪些？',
    options: ['A. 提前观察、提前预判', 'B. 与前车保持足够安全距离', 'C. 主动避让，不依赖他人', 'D. 只要自己不违法就不用管别人'], answer: 'A,B,C',
    explanation: '防御性驾驶强调提前预判、留有余地、主动避险，而不是被动依赖他人守法。'
  },
  {
    id: 51, type: 'single', subject: 4, chapter: 's1',
    question: '机动车在夜间通过急弯、坡路、拱桥或没有交通信号灯控制的路口时，应当怎样使用灯光？',
    options: ['A. 交替使用远近光灯示意', 'B. 只开远光灯', 'C. 只开危险报警闪光灯', 'D. 关闭灯光'], answer: 'A',
    explanation: '夜间通过急弯、坡路等视线不良路段，应交替使用远近光灯示意。'
  },
  {
    id: 52, type: 'multi', subject: 4, chapter: 's1',
    question: '行车中需要临时停车时，正确的做法有哪些？',
    options: ['A. 选择不妨碍交通的地点停放', 'B. 开启危险报警闪光灯', 'C. 车辆故障时在车后适当位置设置警告标志', 'D. 随意停在行车道内'], answer: 'A,B,C',
    explanation: '临时停车不得妨碍通行，故障停车需开危险报警闪光灯并设置警告标志。'
  },
  // ==================== 科目四 · 文明行车常识 ====================
  {
    id: 53, type: 'single', subject: 4, chapter: 's2',
    question: '遇前方机动车排队等候时，驾驶人可以借道超车或占用对面车道穿插等候吗？',
    options: ['A. 可以', 'B. 不可以', 'C. 夜间可以', 'D. 紧急时可以'], answer: 'B',
    explanation: '遇排队等候应依次排队，不得借道超车或穿插等候，否则记3分。'
  },
  {
    id: 54, type: 'judge', subject: 4, chapter: 's2',
    question: '驾驶机动车行经学校门口或人行横道时，应减速慢行，遇行人应当停车让行。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '学校周边和人行横道处行人多，应减速慢行、礼让行人。'
  },
  {
    id: 55, type: 'single', subject: 4, chapter: 's2',
    question: '驾驶机动车在雨天经过泥泞路段、路边有行人时，应当怎样做？',
    options: ['A. 加速通过', 'B. 减速慢行，防止泥水溅到行人', 'C. 鸣喇叭催促', 'D. 保持原速通过'], answer: 'B',
    explanation: '文明驾驶应减速慢行，避免泥水溅到行人。'
  },
  {
    id: 56, type: 'judge', subject: 4, chapter: 's2',
    question: '夜间会车时，对方车辆不关闭远光灯，自己也应开启远光灯回敬。',
    options: ['正确', '错误'], answer: 'B',
    explanation: '对方不变光时应减速靠右停车避让，切忌开远光灯对射，避免事故。'
  },
  {
    id: 57, type: 'multi', subject: 4, chapter: 's2',
    question: '驾驶机动车遇到出租车、公交车等车辆在站点停靠时，应当注意什么？',
    options: ['A. 减速慢行，防止行人突然横穿', 'B. 注意避让上下车的乘客', 'C. 鸣喇叭快速通过', 'D. 保持安全距离'], answer: 'A,B,D',
    explanation: '站点停靠车辆前后可能有行人突然横穿，应减速、保持距离、注意避让。'
  },
  {
    id: 58, type: 'single', subject: 4, chapter: 's2',
    question: '驾驶人发现同车道前车准备靠边停车时，应当怎样做？',
    options: ['A. 鸣喇叭加速超越', 'B. 减速保持安全距离，观察其动态', 'C. 紧贴其右侧通过', 'D. 直接超车'], answer: 'B',
    explanation: '前车靠边停车时，应减速保持距离观察动态，防止其突然变道或开门。'
  },
  // ==================== 科目四 · 恶劣天气和复杂道路条件下驾驶常识 ====================
  {
    id: 59, type: 'single', subject: 4, chapter: 's3',
    question: '驾驶机动车在冰雪路面上行驶时，与前车的安全距离应当怎样？',
    options: ['A. 比平时缩短', 'B. 比平时加大', 'C. 保持不变', 'D. 无要求'], answer: 'B',
    explanation: '冰雪路面制动距离大幅增加，应加大跟车距离。'
  },
  {
    id: 60, type: 'judge', subject: 4, chapter: 's3',
    question: '冰雪路面制动距离会变长，应当提前减速。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '冰雪路面附着力低，制动距离明显变长，需提前减速、缓踩刹车。'
  },
  {
    id: 61, type: 'multi', subject: 4, chapter: 's3',
    question: '驾驶机动车在山区道路行驶时，正确的做法有哪些？',
    options: ['A. 下长坡时利用发动机制动', 'B. 转弯前鸣喇叭、减速靠右行驶', 'C. 会车时靠山体一方让行', 'D. 下坡空挡滑行省油'], answer: 'A,B,C',
    explanation: '山区道路应利用发动机制动、转弯鸣喇叭靠右；会车时靠山体一方让不靠山体一方先行；空挡滑行很危险。'
  },
  {
    id: 62, type: 'single', subject: 4, chapter: 's3',
    question: '驾驶机动车在雾天行车时，应当怎样使用灯光？',
    options: ['A. 开启远光灯', 'B. 开启雾灯和危险报警闪光灯，减速慢行', 'C. 只开启示廓灯', 'D. 关闭所有灯光'], answer: 'B',
    explanation: '雾天应开启雾灯和危险报警闪光灯并减速慢行；远光灯在雾中会形成光幕影响视线。'
  },
  {
    id: 63, type: 'judge', subject: 4, chapter: 's3',
    question: '雨天行车，路面湿滑，制动距离会变长。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '雨水使轮胎与路面附着力下降，制动距离变长，应加大跟车距离。'
  },
  {
    id: 64, type: 'multi', subject: 4, chapter: 's3',
    question: '驾驶机动车通过漫水路时，正确的做法有哪些？',
    options: ['A. 停车察明水情', 'B. 挂低挡匀速通过', 'C. 涉水后轻踩几次制动踏板恢复制动效果', 'D. 高速冲过积水'], answer: 'A,B,C',
    explanation: '过漫水路应先观察水情，低挡匀速通过；涉水后轻踩刹车蒸发水分恢复制动；高速冲水易失控熄火。'
  },
  // ==================== 科目四 · 紧急情况下避险常识 ====================
  {
    id: 65, type: 'single', subject: 4, chapter: 's4',
    question: '行车中遇到转向突然失控时，应当怎样处置？',
    options: ['A. 立即急踩制动踏板', 'B. 抢挂低速挡减速，缓踩制动，利用发动机制动', 'C. 拉紧驻车制动', 'D. 猛打方向'], answer: 'B',
    explanation: '转向失控时应抢挂低速挡利用发动机制动减速，缓踩刹车，不可急刹和猛打方向。'
  },
  {
    id: 66, type: 'judge', subject: 4, chapter: 's4',
    question: '行车中轮胎突然爆裂时，应紧握方向盘，缓抬加速踏板，平稳减速停车，不可急踩制动。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '爆胎后应握稳方向、缓收油门、平稳减速，急刹车易导致车辆失控侧翻。'
  },
  {
    id: 67, type: 'multi', subject: 4, chapter: 's4',
    question: '行车中发动机突然着火，正确的处置方法有哪些？',
    options: ['A. 立即停车熄火，切断电源', 'B. 用灭火器扑救初期火灾', 'C. 迅速打开引擎盖查看火情', 'D. 火势无法控制时远离车辆并拨打119'], answer: 'A,B,D',
    explanation: '发动机着火应先停车熄火断电，用灭火器扑救；贸然打开引擎盖会助燃；火势大时应远离并报警。'
  },
  {
    id: 68, type: 'single', subject: 4, chapter: 's4',
    question: '行车中制动突然失效时，应当怎样处置？',
    options: ['A. 抢挂低速挡，利用发动机制动并配合驻车制动', 'B. 立即弃车跳车', 'C. 急打方向', 'D. 直接关闭点火开关'], answer: 'A',
    explanation: '制动失效时应抢挂低速挡利用发动机制动，配合驻车制动器减速，必要时利用路边障碍物减速停车。'
  },
  {
    id: 69, type: 'judge', subject: 4, chapter: 's4',
    question: '行车中车辆发生侧滑时，应当向侧滑的方向修正方向。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '车辆侧滑时应顺着侧滑方向缓打方向修正，同时松抬油门，不可急刹车。'
  },
  // ==================== 科目四 · 交通事故救护及常见危化品处置常识 ====================
  {
    id: 70, type: 'single', subject: 4, chapter: 's5',
    question: '交通事故造成人员受伤出血时，应当怎样做？',
    options: ['A. 用干净纱布按压止血并拨打120', 'B. 用水冲洗伤口即可', 'C. 不管伤口继续驾驶', 'D. 用嘴吸出伤口污血'], answer: 'A',
    explanation: '外伤出血应立即用干净敷料按压止血，及时拨打120急救电话。'
  },
  {
    id: 71, type: 'judge', subject: 4, chapter: 's5',
    question: '抢救昏迷的伤员时，应保持其呼吸道畅通，解开衣领、领带等。',
    options: ['正确', '错误'], answer: 'A',
    explanation: '昏迷伤员应保持呼吸道畅通，防止窒息，尽快送医。'
  },
  {
    id: 72, type: 'multi', subject: 4, chapter: 's5',
    question: '运送骨折伤员时，正确的做法有哪些？',
    options: ['A. 先固定骨折部位再搬运', 'B. 避免随意移动伤员', 'C. 采用正确姿势搬运', 'D. 用力摇晃伤员使其清醒'], answer: 'A,B,C',
    explanation: '骨折伤员应先固定后搬运，避免二次伤害；摇晃伤员可能加重伤情。'
  }
]
