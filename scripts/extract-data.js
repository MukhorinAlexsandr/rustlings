#!/usr/bin/env node
/**
 * Извлекает данные из app.js в JSON-файлы.
 * Запуск: node scripts/extract-data.js
 */
const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../static/app.js');
const dataDir = path.join(__dirname, '../static/data');
const content = fs.readFileSync(appPath, 'utf8');

function extractArray(content, name) {
  const startMark = `const ${name} = [`;
  const idx = content.indexOf(startMark);
  if (idx === -1) return null;
  let i = idx + startMark.length;
  let depth = 1;
  let inStr = null;
  let escape = false;
  let chr;
  while (i < content.length && depth > 0) {
    chr = content[i];
    if (escape) { escape = false; i++; continue; }
    if (chr === '\\' && inStr) { escape = true; i++; continue; }
    if (!inStr && (chr === '"' || chr === "'" || chr === '`')) inStr = chr;
    else if (chr === inStr) inStr = null;
    if (!inStr) {
      if (chr === '[' || chr === '{') depth++;
      if (chr === ']' || chr === '}') { depth--; if (depth === 0) return content.slice(idx + startMark.length - 1, i + 1); }
    }
    i++;
  }
  return null;
}

function toJson(js, skipCondition = false) {
  let s = js;
  if (skipCondition) {
    s = s.replace(/,?\s*condition:\s*s\s*=>[^,]+/g, '');
    s = s.replace(/LESSONS\.length/g, '999');
    s = s.replace(/TEXTBOOK\.length/g, '999');
    s = s.replace(/,(\s*})/g, '$1');
  }
  try {
    const vm = require('vm');
    const obj = vm.runInNewContext('(' + s + ')', {});
    return JSON.stringify(obj);
  } catch (e) {
    console.error('Parse error:', e.message);
    return null;
  }
}

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const datasets = [
  ['TEXTBOOK', 'textbook.json', false],
  ['TEXTBOOK_PARTS', 'textbook-parts.json', false],
  ['LESSON_PARTS', 'lesson-parts.json', false],
  ['LESSONS', 'lessons.json', false],
  ['ACHIEVEMENTS', 'achievements.json', true],
  ['FIRST_PROJECTS', 'first-projects.json', false],
  ['DAILY_QUESTS', 'daily-quests.json', false],
];

for (const [name, fname, skipCond] of datasets) {
  const arr = extractArray(content, name);
  if (!arr) { console.warn('Skip', name); continue; }
  let json = toJson(arr, skipCond);
  if (!json) { console.warn('Parse failed:', name); continue; }
  fs.writeFileSync(path.join(dataDir, fname), json, 'utf8');
  console.log('Wrote', fname);
}

console.log('Done.');
