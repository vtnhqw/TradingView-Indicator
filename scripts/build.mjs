import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = {
  high52: 'indicators/52-week-high-line-v2.pine',
  mcdx: 'indicators/MCDX-SmartMoney.pine',
  pink: 'indicators/PinkCandle-Indicator-v1.pine',
  zigzag: 'indicators/zigzag-indicator.pine',
};
const sources = {};
for (const [key, file] of Object.entries(files)) {
  sources[key] = await readFile(path.join(root, file), 'utf8');
  if (!sources[key].includes('//@version=6')) throw new Error('Invalid Pine source: ' + file);
}
await writeFile(path.join(root, 'pine-sources.js'),
  '// Generated from indicators/*.pine by node scripts/build.mjs. Do not edit.\nwindow.PINE_SOURCES = ' +
  JSON.stringify(sources, null, 2) + ';\n');
const assets = ['index.html', 'app.js', 'pine-sources.js', 'note/level2_orderbook_cheatsheet.html', ...Object.values(files)];
for (const file of assets) {
  const output = path.join(root, 'out', file);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(path.join(root, file), output);
}
console.log('Built ' + assets.length + ' static assets; all four Pine sources bundled for offline copying.');
