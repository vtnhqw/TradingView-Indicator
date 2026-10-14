import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

function node(tag = 'div') {
  const events = new Map();
  return {
    tagName: tag.toUpperCase(), children: [], style: {}, dataset: {}, hidden: false,
    textContent: '', className: '', attributes: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    querySelector(selector) {
      for (const child of this.children) {
        if (child.tagName?.toLowerCase() === selector) return child;
        const found = child.querySelector?.(selector);
        if (found) return found;
      }
      return null;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { events.set(name, callback); },
    dispatch(name) { events.get(name)?.(); },
  };
}

async function setup() {
  let script;
  try { script = await readFile(new URL('../js/market.js', import.meta.url), 'utf8'); }
  catch { assert.fail('The real-market chart controller is missing'); }
  const elements = new Map(['appleMarketMount', 'marketStatus', 'marketFallback', 'marketMessage', 'marketRetry', 'marketRefresh'].map(id => [id, node()]));
  const root = node(); root.dataset.theme = 'light';
  const observers = [];
  const timers = new Map(); let serial = 0;
  const context = {
    document: { documentElement: root, getElementById: id => elements.get(id), createElement: node },
    navigator: { onLine: true },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { this.target = target; } disconnect() { this.disconnected = true; }
    },
    setTimeout(callback) { timers.set(++serial, callback); return serial; },
    clearTimeout: id => timers.delete(id),
    addEventListener() {},
  };
  context.window = context;
  vm.runInNewContext(script, context);
  const mount = elements.get('appleMarketMount');
  const currentScript = () => mount.querySelector('script');
  function loadFrame() {
    const frame = node('iframe');
    mount.children[0].children[0].append(frame);
    observers.findLast(o => o.target === mount && !o.disconnected).callback();
    frame.dispatch('load');
    return frame;
  }
  return { elements, root, observers, timers, currentScript, loadFrame };
}

test('the market card requests Apple quotes and a responsive candlestick chart from TradingView', async () => {
  const h = await setup();
  const script = h.currentScript();
  assert.equal(script.src, 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js');
  const config = JSON.parse(script.textContent);
  assert.equal(config.symbols[0][1], 'NASDAQ:AAPL|1D');
  assert.equal(config.chartType, 'candlesticks');
  assert.equal(config.showMA, false, 'The Apple chart should not display the built-in moving average');
  assert.equal(config.chartOnly, false);
  assert.equal(config.hideMarketStatus, false);
  assert.equal(config.autosize, true);
  assert.equal(config.colorTheme, 'light');
  assert.equal(h.elements.get('marketFallback').hidden, false);
  const frame = h.loadFrame();
  assert.equal(frame.attributes.title, 'Apple (AAPL) stock price chart by TradingView');
  assert.equal(h.elements.get('marketFallback').hidden, true);
  assert.equal(h.elements.get('marketStatus').textContent, 'Market chart');
});

test('a failed market connection shows a retry state without a fabricated quote', async () => {
  const h = await setup();
  h.currentScript().dispatch('error');
  assert.equal(h.elements.get('marketStatus').textContent, 'Unavailable');
  assert.equal(h.elements.get('marketRetry').hidden, false);
  assert.equal(h.elements.get('marketFallback').hidden, false);
  assert.match(h.elements.get('marketMessage').textContent, /connect/i);
  h.elements.get('marketRetry').dispatch('click');
  assert.equal(h.elements.get('marketStatus').textContent, 'Connecting');
  h.loadFrame();
  assert.equal(h.elements.get('marketFallback').hidden, true);
});

test('changing the site theme rebuilds the market widget with the matching theme', async () => {
  const h = await setup();
  const oldScript = h.currentScript();
  h.loadFrame();
  h.root.dataset.theme = 'dark';
  h.observers.find(o => o.target === h.root).callback();
  const config = JSON.parse(h.currentScript().textContent);
  assert.equal(config.colorTheme, 'dark');
  assert.notEqual(h.currentScript(), oldScript);
  oldScript.dispatch('error');
  assert.equal(h.elements.get('marketStatus').textContent, 'Connecting');
  h.loadFrame();
  assert.equal(h.elements.get('marketFallback').hidden, true);
});

test('the chart can still be reloaded after an iframe load hides the connection overlay', async () => {
  const h = await setup();
  h.loadFrame();
  const previous = h.currentScript();
  h.elements.get('marketRefresh').dispatch('click');
  assert.notEqual(h.currentScript(), previous);
  assert.equal(h.elements.get('marketStatus').textContent, 'Connecting');
  assert.equal(h.elements.get('marketFallback').hidden, false);
});

