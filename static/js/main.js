// RustLings — main.js (ES modules)
import { loadData } from './data.js';
import { STATE, xpForNextLevel, xpForCurrentLevel } from './state.js';
import { highlightInContainer } from './utils.js';
import { renderDashboard } from './views/dashboard.js';
import { renderWhyRust } from './views/why-rust.js';
import { renderTextbook, searchTextbook, highlightMatch } from './views/textbook.js';
import { renderLessons, scrollToTextbookPart } from './views/lessons.js';
import { renderFirstProject } from './views/first-project.js';
import { renderAchievements } from './views/achievements.js';
import {
  renderPractice,
  openPracticePart,
  backToPractice,
  prevPracticeTask,
  nextPracticeTask,
  resetPracticeCode,
  showPracticeHint,
  checkPracticeSolution,
  goToSimilarTask,
} from './views/practice.js';
import { notify } from './notify.js';
import { openChapter, closeChapterOverlay, currentChapterId } from './chapter.js';
import { startChapterQuiz, startPartQuiz, selectQuizOption, nextQuizQuestion, closeQuizOverlay } from './quiz.js';
import {
  openLesson,
  selectLessonOption,
  nextLessonQuestion,
  retryLesson,
  closeLessonOverlay,
} from './lesson.js';

// ============================================================
// SIDEBAR
// ============================================================
function updateSidebar() {
  const lvl = STATE.level;
  const xp = STATE.totalXP;
  const next = xpForNextLevel(lvl);
  const cur = xpForCurrentLevel(lvl);
  const pct = next === cur ? 100 : Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));
  document.getElementById('sidebar-level').textContent = lvl;
  document.getElementById('sidebar-xp').textContent = xp;
  document.getElementById('sidebar-xp-next').textContent = next;
  document.getElementById('xp-fill').style.width = pct + '%';
}

window.addEventListener('rustlings:state-updated', updateSidebar);
window.addEventListener('rustlings:notify', (e) => notify(e.detail.icon, e.detail.msg));
window.addEventListener('rustlings:level-up', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const badge = document.querySelector('.level-badge');
  if (badge) {
    badge.classList.remove('level-up-pulse');
    void badge.offsetWidth;
    badge.classList.add('level-up-pulse');
    setTimeout(() => badge.classList.remove('level-up-pulse'), 1500);
  }
});

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page) {
  const doNav = () => {
    window.__currentPage = page;
    document.querySelectorAll('.nav-item').forEach((n) => {
      n.classList.toggle('active', n.dataset.page === page);
    });
    document.querySelectorAll('.bottom-nav-item').forEach((n) => {
      n.classList.toggle('active', n.dataset.page === page);
    });
    const main = document.getElementById('main');
    main.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'page-enter';
    if (page === 'dashboard') wrap.innerHTML = renderDashboard();
    if (page === 'why-rust') wrap.innerHTML = renderWhyRust();
    if (page === 'textbook') wrap.innerHTML = renderTextbook();
    if (page === 'lessons') wrap.innerHTML = renderLessons();
    if (page === 'first-project') wrap.innerHTML = renderFirstProject();
    if (page === 'achievements') wrap.innerHTML = renderAchievements();
    if (page === 'practice') wrap.innerHTML = renderPractice();
    main.appendChild(wrap);
    highlightInContainer(main);
  };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition === 'function' && !prefersReducedMotion) {
    document.startViewTransition(doNav);
  } else {
    doNav();
  }
}

// ============================================================
// SEARCH RESULT SELECTION
// ============================================================
function selectSearchResult(chapterId) {
  const res = document.getElementById('textbook-search-results');
  const inp = document.getElementById('textbook-search');
  if (res) res.classList.remove('show');
  if (inp) {
    inp.value = '';
    inp.blur();
  }
  openChapter(chapterId);
}

// ============================================================
// ESCAPE KEY + OVERLAY BACKDROP
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('lesson-overlay').classList.contains('open')) closeLessonOverlay();
  else if (document.getElementById('quiz-overlay').classList.contains('open')) closeQuizOverlay();
  else if (document.getElementById('chapter-overlay').classList.contains('open'))
    closeChapterOverlay();
});

