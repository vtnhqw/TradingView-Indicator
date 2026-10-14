import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));

// A missing catalog source or stale bundle must fail before users copy it.
test('every catalog entry copies the exact source available in the repository', async () => {
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(await readFile(path.join(root, 'js/pine-sources.js'), 'utf8'), context);
  const entries = [...html.matchAll(/data-key="([^"]+)" data-file="([^"]+)"/g)];
  assert.ok(entries.length > 0, 'The catalog must contain indicators');
  for (const [, key, file] of entries) {
    const source = await readFile(path.join(root, file), 'utf8');
    assert.equal(context.window.PINE_SOURCES[key], source, `Offline copy differs from ${file}`);
    assert.match(source, /^\/\/@version=6/m);
  }
});

// Exercise the real build in isolation so a passing build also proves that
// assets needed by the redesigned site are actually shipped.
test('the static build produces a self-contained website with working local asset links', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'signal-studio-build-'));
  try {
    for (const file of ['index.html', 'js', 'css', 'assets', 'note', 'indicators', 'scripts']) {
      await cp(path.join(root, file), path.join(fixture, file), { recursive: true });
    }
    const result = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    for (const page of ['index.html', 'note/level2_orderbook_cheatsheet.html']) {
      const pagePath = path.join(fixture, 'out', page);
      const html = await readFile(pagePath, 'utf8');
      const references = [...html.matchAll(/(?:src|href|data-file)="([^"#]+)"/g)]
        .map(match => match[1]).filter(value => !/^(?:https?:|data:)/.test(value));
      for (const file of references) {
        assert.ok((await readFile(path.resolve(path.dirname(pagePath), file))).length > 0, `Missing build asset: ${file} in ${page}`);
      }
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

