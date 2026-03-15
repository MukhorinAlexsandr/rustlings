const fs = require('fs');
const path = require('path');
const appPath = path.resolve(__dirname, '../static/app.js');
const mainPath = path.resolve(__dirname, '../static/js/main.js');
const c = fs.readFileSync(appPath, 'utf8');
const lines = c.split('\n');

const header = `// RustLings — main.js (ES modules)
import { loadData, TEXTBOOK, TEXTBOOK_PARTS, LESSON_PARTS, LESSONS, ACHIEVEMENTS, FIRST_PROJECTS, DAILY_QUESTS } from './data.js';
import { STATE, addXP, saveState, xpForNextLevel, xpForCurrentLevel, getDailyProgress, checkDailyQuest, checkAchievements } from './state.js';
import { escHtml, sanitizeHtml } from './utils.js';

function updateSidebar() {
  const lvl = STATE.level;
  const xp = STATE.totalXP;
  const next = xpForNextLevel(lvl);
  const cur = xpForCurrentLevel(lvl);
  const pct = (next === cur) ? 100 : Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));
  document.getElementById('sidebar-level').textContent = lvl;
  document.getElementById('sidebar-xp').textContent = xp;
  document.getElementById('sidebar-xp-next').textContent = next;
  document.getElementById('xp-fill').style.width = pct + '%';
}

window.addEventListener('rustlings:state-updated', updateSidebar);

let notifTimer = null;
function notify(icon, text) {
  const el = document.getElementById('notification');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent = text;
  el.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

window.addEventListener('rustlings:notify', e => notify(e.detail.icon, e.detail.msg));

`;

const rest = lines.slice(230).join('\n');
fs.writeFileSync(mainPath, header + rest);
console.log('main.js created,', (header + rest).length, 'chars');
