# Деплой Rustlings на Fly.io

## Требования

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) — `winget install Fly.Flyctl` или скачай с fly.io
- Аккаунт на [fly.io](https://fly.io) (бесплатный)

## Шаги

### 1. Войти в Fly.io

```bash
flyctl auth login
```

### 2. Запустить деплой

```bash
cd C:\Users\8mcla\rustlings
flyctl launch
```

При первом запуске:
- **App name:** оставь `rustlings` или придумай свой (например `my-rustlings`)
- **Region:** выбери ближайший (например `ams` для Амстердама)
- **Postgres/Redis:** нажми **No** — не нужны

### 3. Задеплоить приложение

```bash
flyctl deploy
```

Сборка займёт 5–10 минут (компиляция Rust + загрузка образа).

### 4. Открыть в браузере

```bash
flyctl open
```

Или перейди по адресу: **https://rustlings.fly.dev** (или твой app name).

## Полезные команды

| Команда | Описание |
|---------|----------|
| `flyctl status` | Статус приложения |
| `flyctl logs` | Логи в реальном времени |
| `flyctl deploy` | Повторный деплой после изменений |

## Примечание

Приложение использует **auto_stop/auto_start** — VM останавливается при простое и запускается при первом запросе. Первая загрузка после паузы может занять 20–30 секунд.
