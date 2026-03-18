// lessons.js — страница уроков
import { LESSONS, LESSON_PARTS, TEXTBOOK_PARTS } from '../data.js';
import { STATE } from '../state.js';
import { sanitizeHtml } from '../utils.js';
import { t } from '../i18n.js';

export function isTextbookPartComplete(partId) {
  const part = TEXTBOOK_PARTS.find((p) => p.id === partId);
  if (!part) return true;
  for (let id = part.startId; id <= part.endId; id++) {
    if (!STATE.completedChapters.includes(id)) return false;
  }
  return true;
}

export function scrollToTextbookPart(partId) {
  const el = document.querySelector('[data-textbook-part="' + partId + '"]');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function renderLessons() {
  return `
    <div class="page-header">
      <div class="page-title">🎯 Уроки</div>
      <div class="page-subtitle">Проверь знания — вопросы с кодом, выбор ответа, объяснения. Часть уроков открывается после прохождения соответствующей части в учебнике.</div>
    </div>
    ${LESSON_PARTS.map((part) => {
      const textbookPart = TEXTBOOK_PARTS.find((p) => p.id === part.id);
      const partUnlocked = isTextbookPartComplete(part.id);
      const lessons = LESSONS.filter((l) => l.id >= part.startId && l.id <= part.endId);
      return `
    <div class="lesson-part ${partUnlocked ? '' : 'lesson-part-locked'}">
      <div class="lesson-part-header">
        <div class="lesson-part-title">${sanitizeHtml(part.title)}</div>
        <div class="lesson-part-subtitle">${sanitizeHtml(part.subtitle)}</div>
        ${
          !partUnlocked
            ? `
        <div class="lesson-part-lock-msg" onclick="navigate('textbook'); setTimeout(function(){ scrollToTextbookPart(${part.id}); }, 150)">
          🔒 ${t('lockTextbookFirst')} ${textbookPart ? sanitizeHtml(textbookPart.title) : t('thisPart')} ${t('inTextbook')}
        </div>`
            : ''
        }
      </div>
      <div class="lessons-grid">
        ${lessons
          .map((lesson, _idx) => {
            const globalIdx = LESSONS.findIndex((l) => l.id === lesson.id);
            const done = STATE.completedLessons.includes(lesson.id);
            const prevLessonLocked =
              globalIdx > 0 && !STATE.completedLessons.includes(LESSONS[globalIdx - 1].id);
            const locked = !partUnlocked || prevLessonLocked;
            const lockMsg = !partUnlocked
              ? t('lockTextbookFirst') + ' ' + (textbookPart ? sanitizeHtml(textbookPart.title) : t('thisPart')) + ' ' + t('inTextbook')
              : t('lockPrevLesson');
            const stars = '⭐'.repeat(lesson.stars) + '☆'.repeat(3 - lesson.stars);
            return `
        <div class="lesson-card ${done ? 'completed' : ''} ${locked ? 'locked' : ''}"
             onclick="${locked ? `notify('🔒','${lockMsg.replace(/'/g, "\\'")}')` : `openLesson(${lesson.id})`}">
          <div class="lesson-icon-wrap">${lesson.icon}</div>
          <div class="lesson-title">${sanitizeHtml(lesson.title)}</div>
          <div class="lesson-desc">${sanitizeHtml(lesson.desc)}</div>
          <div class="lesson-footer">
            <div class="lesson-stars">${stars}</div>
            <div class="lesson-xp">+${lesson.xp} XP</div>
            <div class="lesson-completed-tag">✓ ${t('lessonDone')}</div>
          </div>
          ${locked ? '<div class="locked-overlay">🔒</div>' : ''}
        </div>`;
          })
          .join('')}
      </div>
    </div>`;
    }).join('')}
  `;
}
