'use strict';

const $ = id => document.getElementById(id);
const cards = [...document.querySelectorAll('.indicator')];
const tabs = [...document.querySelectorAll('.tab')];
const root = document.documentElement;
const dialog = $('dialog');
const iframe = document.querySelector('.lab-shell iframe');
const labShell = $('labShell');
let activeCard = null;
let toastTimer;
let themeTimer;
let previousOverflow = '';
let labContentHeight = null;
const copyFeedback = new WeakMap();

// Storage can be unavailable in private browsing or when opening local files.
function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Keep the session usable. */ }
}
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let preferredTheme = window.StudioTheme.preference;

function sendToSimulator(data) {
  iframe.contentWindow?.postMessage(data, location.origin === 'null' ? '*' : location.origin);
}
function applyTheme(theme, persist = false) {
  window.StudioTheme.apply(theme);
  $('theme').setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  if (persist) {
    preferredTheme = theme;
    savePreference('signal-theme', theme);
  }
  sendToSimulator({ type: 'studio-theme', theme, persist: preferredTheme !== null });
}
$('theme').addEventListener('click', () => {
  const button = $('theme');
  clearTimeout(themeTimer);
  button.classList.remove('theme-switching');
  void button.offsetWidth;
  root.classList.add('theme-transition');
  button.classList.add('theme-switching');
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  themeTimer = setTimeout(() => {
    root.classList.remove('theme-transition');
    button.classList.remove('theme-switching');
  }, 300);
});
systemTheme.addEventListener('change', e => { if (!preferredTheme) applyTheme(e.matches ? 'dark' : 'light'); });
iframe.addEventListener('load', () => {
  sendToSimulator({ type: 'studio-theme', theme: root.dataset.theme, persist: preferredTheme !== null });
  sendToSimulator({ type: 'studio-visibility', visible: $('view-learn').classList.contains('active') });
});
window.addEventListener('message', event => {
  if (event.source !== iframe.contentWindow || event.origin !== location.origin) return;
  const data = event.data;
  if (data?.type === 'studio-theme' && ['light', 'dark'].includes(data.theme)) applyTheme(data.theme, true);
  if (data?.type === 'studio-escape' && labShell.classList.contains('max')) maximize(false);
  if (data?.type === 'studio-size' && typeof data.height === 'number' && Number.isFinite(data.height) && data.height > 0 && data.height <= 20000) {
    labContentHeight = Math.max(400, Math.ceil(data.height));
    if (!labShell.classList.contains('max')) iframe.style.height = labContentHeight + 'px';
  }
});

function maximize(on) {
  if (on === labShell.classList.contains('max')) return;
  labShell.classList.toggle('max', on);
  iframe.style.height = on || labContentHeight === null ? '' : labContentHeight + 'px';
  $('maximize').textContent = on ? 'Minimize' : 'Maximize';
  $('maximize').setAttribute('aria-expanded', String(on));
  if (on) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector('.header').inert = true;
    document.querySelector('footer').inert = true;
    document.querySelector('.lab-head').inert = true;
  } else {
    document.body.style.overflow = previousOverflow;
    document.querySelector('.header').inert = false;
    document.querySelector('footer').inert = false;
    document.querySelector('.lab-head').inert = false;
  }
  document.querySelector('.skip-link').inert = on;
  $('maximize').focus();
}
$('maximize').setAttribute('aria-controls', 'labShell');
$('maximize').setAttribute('aria-expanded', 'false');
$('maximize').addEventListener('click', () => maximize(!labShell.classList.contains('max')));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') maximize(false);
});

