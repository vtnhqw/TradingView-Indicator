import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const appSource = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');

// Minimal DOM boundary for exercising the real application without a browser.
// Clipboard, storage, timers, and frame messages are the external boundaries.
function element(id = '') {
  const attributes = new Map();
  const listeners = new Map();
  const classes = new Set();
  let markup = '';
  let text = '';
  return {
    id, dataset: {}, style: { minWidth: '', height: '' }, disabled: false,
    get textContent() { return text; },
    set textContent(value) { text = value; markup = value; },
    get innerHTML() { return markup; },
    set innerHTML(value) { markup = value; text = value.replace(/<[^>]*>/g, ''); },
    classList: {
      contains: name => classes.has(name),
      add: name => classes.add(name), remove: name => classes.delete(name),
      toggle(name, on) { if (on ?? !classes.has(name)) classes.add(name); else classes.delete(name); },
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name) ?? null,
    removeAttribute: name => attributes.delete(name),
    addEventListener(name, callback) { listeners.set(name, callback); },
    dispatch(name, event) { return listeners.get(name)?.(event); },
    append() {}, prepend() {}, insertBefore() {}, replaceChildren() {}, remove() {},
    focus() {}, select() {}, close() { this.open = false; }, showModal() { this.open = true; },
    getBoundingClientRect: () => ({ width: 130 }),
    querySelector() { return element(); },
  };
}

