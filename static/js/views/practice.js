import { PRACTICE_TASKS, TEXTBOOK_PARTS } from '../data.js';
import { STATE, addXP, saveState } from '../state.js';
import { escHtml as escapeHtml } from '../utils.js';
import { t } from '../i18n.js';

let currentPartId = null;
let currentTaskIndex = 0;
let similarQueue = [];
let isChecking = false;

function getPartTasks(partId) {
  return (PRACTICE_TASKS[partId] || []).sort((a, b) => a.order - b.order);
}

function getCompletedTasks() {
  return STATE.completedPracticeTasks || [];
}

function diffBadge(d) {
  const map = { easy: 'practice-diff-easy', medium: 'practice-diff-medium', hard: 'practice-diff-hard' };
  const labels = { easy: t('diffEasy'), medium: t('diffMedium'), hard: t('diffHard') };
  return `<span class="practice-diff ${map[d] || ''}">${labels[d] || d}</span>`;
}

export function renderPractice() {
  const completed = getCompletedTasks();
  let totalTasks = 0;
  let totalCompleted = 0;

  const parts = TEXTBOOK_PARTS.map((p) => {
    const tasks = getPartTasks(p.id);
    const done = tasks.filter((t) => completed.includes(t.id)).length;
    totalTasks += tasks.length;
    totalCompleted += done;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return `
      <button type="button" class="practice-part-card" onclick="openPracticePart(${p.id})">
        <div class="practice-part-header">
          <span class="practice-part-title">${escapeHtml(p.title)}</span>
          <span class="practice-part-count">${done}/${tasks.length}</span>
        </div>
        <div class="practice-part-sub">${escapeHtml(p.subtitle)}</div>
        <div class="practice-part-bar">
          <div class="practice-part-fill" style="width:${pct}%"></div>
        </div>
      </button>`;
  });

  const globalPct = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return `
    <div class="page-header">
      <h1 class="page-title">${t('practiceTitle')}</h1>
      <p class="page-desc">${t('practiceSubtitle')}</p>
    </div>
    <div class="practice-global-progress">
      <span>${t('practiceSolvedCount', { n: totalCompleted, m: totalTasks })} (${globalPct}%)</span>
      <div class="practice-part-bar" style="margin-top:6px">
        <div class="practice-part-fill" style="width:${globalPct}%"></div>
      </div>
    </div>
    <div class="practice-parts-grid">${parts.join('')}</div>`;
}

export function openPracticePart(partId) {
  currentPartId = partId;
  currentTaskIndex = 0;
  similarQueue = [];
  const tasks = getPartTasks(partId);
  if (!tasks.length) return;

  const completed = getCompletedTasks();
  const firstUnsolved = tasks.findIndex((t) => !completed.includes(t.id));
  currentTaskIndex = firstUnsolved >= 0 ? firstUnsolved : 0;

  showTaskScreen();
}

