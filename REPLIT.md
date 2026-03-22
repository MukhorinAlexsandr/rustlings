# Деплой Rustlings на Replit

Без карты, бесплатно. Replit засыпает после 1 часа неактивности — первый запрос после паузы разбудит сервер за ~30 сек.

## Шаг 1: Загрузить проект на Replit

### Вариант А: Через GitHub (удобно для обновлений)

1. Залей проект на GitHub (если ещё не загружен):
   ```bash
   cd C:\Users\8mcla\rustlings
   git init
   git add .
   git commit -m "Rustlings"
   # Создай репозиторий на github.com и подключи:
   git remote add origin https://github.com/ТВОЙ_USERNAME/rustlings.git
   git push -u origin main
   ```

2. Replit → **Create Repl** → **Import from GitHub** → вставь URL репо.

### Вариант Б: Через ZIP

1. Создай ZIP папки `rustlings` (с Cargo.toml, src, static, .replit, replit.nix).

2. Replit → **Create Repl** → **Import** → загрузи ZIP.

## Шаг 2: Запуск

1. В Replit нажми **Run** (или `cargo run` в консоли).
2. Первая сборка займёт 2–5 минут.
3. Открой встроенный **Webview** (кнопка рядом с Run) или используй выданный URL.

## Шаг 3: Публикация (по желанию)

Replit → **Deploy** → **Deploy** — будет доступен постоянный публичный URL (есть ограничения бесплатного плана).

---

Файлы `.replit` и `replit.nix` уже настроены в проекте.
