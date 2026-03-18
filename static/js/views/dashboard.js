// dashboard.js — главная страница
import { LESSONS, TEXTBOOK, ACHIEVEMENTS, DAILY_QUESTS, PRACTICE_TASKS } from '../data.js';
import { STATE, getDailyProgress } from '../state.js';
import { sanitizeHtml, iconSvg } from '../utils.js';
import { t } from '../i18n.js';

export function renderDashboard() {
  const lessonsTotal = LESSONS.length;
  const chaptersTotal = TEXTBOOK.length;
  const lessonsPct = Math.round((STATE.lessonsCompleted / lessonsTotal) * 100);
  const chaptersPct = Math.round((STATE.chaptersRead / chaptersTotal) * 100);

  const nextLesson = LESSONS.find((l) => !STATE.completedLessons.includes(l.id));
  const nextChapter = TEXTBOOK.find((c) => !STATE.completedChapters.includes(c.id));

  return `
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-badge"><span class="hero-badge-icon">${iconSvg('crab', 16)}</span> RustLings</div>
        <div class="hero-title">${t('heroGreeting')}</div>
        <div class="hero-sub">${t('heroSubtitle')}</div>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg hero-cta" onclick="navigate('lessons')">
            <span class="btn-icon">${iconSvg('target', 20)}</span>
            ${t('heroToLessons')}
          </button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('textbook')"><span class="btn-icon">${iconSvg('book', 18)}</span> ${t('heroTextbook')}</button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('practice')"><span class="btn-icon">${iconSvg('rocket', 18)}</span> ${t('heroPractice')}</button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('first-project')"><span class="btn-icon">${iconSvg('rocket', 18)}</span> ${t('heroFirstProject')}</button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('why-rust')"><span class="btn-icon">${iconSvg('crab', 18)}</span> ${t('heroWhyRust')}</button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-crab"><svg width="140" height="140" aria-hidden="true"><use href="/icons.svg#icon-crab"/></svg></div>
        <div class="hero-glow"></div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-xp">
        <div class="stat-icon-wrap">
          <span class="stat-icon">⭐</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">${STATE.totalXP}</div>
          <div class="stat-label">${t('statXp')}</div>
        </div>
      </div>
      <div class="stat-card stat-level">
        <div class="stat-icon-wrap">
          <span class="stat-icon">🏅</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">${STATE.level}</div>
          <div class="stat-label">${t('statLevel')}</div>
        </div>
      </div>
      <div class="stat-card stat-lessons">
        <div class="stat-icon-wrap">
          <span class="stat-icon">🎯</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">${STATE.lessonsCompleted}</div>
          <div class="stat-label">${t('statLessonsDone')}</div>
        </div>
      </div>
      <div class="stat-card stat-practice" onclick="navigate('practice')" style="cursor:pointer">
        <div class="stat-icon-wrap">
          <span class="stat-icon">💻</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">${(STATE.completedPracticeTasks || []).length}</div>
          <div class="stat-label">${t('statTasksDone')}</div>
        </div>
      </div>
      <div class="stat-card stat-streak">
        <div class="stat-icon-wrap">
          <span class="stat-icon">🔥</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">${STATE.streak || 0}</div>
          <div class="stat-label">${t('statStreak')}</div>
        </div>
      </div>
    </div>

    <div class="quests-block">
      <div class="quests-block-header">
        <div class="quests-block-title">
          <span class="quests-block-icon">⚔️</span>
          <span>${t('dailyQuests')}</span>
        </div>
        <div class="quests-block-badge">
          ${getDailyProgress().completed.length}/${DAILY_QUESTS.length}
        </div>
      </div>
      <div class="quests-list">
        ${DAILY_QUESTS.map((q, i) => {
          const prog = getDailyProgress();
          const val =
            q.unit === 'lessons' ? prog.lessons : q.unit === 'chapters' ? prog.chapters : prog.xp;
          const done = prog.completed.includes(q.id);
          const pct = Math.min(100, Math.round((val / q.target) * 100));
          const accent = ['quest-accent-1', 'quest-accent-2', 'quest-accent-3'][i];
          return `<div class="quest-item ${done ? 'done' : ''} ${accent}">
            <div class="quest-item-glow"></div>
            <div class="quest-icon-wrap">
              <span class="quest-icon">${done ? '✓' : q.icon}</span>
            </div>
            <div class="quest-info">
              <div class="quest-title">${sanitizeHtml(q.title)}</div>
              <div class="quest-progress-wrap">
                <div class="quest-track">
                  <div class="quest-fill" style="width:${pct}%"></div>
                  <div class="quest-track-shine"></div>
                </div>
                <span class="quest-num">${val}/${q.target}</span>
              </div>
            </div>
            <div class="quest-bonus-wrap">
              <span class="quest-bonus">${done ? t('questDone') : '+' + q.bonusXP + ' XP'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="quests-freeze-bar">
        <div class="quests-freeze-icon">❄️</div>
        <div class="quests-freeze-info">
          <span class="quests-freeze-label">${t('streakFreeze')}</span>
          <span class="quests-freeze-value">${STATE.streakFreezes ?? 1} ${t('streakFreezeAvailable')}</span>
        </div>
        <span class="quests-freeze-hint">${t('monday')}</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dash-card continue-card glow-card">
        <div class="dash-card-header">
          <span class="dash-card-icon">▶</span>
          <span class="dash-card-title">${t('continueTitle')}</span>
        </div>
        ${
          nextLesson
            ? `
        <div class="continue-item" onclick="openLesson(${nextLesson.id})">
          <div class="continue-icon">${nextLesson.icon}</div>
          <div class="continue-info">
            <div class="continue-title">${sanitizeHtml(nextLesson.title)}</div>
            <div class="continue-sub">${t('lessonUnit')} · ${nextLesson.xp} XP</div>
          </div>
        </div>`
            : `<div class="continue-item"><div class="continue-info"><div class="continue-title">✅ ${t('allLessonsDone')}</div></div></div>`
        }
        ${
          nextChapter
            ? `
        <div class="continue-item" onclick="openChapter(${nextChapter.id})">
          <div class="continue-icon">${nextChapter.icon}</div>
          <div class="continue-info">
            <div class="continue-title">${sanitizeHtml(nextChapter.title)}</div>
            <div class="continue-sub">${t('textbookUnit')} · ${nextChapter.xp} XP</div>
          </div>
        </div>`
            : `<div class="continue-item"><div class="continue-info"><div class="continue-title">✅ ${t('allChaptersDone')}</div></div></div>`
        }
      </div>

      <div class="dash-card glass-card">
        <div class="dash-card-header">
          <span class="dash-card-icon">📊</span>
          <span class="dash-card-title">${t('progress')}</span>
        </div>
        <div class="progress-list">
          <div class="progress-item">
            <div class="progress-label">${t('lessons')}</div>
            <div class="progress-track"><div class="progress-fill" style="width:${lessonsPct}%"></div></div>
            <div class="progress-pct">${lessonsPct}%</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">${t('textbook')}</div>
            <div class="progress-track"><div class="progress-fill" style="width:${chaptersPct}%"></div></div>
            <div class="progress-pct">${chaptersPct}%</div>
          </div>
        </div>
        <div class="streak-display" style="margin-top:16px">
          <div class="streak-num">${STATE.streak || 0}</div>
          <div class="streak-label">🔥 ${t('streakDays')}</div>
        </div>
      </div>
    </div>

    <div class="dash-card glass-card">
      <div class="dash-card-header">
        <span class="dash-card-icon">🏆</span>
          <span class="dash-card-title">${t('recentAchievements')}</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
        ${
          STATE.unlockedAchievements.length === 0
            ? `<div style="color:var(--text3);font-size:14px">${t('firstAchievementHint')}</div>`
            : STATE.unlockedAchievements
                .slice(-4)
                .map((id) => {
                  const a = ACHIEVEMENTS.find((x) => x.id === id);
                  return a
                    ? `<div style="background:var(--warning-bg);border:1px solid rgba(251,191,36,.25);border-radius:8px;padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:6px"><span>${a.icon}</span><span style="color:var(--warning);font-weight:600">${sanitizeHtml(a.name)}</span></div>`
                    : '';
                })
                .join('')
        }
      </div>
    </div>
  `;
}
