// TradingView Symbol Overview: real AAPL market data, no locally generated prices.
// Configuration follows the provider's public candlestick widget documentation.
(() => {
  const mount = document.getElementById('appleMarketMount');
  if (!mount) return;
  const status = document.getElementById('marketStatus');
  const fallback = document.getElementById('marketFallback');
  const message = document.getElementById('marketMessage');
  const retry = document.getElementById('marketRetry');
  const refresh = document.getElementById('marketRefresh');
  let generation = 0;
  let theme;
  let timeout;
  let frameObserver;

  function render() {
    const current = ++generation;
    theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    clearTimeout(timeout);
    frameObserver?.disconnect();
    mount.replaceChildren();
    mount.hidden = false;
    fallback.hidden = false;
    retry.hidden = true;
    status.textContent = 'Connecting';
    status.dataset.state = 'loading';
    message.textContent = "Connecting to Apple's market activity…";

    function unavailable() {
      if (current !== generation) return;
      clearTimeout(timeout);
      mount.hidden = true;
      fallback.hidden = false;
      retry.hidden = false;
      status.textContent = 'Unavailable';
      status.dataset.state = 'error';
      message.textContent = 'Could not connect to the market chart. Check your connection or try again.';
    }
    function ready() {
      if (current !== generation) return;
      clearTimeout(timeout);
      mount.hidden = false;
      fallback.hidden = true;
      status.textContent = 'Market chart';
      status.dataset.state = 'ready';
    }

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    const chart = document.createElement('div');
    chart.className = 'tradingview-widget-container__widget';
    const credit = document.createElement('div');
    credit.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = 'https://www.tradingview.com/symbols/NASDAQ-AAPL/';
    link.target = '_blank';
    link.rel = 'noopener nofollow';
    link.textContent = 'Apple stock price';
    const attribution = document.createElement('span');
    attribution.textContent = ' by TradingView';
    credit.append(link, attribution);
    container.append(chart, credit);
    mount.append(container);

    frameObserver = new MutationObserver(() => {
      const frame = mount.querySelector('iframe');
      if (!frame || current !== generation) return;
      frame.setAttribute('title', 'Apple (AAPL) stock price chart by TradingView');
      frame.addEventListener('load', ready, { once: true });
      frameObserver.disconnect();
    });
    frameObserver.observe(mount, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify({
      symbols: [['Apple', 'NASDAQ:AAPL|1D']],
      chartOnly: false,
      width: '100%', height: '100%', autosize: true,
      locale: 'en', colorTheme: theme, isTransparent: false,
      backgroundColor: theme === 'dark' ? '#1c1c1e' : '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      fontSize: '12', headerFontSize: 'large',
      chartType: 'candlesticks', showVolume: true, showMA: false,
      hideDateRanges: false, hideMarketStatus: false, hideSymbolLogo: false,
      noTimeScale: false, scalePosition: 'right', scaleMode: 'Normal',
      valuesTracking: '1', changeMode: 'price-and-percent',
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W'],
      upColor: '#22ab94', downColor: '#f7525f',
      borderUpColor: '#22ab94', borderDownColor: '#f7525f',
      wickUpColor: '#22ab94', wickDownColor: '#f7525f',
    });
    script.addEventListener('error', unavailable, { once: true });
    timeout = setTimeout(unavailable, 15000);
    if (navigator.onLine === false) unavailable();
    else container.append(script);
  }

  retry.addEventListener('click', render);
  // Cross-origin iframe load does not prove quotes loaded; recovery stays
  // available outside the overlay even when the provider frame is blocked.
  refresh.addEventListener('click', render);
  new MutationObserver(() => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    if (next !== theme) render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('online', render);
  render();
})();

