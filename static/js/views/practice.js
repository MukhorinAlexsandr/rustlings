import { PRACTICE_TASKS, TEXTBOOK_PARTS } from '../data.js';
import { STATE, addXP, saveState } from '../state.js';
import { escHtml as escapeHtml } from '../utils.js';

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
  const labels = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Сложная' };
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
      <h1 class="page-title">Практика</h1>
      <p class="page-desc">Решай задачи прямо в приложении. Код компилируется и проверяется на сервере.</p>
    </div>
    <div class="practice-global-progress">
      <span>Решено ${totalCompleted} из ${totalTasks} задач (${globalPct}%)</span>
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
          <span>Задача ${currentTaskIndex + 1} из ${totalInPart}</span>
          <button type="button" class="btn-icon" onclick="nextPracticeTask()" ${currentTaskIndex >= totalInPart - 1 ? 'disabled' : ''}>▶</button>
        </span>
      </div>

      <div class="practice-task-layout">
        <div class="practice-task-info">
          <div class="practice-task-title-row">
            <h2 class="practice-task-title">${escapeHtml(task.title)}</h2>
            ${diffBadge(task.difficulty)}
            ${isDone ? '<span class="practice-done-badge">Решено</span>' : ''}
          </div>
          <p class="practice-task-desc">${escapeHtml(task.description)}</p>
          <div class="practice-task-sig"><code>${escapeHtml(task.signature)}</code></div>
          <div class="practice-examples-title">Примеры:</div>
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
              Проверить
            </button>
            <button type="button" class="btn btn-secondary" onclick="resetPracticeCode()">Сбросить</button>
            <button type="button" class="btn btn-secondary" onclick="showPracticeHint()">Подсказка</button>
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

  if (hintIndex >= task.hints.length) hintIndex = 0;
  hintEl.style.display = 'block';
  hintEl.innerHTML = `<strong>Подсказка ${hintIndex + 1}/${task.hints.length}:</strong> ${escapeHtml(task.hints[hintIndex])}`;
  hintIndex++;
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
      let errorHtml = `<div class="practice-error">
        <div class="practice-error-title">Не совсем так...</div>
        <pre class="practice-error-output">${escapeHtml(data.error || 'Неизвестная ошибка')}</pre>`;

      if (task.explanationWrong) {
        errorHtml += `<div class="practice-explanation">${escapeHtml(task.explanationWrong)}</div>`;
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
