const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../static/app.js');
let content = fs.readFileSync(appPath, 'utf8');

let dataStart = content.indexOf('// ============================================================\n// ДАННЫЕ');
if (dataStart === -1) {
  const txtStart = content.indexOf('const TEXTBOOK = [');
  if (txtStart !== -1) dataStart = content.lastIndexOf('// =', txtStart);
}
const dataEnd = content.indexOf('function getTodayKey()');
if (dataStart === -1) throw new Error('dataStart not found');
if (dataEnd === -1) throw new Error('dataEnd not found: function getTodayKey()');
console.log('dataStart', dataStart, 'dataEnd', dataEnd, 'chars to remove', dataEnd - dataStart);

const newDataSection = `// ДАННЫЕ — загружаются из JSON (static/data/)
let TEXTBOOK = [];
let TEXTBOOK_PARTS = [];
let LESSON_PARTS = [];
let LESSONS = [];
const ACHIEVEMENTS = [
  { id: 'first_lesson',    icon: '🎯', name: 'Первый урок',       desc: 'Пройди свой первый урок',              condition: s => s.lessonsCompleted >= 1 },
  { id: 'first_chapter',  icon: '📖', name: 'Первая глава',      desc: 'Прочитай первую главу учебника',        condition: s => s.chaptersRead >= 1 },
  { id: 'five_lessons',   icon: '🔥', name: 'На волне',          desc: 'Пройди 5 уроков',                      condition: s => s.lessonsCompleted >= 5 },
  { id: 'all_lessons',    icon: '🏆', name: 'Мастер уроков',     desc: 'Пройди все уроки',                      condition: s => s.lessonsCompleted >= LESSONS.length },
  { id: 'all_chapters',   icon: '📚', name: 'Книжный червь',     desc: 'Прочитай все главы учебника',           condition: s => s.chaptersRead >= TEXTBOOK.length },
  { id: 'xp_100',         icon: '⭐', name: '100 XP',            desc: 'Набери 100 очков опыта',               condition: s => s.totalXP >= 100 },
  { id: 'xp_500',         icon: '🌟', name: '500 XP',            desc: 'Набери 500 очков опыта',               condition: s => s.totalXP >= 500 },
  { id: 'xp_1000',        icon: '💫', name: '1000 XP',           desc: 'Набери 1000 очков опыта',              condition: s => s.totalXP >= 1000 },
  { id: 'perfect_quiz',   icon: '🎓', name: 'Отличник',          desc: 'Ответь на все вопросы теста верно',     condition: s => s.perfectQuizzes >= 1 },
  { id: 'level5',         icon: '🚀', name: 'Уровень 5',         desc: 'Достигни 5 уровня',                    condition: s => s.level >= 5 },
  { id: 'async_expert',   icon: '⏳', name: 'Async-мастер',       desc: 'Пройди урок Async и tokio',            condition: s => (s.completedLessons || []).includes(21) },
  { id: 'web_expert',     icon: '🌐', name: 'Веб-разработчик',   desc: 'Пройди урок Веб-сервер на Axum',      condition: s => (s.completedLessons || []).includes(22) },
  { id: 'network_expert', icon: '📡', name: 'Сетевой гуру',      desc: 'Пройди урок Файлы и сеть',            condition: s => (s.completedLessons || []).includes(23) },
  { id: 'crypto_expert',  icon: '🔐', name: 'Крипто-энтузиаст', desc: 'Пройди урок Криптография',             condition: s => (s.completedLessons || []).includes(24) },
  { id: 'blockchain_expert', icon: '⛓️', name: 'Блокчейн-исследователь', desc: 'Пройди урок Блокчейн',            condition: s => (s.completedLessons || []).includes(25) },
  { id: 'solana_expert', icon: '☀️', name: 'Solana-разработчик', desc: 'Пройди урок Solana CLI и Rust',      condition: s => (s.completedLessons || []).includes(26) },
  { id: 'anchor_expert', icon: '⚓', name: 'Смарт-контрактер', desc: 'Пройди урок Anchor и смарт-контракты', condition: s => (s.completedLessons || []).includes(27) },
];
let FIRST_PROJECTS = [];
let DAILY_QUESTS = [];

async function loadData() {
  const base = 'data/';
  try {
    const [tb, tbp, lp, l, fp, dq] = await Promise.all([
      fetch(base + 'textbook.json').then(r => r.json()),
      fetch(base + 'textbook-parts.json').then(r => r.json()),
      fetch(base + 'lesson-parts.json').then(r => r.json()),
      fetch(base + 'lessons.json').then(r => r.json()),
      fetch(base + 'first-projects.json').then(r => r.json()),
      fetch(base + 'daily-quests.json').then(r => r.json()),
    ]);
    TEXTBOOK = tb;
    TEXTBOOK_PARTS = tbp;
    LESSON_PARTS = lp;
    LESSONS = l;
    FIRST_PROJECTS = fp;
    DAILY_QUESTS = dq;
  } catch (e) {
    console.error('Ошибка загрузки данных:', e);
    document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#f87171">Не удалось загрузить данные. Проверь, что сервер запущен и папка data/ доступна.</div>';
    throw e;
  }
}

`;

const before = content.slice(0, dataStart);
const after = content.slice(dataEnd);

content = before + newDataSection + '\n' + after;
fs.writeFileSync(appPath, content);
console.log('Injected loadData. Removed embedded data.');
