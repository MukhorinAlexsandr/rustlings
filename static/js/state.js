// ============================================================
// state.js — STATE, XP, уровни, streak, достижения
// ============================================================

import { getTodayKey, getWeekStart } from './utils.js';
import { ACHIEVEMENTS, DAILY_QUESTS } from './data.js';

export const XP_PER_LEVEL = [0, 200, 450, 750, 1100, 1500, 2000, 2600, 3300, 4100, 5000];

export const DEFAULT_STATE = {
  totalXP: 0,
  level: 1,
  lessonsCompleted: 0,
  chaptersRead: 0,
  completedLessons: [],
  completedChapters: [],
  completedPartQuizzes: [],
  unlockedAchievements: [],
  perfectQuizzes: 0,
  streak: 0,
  lastDate: null,
  streakFreezes: 1,
  streakFreezeWeek: null,
  dailyProgress: null,
};

export function loadState() {
  try {
    const saved = localStorage.getItem('rustlings_state');
    if (saved) {
      const s = JSON.parse(saved);
      return {
        ...DEFAULT_STATE,
        ...s,
        completedLessons: s.completedLessons ?? [],
        completedChapters: s.completedChapters ?? [],
        completedPartQuizzes: s.completedPartQuizzes ?? [],
        unlockedAchievements: s.unlockedAchievements ?? [],
      };
    }
  } catch (e) {}
  return { ...DEFAULT_STATE };
}

export function saveState(s) {
  try {
    localStorage.setItem('rustlings_state', JSON.stringify(s));
  } catch (e) {}
}

export function computeLevel(xp) {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

export let STATE = loadState();
STATE.level = computeLevel(STATE.totalXP);

function replenishStreakFreeze() {
  const week = getWeekStart();
  if (STATE.streakFreezeWeek !== week) {
    STATE.streakFreezes = Math.min(1, (STATE.streakFreezes || 0) + 1);
    STATE.streakFreezeWeek = week;
  }
}

function useStreakFreeze() {
  if ((STATE.streakFreezes || 0) > 0) {
    STATE.streakFreezes--;
    return true;
  }
  return false;
}

replenishStreakFreeze();
saveState(STATE);

export function xpForNextLevel(level) {
  return XP_PER_LEVEL[Math.min(level, XP_PER_LEVEL.length - 1)] || 5000;
}

export function xpForCurrentLevel(level) {
  return XP_PER_LEVEL[Math.max(level - 1, 0)] || 0;
}

function emitNotify(icon, msg) {
  window.dispatchEvent(new CustomEvent('rustlings:notify', { detail: { icon, msg } }));
}

function emitStateUpdated() {
  window.dispatchEvent(new CustomEvent('rustlings:state-updated'));
}

export function getDailyProgress() {
  const today = getTodayKey();
  if (!STATE.dailyProgress || STATE.dailyProgress.date !== today) {
    STATE.dailyProgress = { date: today, lessons: 0, chapters: 0, xp: 0, completed: [] };
  }
  return STATE.dailyProgress;
}

export function checkDailyQuest(unit, amount = 1) {
  const prog = getDailyProgress();
  if (unit === 'lessons') prog.lessons += amount;
  if (unit === 'chapters') prog.chapters += amount;
  if (unit === 'xp') prog.xp += amount;

  let bonusTotal = 0;
  DAILY_QUESTS.forEach((q) => {
    if (prog.completed.includes(q.id)) return;
    const val =
      q.unit === 'lessons' ? prog.lessons : q.unit === 'chapters' ? prog.chapters : prog.xp;
    if (val >= q.target) {
      prog.completed.push(q.id);
      bonusTotal += q.bonusXP;
      addXP(q.bonusXP);
      emitNotify(q.icon, `Квест выполнен! +${q.bonusXP} XP`);
    }
  });
  saveState(STATE);
  return bonusTotal;
}

export function addXP(amount) {
  STATE.totalXP += amount;
  const newLevel = computeLevel(STATE.totalXP);
  const leveledUp = newLevel > STATE.level;
  STATE.level = newLevel;
  checkAchievements();
  updateStreak();
  checkDailyQuest('xp', amount);
  saveState(STATE);
  emitStateUpdated();
  if (leveledUp) {
    emitNotify('🎉', `Уровень ${STATE.level}! Ты растёшь!`);
    window.dispatchEvent(new CustomEvent('rustlings:level-up'));
  }
  return leveledUp;
}

function updateStreak() {
  const today = new Date().toDateString();
  if (STATE.lastDate === today) return;
  replenishStreakFreeze();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (STATE.lastDate === yesterday) {
    STATE.streak = (STATE.streak || 0) + 1;
  } else if (STATE.lastDate && STATE.lastDate !== today) {
    if (useStreakFreeze()) {
      emitNotify('❄️', 'Streak Freeze использован — серия сохранена!');
    } else {
      STATE.streak = 1;
    }
  } else {
    STATE.streak = 1;
  }
  STATE.lastDate = today;
  saveState(STATE);
}

export function checkAchievements() {
  ACHIEVEMENTS.forEach((a) => {
    if (!STATE.unlockedAchievements.includes(a.id) && a.condition(STATE)) {
      STATE.unlockedAchievements.push(a.id);
      setTimeout(() => emitNotify(a.icon, `Достижение: ${a.name}!`), 600);
    }
  });
}