const aliases = { home: 'overview', note: 'learn', lab: 'learn' };
function route(value, push = false, moveFocus = false) {
  ++detailGeneration;
  const name = aliases[value] || (['overview', 'indicators', 'learn'].includes(value) ? value : 'overview');
  maximize(false);
  if (dialog.open) dialog.close();
  document.querySelectorAll('.view').forEach(view => {
    const active = view.id === 'view-' + name;
    view.classList.toggle('active', active);
    view.hidden = !active;
    view.setAttribute('role', 'tabpanel');
    view.setAttribute('aria-labelledby', view.id.replace('view-', 'tab-'));
  });
  tabs.forEach(tab => {
    const active = tab.dataset.route === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const hash = '#' + name;
  if (location.hash !== hash) {
    try { history[push ? 'pushState' : 'replaceState'](null, '', hash); }
    catch { location.hash = hash; }
  }
  sendToSimulator({ type: 'studio-visibility', visible: name === 'learn' });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (moveFocus) {
    const heading = document.querySelector('#view-' + name + ' h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
document.querySelectorAll('[data-route]').forEach(control => control.addEventListener('click', e => {
  e.preventDefault();
  route(control.dataset.route, true, !control.classList.contains('tab'));
}));
// Skip navigation without changing the active hash-routed workspace.
document.querySelector('.skip-link').addEventListener('click', e => {
  e.preventDefault();
  $('main').focus();
});
document.querySelector('.tabs').addEventListener('keydown', e => {
  const index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  let next;
  if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
  if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = tabs.length - 1;
  if (next === undefined) return;
  e.preventDefault();
  tabs[next].focus();
  route(tabs[next].dataset.route, true);
});
window.addEventListener('popstate', () => route(location.hash.slice(1)));
window.addEventListener('hashchange', () => route(location.hash.slice(1)));

const count = document.querySelector('.toolbar > span');
count.setAttribute('aria-live', 'polite');
$('indicatorCount').textContent = String(cards.length);
$('alertCount').textContent = String(Object.values(window.PINE_SOURCES || {}).reduce((total, source) =>
  total + (source.match(/^\s*alertcondition\s*\(/gm) || []).length, 0));
count.textContent = cards.length + ' indicators · Pine Script v6';
document.querySelector('.segments').setAttribute('role', 'group');
document.querySelector('.segments').setAttribute('aria-label', 'Filter indicators');
document.querySelectorAll('.segment').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    document.querySelectorAll('.segment').forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter; });
    const visible = cards.filter(card => !card.hidden).length;
    count.textContent = visible + (visible === 1 ? ' indicator' : ' indicators') + ' · Pine Script v6';
  });
});

dialog.setAttribute('aria-labelledby', 'dialogTitle');
dialog.setAttribute('aria-describedby', 'dialogSub');
const sourceSection = document.createElement('details');
sourceSection.className = 'source-section';
sourceSection.innerHTML = '<summary>View Pine source</summary><textarea class="source-code" readonly aria-label="Pine Script source" spellcheck="false"></textarea>';
const sourceArea = sourceSection.querySelector('textarea');
const dialogStatus = document.createElement('p');
dialogStatus.className = 'dialog-status';
dialogStatus.setAttribute('role', 'status');
document.querySelector('.dialog-foot').prepend(dialogStatus);
const sourceLink = document.createElement('a');
sourceLink.className = 'small';
sourceLink.textContent = 'Open source file ↗';
sourceLink.target = '_blank';
sourceLink.rel = 'noopener';
document.querySelector('.dialog-foot').insertBefore(sourceLink, $('done'));
let detailGeneration = 0;

async function getSource(card) {
  // Generated from the actual .pine files; also works when index.html is opened directly.
  const bundled = window.PINE_SOURCES?.[card.dataset.key];
  if (typeof bundled === 'string' && bundled.includes('//@version=6')) return bundled;
  const response = await fetch(card.dataset.file);
  if (!response.ok) throw new Error('Source unavailable');
  const source = await response.text();
  if (!source.includes('//@version=6')) throw new Error('Invalid source response');
  return source;
}
async function openDetails(card, manualCopy = false) {
  const generation = ++detailGeneration;
  activeCard = card;
  const data = info[card.dataset.key];
  $('dialogTitle').textContent = data.title;
  $('dialogSub').textContent = data.sub;
  $('dialogBody').replaceChildren();
  const grid = document.createElement('div');
  grid.className = 'detail-grid';
  data.items.forEach(([heading, copy]) => {
    const detail = document.createElement('article');
    detail.className = 'detail';
    const h = document.createElement('h3');
    const p = document.createElement('p');
    h.textContent = heading;
    p.textContent = copy;
    detail.append(h, p);
    grid.append(detail);
  });
  $('dialogBody').append(grid, sourceSection);
  sourceArea.value = '';
  sourceArea.placeholder = 'Loading source…';
  sourceSection.open = manualCopy;
  dialogStatus.textContent = '';
  sourceLink.href = card.dataset.file;
  if (!dialog.open) dialog.showModal();
  $('dialogBody').scrollTop = 0;
  try {
    const source = await getSource(card);
    if (generation !== detailGeneration) return;
    sourceArea.value = source;
    if (manualCopy) {
      dialogStatus.textContent = 'Automatic copying is unavailable. Select the source below and copy it manually.';
      sourceArea.focus();
      sourceArea.select();
    }
  } catch {
    if (generation !== detailGeneration) return;
    sourceArea.placeholder = 'Source could not be loaded. Use Open source file to access it directly.';
    dialogStatus.textContent = 'Could not load the source file.';
  }
}
cards.forEach(card => {
  const name = card.querySelector('h2').textContent;
  const details = card.querySelector('.detail-button');
  details.setAttribute('aria-label', 'Details for ' + name);
  details.addEventListener('click', () => openDetails(card));
  const copyButton = card.querySelector('.copy-button');
  copyButton.setAttribute('aria-label', 'Copy source for ' + name);
  copyButton.addEventListener('click', () => copySource(card, copyButton));
});
['close', 'done'].forEach(id => $(id).addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { ++detailGeneration; });
$('dialogCopy').addEventListener('click', () => { if (activeCard) copySource(activeCard, $('dialogCopy')); });

