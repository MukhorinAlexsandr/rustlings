// textbook.js — страница учебника + поиск
import { TEXTBOOK, TEXTBOOK_PARTS, PART_QUIZZES } from '../data.js';
import { STATE } from '../state.js';
import { escHtml, sanitizeHtml } from '../utils.js';
import { t } from '../i18n.js';

export function getChapterSearchText(ch) {
  let text = (ch.title || '') + ' ' + (ch.desc || '');
  if (ch.sections && Array.isArray(ch.sections)) {
    ch.sections.forEach((s) => {
      if (s.content) text += ' ' + s.content;
      if (s.title) text += ' ' + s.title;
      if (s.items && Array.isArray(s.items)) text += ' ' + s.items.join(' ');
    });
  }
  return text.toLowerCase();
}

export function searchTextbook(query) {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  return TEXTBOOK.filter((ch) => getChapterSearchText(ch).includes(q));
}

export function highlightMatch(text, query) {
  if (!query || !text) return escHtml(text);
  const q = escHtml(query);
  const t = escHtml(text);
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return t.replace(re, '<mark class="search-highlight">$1</mark>');
}

export function renderTextbook() {
  return `
    <div class="page-header textbook-header">
      <div class="textbook-header-top">
        <div>
          <div class="page-title">📚 ${t('textbookTitle')}</div>
          <div class="page-subtitle">${t('textbookSubtitle')}</div>
        </div>
        <div class="textbook-search-wrap">
          <span class="textbook-search-icon" aria-hidden="true"><svg width="18" height="18"><use href="/icons.svg#icon-search"/></svg></span>
          <input type="search" class="textbook-search" id="textbook-search" placeholder="${t('searchPlaceholder')}" autocomplete="off" aria-label="${t('searchPlaceholder')}">
          <div class="textbook-search-results" id="textbook-search-results" aria-live="polite"></div>
        </div>
      </div>
    </div>
    ${TEXTBOOK_PARTS.map((part) => {
      const chapters = TEXTBOOK.filter((ch) => ch.id >= part.startId && ch.id <= part.endId);
      const allChaptersRead = chapters.every((ch) => STATE.completedChapters.includes(ch.id));
      const partQuiz = PART_QUIZZES.find((pq) => pq.partId === part.id);
      const partQuizDone = STATE.completedPartQuizzes?.includes(part.id) ?? false;
      const canStartPartQuiz = allChaptersRead && partQuiz && partQuiz.questions?.length > 0;
      return `
    <div class="textbook-part" data-textbook-part="${part.id}">
      <div class="textbook-part-header">
        <div class="textbook-part-title">${sanitizeHtml(part.title)}</div>
        <div class="textbook-part-subtitle">${sanitizeHtml(part.subtitle)}</div>
      </div>
      <div class="chapters-grid">
        ${chapters
          .map((ch) => {
            const done = STATE.completedChapters.includes(ch.id);
            return `
        <div class="chapter-card ${done ? 'completed' : ''}" onclick="openChapter(${ch.id})">
          <div class="chapter-icon">${ch.icon}</div>
          <div class="chapter-meta">
            <div class="chapter-num">${t('chapter')} ${ch.id}</div>
            <div class="chapter-title">${sanitizeHtml(ch.title)}</div>
            <div class="chapter-desc">${sanitizeHtml(ch.desc)}</div>
            <div class="chapter-footer">
              <div class="read-time">⏱ ${ch.readTime} мин</div>
              <div class="chapter-xp">+${ch.xp} XP</div>
              <div class="chapter-done-badge">✓ ${t('read')}</div>
            </div>
          </div>
        </div>`;
          })
          .join('')}
      </div>
      ${partQuiz ? `
      <div class="textbook-part-quiz-wrap">
        <button class="btn ${partQuizDone ? 'btn-secondary' : 'btn-primary'} textbook-part-quiz-btn ${!canStartPartQuiz ? 'disabled' : ''}" 
          onclick="${canStartPartQuiz && !partQuizDone ? `startPartQuiz(${part.id})` : ''}"
          ${!canStartPartQuiz ? 'disabled' : ''}
          title="${partQuizDone ? t('superQuizDone') : !allChaptersRead ? t('superQuizLock') + ' ' + t('chapters') : t('superQuiz')}">
          ${partQuizDone ? '✓ ' + t('superQuizDone') : allChaptersRead ? `🎯 ${t('superQuizPart')} ${part.id} (+${partQuiz.xp} XP)` : `🔒 ${t('superQuiz')} (${t('superQuizLock')} ${chapters.length} ${t('chapters')})`}
        </button>
      </div>` : ''}
    </div>`;
    }).join('')}
  `;
}
