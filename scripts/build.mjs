import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = {
  high52: 'indicators/52-week-high-line.pine',
  maSpectrum: 'indicators/MA-Spectrum-7.pine',
  mcdx: 'indicators/MCDX-SmartMoney.pine',
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
await writeFile(path.join(root, 'js/pine-sources.js'),
  '// Generated from indicators/*.pine by node scripts/build.mjs. Do not edit.\nwindow.PINE_SOURCES = ' +
  JSON.stringify(sources, null, 2) + ';\n');
const assets = ['index.html', 'js/app.js', 'js/pine-sources.js', 'assets/favicon.svg', 'css/studio.css', 'css/orderbook.css', 'js/orderbook.js', 'js/theme.js', 'js/lab-size.js', 'js/market.js', 'note/level2_orderbook_cheatsheet.html', ...Object.values(files)];
for (const file of assets) {
  const output = path.join(root, 'out', file);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(path.join(root, file), output);
}
console.log(`Built ${assets.length} static assets; all ${bundledFiles.length} Pine sources bundled for offline copying.`);

