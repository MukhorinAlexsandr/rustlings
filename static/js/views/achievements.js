// achievements.js — страница достижений
import { ACHIEVEMENTS } from '../data.js';
import { STATE } from '../state.js';
import { sanitizeHtml } from '../utils.js';

export function renderAchievements() {
  const unlocked = STATE.unlockedAchievements.length;
  return `
    <div class="page-header">
      <div class="page-title">🏆 Достижения</div>
      <div class="page-subtitle">Разблокировано: ${unlocked} из ${ACHIEVEMENTS.length}</div>
    </div>
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map((a) => {
        const done = STATE.unlockedAchievements.includes(a.id);
        return `
        <div class="achievement-card ${done ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${sanitizeHtml(a.name)}</div>
            <div class="achievement-desc">${sanitizeHtml(a.desc)}</div>
            ${done ? '<div class="achievement-badge">✓ Получено</div>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}
