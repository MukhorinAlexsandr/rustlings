# План проекта RustLings

Документ описывает расположение проекта, структуру и логику. Код не менялся.

---

## 1. Где проект

- **Путь:** `C:\Users\8mcla\rustlings`
- **Тип:** веб-приложение (бэкенд на Rust, фронтенд на JS).
- **Запуск:** из папки `rustlings` выполнить `cargo run`, открыть в браузере http://127.0.0.1:3000

---

## 2. Роль частей проекта

| Часть | Назначение |
|-------|------------|
| **Бэкенд (Rust)** | Сервер Axum: раздаёт статику из `static/` и один API `GET /api/hello` (JSON). |
| **Фронтенд** | Одна страница (`index.html`), логика в ES-модулях в `static/js/`. |
| **Данные** | JSON в `static/data/`: учебник, уроки, квизы, достижения, квесты, первый проект. |
| **Сборка** | `cargo build` / `cargo run`. Для JS: ESLint, Prettier (`npm run lint`, `npm run format:write`). |

---

## 3. Бэкенд (Rust)

- **Файл:** `src/main.rs`
- **Стек:** axum, tokio, tower_http, serde, serde_json
- **Логика:**
  - Роутер: `GET /api/hello` → `hello_handler()` (возвращает `{"message": "Привет с бэкенда!"}`).
  - Все остальные запросы → раздача файлов из папки `static/` (ServeDir).
  - Слушает `127.0.0.1:3000`.

---

## 4. Фронтенд — точка входа и навигация

- **Точка входа:** `static/index.html` подключает `static/js/main.js` как модуль.
- **main.js:**
  - При загрузке вызывает `loadData()` (подгружает все JSON из `data/`).
  - Навигация по разделам: `navigate(page)` — переключает страницы без перезагрузки (`dashboard`, `why-rust`, `textbook`, `lessons`, `first-project`, `achievements`).
  - Обновляет сайдбар (уровень, XP, прогресс до следующего уровня).
  - Вешает обработчики: сайдбар, нижняя навигация, мобильное меню, переключатель темы, закрытие модалок по Escape и клику по фону, поиск по учебнику, копирование кода.
  - Экспортирует в `window` функции для onclick в HTML: `navigate`, `openChapter`, `openLesson`, квизы, закрытие оверлеев и т.д.

---

## 5. Данные и состояние

- **data.js**
  - Экспортирует глобальные массивы: `TEXTBOOK`, `TEXTBOOK_PARTS`, `PART_QUIZZES`, `LESSON_PARTS`, `LESSONS`, `FIRST_PROJECTS`, `DAILY_QUESTS`, и константу `ACHIEVEMENTS` (массив с `id`, `icon`, `name`, `desc`, `condition(state)`).
  - `loadData()` — параллельно запрашивает все JSON из `data/`, заполняет эти переменные; при ошибке показывает сообщение и бросает исключение.

- **state.js**
  - `STATE` — объект прогресса: `totalXP`, `level`, `lessonsCompleted`, `chaptersRead`, `completedLessons`, `completedChapters`, `completedPartQuizzes`, `unlockedAchievements`, `perfectQuizzes`, `streak`, `lastDate`, `streakFreezes`, `dailyProgress` и т.д.
  - Загрузка/сохранение: `loadState()` / `saveState()` через `localStorage` ключ `rustlings_state`.
  - XP и уровни: `XP_PER_LEVEL`, `computeLevel()`, `xpForNextLevel()`, `xpForCurrentLevel()`.
  - Достижения: `checkAchievements()` — проверяет условия из `ACHIEVEMENTS`, при выполнении добавляет в `unlockedAchievements` и шлёт уведомление.
  - Ежедневные квесты: `getDailyProgress()`, `checkDailyQuest(unit, amount)` — обновляет дневной прогресс и начисляет бонус XP за выполнение квестов.
  - Серия дней: `updateStreak()`, streak freeze (раз в неделю пополнение), вызывается при `addXP()`.
  - `addXP(amount)` — добавляет XP, пересчитывает уровень, проверяет достижения, обновляет streak и дневные квесты, сохраняет состояние и диспатчит события `rustlings:state-updated` и при повышении уровня `rustlings:level-up`.

