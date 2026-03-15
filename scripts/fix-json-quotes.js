#!/usr/bin/env node
/**
 * Конвертирует first-projects.json из JS-литерала в валидный JSON.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const fpPath = path.join(__dirname, '../static/data/first-projects.json');
let content = fs.readFileSync(fpPath, 'utf8');

try {
  const obj = vm.runInNewContext('(' + content + ')', {});
  const json = JSON.stringify(obj, null, 2);
  fs.writeFileSync(fpPath, json, 'utf8');
  console.log('first-projects.json fixed.');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
