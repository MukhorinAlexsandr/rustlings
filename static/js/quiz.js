// quiz.js — квиз по главе и супер-тест по части
import { TEXTBOOK, PART_QUIZZES } from './data.js';
import { STATE, addXP, saveState, checkAchievements, checkDailyQuest } from './state.js';
import { sanitizeHtml, escHtml, highlightInContainer } from './utils.js';
import { openOverlay, closeOverlay, getFocusableIn } from './a11y.js';
import { closeChapterOverlay } from './chapter.js';
import { fireConfetti, notify } from './notify.js';

let quizState = {};

function showQuizResults() {
  const { score, questions, xp, title, type, partId, chapterId, minCorrect } = quizState;
  const total = questions.length;
  const perfect = score === total;
  const earnedXP = Math.round(xp * 0.5 * (score / total));

  // XP начисляется только при первом прохождении
  let xpToAdd = 0;
  if (type === 'chapter' && chapterId != null) {
    const firstTime = !STATE.completedChapters.includes(chapterId);
    if (firstTime) {
      xpToAdd = earnedXP;
      STATE.completedChapters.push(chapterId);
      STATE.chaptersRead = STATE.completedChapters.length;
      const ch = TEXTBOOK.find((c) => c.id === chapterId);
      if (ch) {
        xpToAdd += ch.xp;
        checkDailyQuest('chapters', 1);
        notify('📖', `Глава пройдена! +${ch.xp} XP за "${ch.title}"`);
      }
      saveState(STATE);
      checkAchievements();
    }
  } else if (type === 'part' && partId != null) {
    const passed = minCorrect != null ? score >= minCorrect : score >= total / 2;
    const firstTime = passed && !STATE.completedPartQuizzes.includes(partId);
    if (firstTime) {
      xpToAdd = earnedXP;
      STATE.completedPartQuizzes = [...(STATE.completedPartQuizzes || []), partId];
      saveState(STATE);
      checkAchievements();
    }
  }

  if (xpToAdd > 0) addXP(xpToAdd);
  if (perfect) {
    STATE.perfectQuizzes = (STATE.perfectQuizzes || 0) + 1;
    fireConfetti();
  }

  const partFailed = type === 'part' && minCorrect != null && score < minCorrect;
  const emoji = perfect ? '🎉' : score >= total / 2 ? '😊' : '😅';
  const partFailHint = partFailed
    ? `<div class="quiz-part-fail-hint">Для зачёта части нужно минимум ${minCorrect} правильных. Попробуй ещё раз!</div>`
    : '';
  document.getElementById('quiz-body').innerHTML = `
    <div class="quiz-results">
      <span class="result-emoji">${emoji}</span>
      <div class="result-title">${perfect ? 'Отлично!' : score >= total / 2 ? 'Хорошо!' : 'Можно лучше!'}</div>
      <div class="result-subtitle">Тест по теме: ${sanitizeHtml(title)}</div>
      <div class="result-score">${score} / ${total}</div>
      <div class="result-score-label">правильных ответов</div>
      <div class="result-xp">${xpToAdd > 0 ? `⭐ +${xpToAdd} XP` : partFailed ? 'Попробуй ещё раз для зачёта' : '🔄 Повторное прохождение — XP не начисляется'}</div>
      ${partFailHint}
      <div class="result-actions">
        <button class="btn btn-secondary" onclick="closeQuizOverlay()">Закрыть</button>
        <button class="btn btn-primary" onclick="navigate('${window.__currentPage || 'dashboard'}')">Продолжить</button>
      </div>
    </div>
  `;
  document.getElementById('quiz-counter').textContent = 'Результат';
  document.getElementById('quiz-progress-fill').style.width = '100%';
}

export function startChapterQuiz(chapterId) {
  const ch = TEXTBOOK.find((c) => c.id === chapterId);
  if (!ch || !ch.quiz || ch.quiz.length === 0) return;
  closeChapterOverlay();
  quizState = {
    questions: ch.quiz,
    current: 0,
    score: 0,
    xp: ch.xp,
    title: ch.title,
    type: 'chapter',
    chapterId,
  };
  renderQuizQuestion();
  openOverlay('quiz-overlay');
}

export function startPartQuiz(partId) {
  const pq = PART_QUIZZES.find((p) => p.partId === partId);
  if (!pq || !pq.questions || pq.questions.length === 0) return;
  closeChapterOverlay();
  quizState = {
    questions: pq.questions,
    current: 0,
    score: 0,
    xp: pq.xp,
    title: pq.title,
    type: 'part',
    partId: pq.partId,
    minCorrect: pq.minCorrect ?? Math.ceil(pq.questions.length * 0.7),
  };
  renderQuizQuestion();
  openOverlay('quiz-overlay');
}

export function renderQuizQuestion() {
  const { questions, current } = quizState;
  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);
  document.getElementById('quiz-counter').textContent =
    `Вопрос ${current + 1} из ${questions.length}`;
  document.getElementById('quiz-progress-fill').style.width = pct + '%';

  const letters = ['А', 'Б', 'В', 'Г'];
  document.getElementById('quiz-body').innerHTML = `
    <div class="quiz-question">${sanitizeHtml(q.question)}</div>
    ${q.code ? `<div class="code-block-wrap"><pre class="quiz-code-block"><code class="language-rust">${escHtml(q.code)}</code></pre><button type="button" class="code-copy-btn" aria-label="Копировать код">Копировать</button></div>` : ''}
    <div class="quiz-options">
      ${q.options
        .map(
          (opt, i) => `
        <button class="quiz-option" onclick="selectQuizOption(${i})">
          <span class="option-letter">${letters[i]}</span>
          <span>${sanitizeHtml(opt)}</span>
        </button>`
        )
        .join('')}
    </div>
    <div class="quiz-explanation" id="quiz-expl"><strong>💡 Объяснение:</strong> ${sanitizeHtml(q.explanation)}</div>
    <div class="quiz-nav" id="quiz-nav" style="display:none">
      <button class="btn btn-primary" onclick="nextQuizQuestion()">
        ${current + 1 < questions.length ? 'Следующий →' : 'Завершить ✓'}
      </button>
    </div>
  `;
  highlightInContainer(document.getElementById('quiz-body'));
  if (document.getElementById('quiz-overlay').classList.contains('open')) {
    const focusable = getFocusableIn(document.getElementById('quiz-overlay'));
    if (focusable.length) focusable[0].focus();
  }
}

export function selectQuizOption(idx) {
  const q = quizState.questions[quizState.current];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach((o) => (o.disabled = true));
  opts[idx].classList.add(idx === q.correct ? 'correct' : 'wrong');
  opts[q.correct].classList.add('correct');
  if (idx === q.correct) quizState.score++;
  document.getElementById('quiz-expl').classList.add('show');
  document.getElementById('quiz-nav').style.display = 'flex';
}

export function nextQuizQuestion() {
  quizState.current++;
  if (quizState.current < quizState.questions.length) {
    renderQuizQuestion();
  } else {
    showQuizResults();
  }
}

export function closeQuizOverlay() {
  closeOverlay('quiz-overlay');
  if (typeof window.navigate === 'function') {
    window.navigate(window.__currentPage || 'dashboard');
  }
}
