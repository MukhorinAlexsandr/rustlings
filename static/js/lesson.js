// lesson.js — модалка урока
import { LESSONS } from './data.js';
import { STATE, addXP, checkDailyQuest } from './state.js';
import { sanitizeHtml, escHtml, highlightInContainer } from './utils.js';
import { openOverlay, closeOverlay, getFocusableIn } from './a11y.js';
import { fireConfetti } from './notify.js';

let lessonState = {};

function showLessonResults() {
  const { lesson, score } = lessonState;
  const total = lesson.questions.length;
  const perfect = score === total;
  const earnedXP = Math.round(lesson.xp * (score / total));

  // Mark lesson complete
  if (!STATE.completedLessons.includes(lesson.id)) {
    STATE.completedLessons.push(lesson.id);
    STATE.lessonsCompleted = STATE.completedLessons.length;
  }
  if (perfect) STATE.perfectQuizzes = (STATE.perfectQuizzes || 0) + 1;
  checkDailyQuest('lessons', 1);
  addXP(earnedXP);
  if (perfect) fireConfetti();

  const emoji = perfect ? '🏆' : score >= total / 2 ? '😊' : '💪';
  document.getElementById('lesson-body').innerHTML = `
    <div class="quiz-results">
      <span class="result-emoji">${emoji}</span>
      <div class="result-title">${perfect ? 'Идеально!' : score >= total / 2 ? 'Молодец!' : 'Не сдавайся!'}</div>
      <div class="result-subtitle">Урок: ${sanitizeHtml(lesson.title)}</div>
      <div class="result-score">${score} / ${total}</div>
      <div class="result-score-label">правильных ответов</div>
      <div class="result-xp">⭐ +${earnedXP} XP</div>
      <div class="result-actions">
        <button class="btn btn-secondary" onclick="retryLesson(${lesson.id})">Повторить</button>
        <button class="btn btn-primary" onclick="closeLessonOverlay()">Готово ✓</button>
      </div>
    </div>
  `;
  document.getElementById('lesson-counter').textContent = 'Результат';
  document.getElementById('lesson-progress-fill').style.width = '100%';
}

export function openLesson(id) {
  const lesson = LESSONS.find((l) => l.id === id);
  if (!lesson) return;
  lessonState = { lesson, current: 0, score: 0 };
  renderLessonQuestion();
  openOverlay('lesson-overlay');
}

export function renderLessonQuestion() {
  const { lesson, current } = lessonState;
  const q = lesson.questions[current];
  const pct = Math.round((current / lesson.questions.length) * 100);
  const letters = ['А', 'Б', 'В', 'Г'];

  document.getElementById('lesson-counter').textContent =
    `Вопрос ${current + 1} из ${lesson.questions.length}`;
  document.getElementById('lesson-progress-fill').style.width = pct + '%';

  document.getElementById('lesson-body').innerHTML = `
    <div class="quiz-question">${sanitizeHtml(q.question)}</div>
    ${q.code ? `<pre class="quiz-code-block"><code class="language-rust">${escHtml(q.code)}</code></pre>` : ''}
    <div class="quiz-options">
      ${q.options
        .map(
          (opt, i) => `
        <button class="quiz-option" onclick="selectLessonOption(${i})">
          <span class="option-letter">${letters[i]}</span>
          <span>${sanitizeHtml(opt)}</span>
        </button>`
        )
        .join('')}
    </div>
    <div class="quiz-explanation" id="lesson-expl"><strong>💡 Объяснение:</strong> ${sanitizeHtml(q.explanation)}</div>
    <div class="quiz-nav" id="lesson-nav" style="display:none">
      <button class="btn btn-primary" onclick="nextLessonQuestion()">
        ${current + 1 < lesson.questions.length ? 'Следующий →' : 'Завершить ✓'}
      </button>
    </div>
  `;
  highlightInContainer(document.getElementById('lesson-body'));
  if (document.getElementById('lesson-overlay').classList.contains('open')) {
    const focusable = getFocusableIn(document.getElementById('lesson-overlay'));
    if (focusable.length) focusable[0].focus();
  }
}

export function selectLessonOption(idx) {
  const q = lessonState.lesson.questions[lessonState.current];
  const opts = document.querySelectorAll('#lesson-body .quiz-option');
  opts.forEach((o) => (o.disabled = true));
  opts[idx].classList.add(idx === q.correct ? 'correct' : 'wrong');
  opts[q.correct].classList.add('correct');
  if (idx === q.correct) lessonState.score++;
  document.getElementById('lesson-expl').classList.add('show');
  document.getElementById('lesson-nav').style.display = 'flex';
}

export function nextLessonQuestion() {
  lessonState.current++;
  if (lessonState.current < lessonState.lesson.questions.length) {
    renderLessonQuestion();
  } else {
    showLessonResults();
  }
}

export function retryLesson(id) {
  closeLessonOverlay();
  setTimeout(() => openLesson(id), 150);
}

export function closeLessonOverlay() {
  closeOverlay('lesson-overlay');
  if (typeof window.navigate === 'function') {
    window.navigate(window.__currentPage || 'dashboard');
  }
}
