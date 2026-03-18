// i18n.js — переключение языка RU / EN

const TRANSLATIONS = {
  ru: {
    // Meta
    pageTitle: 'RustLings 🦀 — Учи Rust легко',
    skipLink: 'Перейти к содержимому',

    // Logo
    logoSub: 'Учи Rust играючи',

    // Nav
    navHome: 'Главная',
    navWhyRust: 'Почему Rust?',
    navTextbook: 'Учебник',
    navLessons: 'Уроки',
    navPractice: 'Практика',
    navFirstProject: 'Первый проект',
    navAchievements: 'Достижения',

    // Sidebar
    settings: 'Настройки',
    theme: 'Тема',
    language: 'Язык',
    themeToggle: 'Переключить тему',
    langToggle: 'Переключить язык',
    level: 'Уровень',

    // Hero
    heroGreeting: 'Привет! Продолжим учить Rust?',
    heroSubtitle: 'Учебник по Easy Rust — просто, с аналогиями, как для 12-летних.',
    heroToLessons: 'К урокам',
    heroTextbook: 'Учебник',
    heroPractice: 'Практика',
    heroFirstProject: 'Первый проект',
    heroWhyRust: 'Почему Rust?',

    // Stats
    statXp: 'Очков опыта',
    statLevel: 'Уровень',
    statLessonsDone: 'Уроков пройдено',
    statTasksDone: 'Задач решено',
    statStreak: 'Дней подряд',

    // Dashboard
    dailyQuests: 'Ежедневные квесты',
    questDone: 'Готово!',
    streakFreeze: 'Streak Freeze',
    streakFreezeAvailable: 'доступно',
    monday: 'Понедельник',
    continueTitle: 'Продолжить',
    lessonUnit: 'Урок',
    textbookUnit: 'Учебник',
    allLessonsDone: 'Все уроки пройдены!',
    allChaptersDone: 'Все главы прочитаны!',
    progress: 'Прогресс',
    lessons: 'Уроки',
    textbook: 'Учебник',
    streakDays: 'дней подряд',
    recentAchievements: 'Недавние достижения',
    firstAchievementHint: 'Пройди первый урок и заработай своё первое достижение!',

    // Modals
    closeChapter: 'Закрыть главу',
    takeChapterQuiz: 'Пройти тест по главе →',
    questionNOfM: 'Вопрос {n} из {m}',
    closeQuiz: 'Закрыть тест',
    closeLesson: 'Закрыть урок',

    // Search
    searchNoResults: 'Ничего не найдено',
    copied: 'Скопировано!',
    copy: 'Копировать',
    loadError: 'Ошибка загрузки данных...',

    // Textbook
    textbookTitle: 'Учебник по Rust',
    textbookSubtitle: 'Основано на Easy Rust — объяснения как для 12-летних, с аналогиями из жизни',
    searchPlaceholder: 'Поиск по главам...',
    chapter: 'Глава',
    read: 'Прочитано',
    superQuiz: 'Супер-тест',
    superQuizDone: 'Супер-тест пройден',
    superQuizPart: 'Супер-тест части',
    superQuizLock: 'прочитай все',
    chapters: 'глав',

    // Lessons
    lessonsTitle: 'Уроки',
    lessonsSubtitle: 'Проверь знания — вопросы с кодом, выбор ответа, объяснения. Часть уроков открывается после прохождения соответствующей части в учебнике.',
    lockMsg: 'Пройди предыдущие уроки, чтобы открыть',
    lockTextbookFirst: 'Сначала пройди',
    lockPrevLesson: 'Сначала пройди предыдущий урок!',
    inTextbook: 'в учебнике',
    thisPart: 'эту часть',
    lessonDone: 'Пройдено',

    // Practice
    practiceTitle: 'Практика',
    practiceSubtitle: 'Решай задачи прямо в приложении. Код компилируется и проверяется на сервере.',
    practiceSolved: 'Решено',
    practiceTaskNOfM: 'Задача {n} из {m}',
    practiceSolvedCount: 'Решено {n} из {m} задач',
    practiceYourCode: 'Твой код:',
    practiceExamples: 'Примеры:',
    back: 'Назад',
    check: 'Проверить',
    reset: 'Сбросить',
    hint: 'Подсказка',
    diffEasy: 'Лёгкая',
    diffMedium: 'Средняя',
    diffHard: 'Сложная',
    done: 'Готово',
    similarTask: 'Похожая задача',

    // Quiz / Lesson
    optionLetters: ['А', 'Б', 'В', 'Г'],
    resultGreat: 'Отлично!',
    resultGood: 'Хорошо!',
    resultBetter: 'Можно лучше!',
    resultPerfect: 'Идеально!',
    resultWellDone: 'Молодец!',
    resultKeepGoing: 'Не сдавайся!',
    resultRetry: 'Попробуй ещё',
    lessonLabel: 'Урок:',
    correct: 'Верно',
    continueBtn: 'Продолжить',
    doneBtn: 'Готово ✓',
    retry: 'Повторить',
    closeBtn: 'Закрыть',
    nextQuestion: 'Следующий →',
    finishQuiz: 'Завершить ✓',
    resultLabel: 'Результат',
    correctAnswers: 'правильных ответов',
    partFailHint: 'Для зачёта части нужно минимум {n} правильных. Попробуй ещё раз!',
    retryForCredit: 'Попробуй ещё раз для зачёта',
    noXpRepeat: 'Повторное прохождение — XP не начисляется',
    chapterDone: 'Глава пройдена!',
    quizTopic: 'Тест по теме:',
  },
  en: {
    pageTitle: 'RustLings 🦀 — Learn Rust easily',
    skipLink: 'Skip to content',

    logoSub: 'Learn Rust the fun way',

    navHome: 'Home',
    navWhyRust: 'Why Rust?',
    navTextbook: 'Textbook',
    navLessons: 'Lessons',
    navPractice: 'Practice',
    navFirstProject: 'First Project',
    navAchievements: 'Achievements',

    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    themeToggle: 'Toggle theme',
    langToggle: 'Switch language',
    level: 'Level',

    heroGreeting: 'Hi! Ready to learn Rust?',
    heroSubtitle: 'Easy Rust textbook — simple, with analogies, like for 12-year-olds.',
    heroToLessons: 'To lessons',
    heroTextbook: 'Textbook',
    heroPractice: 'Practice',
    heroFirstProject: 'First Project',
    heroWhyRust: 'Why Rust?',

    statXp: 'XP points',
    statLevel: 'Level',
    statLessonsDone: 'Lessons done',
    statTasksDone: 'Tasks solved',
    statStreak: 'Day streak',

    dailyQuests: 'Daily quests',
    questDone: 'Done!',
    streakFreeze: 'Streak Freeze',
    streakFreezeAvailable: 'available',
    monday: 'Monday',
    continueTitle: 'Continue',
    lessonUnit: 'Lesson',
    textbookUnit: 'Textbook',
    allLessonsDone: 'All lessons completed!',
    allChaptersDone: 'All chapters read!',
    progress: 'Progress',
    lessons: 'Lessons',
    textbook: 'Textbook',
    streakDays: 'day streak',
    recentAchievements: 'Recent achievements',
    firstAchievementHint: 'Complete your first lesson to earn your first achievement!',

    closeChapter: 'Close chapter',
    takeChapterQuiz: 'Take chapter quiz →',
    questionNOfM: 'Question {n} of {m}',
    closeQuiz: 'Close quiz',
    closeLesson: 'Close lesson',

    searchNoResults: 'No results found',
    copied: 'Copied!',
    copy: 'Copy',
    loadError: 'Error loading data...',

    textbookTitle: 'Rust Textbook',
    textbookSubtitle: 'Based on Easy Rust — explanations for 12-year-olds, with real-life analogies',
    searchPlaceholder: 'Search chapters...',
    chapter: 'Chapter',
    read: 'Read',
    superQuiz: 'Super quiz',
    superQuizDone: 'Super quiz passed',
    superQuizPart: 'Super quiz part',
    superQuizLock: 'read all',
    chapters: 'chapters',

    lessonsTitle: 'Lessons',
    lessonsSubtitle: 'Test your knowledge — code questions, multiple choice, explanations. Some lessons unlock after completing the corresponding textbook part.',
    lockMsg: 'Complete previous lessons to unlock',
    lockTextbookFirst: 'Complete',
    lockPrevLesson: 'Complete the previous lesson first!',
    inTextbook: 'in the textbook',
    thisPart: 'this part',
    lessonDone: 'Completed',

    practiceTitle: 'Practice',
    practiceSubtitle: 'Solve tasks right in the app. Code is compiled and checked on the server.',
    practiceSolved: 'Solved',
    practiceTaskNOfM: 'Task {n} of {m}',
    practiceSolvedCount: 'Solved {n} of {m} tasks',
    practiceYourCode: 'Your code:',
    practiceExamples: 'Examples:',
    back: 'Back',
    check: 'Check',
    reset: 'Reset',
    hint: 'Hint',
    diffEasy: 'Easy',
    diffMedium: 'Medium',
    diffHard: 'Hard',
    done: 'Done',
    similarTask: 'Similar task',

    optionLetters: ['A', 'B', 'C', 'D'],
    resultGreat: 'Great!',
    resultGood: 'Good!',
    resultBetter: 'Could be better!',
    resultPerfect: 'Perfect!',
    resultWellDone: 'Well done!',
    resultKeepGoing: "Don't give up!",
    resultRetry: 'Try again',
    lessonLabel: 'Lesson:',
    correct: 'Correct',
    continueBtn: 'Continue',
    doneBtn: 'Done ✓',
    retry: 'Retry',
    closeBtn: 'Close',
    nextQuestion: 'Next →',
    finishQuiz: 'Finish ✓',
    resultLabel: 'Result',
    correctAnswers: 'correct answers',
    partFailHint: 'You need at least {n} correct to pass. Try again!',
    retryForCredit: 'Try again to get credit',
    noXpRepeat: 'Repeat — no XP awarded',
    chapterDone: 'Chapter completed!',
    quizTopic: 'Quiz topic:',
  },
};

let _lang = 'ru';

export function getLang() {
  return _lang;
}

export function setLang(lang) {
  if (lang !== 'ru' && lang !== 'en') return;
  _lang = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem('rustlings_lang', lang);
  } catch (_) {}
}

export function t(key, params = {}) {
  const dict = TRANSLATIONS[_lang] || TRANSLATIONS.ru;
  let s = dict[key];
  if (s === undefined) s = TRANSLATIONS.ru[key] || key;
  if (typeof s === 'string' && Object.keys(params).length) {
    Object.entries(params).forEach(([k, v]) => {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return s;
}

export function initI18n() {
  try {
    const stored = localStorage.getItem('rustlings_lang');
    if (stored === 'ru' || stored === 'en') {
      _lang = stored;
    }
  } catch (_) {}
  document.documentElement.lang = _lang;
}

/** Обновить все элементы с data-i18n и data-i18n-aria */
export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (key) el.setAttribute('aria-label', t(key));
  });
  document.title = t('pageTitle');
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = _lang.toUpperCase();
}