---

## 6. Представления (страницы)

В `static/js/views/`:

| Файл | Страница | Назначение |
|------|----------|------------|
| dashboard.js | Главная | `renderDashboard()` — дашборд с квизами частей, дневными квестами, быстрыми ссылками. |
| why-rust.js | Почему Rust? | `renderWhyRust()` — контент блока «Почему Rust». |
| textbook.js | Учебник | `renderTextbook()` — список частей и глав из `TEXTBOOK_PARTS`/`TEXTBOOK`; `searchTextbook(q)`, `highlightMatch()` — поиск и подсветка. |
| lessons.js | Уроки | `renderLessons()` — список уроков из `LESSONS`; `scrollToTextbookPart()` — скролл к части учебника. |
| first-project.js | Первый проект | `renderFirstProject()` — задания из `FIRST_PROJECTS`. |
| achievements.js | Достижения | `renderAchievements()` — список достижений из `ACHIEVEMENTS` и статус разблокировки из `STATE.unlockedAchievements`. |

---

## 7. Модалки и интерактив

- **chapter.js** — открытие/закрытие модалки главы учебника: `openChapter(id)`, `closeChapterOverlay()`, текущая глава `currentChapterId`; кнопка «Тест» в читалке запускает квиз по главе.
- **quiz.js** — квизы: по главе (`startChapterQuiz`) и по части (`startPartQuiz`), выбор варианта `selectQuizOption`, следующий вопрос `nextQuizQuestion`, закрытие `closeQuizOverlay`.
- **lesson.js** — уроки: `openLesson`, `selectLessonOption`, `nextLessonQuestion`, `retryLesson`, `closeLessonOverlay`.
- **notify.js** — уведомления (тост) и конфетти.
- **utils.js** — утилиты: экранирование HTML, санитизация, подсветка кода в контейнере, даты для streak/daily.
- **a11y.js** — доступность: focus trap в оверлеях и т.п.

---

## 8. Статика и данные

- **static/**  
  - `index.html`, `style.css`, `manifest.json`, `sw.js`, `icons.svg`  
  - `js/` — main.js, data.js, state.js, utils.js, chapter.js, quiz.js, lesson.js, notify.js, a11y.js, views/*.js  
  - `data/` — textbook.json, textbook-parts.json, part-quizzes.json, lesson-parts.json, lessons.json, first-projects.json, daily-quests.json, achievements.json (последний не файл — достижения заданы в data.js как ACHIEVEMENTS).

- **Скрипты (scripts/)**  
  - Вспомогательные: remove-embedded.js, fix-json-quotes.js, extract-data.js, inject-loader.js, create-main.js.

- **Документация/планы в корне**  
  - README.md, DESIGN-ANALYSIS-2026.md, PLAN-*.md, TEXTBOOK-AUDIT.md и др. — описание и планы доработок.

---

## 9. Зависимости

- **Rust (Cargo.toml):** axum 0.7, tokio (full), tower-http (fs), serde (derive), serde_json.
- **Node (package.json):** только dev — eslint, eslint-config-prettier, prettier; скрипты lint и format.

---

## 10. Краткий план дальнейших шагов (без изменения кода)

Если позже захочешь развивать проект, логичный порядок:

1. **Проверка запуска** — `cargo run`, открыть http://127.0.0.1:3000, пройти главную, учебник, урок, квиз, достижения.
2. **Добавление задач/упражнений** — либо новые JSON в `data/`, либо новый раздел в навигации + view + роут при необходимости.
3. **Расширение API** — при необходимости добавить в `src/main.rs` новые маршруты (например, сохранение прогресса на сервер).
4. **Тесты** — отдельный план уже есть в PLAN-TESTY-QUIZ.md и др.; можно опираться на них.

Текущая логика проекта сохранена и в коде не менялась.
