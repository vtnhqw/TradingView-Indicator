# 📈 TradingView Pine Script v6 Indicator Suite

Welcome to this professional TradingView Indicator suite written in **Pine Script v6**. These indicators are designed to help traders identify institutional accumulation (Smart Money), dynamic support zones (Pillow Support), breakout levels (52-Week Highs), buy-on-dip reversal setups using candle-color triggers, and swing structures. It also includes an interactive browser-based Level II order book simulator note to master order flow dynamics.

---

## 📂 Repository Contents

This workspace contains the following indicator scripts and tools:

1. **[52-week-high-line-v2.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/52-week-high-line-v2.pine)**: A dynamic, breakout-oriented indicator that plots the 52-week high, shows the percentage distance, and raises proximity alerts.
2. **[MCDX-SmartMoney.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/MCDX-SmartMoney.pine)**: An RSI-based momentum classifier that segments market participants into Bankers (Smart Money), Hot Money (speculators), and Retailers.
3. **[PinkCandle-Indicator-v1.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/PinkCandle-Indicator-v1.pine)**: A complete trend and reversal system featuring dynamic Pillow Support, institutional Shark Zones, and climax volume coloring.
4. **[zigzag-indicator.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/zigzag-indicator.pine)**: A swing high/low wave indicator that filters market noise by connecting pivot highs and lows, detailing percentage/price movements, and displaying a live developing leg.
5. **[note/level2_orderbook_cheatsheet.html](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/note/level2_orderbook_cheatsheet.html)**: An interactive cheatsheet and live Level II Order Book Simulator that visualizes order flow, spread, walls, spoofing, breakouts, and breakdowns with a built-in event log and dark/light modes.

---

## 🚀 How to Use These Scripts in TradingView

Follow these step-by-step instructions to load and run these indicators on any TradingView chart:

### 1. Copy the Pine Script Code
* Open the indicator file you want to use from this workspace:
  * Open [52-week-high-line-v2.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/52-week-high-line-v2.pine)
  * Open [MCDX-SmartMoney.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/MCDX-SmartMoney.pine)
  * Open [PinkCandle-Indicator-v1.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/PinkCandle-Indicator-v1.pine)
  * Open [zigzag-indicator.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/zigzag-indicator.pine)
* Select the entire code (Ctrl+A / Cmd+A) and copy it (Ctrl+C / Cmd+C).