async function harness({ clipboardFails = false, clipboardWrite, origin = 'https://studio.example' } = {}) {
  const ids = new Map();
  const one = selector => {
    if (!ids.has(selector)) ids.set(selector, element(selector));
    return ids.get(selector);
  };
  const frame = one('.lab-shell iframe');
  const frameMessages = [];
  frame.contentWindow = { postMessage(data) { frameMessages.push(data); } };
  const views = ['overview', 'indicators', 'learn'].map(name => {
    const view = element('view-' + name);
    ids.set(view.id, view);
    return view;
  });
  const events = new Map();
  const timers = new Map();
  let timerId = 0;
  const source = '//@version=6\nindicator("Example")\nplot(close)\n';
  const clipboard = [];
  const document = {
    documentElement: element('root'), body: element('body'),
    getElementById: one, querySelector: one,
    querySelectorAll: selector => selector === '.view' ? views : [],
    createElement: tag => element(tag), addEventListener() {}, execCommand: () => false,
  };
  const context = vm.createContext({
    document, location: { origin, hash: '#overview' },
    history: { replaceState() {}, pushState() {} },
    localStorage: { getItem: () => null, setItem() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    navigator: { clipboard: { async writeText(value) { if (clipboardWrite) return clipboardWrite(value); if (clipboardFails) throw Error('Denied'); clipboard.push(value); } } },
    setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  context.window = context;
  context.addEventListener = (name, handler) => events.set(name, handler);
  context.scrollTo = () => {};
  context.PINE_SOURCES = { sample: source };
  // Startup must use the actual early theme script once it exists.
  try { vm.runInContext(await readFile(new URL('../js/theme.js', import.meta.url), 'utf8'), context); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  vm.runInContext(appSource, context);
  const button = element();
  button.textContent = 'Copy source';
  button.innerHTML = 'Copy source <span aria-hidden="true">↗</span>';
  button.setAttribute('aria-label', 'Copy source for Example');
  return { context, button, source, clipboard, frame, frameMessages, events, timers, one };
}

test('a successful copy confirms on the button and then restores its original contents', async () => {
  const h = await harness();
  const original = h.button.innerHTML;
  await h.context.copySource({ dataset: { key: 'sample' } }, h.button);
  assert.equal(h.clipboard[0], h.source);
  assert.equal(h.button.textContent, 'Copied ✓');
  assert.equal(h.button.disabled, false);
  for (const { callback } of [...h.timers.values()]) callback();
  assert.equal(h.button.innerHTML, original);
  assert.equal(h.button.getAttribute('aria-label'), 'Copy source for Example');
});

test('failed copying never displays a success state', async () => {
  const h = await harness({ clipboardFails: true });
  const original = h.button.innerHTML;
  await h.context.copySource({ dataset: { key: 'missing', file: 'missing.pine' } }, h.button);
  assert.equal(h.button.disabled, false);
  assert.equal(h.button.innerHTML, original);
  assert.notEqual(h.button.textContent, 'Copied ✓');
});

test('copying preserves keyboard focus and ignores repeated activation while pending', async () => {
  let finish;
  let writes = 0;
  const h = await harness({ clipboardWrite: () => { writes++; return new Promise(resolve => { finish = resolve; }); } });
  const document = h.context.document;
  document.activeElement = h.button;
  // Native disabled buttons lose keyboard focus; model that DOM boundary.
  let disabled = false;
  Object.defineProperty(h.button, 'disabled', {
    get: () => disabled,
    set(value) { disabled = value; if (value && document.activeElement === h.button) document.activeElement = document.body; },
  });
  const card = { dataset: { key: 'sample' } };
  const pending = h.context.copySource(card, h.button);
  await Promise.resolve();
  assert.equal(document.activeElement, h.button);
  await h.context.copySource(card, h.button);
  assert.equal(writes, 1);
  finish();
  await pending;
  assert.equal(document.activeElement, h.button);
  assert.equal(h.button.getAttribute('aria-disabled'), null);
});

test('a delayed clipboard failure cannot reopen details after navigation', async () => {
  let deny;
  const h = await harness({ clipboardWrite: () => new Promise((resolve, reject) => { deny = reject; }) });
  h.context.PINE_SOURCES.high52 = h.source;
  const pending = h.context.copySource({ dataset: { key: 'high52', file: 'indicators/52-week-high-line.pine' } }, h.button);
  await Promise.resolve();
  h.context.route('learn');
  deny(Error('Permission denied'));
  await pending;
  assert.notEqual(h.one('dialog').open, true);
  assert.equal(h.button.textContent, 'Copy source ↗');
});

test('the simulator grows to its content and restores that height after maximization', async () => {
  const h = await harness();
  h.events.get('message')({ source: h.frame.contentWindow, origin: 'https://studio.example', data: { type: 'studio-size', height: 1848.2 } });
  assert.equal(h.frame.style.height, '1849px');
  h.context.maximize(true);
  assert.equal(h.frame.style.height, '');
  h.context.maximize(false);
  assert.equal(h.frame.style.height, '1849px');
});

test('untrusted frame messages and invalid sizes cannot change the simulator height', async () => {
  const h = await harness();
  h.frame.style.height = '760px';
  for (const event of [
    { source: {}, origin: 'https://studio.example', data: { type: 'studio-size', height: 4000 } },
    { source: h.frame.contentWindow, origin: 'https://other.example', data: { type: 'studio-size', height: 4000 } },
    ...[-1, NaN, Infinity, '4000'].map(height => ({ source: h.frame.contentWindow, origin: 'https://studio.example', data: { type: 'studio-size', height } })),
  ]) h.events.get('message')(event);
  assert.equal(h.frame.style.height, '760px');
});

test('the early theme script respects saved settings and safely falls back to the system', async () => {
  let source;
  try { source = await readFile(new URL('../js/theme.js', import.meta.url), 'utf8'); }
  catch { assert.fail('A theme script must apply the preference before the stylesheet loads'); }
  for (const [saved, systemDark, expected] of [['dark', false, 'dark'], ['light', true, 'light'], [null, true, 'dark'], ['invalid', false, 'light']]) {
    const root = element();
    const meta = {};
    const context = { document: { documentElement: root, querySelector: () => meta }, localStorage: { getItem: () => saved }, matchMedia: () => ({ matches: systemDark }) };
    context.window = context;
    vm.runInNewContext(source, context);
    assert.equal(root.dataset.theme, expected);
    assert.equal(meta.content, expected === 'dark' ? '#101012' : '#fbfbfd');
  }
  const root = element();
  const context = { document: { documentElement: root, querySelector: () => ({}) }, localStorage: { getItem() { throw Error('Storage blocked'); } }, matchMedia: () => ({ matches: true }) };
  context.window = context;
  vm.runInNewContext(source, context);
  assert.equal(root.dataset.theme, 'dark');
});

test('system theme synchronization does not turn into a saved user preference', async () => {
  const h = await harness();
  const initial = h.frameMessages.find(message => message.type === 'studio-theme');
  assert.equal(initial.persist, false);
  h.context.applyTheme('dark', true);
  assert.equal(h.frameMessages.at(-1).persist, true);
});

test('the embedded lab reports content height without feeding viewport height back into itself', async () => {
  let source;
  try { source = await readFile(new URL('../js/lab-size.js', import.meta.url), 'utf8'); }
  catch { assert.fail('The lab must report its content size to the parent'); }
  const messages = [];
  const pending = [];
  let observe;
  let bottom = 1800.4;
  const sheet = { getBoundingClientRect: () => ({ width: 600, bottom }) };
  const context = {
    document: { querySelector: () => sheet, body: {} }, location: { origin: 'https://studio.example' },
    getComputedStyle: () => ({ paddingBottom: '24px' }),
    requestAnimationFrame: callback => pending.push(callback),
    ResizeObserver: class { constructor(callback) { observe = callback; } observe() {} },
    addEventListener() {}, parent: { postMessage: data => messages.push(data) },
  };
  context.window = context;
  vm.runInNewContext(source, context);
  pending.shift()();
  assert.equal(messages[0].type, 'studio-size');
  assert.equal(messages[0].height, 1825);
  // Scrolling in maximized mode must not shorten the normal-view document.
  context.scrollY = 320;
  bottom = 1480.4;
  observe(); pending.shift()();
  assert.equal(messages.length, 1, 'Unchanged content must not create a resize loop');
  bottom = 1630;
  observe(); pending.shift()();
  assert.equal(messages[1].height, 1974);
});

