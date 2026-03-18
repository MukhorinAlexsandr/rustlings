// chapter.js — модалка главы, рендер секций
import { TEXTBOOK } from './data.js';
import { escHtml, sanitizeHtml, highlightInContainer } from './utils.js';
import { openOverlay, closeOverlay } from './a11y.js';
import { t } from './i18n.js';

export let currentChapterId = null;

export function openChapter(id) {
  const ch = TEXTBOOK.find((c) => c.id === id);
  if (!ch) return;
  currentChapterId = id;

  document.getElementById('reader-title').textContent = `${ch.icon} ${t('chapter')} ${ch.id}: ${ch.title}`;
  document.getElementById('reader-body').innerHTML = renderSections(ch.sections);
  openOverlay('chapter-overlay');
  highlightInContainer(document.getElementById('reader-body'));
  // Глава считается прочитанной только после прохождения теста (см. quiz.js)
}

export function renderSections(sections) {
  return sections
    .map((s) => {
      switch (s.type) {
        case 'heading':
          return `<h2 class="section-heading">${sanitizeHtml(s.content)}</h2>`;
        case 'text':
          return `<p class="section-text">${sanitizeHtml(s.content)}</p>`;
        case 'analogy':
          return `<div class="analogy-box"><div class="analogy-icon">💡</div><div class="analogy-content"><div class="analogy-title">${sanitizeHtml(s.title)}</div><div class="analogy-text">${sanitizeHtml(s.content)}</div></div></div>`;
        case 'code':
          return `<div class="code-block-wrap"><pre><code class="language-rust">${escHtml(s.content)}</code></pre><button type="button" class="code-copy-btn" aria-label="${t('copy')}" title="${t('copy')}">${t('copy')}</button></div>`;
        case 'list':
          return `<ul class="section-list">${(s.items || []).map((i) => `<li>${sanitizeHtml(i)}</li>`).join('')}</ul>`;
        case 'note':
          return `<div class="note-box"><div class="box-icon">ℹ️</div><div>${sanitizeHtml(s.content)}</div></div>`;
        case 'tip':
          return `<div class="tip-box"><div class="box-icon">✅</div><div>${sanitizeHtml(s.content)}</div></div>`;
        case 'warning':
          return `<div class="warning-box"><div class="box-icon">⚠️</div><div>${sanitizeHtml(s.content)}</div></div>`;
        default:
          return `<p class="section-text">${sanitizeHtml(s.content || '')}</p>`;
      }
    })
    .join('');
}

export function closeChapterOverlay() {
  closeOverlay('chapter-overlay');
}
