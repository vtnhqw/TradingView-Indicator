import { it, expect, vi } from "vitest";
import { mountMarketChart } from "../src/lib/market";

it("requests actual AAPL candles, volume and no moving average from TradingView", () => {
  const mount = document.createElement("div");
  const status = vi.fn();
  const cleanup = mountMarketChart(mount, "dark", status);
  const script = mount.querySelector("script");
  const config = JSON.parse(script.textContent);
  expect(script.src).toBe(
    "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
  );
  expect(config.symbols).toEqual([["Apple", "NASDAQ:AAPL|1D"]]);
  expect(config.chartType).toBe("candlesticks");
  expect(config.showMA).toBe(false);
  expect(config.showVolume).toBe(true);
  expect(config.colorTheme).toBe("dark");
  script.dispatchEvent(new Event("error"));
  expect(status).toHaveBeenLastCalledWith("error");
  cleanup();
  expect(mount.children).toHaveLength(0);
});
it("ignores late iframe loads after a timeout and cleans up pending work", async () => {
  vi.useFakeTimers();
  try {
    const mount = document.createElement("div");
    const status = vi.fn();
    const cleanup = mountMarketChart(mount, "light", status);
    const frame = document.createElement("iframe");
    mount.append(frame);
    await Promise.resolve();
    vi.advanceTimersByTime(15000);
    expect(status).toHaveBeenLastCalledWith("error");
    frame.dispatchEvent(new Event("load"));
    expect(status).toHaveBeenLastCalledWith("error");
    cleanup();
    status.mockClear();
    frame.dispatchEvent(new Event("load"));
    vi.runAllTimers();
    expect(status).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
