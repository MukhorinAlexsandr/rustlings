# =============================================================================
# Rustlings — деплой на Fly.io
# Сборка приложения и runtime с rustc для проверки решений
# =============================================================================

# Этап 1: Сборка
FROM rust:1-bookworm AS builder
WORKDIR /app

# Копируем манифесты для кэширования зависимостей
COPY Cargo.toml Cargo.lock* ./
COPY src ./src

# Предварительная сборка зависимостей (ускоряет пересборку)
RUN cargo build --release 2>/dev/null || true

# Копируем статику и пересобираем
COPY static ./static
RUN touch src/main.rs && cargo build --release

# Этап 2: Runtime — нужен rustc для компиляции кода пользователей
FROM rust:1-slim-bookworm
WORKDIR /app

# Копируем бинарник и статику
COPY --from=builder /app/target/release/rustlings /app/rustlings
COPY --from=builder /app/static /app/static

# Fly.io проксирует на этот порт
EXPOSE 3000

ENV PORT=3000
CMD ["./rustlings"]
