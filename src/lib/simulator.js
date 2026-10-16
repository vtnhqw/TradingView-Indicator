export const SYMBOLS = {
  BTC: {
    name: "BTC/USDT",
    class: "Crypto",
    basePrice: 95200.0,
    step: 0.5,
    decimal: 2,
    unit: "BTC",
    defaultSpread: 1.0,
    normalVol: 1.5,
    multiplier: 1,
  },
  AAPL: {
    name: "AAPL (Apple Inc.)",
    class: "Stock",
    basePrice: 182.5,
    step: 0.02,
    decimal: 2,
    unit: "Shares",
    defaultSpread: 0.04,
    normalVol: 450,
    multiplier: 100,
  },
  EURUSD: {
    name: "EUR/USD",
    class: "Forex",
    basePrice: 1.0854,
    step: 0.00005,
    decimal: 5,
    unit: "Lots",
    defaultSpread: 0.0001,
    normalVol: 12,
    multiplier: 1,
  },
};

export const SCENARIOS = {
  normal: [
    "Normal market",
    "Balanced buying and selling with small fluctuations.",
  ],
  bid_wall: [
    "Bid wall",
    "Watch a large buy order absorb selling near support.",
  ],
  ask_wall: [
    "Ask wall",
    "Watch a large sell order absorb buying near resistance.",
  ],
  breakout: [
    "Breakout",
    "Buying consumes the ask wall and price moves higher.",
  ],
  breakdown: [
    "Breakdown",
    "Selling consumes the bid wall and price moves lower.",
  ],
  spoofing: [
    "Spoofing",
    "A large displayed order disappears before execution.",
  ],
  iceberg: [
    "Iceberg order",
    "Small visible orders replenish as hidden size is filled.",
  ],
  liquidity_sweep: [
    "Liquidity sweep",
    "Price moves through support, then reverses.",
  ],
};

