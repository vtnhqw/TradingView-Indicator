# TradingView Pine Script v6 Indicator Suite

An open-source collection of five TradingView indicators plus an interactive Level II order-book simulator. Every indicator is plain Pine Script v6 and can be inspected before it is copied into TradingView.

> These tools are for education and chart analysis. They are not financial advice, and their labels are signals or momentum proxies—not observations of actual institutional order flow.

## Indicators

| Indicator | Display | Purpose | Alerts |
| --- | --- | --- | ---: |
| [52-Week High](indicators/52-week-high-line-v2.pine) | Overlay | Tracks the highest value across an adaptive 252-chart-bar lookback, distance, and proximity | 2 |
| [MCDX Smart Money](indicators/MCDX-SmartMoney.pine) | Pane | Displays RSI-derived momentum components labelled Banker, Hot Money, and Retailer | 5 |
| [Pink Candle](indicators/PinkCandle-Indicator-v1.pine) | Overlay | Combines EMA/ATR bands, volume climaxes, and candle-colour setup signals | 6 |
| [RSI Divergence](indicators/rsi-divergence-indicator.pine) | Pane | Finds regular and hidden divergence between confirmed RSI and price pivots | 4 |
| [ZigZag Swing Wave](indicators/zigzag-indicator.pine) | Overlay | Connects confirmed price pivots and previews the developing swing | 2 |

The names used by MCDX are conventional labels for its RSI-derived model. They should not be interpreted as measured ownership or capital-flow percentages.

## Use in TradingView

1. Open one of the indicator files above and copy its complete contents.
2. Open a chart in [TradingView](https://www.tradingview.com/), then open **Pine Editor**.
3. Create a new indicator, replace the template with the copied source, and save it.
4. Select **Add to chart**.
5. Configure the indicator from its settings and create only the alerts you need.

Pivot-based indicators confirm signals only after their configured right-side lookback has elapsed. Signals evaluated on the current candle can change before that candle closes; configure TradingView alert frequency accordingly.

## Local website

The website provides a visual catalog, offline source-copying support, and a Learn section. The interactive Order Book Lab is its first lesson, with room for more learning modules later.

Open `index.html` directly, or build the deployable directory:

```sh
node scripts/build.mjs
```

The build performs repository consistency checks before generating `pine-sources.js` and copying the site into `out/`. It fails when an indicator under `indicators/` is missing from the build manifest or when a mapped source is not a Pine v6 indicator.

Generated output is intentionally excluded from Git. Commit `pine-sources.js` whenever an indicator source changes so direct-file users receive the current source bundle.

## Repository layout

```text
indicators/                         Pine Script sources
note/level2_orderbook_cheatsheet.html
                                    Interactive Level II simulator
scripts/build.mjs                   Validation and static-site build
app.js                              Website interactions
index.html                          Website shell and catalog
pine-sources.js                     Generated offline source bundle
```

The root-level `test` file is a standalone experimental Pine script and is not part of the published five-indicator catalog.

## License

The project is distributed under the [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/). Individual source headers remain authoritative for files that include their own copyright or attribution notices.
