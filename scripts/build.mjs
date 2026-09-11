import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = {
  high52: 'indicators/52-week-high-line-v2.pine',
  mcdx: 'indicators/MCDX-SmartMoney.pine',
  pink: 'indicators/PinkCandle-Indicator-v1.pine',
  rsi: 'indicators/rsi-divergence-indicator.pine',
  zigzag: 'indicators/zigzag-indicator.pine',
};

const indicatorFiles = (await readdir(path.join(root, 'indicators')))
  .filter(file => file.endsWith('.pine'))
  .map(file => `indicators/${file}`)
  .sort();
const bundledFiles = Object.values(files).sort();
if (JSON.stringify(indicatorFiles) !== JSON.stringify(bundledFiles)) {
  throw new Error('Build manifest does not match indicators/*.pine');
}

const indexSource = await readFile(path.join(root, 'index.html'), 'utf8');
const catalogFiles = [...indexSource.matchAll(/data-file="([^"]+\.pine)"/g)]
  .map(match => match[1])
  .sort();
if (JSON.stringify(catalogFiles) !== JSON.stringify(bundledFiles)) {
  throw new Error('Website catalog does not match the build manifest');
}

const sources = {};
for (const [key, file] of Object.entries(files)) {
  sources[key] = await readFile(path.join(root, file), 'utf8');
  if (!/^\/\/@version=6/m.test(sources[key]) || !/\bindicator\s*\(/.test(sources[key])) {
    throw new Error('Invalid Pine source: ' + file);
  }
}
await writeFile(path.join(root, 'pine-sources.js'),
  '// Generated from indicators/*.pine by node scripts/build.mjs. Do not edit.\nwindow.PINE_SOURCES = ' +
  JSON.stringify(sources, null, 2) + ';\n');
const assets = ['index.html', 'app.js', 'pine-sources.js', 'assets/favicon.svg', 'note/level2_orderbook_cheatsheet.html', ...Object.values(files)];
for (const file of assets) {
  const output = path.join(root, 'out', file);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(path.join(root, file), output);
}
console.log(`Built ${assets.length} static assets; all ${bundledFiles.length} Pine sources bundled for offline copying.`);