function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('aria-label', 'Copy buffer');
  area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
  const focus = document.activeElement;
  (dialog.open ? dialog : document.body).append(area);
  area.focus();
  area.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* Offer manual copying. */ }
  area.remove();
  focus?.focus({ preventScroll: true });
  return copied;
}
async function copySource(card, button) {
  if (button.disabled || button.dataset.copyState === 'loading') return;
  const generation = detailGeneration;
  let state = copyFeedback.get(button);
  if (state) clearTimeout(state.timer);
  else state = { markup: button.innerHTML, label: button.getAttribute('aria-label'), minWidth: button.style.minWidth };
  copyFeedback.set(button, state);
  button.style.minWidth = Math.ceil(button.getBoundingClientRect().width) + 'px';
  button.setAttribute('aria-disabled', 'true');
  button.setAttribute('aria-busy', 'true');
  button.dataset.copyState = 'loading';
  button.textContent = 'Copying…';
  let success = false;
  try {
    const source = await getSource(card);
    if (generation !== detailGeneration) return;
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(source); copied = true; } catch { /* Fall through. */ }
    }
    if (generation !== detailGeneration) return;
    if (!copied) copied = legacyCopy(source);
    if (!copied) { await openDetails(card, true); return; }
    success = true;
    showStatus('Source copied to clipboard.');
  } catch {
    if (generation === detailGeneration) showStatus('Could not load the source. Open Details to access the file.');
  } finally {
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
    if (success) {
      button.textContent = 'Copied ✓';
      button.dataset.copyState = 'copied';
      button.setAttribute('aria-label', 'Source copied. ' + (state.label || 'Copy source'));
      state.timer = setTimeout(() => resetCopyFeedback(button, state), 1800);
    } else resetCopyFeedback(button, state);
  }
}
function resetCopyFeedback(button, state) {
  if (copyFeedback.get(button) !== state) return;
  button.innerHTML = state.markup;
  if (state.label === null) button.removeAttribute('aria-label');
  else button.setAttribute('aria-label', state.label);
  button.style.minWidth = state.minWidth;
  delete button.dataset.copyState;
  copyFeedback.delete(button);
}
function showStatus(message) {
  if (dialog.open) dialogStatus.textContent = message;
  else {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3500);
  }
}

document.querySelector('.github').setAttribute('aria-label', 'View repository on GitHub (opens in new tab)');
document.querySelectorAll('svg').forEach(svg => svg.setAttribute('aria-hidden', 'true'));
applyTheme(preferredTheme || (systemTheme.matches ? 'dark' : 'light'));
route(location.hash.slice(1));

const info = {
  high52: {
    title: '52-Week High',
    sub: 'Breakout and proximity framework',
    items: [
      ['Adaptive lookback', 'Uses up to 252 chart bars and safely adapts for newer listings.'],
      ['Distance tracking', 'Shows the current close as a percentage from the active high.'],
      ['Visual control', 'Adjust line style, width, axis marker, and label visibility.'],
      ['Alerts', 'Near 52W High and New 52W High conditions.'],
    ],
  },
  maSpectrum: {
    title: 'MA Spectrum 7',
    sub: 'Seven-layer moving-average overlay',
    items: [
      ['Fast group', 'Plots 20, 50, 100, and 200-period averages from a configurable source.'],
      ['Long group', 'Adds 350, 700, and 1,400-period SMA or EMA trend references.'],
      ['Flexible methods', 'The fast group supports SMA, EMA, RMA, WMA, and VWMA calculations.'],
      ['Display controls', 'Toggle either group or each individual average and customize every color.'],
    ],
  },
  mcdx: {
    title: 'MCDX Smart Money',
    sub: 'RSI-derived momentum classifier',
    items: [
      ['Banker strength', 'An RSI-derived momentum proxy with adjustable sensitivity; not measured institutional order flow.'],
      ['Hot money', 'A separate short-term momentum layer.'],
      ['Retail balance', 'Fills the remaining oscillator view for fast comparisons.'],
      ['Alerts', 'Banker crossovers, strong zones, and retailer dominance.'],
    ],
  },
};

