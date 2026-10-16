// The provider iframe load confirms the frame, not quote availability.
// Keep reload and direct-provider access available at all times.
export function mountMarketChart(mount, theme, onStatus) {
  let disposed = false;
  let frame;
  let timedOut = false;
  onStatus("loading");
  mount.replaceChildren();
  const container = document.createElement("div");
  container.className = "tradingview-widget-container";
  const chart = document.createElement("div");
  chart.className = "tradingview-widget-container__widget";
  const credit = document.createElement("div");
  credit.className = "tradingview-widget-copyright";
  const link = document.createElement("a");
  link.href = "https://www.tradingview.com/symbols/NASDAQ-AAPL/";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Apple stock price by TradingView";
  credit.append(link);
  container.append(chart, credit);
  mount.append(container);
  const unavailable = () => {
    if (!disposed) {
      timedOut = true;
      onStatus("error");
    }
  };
  const timeout = setTimeout(unavailable, 15000);
  const ready = () => {
    if (!disposed && !timedOut) {
      clearTimeout(timeout);
      onStatus("ready");
    }
  };
  const observer = new MutationObserver(() => {
    const next = mount.querySelector("iframe");
    if (!next || disposed) return;
    frame = next;
    frame.title = "Apple (AAPL) stock price chart by TradingView";
    frame.addEventListener("load", ready, { once: true });
    observer.disconnect();
  });
  observer.observe(mount, { childList: true, subtree: true });
  const script = document.createElement("script");
  script.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
  script.async = true;
  script.textContent = JSON.stringify({
    symbols: [["Apple", "NASDAQ:AAPL|1D"]],
    chartOnly: false,
    width: "100%",
    height: "100%",
    autosize: true,
    locale: "en",
    colorTheme: theme,
    isTransparent: false,
    backgroundColor: theme === "dark" ? "#1c1c1e" : "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    fontSize: "12",
    headerFontSize: "large",
    chartType: "candlesticks",
    showVolume: true,
    showMA: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    noTimeScale: false,
    scalePosition: "right",
    scaleMode: "Normal",
    valuesTracking: "1",
    changeMode: "price-and-percent",
    dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W"],
    upColor: "#22ab94",
    downColor: "#f7525f",
    borderUpColor: "#22ab94",
    borderDownColor: "#f7525f",
    wickUpColor: "#22ab94",
    wickDownColor: "#f7525f",
  });

  script.addEventListener("error", unavailable, { once: true });
  if (navigator.onLine === false) {
    clearTimeout(timeout);
    unavailable();
  } else container.append(script);
  return () => {
    disposed = true;
    clearTimeout(timeout);
    observer.disconnect();
    frame?.removeEventListener("load", ready);
    script.removeEventListener("error", unavailable);
    mount.replaceChildren();
  };
}
