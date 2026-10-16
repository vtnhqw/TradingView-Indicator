# TradingView Pine Script v6 Indicator Suite

An open-source collection of three TradingView indicators plus an interactive Level II order-book simulator. Every indicator is plain Pine Script v6 and can be inspected before it is copied into TradingView.

> [!IMPORTANT]
> **Indicator Modification Policy:** Never touch, edit, or refactor any indicator source files (`indicators/*.pine`) without asking or without prior consent from the repository owner. All Pine Script files must remain intact unless explicitly requested.

> These tools are for education and chart analysis. They are not financial advice, and their labels are signals or momentum proxies—not observations of actual institutional order flow.

## Indicators

| Indicator | Display | Purpose | Alerts |
| --- | --- | --- | ---: |
| [52-Week High](indicators/52-week-high-line.pine) | Overlay | Tracks the highest value across an adaptive 252-chart-bar lookback, distance, and proximity | 2 |
| [MA Spectrum 7](indicators/MA-Spectrum-7.pine) | Overlay | Plots seven configurable moving averages spanning 20 to 1,400 periods | 0 |
| [MCDX Smart Money](indicators/MCDX-SmartMoney.pine) | Pane | Displays RSI-derived momentum components labelled Banker, Hot Money, and Retailer | 5 |

The names used by MCDX are conventional labels for its RSI-derived model. They should not be interpreted as measured ownership or capital-flow percentages.

## Use in TradingView

1. Open one of the indicator files above and copy its complete contents.
2. Open a chart in [TradingView](https://www.tradingview.com/), then open **Pine Editor**.
3. Create a new indicator, replace the template with the copied source, and save it.
4. Select **Add to chart**.
5. Configure the indicator from its settings and create only the alerts you need.

Signals evaluated on the current candle can change before that candle closes; configure TradingView alert frequency accordingly.

## Local website

Terminal is a React application using **actual shadcn/ui components**, Tailwind CSS, Radix primitives, and Vite. The overview, indicator library, dialogs, navigation, filters, and Order Book Lab share the same component system and light/dark theme.

The source lives in `src/`. Locally owned shadcn components are in `src/components/ui/` and configured by `components.json`. They were installed from the official shadcn registry; `cn` uses the local class-merging utility, and Sonner receives the app theme directly. Add components with `npx shadcn@latest add <component>` (see the [official Vite setup](https://ui.shadcn.com/docs/installation/vite)).

### Development

Requires Node.js **22.12 or newer** (CI uses Node 24).

```sh
npm ci
npm start
```

Open `http://localhost:8000`. The React source requires the development server; opening `index.html` directly with `file://` is no longer supported.

```sh
npm test          # simulator, production asset checks, React interaction tests
npm run build    # production static website in out/
npm run preview  # serve the production build locally on port 8000
```

The build validates that every `indicators/*.pine` file is included in the catalog, imports exact source text into the app for offline copying, and copies the unchanged files into `out/indicators/`. No generated `pine-sources.js` file is needed. Source copying, filtering, and simulation work without external requests after the local application loads; there is no offline page cache/service worker.

The standalone lesson URL remains `note/level2_orderbook_cheatsheet.html`. Both entry pages use the same React components. The `#learn` route opens the lesson library. Lessons have independent URLs: `#learn/order-book` for the simulator and `#learn/darvas` for the documentation guide. Darvas sections are linkable, for example `#learn/darvas/worked-example`. `#home` opens the overview, while legacy `#note` and `#lab` shortcuts still open the Order Book Lab.

The Order Book Lab preserves BTC, AAPL, and EUR/USD, seven scripted scenarios, speed selection, pause/resume, reset, event logging, cumulative depth, and maximized viewing. Its engine is isolated from rendering in `src/lib/simulator.js`. Simulation timers stop when the page is hidden or the lab unmounts. All simulator data is illustrative.

The overview retains TradingView's Apple (`NASDAQ:AAPL`) Symbol Overview widget for actual quotes, candlesticks, volume, and selectable time ranges. Moving averages are disabled. The chart follows the selected theme and requires an internet connection. Public Nasdaq widget data may be delayed. Failures provide a retry control and a direct AAPL link. Loading an iframe does not guarantee quotes are available; reload remains accessible. The widget does not run the repository's custom Pine indicators.

> **Hosting policy:** This repository must not be deployed or hosted using OpenAI hosting. Do not create or restore `.openai/hosting.json` or any other OpenAI hosting configuration. Keep the website local unless the repository owner explicitly chooses a different, non-OpenAI hosting provider.

The existing GitHub Pages workflow installs dependencies and builds `out/`. Relative asset URLs support repository subpaths. No deployment is performed by local development commands.

### Adding lessons

The Learn area separates the lesson library from individual guides and labs. It includes a responsive lesson sidebar, breadcrumbs, documentation section navigation, and direct URLs. Darvas is a standalone guide with a staged illustration, hypothetical risk example, practice question, and linked sources; it is not embedded in the Order Book Lab.

To add a reading lesson:

1. Create a content module in `src/content/lessons/` (use `darvas.js` as an example).
2. Add its metadata, unique `slug`, `kind: "guide"`, `sections`, and `sources` to `src/content/lessons/index.js`.
3. Give every section a unique stable `id` and `title`. Supported content includes `paragraphs`, `bullets`, `table`, `paragraphsAfter`, `callout`, `question`, and source references. Register custom illustrations in `lesson-article.jsx` only when needed.

The library cards, lesson sidebar, section navigation, and lesson links use this registry automatically. Interactive lessons also register their React component in `src/components/learn/learn-page.jsx`. Preserve existing slugs and section IDs so saved links keep working.

### Repository layout

```text
src/App.jsx                         Shared shell, navigation, and routes
src/components/overview.jsx         Homepage and indicator previews
src/components/indicator-library.jsx Catalog, details, and source copying
src/components/order-book-lab.jsx   Interactive lesson and shadcn controls
src/components/learn/               Library, documentation layout, article renderer
src/content/lessons/                Lesson registry and guide content
src/components/market-chart.jsx     TradingView chart and recovery UI
src/components/ui/                  Locally owned shadcn/ui components
src/lib/                            Theme, indicator data, chart lifecycle, engine
src/index.css                       Tailwind entry and shared theme tokens
indicators/                         Pine Script sources (MUST REMAIN INTACT)
note/level2_orderbook_cheatsheet.html Standalone React lesson entry
scripts/                            Build validation and Node regression tests
tests/                              React interaction and chart lifecycle tests
out/                                Generated static website (Git-ignored)
```

## License

The project is distributed under the [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/). Individual source headers remain authoritative for files that include their own copyright or attribution notices.