export function createSimulator() {
  let currentSymbol = "BTC";
  let midPrice = SYMBOLS.BTC.basePrice;
  let lastPrice = midPrice;
  let activeScenario = "normal";
  let stepIndex = 0;
  let asks = [],
    bids = [],
    lastAsks = [],
    lastBids = [];
  let wallPrice = null,
    wallSize = 0,
    wallSide = null;
  let logs = [],
    logId = 0;
  function logMessage(text, type = "info") {
    logs = [
      ...logs.slice(-49),
      { id: ++logId, text, type, time: new Date().toLocaleTimeString() },
    ];
  }
  function initBook() {
    const sym = SYMBOLS[currentSymbol];
    asks = [];
    bids = [];
    wallPrice = null;
    wallSide = null;
    wallSize = 0;

    const spread = sym.defaultSpread;
    const startAsk = midPrice + spread / 2;
    const startBid = midPrice - spread / 2;

    for (let i = 0; i < 5; i++) {
      asks.push({
        price: startAsk + i * sym.step,
        size: getRandomNormalSize(),
        cumulative: 0,
        isWall: false,
      });

      bids.push({
        price: startBid - i * sym.step,
        size: getRandomNormalSize(),
        cumulative: 0,
        isWall: false,
      });
    }

    // Sort and compute
    calculateCumulative();
  }

  function getRandomNormalSize() {
    const sym = SYMBOLS[currentSymbol];
    const base = sym.normalVol;
    // Generate right variation
    const variation = Math.random() * 0.9 + 0.1;
    let size = base * variation;

    if (currentSymbol === "BTC") {
      return Number(size.toFixed(2));
    } else if (currentSymbol === "EURUSD") {
      return Number(size.toFixed(1));
    } else {
      return Math.floor(size);
    }
  }

  function calculateCumulative() {
    let cumAsk = 0;
    for (let i = 0; i < asks.length; i++) {
      cumAsk += asks[i].size;
      asks[i].cumulative = Number(cumAsk.toFixed(2));
    }

    let cumBid = 0;
    for (let i = 0; i < bids.length; i++) {
      cumBid += bids[i].size;
      bids[i].cumulative = Number(cumBid.toFixed(2));
    }
  }

  function tick() {
    // Save last states for flash compare
    lastAsks = asks.map((a) => ({ ...a }));
    lastBids = bids.map((b) => ({ ...b }));
    lastPrice = midPrice;

    const sym = SYMBOLS[currentSymbol];

    if (activeScenario === "normal") {
      // Balanced price drift
      const rand = Math.random();
      if (rand < 0.25) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
      } else if (rand < 0.5) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
      }

      // Update normal books
      fluctuateBookSizes();
    } else {
      // Run Scenario Sequence
      runScenarioStep();
    }

    realignBookPrices();
    calculateCumulative();
  }

  function realignBookPrices() {
    const sym = SYMBOLS[currentSymbol];
    const spread = sym.defaultSpread;
    const startAsk = midPrice + spread / 2;
    const startBid = midPrice - spread / 2;

    // Realign ask prices
    asks.forEach((a, i) => {
      a.price = Number((startAsk + i * sym.step).toFixed(sym.decimal));

      // Check if wall exists at this price
      if (
        wallPrice !== null &&
        Math.abs(a.price - wallPrice) < 0.000001 &&
        wallSide === "ask"
      ) {
        a.isWall = true;
        a.size = wallSize;
      } else {
        a.isWall = false;
        // If it was just converted back from a wall, give it a normal size
        if (a.size > sym.normalVol * 3) {
          a.size = getRandomNormalSize();
        }
      }
    });

    // Realign bid prices
    bids.forEach((b, i) => {
      b.price = Number((startBid - i * sym.step).toFixed(sym.decimal));

      // Check if wall exists at this price
      if (
        wallPrice !== null &&
        Math.abs(b.price - wallPrice) < 0.000001 &&
        wallSide === "bid"
      ) {
        b.isWall = true;
        b.size = wallSize;
      } else {
        b.isWall = false;
        // Reset if it was a wall before
        if (b.size > sym.normalVol * 3) {
          b.size = getRandomNormalSize();
        }
      }
    });
  }

  function fluctuateBookSizes() {
    const sym = SYMBOLS[currentSymbol];
    const decimals =
      currentSymbol === "BTC" ? 2 : currentSymbol === "EURUSD" ? 1 : 0;

    asks.forEach((a) => {
      if (!a.isWall) {
        const change = (Math.random() - 0.5) * 0.15; // +/- 7.5%
        a.size = Number(
          Math.max(sym.normalVol * 0.15, a.size + a.size * change).toFixed(
            decimals,
          ),
        );
      }
    });

    bids.forEach((b) => {
      if (!b.isWall) {
        const change = (Math.random() - 0.5) * 0.15;
        b.size = Number(
          Math.max(sym.normalVol * 0.15, b.size + b.size * change).toFixed(
            decimals,
          ),
        );
      }
    });
  }

  function getScenarioWallSize() {
    const sym = SYMBOLS[currentSymbol];
    if (currentSymbol === "BTC") return 125.5;
    if (currentSymbol === "AAPL") return 35000;
    if (currentSymbol === "EURUSD") return 1500;
  }

  function runScenarioStep() {
    const sym = SYMBOLS[currentSymbol];
    stepIndex++;

    switch (activeScenario) {
      case "bid_wall": // Buy Support Wall
        if (stepIndex === 1) {
          // Initialize Wall
          wallPrice = Number(
            (midPrice - sym.defaultSpread / 2 - 3 * sym.step).toFixed(
              sym.decimal,
            ),
          );
          wallSide = "bid";
          wallSize = getScenarioWallSize();
          logMessage(
            "🧱 SUPPORT WALL PLACED: Institutional buy order of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " detected at $" +
              wallPrice.toFixed(sym.decimal) +
              ". This creates a price floor.",
            "bullish",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          logMessage(
            "📉 Market selling pressure ticks price down to $" +
              midPrice.toFixed(sym.decimal) +
              ", sliding closer to the support wall.",
            "info",
          );
        } else if (stepIndex === 3) {
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          logMessage(
            "📉 Price ticks down to $" +
              midPrice.toFixed(sym.decimal) +
              ". The buy wall is now only one step away!",
            "info",
          );
        } else if (stepIndex === 4) {
          // Wall is tested
          wallSize = Number(
            (wallSize * 0.94).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "🛡️ WALL DEFENDED: Sellers hit the wall at $" +
              wallPrice.toFixed(sym.decimal) +
              ". Big buyers are absorbing all market sells. Wall size drops slightly.",
            "bullish",
          );
        } else if (stepIndex === 5) {
          // Rebound
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          wallSize = Number(
            (wallSize * 0.98).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "🚀 REBOUND: Selling force is exhausted at the wall. Buyers step in aggressively, pushing price up to $" +
              midPrice.toFixed(sym.decimal) +
              ".",
            "bullish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "📈 Upward trajectory continues. The support floor successfully prevented a price drop.",
            "bullish",
          );
          // Clear wall
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "ask_wall": // Sell Resistance Wall
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice + sym.defaultSpread / 2 + 3 * sym.step).toFixed(
              sym.decimal,
            ),
          );
          wallSide = "ask";
          wallSize = getScenarioWallSize();
          logMessage(
            "🧱 RESISTANCE WALL PLACED: Institutional sell order of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " detected at $" +
              wallPrice.toFixed(sym.decimal) +
              ". This creates a price ceiling.",
            "bearish",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "📈 Buying volume pushes price up to $" +
              midPrice.toFixed(sym.decimal) +
              ", heading towards the sell wall.",
            "info",
          );
        } else if (stepIndex === 3) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "📈 Price rises to $" +
              midPrice.toFixed(sym.decimal) +
              ". The sell wall is now only one tick away!",
            "info",
          );
        } else if (stepIndex === 4) {
          // Wall is tested
          wallSize = Number(
            (wallSize * 0.94).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "🛑 CEILING HIT: Buyers test the sell wall at $" +
              wallPrice.toFixed(sym.decimal) +
              ". Supply absorbs all buying volume. Wall size declines.",
            "bearish",
          );
        } else if (stepIndex === 5) {
          // Rejection
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          wallSize = Number(
            (wallSize * 0.98).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "📉 REJECTION: Buyers fail to crack the wall. Sellers regain control, forcing price down to $" +
              midPrice.toFixed(sym.decimal) +
              ".",
            "bearish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          logMessage(
            "📉 Rejection completed. The sell wall effectively capped the market.",
            "bearish",
          );
          // Clear wall
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "breakout": // Ask Wall Eaten & Surge
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice + sym.defaultSpread / 2 + 2 * sym.step).toFixed(
              sym.decimal,
            ),
          );
          wallSide = "ask";
          wallSize = Number(
            (getScenarioWallSize() * 0.6).toFixed(
              currentSymbol === "AAPL" ? 0 : 2,
            ),
          );
          logMessage(
            "🧱 RESISTANCE BLOCKED: A medium-large sell wall of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " is standing at $" +
              wallPrice.toFixed(sym.decimal) +
              ".",
            "info",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          wallSize = Number(
            (wallSize * 0.5).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚔️ ABSORPTION: Buyers hit the resistance wall at $" +
              wallPrice.toFixed(sym.decimal) +
              ". Market buy orders eat 50% of the wall! Remaining: " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              ".",
            "info",
          );
        } else if (stepIndex === 3) {
          wallSize = Number(
            (wallSize * 0.2).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚔️ CHEWING DEPTH: Buying pressure continues. Wall is thinned down to " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              ". Sellers are capitulating.",
            "info",
          );
        } else if (stepIndex === 4) {
          // Eat the rest
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "🔥 WALL CLEARED: The resistance wall at $" +
              midPrice.toFixed(sym.decimal) +
              " has been completely consumed by buyers. Supply is exhausted!",
            "bullish",
          );
        } else if (stepIndex === 5) {
          // Surge
          midPrice = Number((midPrice + sym.step * 3).toFixed(sym.decimal));
          // Stack bids
          bids[0].size = Number(
            (sym.normalVol * 4.5).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚡ BREAKOUT RALLY: Price surges violently to $" +
              midPrice.toFixed(sym.decimal) +
              "! Short-sellers cover in panic (market buys) and FOMO traders jump in.",
            "bullish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "🚀 MOMENTUM: Breakout extends to $" +
              midPrice.toFixed(sym.decimal) +
              ". Heavy buying size is now stacking on the bid side as a new floor.",
            "bullish",
          );
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "breakdown": // Bid Wall Cleared & Crash
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice - sym.defaultSpread / 2 - 2 * sym.step).toFixed(
              sym.decimal,
            ),
          );
          wallSide = "bid";
          wallSize = Number(
            (getScenarioWallSize() * 0.6).toFixed(
              currentSymbol === "AAPL" ? 0 : 2,
            ),
          );
          logMessage(
            "🧱 SUPPORT ZONE: A support wall of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " is holding the bid side at $" +
              wallPrice.toFixed(sym.decimal) +
              ".",
            "info",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          wallSize = Number(
            (wallSize * 0.5).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚔️ ABSORPTION: Sellers hit the support wall at $" +
              wallPrice.toFixed(sym.decimal) +
              ". Heavy selling volume consumes 50% of the buy orders. Remaining: " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              ".",
            "info",
          );
        } else if (stepIndex === 3) {
          wallSize = Number(
            (wallSize * 0.2).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚔️ FLOODING CHEATSHEET: Selling volume increases. Support is thin: only " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " left on the floor.",
            "info",
          );
        } else if (stepIndex === 4) {
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          logMessage(
            "🔥 WALL CRACKED: The support floor at $" +
              midPrice.toFixed(sym.decimal) +
              " has been completely cleared. Buyers are wiped out!",
            "bearish",
          );
        } else if (stepIndex === 5) {
          // Panic Drop
          midPrice = Number((midPrice - sym.step * 3).toFixed(sym.decimal));
          // Stack asks
          asks[0].size = Number(
            (sym.normalVol * 4.5).toFixed(currentSymbol === "AAPL" ? 0 : 2),
          );
          logMessage(
            "⚡ PANIC BREAKDOWN: Price plummets to $" +
              midPrice.toFixed(sym.decimal) +
              "! Stop-losses are triggered, causing a waterfall of market sells.",
            "bearish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice - sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "📉 SELL-OFF: Panic extends price down to $" +
              midPrice.toFixed(sym.decimal) +
              ". Asks stack heavily as traders rush to exit.",
            "bearish",
          );
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "spoofing": // Spoofing (Fake Wall vanishes)
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice + sym.defaultSpread / 2 + 3 * sym.step).toFixed(
              sym.decimal,
            ),
          );
          wallSide = "ask";
          wallSize = Number(
            (getScenarioWallSize() * 1.5).toFixed(
              currentSymbol === "AAPL" ? 0 : 2,
            ),
          ); // Massive spoof wall
          logMessage(
            "⚠️ SPOOF WALL PLACED: A massive sell order of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " appears at $" +
              wallPrice.toFixed(sym.decimal) +
              ", blocking the upside.",
            "warning",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "📈 Price rises to $" +
              midPrice.toFixed(sym.decimal) +
              ". Buyers are slowly stepping up, attempting to test the wall.",
            "info",
          );
        } else if (stepIndex === 3) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "🔍 Price ticks up to $" +
              midPrice.toFixed(sym.decimal) +
              ". Only one step away from the massive wall! Watch if they execute.",
            "warning",
          );
        } else if (stepIndex === 4) {
          // SPOOF! Wall disappears
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          logMessage(
            "💨 SPOOF ALARM: The massive wall at $" +
              (midPrice + sym.defaultSpread / 2 + sym.step).toFixed(
                sym.decimal,
              ) +
              " has VANISHED! The order was canceled right before execution. It was a bluff.",
            "warning",
          );
        } else if (stepIndex === 5) {
          // Easy breakout
          midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "⚡ EASY SURGE: With the fake resistance barrier removed, price easily surges up to $" +
              midPrice.toFixed(sym.decimal) +
              " due to lack of supply.",
            "bullish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "ℹ️ Spoofing occurs when manipulators place huge orders to influence retail behavior (e.g. force them to sell), then pull the order.",
            "system",
          );
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "iceberg": // Hidden Institutional Iceberg Order
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice - sym.defaultSpread / 2 - sym.step).toFixed(sym.decimal),
          );
          wallSide = "bid";
          wallSize = Number(
            (getScenarioWallSize() * 0.08).toFixed(
              currentSymbol === "AAPL" ? 0 : 2,
            ),
          );
          logMessage(
            "🧊 ICEBERG ORDER DETECTED: A small visible bid of " +
              wallSize.toLocaleString() +
              " " +
              sym.unit +
              " appears at $" +
              wallPrice.toFixed(sym.decimal) +
              ". Hidden depth reload suspected.",
            "info",
          );
        } else if (stepIndex === 2) {
          logMessage(
            "⚡ ABSORPTION: Sellers hit the bid with market sell orders, but the order immediately replenishes at $" +
              wallPrice.toFixed(sym.decimal) +
              "!",
            "bullish",
          );
        } else if (stepIndex === 3) {
          logMessage(
            "🛡️ RELOAD CONFIRMED: Sellers dump another tranche. The iceberg bid absorbs all supply without budging.",
            "bullish",
          );
        } else if (stepIndex === 4) {
          logMessage(
            "💎 ACCUMULATION COMPLETE: Over " +
              getScenarioWallSize().toLocaleString() +
              " " +
              sym.unit +
              " absorbed quietly. Supply has dried up.",
            "bullish",
          );
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
        } else if (stepIndex === 5) {
          midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "🚀 ROCKET MOVE: With overhead supply cleared by the iceberg, price surges up to $" +
              midPrice.toFixed(sym.decimal) +
              ".",
            "bullish",
          );
        } else if (stepIndex === 6) {
          midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
          logMessage(
            "ℹ️ Iceberg orders split large institutional positions into small visible chunks to avoid moving the market during accumulation.",
            "system",
          );
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      case "liquidity_sweep": // Stop Hunt / Liquidity Sweep
        if (stepIndex === 1) {
          wallPrice = Number(
            (midPrice - sym.defaultSpread / 2 - sym.step).toFixed(sym.decimal),
          );
          wallSide = "bid";
          wallSize = Number(
            (getScenarioWallSize() * 0.35).toFixed(
              currentSymbol === "AAPL" ? 0 : 2,
            ),
          );
          logMessage(
            "🎯 KEY SUPPORT TESTED: Price approaches key support at $" +
              wallPrice.toFixed(sym.decimal) +
              " where retail stop-losses are clustered.",
            "warning",
          );
        } else if (stepIndex === 2) {
          midPrice = Number((wallPrice - sym.step).toFixed(sym.decimal));
          wallPrice = null;
          wallSide = null;
          wallSize = 0;
          logMessage(
            "⚠️ BREAKDOWN BREACH: Price pierces support down to $" +
              midPrice.toFixed(sym.decimal) +
              ", triggering a cascade of retail stop-loss market sells.",
            "bearish",
          );
        } else if (stepIndex === 3) {
          midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
          logMessage(
            "🌪️ LIQUIDITY SWEEP: Extreme panic selling as stops trigger. Smart money steps in to absorb the panic liquidity.",
            "warning",
          );
        } else if (stepIndex === 4) {
          midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "⚡ V-SHAPED REVERSAL: Aggressive institutional market buys snap price right back above the broken support level!",
            "bullish",
          );
        } else if (stepIndex === 5) {
          midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
          logMessage(
            "🚀 SHORT SQUEEZE: Trapped breakout sellers are forced to cover their positions, catapulting price to $" +
              midPrice.toFixed(sym.decimal) +
              ".",
            "bullish",
          );
        } else if (stepIndex === 6) {
          logMessage(
            "ℹ️ Liquidity sweeps flush retail stop-loss liquidity into waiting institutional limit orders before resuming the true trend.",
            "system",
          );
          activeScenario = "normal";

          stepIndex = 0;
        }
        break;

      default:
        activeScenario = "normal";
        stepIndex = 0;
    }
  }

  function selectScenario(value) {
    if (!Object.hasOwn(SCENARIOS, value)) throw new Error("Unknown scenario");
    activeScenario = value;
    stepIndex = 0;
    wallPrice = null;
    wallSide = null;
    wallSize = 0;
    realignBookPrices();
    calculateCumulative();
    logMessage("Scenario: " + SCENARIOS[value][0], "system");
  }
  function reset() {
    midPrice = SYMBOLS[currentSymbol].basePrice;
    lastPrice = midPrice;
    activeScenario = "normal";
    stepIndex = 0;
    lastAsks = [];
    lastBids = [];
    initBook();
    logMessage("Order book reset to baseline.", "system");
  }
  function changeSymbol(value) {
    if (!Object.hasOwn(SYMBOLS, value)) throw new Error("Unknown symbol");
    currentSymbol = value;
    reset();
    logMessage(
      "Loaded " + SYMBOLS[value].name + ". Sample data only.",
      "system",
    );
  }
  function snapshot() {
    return {
      symbol: currentSymbol,
      scenario: activeScenario,
      midPrice,
      lastPrice,
      asks: asks.map((level) => ({ ...level })),
      bids: bids.map((level) => ({ ...level })),
      logs: logs.map((log) => ({ ...log })),
      step: stepIndex,
    };
  }
  initBook();
  logMessage(
    "Level II simulation ready. All prices and events are simulated.",
    "system",
  );
  return { snapshot, tick, selectScenario, changeSymbol, reset };
}