// ============================================================
// EXPORT TO WINDOW (for onclick in HTML)
// ============================================================
window.navigate = navigate;
window.openChapter = openChapter;
window.openLesson = openLesson;
window.scrollToTextbookPart = scrollToTextbookPart;
window.selectSearchResult = selectSearchResult;
window.startChapterQuiz = startChapterQuiz;
window.startPartQuiz = startPartQuiz;
window.selectQuizOption = selectQuizOption;
window.nextQuizQuestion = nextQuizQuestion;
window.selectLessonOption = selectLessonOption;
window.nextLessonQuestion = nextLessonQuestion;
window.retryLesson = retryLesson;
window.closeChapterOverlay = closeChapterOverlay;
window.closeQuizOverlay = closeQuizOverlay;
window.closeLessonOverlay = closeLessonOverlay;
window.notify = notify;
window.openPracticePart = openPracticePart;
window.backToPractice = backToPractice;
window.prevPracticeTask = prevPracticeTask;
window.nextPracticeTask = nextPracticeTask;
window.resetPracticeCode = resetPracticeCode;
window.showPracticeHint = showPracticeHint;
window.checkPracticeSolution = checkPracticeSolution;
window.goToSimilarTask = goToSimilarTask;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (_) {}
  }
  await loadData();

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.dataset.page);
    });
  });

  // Bottom nav (mobile)
  document.querySelectorAll('.bottom-nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.dataset.page);
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile toggle
  document.getElementById('mobile-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    const hl = document.getElementById('highlight-theme');
    if (hl) hl.href = next === 'light'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
    try {
      localStorage.setItem('rustlings_theme', next);
    } catch (_) {}
  });

  // Close modals
  document.getElementById('chapter-close').addEventListener('click', closeChapterOverlay);
  document.getElementById('quiz-close').addEventListener('click', closeQuizOverlay);
  document.getElementById('lesson-close').addEventListener('click', closeLessonOverlay);

  // Quiz button in reader
  document.getElementById('reader-quiz-btn').addEventListener('click', () => {
    if (currentChapterId) startChapterQuiz(currentChapterId);
  });

  // Copy code button (delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.code-copy-btn');
    if (!btn) return;
    const wrap = btn.closest('.code-block-wrap');
    const pre = wrap?.querySelector('pre');
    if (!pre) return;
    const code = pre.textContent || '';
    navigator.clipboard?.writeText(code).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Скопировано!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 1500);
    });
  });

  // Поиск по учебнику — делегирование (работает после навигации)
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'textbook-search') return;
    const resultsEl = document.getElementById('textbook-search-results');
    if (!resultsEl) return;
    const q = e.target.value.trim();
    const results = searchTextbook(q);
    if (q.length < 2) {
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('show');
      return;
    }
    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
      resultsEl.classList.add('show');
      return;
    }
    resultsEl.innerHTML = results
      .slice(0, 12)
      .map(
        (ch) => `
      <button type="button" class="search-result-item" onclick="selectSearchResult(${ch.id})">
        <span class="search-result-icon">${ch.icon}</span>
        <span class="search-result-text">
          <span class="search-result-title">${highlightMatch(ch.title, e.target.value)}</span>
          <span class="search-result-desc">${highlightMatch(ch.desc, e.target.value)}</span>
        </span>
      </button>
    `
      )
      .join('');
    resultsEl.classList.add('show');
  });

  document.addEventListener('focusin', (e) => {
    if (e.target.id !== 'textbook-search') return;
    const resultsEl = document.getElementById('textbook-search-results');
    const q = e.target.value?.trim() || '';
    if (q.length >= 2 && resultsEl) {
      const results = searchTextbook(q);
      if (results.length > 0) {
        resultsEl.innerHTML = results
          .slice(0, 12)
          .map(
            (ch) => `
          <button type="button" class="search-result-item" onclick="selectSearchResult(${ch.id})">
            <span class="search-result-icon">${ch.icon}</span>
            <span class="search-result-text">
              <span class="search-result-title">${highlightMatch(ch.title, q)}</span>
              <span class="search-result-desc">${highlightMatch(ch.desc, q)}</span>
            </span>
          </button>
        `
          )
          .join('');
        resultsEl.classList.add('show');
      }
    }
  });

  // Close search results on outside click
  document.addEventListener('click', (e) => {
    const res = document.getElementById('textbook-search-results');
    const inp = document.getElementById('textbook-search');
    if (res?.classList.contains('show') && inp && !res.contains(e.target) && e.target !== inp) {
      res.classList.remove('show');
    }
  });

  // Close overlays on backdrop click
  ['chapter-overlay', 'quiz-overlay', 'lesson-overlay'].forEach((id) => {
    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target.id === id) {
        if (id === 'chapter-overlay') closeChapterOverlay();
        if (id === 'quiz-overlay') closeQuizOverlay();
        if (id === 'lesson-overlay') closeLessonOverlay();
      }
    });
  });

  // Skip link: фокус на main при активации
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    });
  }

  updateSidebar();
  navigate('dashboard');
});