function showTaskScreen() {
  const tasks = getPartTasks(currentPartId);
  const task = tasks[currentTaskIndex];
  if (!task) return;

  const part = TEXTBOOK_PARTS.find((p) => p.id === currentPartId);
  const partTitle = part ? part.title : `Часть ${currentPartId}`;
  const completed = getCompletedTasks();
  const isDone = completed.includes(task.id);
  const totalInPart = tasks.length;
  const doneInPart = tasks.filter((t) => completed.includes(t.id)).length;

  const examplesHtml = task.examples
    .map(
      (ex) => `<div class="practice-example">
        <code>${escapeHtml(ex.input)}</code> → <code>${escapeHtml(ex.output)}</code>
      </div>`
    )
    .join('');

  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="practice-task-screen">
      <div class="practice-task-topbar">
        <button type="button" class="btn btn-secondary practice-back-btn" onclick="backToPractice()">← Назад</button>
        <span class="practice-task-progress">${partTitle} — ${doneInPart}/${totalInPart}</span>
        <span class="practice-task-nav">
          <button type="button" class="btn-icon" onclick="prevPracticeTask()" ${currentTaskIndex === 0 ? 'disabled' : ''}>◀</button>
          <span>${t('practiceTaskNOfM', { n: currentTaskIndex + 1, m: totalInPart })}</span>
          <button type="button" class="btn-icon" onclick="nextPracticeTask()" ${currentTaskIndex >= totalInPart - 1 ? 'disabled' : ''}>▶</button>
        </span>
      </div>

      <div class="practice-task-layout">
        <div class="practice-task-info">
          <div class="practice-task-title-row">
            <h2 class="practice-task-title">${escapeHtml(task.title)}</h2>
            ${diffBadge(task.difficulty)}
            ${isDone ? `<span class="practice-done-badge">${t('practiceSolved')}</span>` : ''}
          </div>
          <p class="practice-task-desc">${escapeHtml(task.description)}</p>
          <div class="practice-task-sig"><code>${escapeHtml(task.signature)}</code></div>
          <div class="practice-examples-title">${t('practiceExamples')}</div>
          <div class="practice-examples">${examplesHtml}</div>
        </div>

        <div class="practice-editor-area">
          <div class="practice-editor-label">Твой код:</div>
          <textarea
            id="practice-code"
            class="practice-code-editor"
            spellcheck="false"
            autocomplete="off"
          >${escapeHtml(task.template)}</textarea>
          <div class="practice-actions">
            <button type="button" class="btn btn-primary practice-check-btn" id="practice-check-btn" onclick="checkPracticeSolution()">
              ${t('check')}
            </button>
            <button type="button" class="btn btn-secondary" onclick="resetPracticeCode()">${t('reset')}</button>
            <button type="button" class="btn btn-secondary" onclick="showPracticeHint()">${t('hint')}</button>
          </div>
          <div id="practice-result" class="practice-result"></div>
          <div id="practice-hint" class="practice-hint" style="display:none"></div>
        </div>
      </div>
    </div>`;
}

export function backToPractice() {
  currentPartId = null;
  const main = document.getElementById('main');
  main.innerHTML = renderPractice();
}

export function prevPracticeTask() {
  if (currentTaskIndex > 0) {
    currentTaskIndex--;
    similarQueue = [];
    showTaskScreen();
  }
}

export function nextPracticeTask() {
  const tasks = getPartTasks(currentPartId);
  if (currentTaskIndex < tasks.length - 1) {
    currentTaskIndex++;
    similarQueue = [];
    showTaskScreen();
  }
}

export function resetPracticeCode() {
  const tasks = getPartTasks(currentPartId);
  const task = tasks[currentTaskIndex];
  if (!task) return;
  const editor = document.getElementById('practice-code');
  if (editor) editor.value = task.template;
  const result = document.getElementById('practice-result');
  if (result) result.innerHTML = '';
}

let hintIndex = 0;
export function showPracticeHint() {
  const tasks = getPartTasks(currentPartId);
  const task = tasks[currentTaskIndex];
  if (!task || !task.hints || !task.hints.length) return;

  const hintEl = document.getElementById('practice-hint');
  if (!hintEl) return;

  if (hintIndex >= task.hints.length) {
    hintEl.innerHTML = '<div class="hint-all-shown">Все подсказки показаны. Попробуй решить задачу!</div>';
    return;
  }

  hintIndex++;
  hintEl.style.display = 'block';

  const labels = ['Намёк', 'Подробнее', 'Решение'];
  let html = '';
  for (let i = 0; i < hintIndex; i++) {
    const label = labels[i] || `Подсказка ${i + 1}`;
    const isLast = i === hintIndex - 1;
    html += `<div class="hint-step ${isLast ? 'hint-step-new' : 'hint-step-old'}">
      <span class="hint-step-label">${label} (${i + 1}/${task.hints.length}):</span>
      <span class="hint-step-text">${escapeHtml(task.hints[i])}</span>
    </div>`;
  }

  if (hintIndex < task.hints.length) {
    html += `<div class="hint-more">Нужна ещё подсказка? Нажми кнопку ещё раз.</div>`;
  }

  hintEl.innerHTML = html;
}

export async function checkPracticeSolution() {
  if (isChecking) return;

  const tasks = getPartTasks(currentPartId);
  const task = tasks[currentTaskIndex];
  if (!task) return;

  const code = document.getElementById('practice-code')?.value || '';
  const btn = document.getElementById('practice-check-btn');
  const resultEl = document.getElementById('practice-result');

  isChecking = true;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Проверяю...';
  }
  if (resultEl) resultEl.innerHTML = '<div class="practice-checking">Компилирую и запускаю...</div>';

  try {
    const resp = await fetch('/api/check_solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, taskId: task.id }),
    });
    const data = await resp.json();

    if (data.ok) {
      resultEl.innerHTML = `<div class="practice-success">Верно! Отличная работа.</div>`;
      markTaskCompleted(task.id);

      setTimeout(() => {
        const nextIdx = currentTaskIndex + 1;
        if (nextIdx < tasks.length) {
          currentTaskIndex = nextIdx;
          similarQueue = [];
          hintIndex = 0;
          showTaskScreen();
        }
      }, 1200);
    } else {
      const isCompileError = (data.error || '').includes('error') && (data.error || '').includes('-->');
      const errorLabel = isCompileError ? 'Ошибка компиляции' : 'Тест не прошёл';
      const errorIcon = isCompileError ? '🔴' : '🟡';

      let errorHtml = `<div class="practice-error">
        <div class="practice-error-title">${errorIcon} ${errorLabel}</div>
        <pre class="practice-error-output">${escapeHtml(data.error || 'Неизвестная ошибка')}</pre>`;

      if (task.explanationWrong) {
        errorHtml += `
          <div class="practice-explanation">
            <div class="practice-explanation-header">💡 Как решить:</div>
            <div class="practice-explanation-text">${escapeHtml(task.explanationWrong)}</div>
          </div>`;
      }

      if (task.examples && task.examples.length > 0) {
        errorHtml += `
          <div class="practice-error-examples">
            <div class="practice-explanation-header">📋 Ожидаемое поведение:</div>
            ${task.examples.map((ex) => `<div class="practice-error-example-row"><code>${escapeHtml(ex.input)}</code> → <code class="practice-expected">${escapeHtml(ex.output)}</code></div>`).join('')}
          </div>`;
      }

      if (task.hints && task.hints.length > 0) {
        errorHtml += `
          <div class="practice-error-hints">
            <div class="practice-explanation-header">🔑 Подсказка:</div>
            <div class="practice-explanation-text">${escapeHtml(task.hints[0])}</div>
          </div>`;
      }

      if (task.similarTaskIds && task.similarTaskIds.length > 0 && similarQueue.length === 0) {
        similarQueue = [...task.similarTaskIds];
      }

      if (similarQueue.length > 0) {
        const similarId = similarQueue.shift();
        const allTasks = tasks;
        const similarIdx = allTasks.findIndex((t) => t.id === similarId);
        if (similarIdx >= 0) {
          errorHtml += `<button type="button" class="btn btn-secondary practice-similar-btn" onclick="goToSimilarTask(${similarIdx})">
            Попробовать похожую задачу →
          </button>`;
        }
      }

      errorHtml += '</div>';
      resultEl.innerHTML = errorHtml;
    }
  } catch (e) {
    resultEl.innerHTML = `<div class="practice-error">
      <div class="practice-error-title">Ошибка связи с сервером</div>
      <pre class="practice-error-output">${escapeHtml(e.message)}</pre>
    </div>`;
  } finally {
    isChecking = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Проверить';
    }
  }
}

export function goToSimilarTask(taskIndex) {
  currentTaskIndex = taskIndex;
  hintIndex = 0;
  showTaskScreen();
}

function markTaskCompleted(taskId) {
  if (!STATE.completedPracticeTasks) STATE.completedPracticeTasks = [];
  if (!STATE.completedPracticeTasks.includes(taskId)) {
    STATE.completedPracticeTasks.push(taskId);
    addXP(30);
    saveState(STATE);
  }
}
