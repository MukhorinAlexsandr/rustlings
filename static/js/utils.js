// ============================================================
// utils.js — Вспомогательные функции без зависимостей
// ============================================================

export function getTodayKey() {
  return new Date().toDateString();
}

export function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toDateString();
}

export function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function sanitizeHtml(str) {
  if (str == null) return '';
  if (typeof DOMPurify === 'undefined') return escHtml(str);
  return DOMPurify.sanitize(String(str), {
    ALLOWED_TAGS: ['code', 'strong', 'em', 'br'],
    ALLOWED_ATTR: [],
  });
}

/** SVG-иконка из спрайта (для динамического рендера) */
export function iconSvg(name, size = 20) {
  return `<svg width="${size}" height="${size}" aria-hidden="true"><use href="/icons.svg#icon-${name}"/></svg>`;
}

/** Подсветка кода только в указанном контейнере (вместо глобального highlightAll) */
export function highlightInContainer(container) {
  if (typeof hljs === 'undefined' || !container) return;
  container.querySelectorAll('pre code').forEach((el) => {
    try {
      hljs.highlightElement(el);
    } catch (_) {}
  });
}
