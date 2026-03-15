const fs = require('fs');
const path = require('path');
const appPath = path.resolve(__dirname, '../static/app.js');
let content = fs.readFileSync(appPath, 'utf8');

// Find "// Embedded data removed" or "/* REMOVED"
const startMark = content.indexOf('// Embedded data removed');
const altMark = content.indexOf('/* REMOVED_EMBEDDED_DATA');
const start = (startMark !== -1 ? startMark : altMark);
if (start === -1) {
  console.log('No removal marker found - data may already be removed.');
  process.exit(0);
}

// End of the line with the marker
const lineEnd = content.indexOf('\n', start) + 1;
// Start of block to remove (first char after the marker line)
const blockStart = lineEnd;
const blockEnd = content.indexOf('function getTodayKey()', blockStart);
if (blockEnd === -1) {
  console.error('function getTodayKey() not found');
  process.exit(1);
}

content = content.slice(0, blockStart) + content.slice(blockEnd);
fs.writeFileSync(appPath, content, 'utf8');
console.log('Removed', blockEnd - blockStart, 'chars.');
