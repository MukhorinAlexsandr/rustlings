# RustLings 🦀

Интерактивный учебник Rust + Web3 (Solana, Anchor). Учи Rust легко — от основ до смарт-контрактов.

## Возможности

- **98 глав учебника** — от переменных до Anchor
- **27 уроков** — тесты на закрепление
- **Достижения и XP** — геймификация прогресса
- **Первый проект** — практические задания
- **Части:** основы, данные, продвинутый Rust, инструменты, async, веб, файлы и сеть, криптография, блокчейн, Solana, Anchor

## Требования

- [Rust](https://rustup.rs/) (Cargo входит в установку)

## Быстрый старт

```bash
# Клонируй репозиторий (или перейди в папку проекта)
cd rustlings

# Запусти сервер
cargo run
```

Открой в браузере: **http://127.0.0.1:3000**

## Структура проекта

```
rustlings/
├── src/
│   └── main.rs          # Бэкенд на Axum (раздача static + API)
├── static/
│   ├── index.html       # Главная страница
│   ├── style.css        # Стили
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service Worker (офлайн)
│   ├── js/
│   │   ├── main.js      # Точка входа, навигация
│   │   ├── data.js      # Загрузка JSON, ACHIEVEMENTS
│   │   ├── state.js     # STATE, XP, уровни, streak
│   │   ├── utils.js     # escHtml, sanitizeHtml, highlight
│   │   ├── views/       # Рендер страниц (dashboard, textbook, lessons...)
│   │   ├── chapter.js   # Модалка главы
│   │   ├── quiz.js      # Квиз по главе
│   │   ├── lesson.js    # Модалка урока
│   │   ├── notify.js    # Уведомления, confetti
│   │   └── a11y.js      # Overlay, focus trap
│   └── data/            # JSON: textbook, lessons, daily-quests...
├── Cargo.toml           # Зависимости Rust
├── package.json         # ESLint, Prettier
└── README.md
```

## Разработка

- **Бэкенд:** Axum, Tokio, tower-http
- **Фронтенд:** Vanilla JS (ES modules), localStorage для прогресса
- **Контент:** `data/*.json` + `data.js` (ACHIEVEMENTS)
- **Lint:** `npm run lint` | **Format:** `npm run format:write`

### Сборка

```bash
cargo build          # Debug-сборка
cargo build --release  # Release (оптимизированная)
```

### Запуск

```bash
cargo run            # Debug
cargo run --release  # Release
```

## Лицензия

MIT (или укажи свою)
