// first-project.js — страница первого проекта
import { TEXTBOOK, FIRST_PROJECTS } from '../data.js';
import { escHtml, sanitizeHtml } from '../utils.js';

export function renderFirstProject() {
  return `
    <div class="page-header">
      <div class="page-title">🚀 Твой первый проект</div>
      <div class="page-subtitle">Всё, что ты прошёл в учебнике — достаточно для первого проекта. Выбери идею и следуй плану.</div>
    </div>

    <div class="project-intro">
      <p>После глав про переменные, функции, match, Vec и структуры ты уже можешь написать рабочую программу. Ниже — 5 простых идей с пошаговым планом и шаблоном кода.</p>
    </div>

    <div class="project-checklist">
      <div class="project-checklist-title">📋 Что нужно знать (по главам)</div>
      <div class="project-checklist-items">
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(1), 200)" class="check-item">1. Привет, Rust!</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(2), 200)" class="check-item">2. Переменные</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(3), 200)" class="check-item">3. Типы</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(4), 200)" class="check-item">4. Функции</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(5), 200)" class="check-item">5. if/else</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(8), 200)" class="check-item">8. Enum и match</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(7), 200)" class="check-item">7. Структуры</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(10), 200)" class="check-item">10. Vec и итераторы</span>
        <span onclick="navigate('textbook'); setTimeout(() => openChapter(19), 200)" class="check-item">19. Строки</span>
      </div>
    </div>

    <div class="projects-grid">
      ${FIRST_PROJECTS.map((p) => {
        const chapterLinks = p.chapters
          .map((id) => {
            const ch = TEXTBOOK.find((c) => c.id === id);
            return ch
              ? `<a href="#" onclick="navigate('textbook'); setTimeout(() => openChapter(${id}), 200); return false" class="chapter-tag">${ch.icon} ${id}</a>`
              : '';
          })
          .join('');
        return `
        <div class="project-card">
          <div class="project-card-header">
            <span class="project-icon">${p.icon}</span>
            <div>
              <div class="project-title">${sanitizeHtml(p.title)}</div>
              <div class="project-desc">${sanitizeHtml(p.desc)}</div>
            </div>
          </div>
          <div class="project-chapters">
            <span class="project-chapters-label">Главы:</span>
            ${chapterLinks}
          </div>
          <div class="project-steps">
            <div class="project-steps-title">План:</div>
            <ol>
              ${p.steps.map((s) => `<li>${sanitizeHtml(s)}</li>`).join('')}
            </ol>
          </div>
          <div class="project-template">
            <div class="project-template-title">Шаблон:</div>
            <pre><code class="language-rust">${escHtml(p.template)}</code></pre>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="project-cta">
      <p>Создай папку проекта: <code>cargo new имя_проекта</code></p>
      <p>Запусти: <code>cargo run</code></p>
    </div>
  `;
}