### 2. Open TradingView's Pine Editor
1. Go to [TradingView](https://www.tradingview.com) and open any asset chart (e.g., AAPL, BTCUSD).
2. At the bottom of the screen, click on the **Pine Editor** tab.
3. Click the **Open** drop-down menu on the top right of the Pine Editor and select **New indicator** (or clear the default template).

### 3. Paste and Save
1. Paste the copied code into the editor, completely replacing the default code.
2. Click **Save** on the upper-right of the editor.
3. Give it a name (e.g., `MCDX Smart Money`, `Pink Candle Indicator`, `ZigZag Wave`).

### 4. Add to Chart
1. Click the **Add to Chart** button right next to the Save button.
2. The indicator will appear on your chart:
   * **Overlay Indicators** (e.g., **52-Week High**, **ZigZag Wave**, & **Pink Candle**) will draw directly on top of your price candlesticks.
   * **Pane Indicators** (e.g., **MCDX Smart Money**) will display in a separate pane underneath the chart.

### 5. Access Settings and Alerts
* **Settings**: Hover over the indicator name on the top-left of the chart (or the indicator pane) and click the **Gear Icon** ⚙️ to configure lengths, colors, and thresholds.
* **Alerts**: Click the **Three Dots** next to the indicator name on the chart, click **Add Alert**, and select your trigger conditions (e.g., `WHITE Candle — Enter Now` or `Broke 52W High`).

---

## 💻 How to Run the Level II Order Book Simulator

The Level II Order Book note is a fully interactive simulator built to run in any browser.

1. **VS Code Live Server**: If you are using VS Code, install the **Live Server** extension. Right-click on [level2_orderbook_cheatsheet.html](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/note/level2_orderbook_cheatsheet.html) and select **Open with Live Server**.
2. **Python Server**: Open a terminal in the folder directory and run:
   ```bash
   python -m http.server 8000
   ```
   Open your browser and navigate to `http://localhost:8000/note/level2_orderbook_cheatsheet.html`.
3. **Features**: Change symbol types (BTC, AAPL, EURUSD), adjust tick speeds, play/pause ticks, toggle light/dark modes, and click any item in **Signals to Watch** to watch order flow patterns (walls, spoofing, breakouts) play out in real time with a console log explainer.

---

## 🔍 Detailed Indicator Breakdown

---

### 1. 52-Week High (`52-week-high-line-v2.pine`)

[52-week-high-line-v2.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/52-week-high-line-v2.pine) is designed to track one of the most critical resistance levels used by institutional investors: the **52-Week High**. When an asset breaks through its 52-week high, it often signals the beginning of a powerful momentum extension.

```
       52W High Level Line (e.g., Orange dashed/solid line extending right)
  ------------------------------------------------------------- [52W High Price]
                                    ▲ Breakout (Crossover Alert)
                 ▲ Proximity Alert  │
                 │ (Within X%)      │   ┌─┐
         ┌─┐     │                  │ ┌─┤ │
       ┌─┤ ├─┐  ┌┴┐                 └─┤ └─┘
       │ └─┘ └──┘ └───────────────────┘
```

#### ⚙️ Technical Mechanics
* **Adaptive Lookback**: Typically, a 52-week high refers to 252 trading days. This script features an adaptive engine (`adaptedLen = math.min(bar_index + 1, 252)`) that scales the lookback window automatically for newly-listed assets or short charts, preventing indexing crashes.
* **Distance Tracking**: Computes the exact percentage distance between the current close and the 52-week high.
* **Axis Labels**: Uses TradingView's native price axis plot so that you can see the high's exact value clearly marked on the right-hand price scale.

#### 🎛️ Input Controls
* **Line Color & Width**: Customize the visual appearance of the 52-week high line.
* **Line Style**: Toggle between `Solid`, `Dashed`, and `Dotted`.
* **Label Toggles**: Show or hide the text label on the left side of the line, show/hide the distance %, and show/hide the price axis marker.
* **Proximity Alert (%)**: Sets the threshold distance (default: `2.0%`) for proximity alerts.

#### 🚨 Custom Alerts
* `Near 52W High`: Fires when the asset's current price comes within the proximity threshold (e.g., 2%) of the 52-week high.
* `Broke 52W High`: Fires the moment the closing price crosses above the 52-week high (breakout signal).

---

### 2. MCDX Smart Money (`MCDX-SmartMoney.pine`)

[MCDX-SmartMoney.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/MCDX-SmartMoney.pine) is an open-source recreation of the popular MCDX (Multi-Color Direction Index) indicator. It uses an RSI-based momentum classification formula to estimate the ratio of institutional ("Banker") capital versus retail capital.

#### 📊 Market Composition Color Codes
* 🔴 **Bankers (Smart Money)**: Represents institutional accumulation. When Bankers occupy a large portion of the bar, it indicates big money is buying or supporting the price. **Highly Bullish**.
* 🟡 **Hot Money (Speculators)**: Represents short-term momentum and fast-moving hot money. A sign of short-term speculative trading. **Neutral / Transitional**.
* 🟢 **Retailers (Retail Traders)**: Represents retail investors who are often trapped at market tops or panic selling at bottoms. When Retailer bars dominate, avoid going long. **Bearish / Distribution**.

#### 🧪 Calculation Logic
The indicator uses a proprietary RSI momentum scaler to compute Bankers and Hot Money levels up to a maximum height of `20`:
$$\text{Value} = \text{Clamp}\Big(0,\ 20,\ \text{Sensitivity} \times (\text{RSI}(\text{Period}) - \text{RSI Base})\Big)$$
Retailers fill the remaining space from the bottom up:
$$\text{Retailer Value} = 20 - \max(\text{Banker Value}, \text{Hot Money Value})$$

```
  20 ┼───────────────────────────────────────────── (Max Height Limit)
     │ 🔴🔴🔴                  🔴🔴🔴  [Banker overlay]
     │ 🔴🔴🔴   🟡🟡🟡         🔴🔴🔴  
  10 ┼─🟡🟡🟡───🟡🟡🟡─────────🟡🟡🟡─── [Hot Money base] ───── (Mid Level)
     │ 🟢🟢🟢   🟢🟢🟢   🟢🟢🟢 🟢🟢🟢  [Retailer bottom-fill]
     │ 🟢🟢🟢   🟢🟢🟢   🟢🟢🟢 🟢🟢🟢  
    0 ┴───────────────────────────────────────────── (Zero Level)
```

#### 🎛️ Input Controls
* **Banker Settings**: Modify the Banker RSI Base (default: `50`), RSI Period (default: `50`), and Sensitivity (default: `1.5`).
* **Hot Money Settings**: Modify the Hot Money RSI Base (default: `30`), RSI Period (default: `40`), and Sensitivity (default: `0.7`).
* **Display Settings**:
  * **Show Moving Averages**: Toggle SMA lines for Bankers, Hot Money, and Retailers (default: 10-period).
  * **Show Background Signal**: The background color changes based on who is dominant (Bullish Green for Banker dominance, Bearish Red for Retailer dominance).
  * **Show % Labels**: Adds a clean real-time **Information Dashboard Table** in the top-right corner showing current values and percentages.

#### 🚨 Custom Alerts
* `Banker Crossover Hot Money`: Triggered when Banker value crosses above Hot Money (early bullish momentum).
* `Banker Crossover Retail`: Triggered when Banker value crosses above Retailer value (strong institutional buy signal).
* `Banker Crossunder Hot Money`: Triggered when Banker value crosses below Hot Money (caution, institutions cooling off).
* `Strong Banker Zone (>= 15)`: Triggered when Banker value is $\ge 15$ (heavy institutional block buying).
* `Retailer Dominant (>= 18)`: Triggered when Retailer value is $\ge 18$ (retailers stuck, extreme risk of dumping).

---

### 3. Pink Candle Indicator (`PinkCandle-Indicator-v1.pine`)

[PinkCandle-Indicator-v1.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/PinkCandle-Indicator-v1.pine) is a full-featured "Buy-on-Dip" execution system. It identifies exact entry and exit coordinates by analyzing oversold momentum, volume climaxes, dynamic support, and overhead supply.

```
       [ Shark Zone / Tory Box - Institutional Sell/TP Zone ]  (Red Ribbon)
       ====================================================
                     ★ Yellow TP Candle / BC Climax
                    /
                  ┌─┐   ┌─┐
                ┌─┤ │ ┌─┤ │ ◄── Blue Breakout Candle (High Vol)
                │ └─┘ │ └─┘
         ┌─┐    │     │
  ======─┤ ├─===┴=====┴==================================== [ Pillow Upper Band ]
  ░░░░░░░└─┘░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ [ Pillow Mid Line (Uptrend/Downtrend Boundary) ]
  ======┌─┐================================================ [ Pillow Lower Band ]
        │ ├─┐ ◄── White Knight Candle (Entry Trigger)
       ┌┴┐└─┘
       └─┘ ◄── Pink Candle / SC Climax (Standby Buy / Reversal Wick)
```

#### 🎨 Candle & Signal Color Legend
When active, this indicator overrides the default candle colors to guide your trade execution:

| Candle Color | Signal Name | Meaning / Trader Action |
| :--- | :--- | :--- |
| **🌸 Pink** | **Standby Buy** | Potential bottom/reversal. Triggered when RSI/Stochastics are oversold, the candle forms a long lower wick (hammer-style rejection), or immediately after a panic Selling Climax. **Do not buy yet — get ready.** |
| **⚪ White** | **White Knight** | **CONFIRMED ENTRY.** Fires on a bullish candle with good volume that breaks back above the lower Pillow band immediately after a Pink setup. **This is your buy signal.** |
| **🟡 Yellow** | **Standby Sell** | Potential top/weakness. Price is overbought or touching the Shark Zone, and printing an upper wick rejection (shooting star). **Start booking profits / scaling out.** |
| **🔵 Blue** | **Breakout** | Strong breakout candle closing above the Pillow's upper limit with high volume. **Hold your position or add on momentum.** |
| **🟢 Green** | **Uptrend** | Price is holding comfortably above the Pillow Midline. **Ride the trend.** |
| **🔴 Red** | **Downtrend** | Price is below the Pillow Midline. **Danger zone — do not buy.** |
| **🚨 SC Tag** | **Selling Climax** | Marked at the bottom of a candle when volume is $>2.0x$ the average on a massive red candle. Rejection here leads to a Pink candle. |
| **🚨 BC Tag** | **Buying Climax** | Marked at the top of a candle when volume is $>2.0x$ the average on a massive green candle. Signals buyer exhaustion. |

#### 🎛️ Primary Components
1. **Pillow Support Band**: A dynamic ribbon plotted around the EMA (default: `21`) shifted by ATR. It acts as the primary accumulation channel during pullbacks.
2. **Shark Zone (Tory Box)**: Plotted using the highest high of the last $N$ bars (default: `50`) with an adjustable thickness. This represents heavy institutional supply where retail buyers are lured in right before a dump.
3. **Dashboard Table (SOP Hint)**: A real-time box in the top-right corner displaying indicator metrics and a **Standard Operating Procedure (SOP) Hint** explaining exactly what you should do on the current candle.

#### 🚨 Custom Alerts
Alerts are available for every major candle color state (`PINK`, `WHITE`, `YELLOW`, `BLUE`) and volume climaxes (`SC`, `BC`) to ensure you never miss a setups.

---

### 4. ZigZag Swing Indicator (`zigzag-indicator.pine`)

[zigzag-indicator.pine](file:///C:/Users/vtnhq/Downloads/TradingView-Indicator/zigzag-indicator.pine) is a swing-trading indicator designed to filter out short-term market noise and highlight the core market structure (higher highs, lower lows). It connects confirmed pivot points with colored lines.

```
                  (Confirmed Swing High)
                         ▲
                        / \
                       /   \
                      /     \  ◄── Red Down Leg (Downswing)
  Green Up Leg ──────/       \
  (Upswing)         /         \
                   /           ▼
                  /       (Confirmed Swing Low)
```

#### ⚙️ Technical Mechanics
* **Pivot Strength Lookback (Depth)**: Uses `ta.pivothigh()` and `ta.pivotlow()` over a configurable depth window (default: `10` bars) to verify pivot points.
* **Source Mode**: Detects pivots based on High/Low ranges (standard) or Closing prices.
* **Price & Percent Labels**: Displays labels on each pivot showing the price and percentage change relative to the previous pivot.
* **Live Developing Leg**: Draws a temporary dashed line showing real-time price progress towards the next potential pivot before confirmation.
* **Trend Shading**: Optionally colors the chart background based on the current swing direction (green for up, red for down).

#### 🎛️ Input Controls
* **Depth (Pivot Strength)**: Lookback bars required on each side to confirm pivots (default: `10`).
* **Pivot Source**: Toggle pivot detection source between `High/Low` or `Close`.
* **Labels**: Toggle Price labels and percentage change calculations.
* **Style**: Toggle leg colors (green/red), line width, and live developing leg preview.

---

## 🛠️ The Ultimate Trading Setup (SOP)

Combining these indicators creates a powerful, systematic trading framework.

```
                  ┌─────────────────────────────────┐
                  │   Monitor Market in Downtrend   │
                  │         (Red Candles)           │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ Wait for Selling Climax (SC) /   │
                  │  Pink Candle (Standby to Buy)   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │   Wait for White Knight ⚪      │
                  │       (Entry Confirmation)      │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │           BUY ENTRY             │
                  │ (Stop-Loss under Pink Candle)    │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ Check MCDX: Are Bankers (Red)   │
                  │       Accumulating? (>50%)      │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ Take Profit on Yellow Candle 🟡  │
                  │     inside red Shark Zone       │
                  └─────────────────────────────────┘
```

### Step 1: Accumulation & Setup
* **Context**: Watch for an asset trading in a downtrend (Red candles below the Pillow midline).
* **Setup**: Wait for panic to peak, marked by a **Selling Climax (SC)** label or a **Pink Candle** (Standby Buy).
* **SOP Table Hint**: `⏳ SOP: Wait for WHITE`.

### Step 2: The Buy Trigger
* **Signal**: Buy immediately when a **White Candle** (White Knight) prints and closes.
* **Filter with MCDX**: Check the MCDX Smart Money indicator. Look for Banker (Red) bars crossing above Hot Money or Retailer bars, confirming institutional backing.
* **Stop-Loss (SL)**: Place your stop-loss just below the low of the Pink candle, the pivot low from the **ZigZag Wave**, or the lower band of the Pillow Support.

### Step 3: Riding the Trend
* **Management**: Keep holding as long as candles remain **Green** (uptrend) or **Blue** (strong breakout with volume).
* **MCDX Confirmation**: Bankers (Red) should ideally exceed $50\%$ on the dashboard, and the MCDX background should turn green.
* **Structure**: Use the **ZigZag Wave** to monitor if the price is making higher highs and higher lows.

### Step 4: The Exit (Take Profit)
* **Signal**: Take profit when the candle turns **Yellow** (Standby Sell) or a **Buying Climax (BC)** tag appears.
* **Supply Zone**: Be especially aggressive in taking profits if these bearish signals appear inside the red **Shark Zone (Tory Box)** ribbon.
* **SOP Table Hint**: `💰 SOP: Book profits`.

---

## ✍️ Authors & License
* **52-Week High, Pink Candle & ZigZag** are developed and maintained in this repository.
* **MCDX Smart Money** is a Pine Script v6 recreation of the MCDX formula originally conceptualized by *Mango2Juice* and *kgiap123* on TradingView.
* Subject to the **Mozilla Public License 2.0**.
