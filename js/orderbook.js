// Symbol Parameters Config
const SYMBOLS = {
  BTC: { 
    name: "BTC/USDT", 
    class: "Crypto",
    basePrice: 95200.00, 
    step: 0.50, 
    decimal: 2, 
    unit: "BTC", 
    defaultSpread: 1.00, 
    normalVol: 1.5,
    multiplier: 1 
  },
  AAPL: { 
    name: "AAPL (Apple Inc.)", 
    class: "Stock",
    basePrice: 182.50, 
    step: 0.02, 
    decimal: 2, 
    unit: "Shares", 
    defaultSpread: 0.04, 
    normalVol: 450,
    multiplier: 100 
  },
  EURUSD: { 
    name: "EUR/USD", 
    class: "Forex",
    basePrice: 1.08540, 
    step: 0.00005, 
    decimal: 5, 
    unit: "Lots", 
    defaultSpread: 0.00010, 
    normalVol: 12,
    multiplier: 1
  }
};

// State Variables
let currentSymbol = "BTC";
let midPrice = SYMBOLS.BTC.basePrice;
let activeScenario = "normal";
let stepIndex = 0;
let isPaused = false;
let updateIntervalMs = 750;
let timerId = null;
let hostVisible = true;

function saveTheme(value) {
  try { localStorage.setItem("signal-theme", value); } catch {}
}
function notifyHost(data) {
  if (window.parent !== window) {
    window.parent.postMessage(data, location.origin === 'null' ? '*' : location.origin);
  }
}

// Book Arrays
let asks = [];
let bids = [];
let lastAsks = [];
let lastBids = [];
let lastPrice = midPrice;

// Wall State
let wallPrice = null;
let wallSize = 0;
let wallSide = null; // 'bid' or 'ask'

// Initialize Book on page load
function initOrderBook() {
  checkThemePreference();
  initBook();
  logMessage("SYSTEM: Level II Simulator Initialized. Loaded asset: BTC/USDT.", "system");
  logMessage("TIPS: Click on any 'Signal to Watch' card to view its live animated simulation.", "info");
  startTimer();
  document.querySelectorAll('.signal-row').forEach(row => {
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.setAttribute('aria-pressed', 'false');
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        row.click();
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener("click", function(event) {
    document.querySelectorAll(".custom-select").forEach(select => {
      if (!select.contains(event.target)) {
        select.classList.remove("active");
        const trigger = select.querySelector(".select-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initOrderBook);
} else {
  initOrderBook();
}

// Keyboard Accessibility for Custom Dropdowns
document.addEventListener("keydown", function(event) {
  if (event.key === 'Escape') {
    const openPicker = document.querySelector('.custom-select.active');
    if (!openPicker) notifyHost({ type: 'studio-escape' });
  }
  const activeEl = document.activeElement;
  if (!activeEl || !activeEl.classList.contains("select-trigger")) return;

  const container = activeEl.parentElement;
  const isOpen = container.classList.contains("active");

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activeEl.click();
  } else if (event.key === "Escape" && isOpen) {
    event.preventDefault();
    container.classList.remove("active");
    activeEl.setAttribute("aria-expanded", "false");
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!isOpen) {
      container.classList.add("active");
      activeEl.setAttribute("aria-expanded", "true");
      return;
    }

    const options = Array.from(container.querySelectorAll(".select-option"));
    const selectedIdx = options.findIndex(opt => opt.classList.contains("selected"));
    let nextIdx = selectedIdx;

    if (event.key === "ArrowDown") {
      nextIdx = (selectedIdx + 1) % options.length;
    } else if (event.key === "ArrowUp") {
      nextIdx = (selectedIdx - 1 + options.length) % options.length;
    }

    options[nextIdx].click();
  }
});

// Custom Dropdowns Handlers
function toggleDropdown(containerId, event) {
  event.stopPropagation();
  const target = document.getElementById(containerId);
  const isActive = target.classList.contains("active");

  // Close all other dropdowns
  document.querySelectorAll(".custom-select").forEach(el => {
    el.classList.remove("active");
    const trigger = el.querySelector(".select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });

  if (!isActive) {
    target.classList.add("active");
    const trigger = target.querySelector(".select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }
}

function selectOption(containerId, value, text, callback) {
  updateCustomSelectValue(containerId, value, text);

  // Close dropdown
  const target = document.getElementById(containerId);
  if (target) {
    target.classList.remove("active");
    const trigger = target.querySelector(".select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  // Trigger original callback
  if (callback) {
    callback(value);
  }
}

function updateCustomSelectValue(containerId, value, text) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.tagName === 'SELECT') {
    container.value = value;
    return;
  }

  // Update trigger text
  const triggerText = container.querySelector(".trigger-text");
  if (triggerText) {
    triggerText.innerText = text;
  }

  // Update selected class and aria-selected on options
  const options = container.querySelectorAll(".select-option");
  options.forEach(opt => {
    if (opt.getAttribute("data-value") === value) {
      opt.classList.add("selected");
      opt.setAttribute("aria-selected", "true");
    } else {
      opt.classList.remove("selected");
      opt.setAttribute("aria-selected", "false");
    }
  });
}

// Theme Management
function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle("light-theme");
  const newTheme = isLight ? "light" : "dark";
  window.StudioTheme.apply(newTheme);
  saveTheme(newTheme);
  updateThemeButtonUI(isLight);
  logMessage(`SYSTEM: Switched to ${isLight ? 'Light' : 'Dark'} visual theme.`, "system");

  // Notify parent window if embedded in iframe
  try {
    if (window.parent && window.parent !== window) {
      notifyHost({ type: 'studio-theme', theme: newTheme });
    }
  } catch(e) {
    // Suppress cross-origin issues
  }
}

function updateThemeButtonUI(isLight) {
  const btn = document.getElementById("theme-toggle-btn");
  const sunIcon = btn.querySelector(".sun-icon");
  const moonIcon = btn.querySelector(".moon-icon");
  const text = btn.querySelector(".toggle-text");

  if (isLight) {
    sunIcon.style.display = "none";
    moonIcon.style.display = "inline-block";
    text.innerText = "Dark Mode";
  } else {
    sunIcon.style.display = "inline-block";
    moonIcon.style.display = "none";
    text.innerText = "Light Mode";
  }
}

function checkThemePreference() {
  const isLight = document.documentElement.dataset.theme === "light";
  if (isLight) {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
  updateThemeButtonUI(isLight);
}

// Listen for theme toggle messages from parent window
window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== location.origin) return;
  if (event.data?.type === 'studio-visibility') {
    hostVisible = event.data.visible === true;
    if (hostVisible && !isPaused) startTimer();
    else stopTimer();
  }
  if (event.data?.type === 'studio-theme' && ['light', 'dark'].includes(event.data.theme)) {
    window.StudioTheme.apply(event.data.theme);
    const isLight = event.data.theme === 'light';
    if (isLight) {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    if (event.data.persist === true) saveTheme(event.data.theme);
    updateThemeButtonUI(isLight);
  }
});

// Generate initial levels
function initBook() {
  const sym = SYMBOLS[currentSymbol];
  asks = [];
  bids = [];
  wallPrice = null;
  wallSide = null;
  wallSize = 0;

  const spread = sym.defaultSpread;
  const startAsk = midPrice + (spread / 2);
  const startBid = midPrice - (spread / 2);

  for (let i = 0; i < 5; i++) {
    asks.push({
      price: startAsk + i * sym.step,
      size: getRandomNormalSize(),
      cumulative: 0,
      isWall: false
    });

    bids.push({
      price: startBid - i * sym.step,
      size: getRandomNormalSize(),
      cumulative: 0,
      isWall: false
    });
  }

  // Sort and compute
  calculateCumulative();
  renderOrderBook();
}

// Helper size generator
function getRandomNormalSize() {
  const sym = SYMBOLS[currentSymbol];
  const base = sym.normalVol;
  // Generate right variation
  const variation = (Math.random() * 0.9) + 0.1;
  let size = base * variation;

  if (currentSymbol === "BTC") {
    return Number(size.toFixed(2));
  } else if (currentSymbol === "EURUSD") {
    return Number(size.toFixed(1));
  } else {
    return Math.floor(size);
  }
}

// Calculate Cumulative Depth
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

// Master Timer Functions
function startTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  if (isPaused || !hostVisible) return;
  timerId = setInterval(tick, updateIntervalMs);
}

// Stop Timer
function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function togglePlayPause() {
  const btn = document.getElementById("play-btn");
  const indicator = document.getElementById("live-indicator");
  const indicatorText = document.getElementById("live-indicator-text");

  isPaused = !isPaused;
  if (isPaused) {
    stopTimer();
    btn.innerText = "Resume Simulator";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary");
    indicator.classList.add("paused");
    indicatorText.innerText = "Simulator Paused";
    logMessage("SYSTEM: Simulation paused.", "system");
  } else {
    startTimer();
    btn.innerText = "Pause Simulator";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-primary");
    indicator.classList.remove("paused");
    indicatorText.innerText = "Simulator Live";
    logMessage("SYSTEM: Simulation resumed.", "system");
  }
}

function changeSpeed(val) {
  updateIntervalMs = parseInt(val);
  logMessage(`SYSTEM: Update speed set to ${val}ms.`, "system");
  if (!isPaused) {
    startTimer();
  }
}

function resetSimulator() {
  const sym = SYMBOLS[currentSymbol];
  midPrice = sym.basePrice;
  lastPrice = midPrice;
  activeScenario = "normal";
  stepIndex = 0;
  lastAsks = [];
  lastBids = [];

  updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
  updateActiveSignalHighlight();
  initBook();
  logMessage("SYSTEM: Order book completely reset to baseline parameters.", "system");
}

// Ticks Handler
function tick() {
  // Save last states for flash compare
  lastAsks = asks.map(a => ({...a}));
  lastBids = bids.map(b => ({...b}));
  lastPrice = midPrice;

  const sym = SYMBOLS[currentSymbol];

  if (activeScenario === "normal") {
    // Balanced price drift
    const rand = Math.random();
    if (rand < 0.25) {
      midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
    } else if (rand < 0.50) {
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
  renderOrderBook();
}

// Re-align order book levels around current midPrice
function realignBookPrices() {
  const sym = SYMBOLS[currentSymbol];
  const spread = sym.defaultSpread;
  const startAsk = midPrice + (spread / 2);
  const startBid = midPrice - (spread / 2);

  // Realign ask prices
  asks.forEach((a, i) => {
    a.price = Number((startAsk + i * sym.step).toFixed(sym.decimal));

    // Check if wall exists at this price
    if (wallPrice !== null && Math.abs(a.price - wallPrice) < 0.000001 && wallSide === 'ask') {
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
    if (wallPrice !== null && Math.abs(b.price - wallPrice) < 0.000001 && wallSide === 'bid') {
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

// Size fluctuation generator
function fluctuateBookSizes() {
  const sym = SYMBOLS[currentSymbol];
  const decimals = currentSymbol === "BTC" ? 2 : (currentSymbol === "EURUSD" ? 1 : 0);

  asks.forEach(a => {
    if (!a.isWall) {
      const change = (Math.random() - 0.5) * 0.15; // +/- 7.5%
      a.size = Number(Math.max(sym.normalVol * 0.15, a.size + a.size * change).toFixed(decimals));
    }
  });

  bids.forEach(b => {
    if (!b.isWall) {
      const change = (Math.random() - 0.5) * 0.15;
      b.size = Number(Math.max(sym.normalVol * 0.15, b.size + b.size * change).toFixed(decimals));
    }
  });
}

// Generate wall size depending on Symbol
function getScenarioWallSize() {
  const sym = SYMBOLS[currentSymbol];
  if (currentSymbol === "BTC") return 125.50;
  if (currentSymbol === "AAPL") return 35000;
  if (currentSymbol === "EURUSD") return 1500;
}

// Trigger from UI Select Option
function selectScenario(val) {
  activeScenario = val;
  stepIndex = 0;
  wallPrice = null;
  wallSide = null;
  wallSize = 0;
  // Clear the previous scenario immediately, including while paused.
  realignBookPrices();
  calculateCumulative();
  renderOrderBook();
  updateActiveSignalHighlight();
  logMessage(`SYSTEM: Changed scenario mode to '${val.toUpperCase()}'.`, "system");
}

// Highlight active signal card
function updateActiveSignalHighlight() {
  // Clear all active highlights
  document.querySelectorAll(".signal-row").forEach(el => {
    el.classList.remove("active-signal");
    el.setAttribute('aria-pressed', 'false');
  });

  // Set active highlight if exists
  if (activeScenario !== "normal") {
    const activeEl = document.getElementById(`signal-${activeScenario}`);
    if (activeEl) {
      activeEl.classList.add("active-signal");
      activeEl.setAttribute('aria-pressed', 'true');
    }
  }
}

// Trigger from Signal Click (Bidirectional integration)
function triggerSignal(scenarioName) {
  if (isPaused) {
    togglePlayPause(); // Unpause automatically if paused
  }

  let scenarioText = "";
  switch(scenarioName) {
    case "normal": scenarioText = "Normal Market (Balanced)"; break;
    case "bid_wall": scenarioText = "Bid Wall (Support)"; break;
    case "ask_wall": scenarioText = "Ask Wall (Resistance)"; break;
    case "breakout": scenarioText = "Breakout (Ask Wall Eaten)"; break;
    case "breakdown": scenarioText = "Breakdown (Bid Wall Eaten)"; break;
    case "spoofing": scenarioText = "Spoofing (Fake Wall Canceled)"; break;
    case "iceberg": scenarioText = "Iceberg Order (Hidden Size)"; break;
    case "liquidity_sweep": scenarioText = "Liquidity Sweep (Stop Hunt)"; break;
  }

  updateCustomSelectValue("custom-select-scenario", scenarioName, scenarioText);
  selectScenario(scenarioName);
}

// Action log formatter
function logMessage(text, type = "info") {
  const consoleBox = document.getElementById("console-box");
  const d = new Date();
  const timeStr = d.toTimeString().split(' ')[0];

  const line = document.createElement("div");
  line.className = `console-line log-${type}`;
  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = `[${timeStr}]`;
  const msgSpan = document.createElement("span");
  msgSpan.textContent = text;
  line.append(timeSpan, " ", msgSpan);

  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;

  // Cap log lines
  while (consoleBox.children.length > 50) {
    consoleBox.removeChild(consoleBox.firstChild);
  }
}

// Dropdown symbol switcher
function changeSymbol(val) {
  currentSymbol = val;
  const sym = SYMBOLS[val];

  // Update labels
  document.getElementById("ob-symbol-name").innerHTML = `${sym.name} <span class="symbol-badge">${sym.class}</span>`;
  document.getElementById("ob-size-header").innerText = `Size (${sym.unit})`;
  document.getElementById("ob-total-header").innerText = `Total (${sym.unit})`;

  resetSimulator();
  logMessage(`SYSTEM: Switched symbol to ${sym.name}.`, "system");
}

// Render HTML structures
function renderOrderBook() {
  const tbody = document.getElementById("ob-tbody");
  const sym = SYMBOLS[currentSymbol];

  // Calculate max size for visual depth percentage bars
  const maxBookVal = Math.max(
    ...asks.map(a => a.size),
    ...bids.map(b => b.size),
    sym.normalVol * 2 // minimum baseline
  );

  let html = "";

  // 1. Asks (Render in reverse order so highest price is at top)
  for (let i = asks.length - 1; i >= 0; i--) {
    html += getRowMarkup('ask', asks[i], maxBookVal);
  }

  // 2. Mid Price Row
  const spread = (asks[0].price - bids[0].price);
  const spreadPercent = ((spread / midPrice) * 100).toFixed(2);

  let priceDirection = "→";
  let dirClass = "";
  let valClass = "";

  if (midPrice > lastPrice) {
    priceDirection = "▲";
    dirClass = "up";
    valClass = "up";
  } else if (midPrice < lastPrice) {
    priceDirection = "▼";
    dirClass = "down";
    valClass = "down";
  }

  html += `
    <tr class="mid-price-tr">
      <td colspan="3" class="mid-price-cell">
        <div class="mid-price-wrapper">
          <div class="mid-price-value ${valClass}" id="mid-price-val">
            ${midPrice.toFixed(sym.decimal)}
          </div>
          <div class="mid-price-dir ${dirClass}" id="mid-price-dir">
            ${priceDirection}
          </div>
        </div>
        <div class="spread-info" id="spread-val">
          Spread: $${spread.toFixed(sym.decimal)} (${spreadPercent}%)
        </div>
      </td>
    </tr>
  `;

  // 3. Bids (Render in index order: bids[0] is highest price, bids[4] is lowest)
  for (let i = 0; i < bids.length; i++) {
    html += getRowMarkup('bid', bids[i], maxBookVal);
  }

  tbody.innerHTML = html;

  // Update top header spread
  document.getElementById("top-spread-indicator").innerText = `Spread: $${spread.toFixed(sym.decimal)} (${spreadPercent}%)`;
}

// Row Markup generator
function getRowMarkup(type, level, maxBookVal) {
  const sym = SYMBOLS[currentSymbol];
  const decimals = sym.decimal;

  const percentage = Math.min((level.size / maxBookVal) * 100, 100).toFixed(0);
  const priceStr = level.price.toFixed(decimals);

  // Format size
  let sizeStr = "";
  let totalStr = "";
  if (currentSymbol === "AAPL") {
    sizeStr = level.size.toLocaleString();
    totalStr = level.cumulative.toLocaleString();
  } else if (currentSymbol === "EURUSD") {
    sizeStr = level.size.toFixed(1);
    totalStr = level.cumulative.toFixed(1);
  } else {
    sizeStr = level.size.toFixed(2);
    totalStr = level.cumulative.toFixed(2);
  }

  // Check for size flashes
  let sizeClass = "";
  const prevBook = type === 'ask' ? lastAsks : lastBids;
  const prevLevel = prevBook.find(l => Math.abs(l.price - level.price) < 0.000001);
  if (prevLevel) {
    if (level.size > prevLevel.size) {
      sizeClass = "flash-green-text";
    } else if (level.size < prevLevel.size) {
      sizeClass = "flash-red-text";
    }
  }

  const isWall = level.isWall;
  const wallClass = isWall ? `wall-row ${type}-wall` : '';
  const colorClass = type === 'ask' ? 'color-ask' : 'color-bid';
  const bgGradient = type === 'ask'
    ? `linear-gradient(to left, var(--color-ask-light) ${percentage}%, transparent ${percentage}%)`
    : `linear-gradient(to left, var(--color-bid-light) ${percentage}%, transparent ${percentage}%)`;

  return `
    <tr class="${wallClass}" style="background: ${bgGradient}">
      <td class="${colorClass}">${priceStr}</td>
      <td class="${sizeClass}">${sizeStr}${isWall ? ' 🧱' : ''}</td>
      <td style="color: var(--color-text-secondary);">${totalStr}</td>
    </tr>
  `;
}

// ==========================================
//     SCENARIOS STATE MACHINE
// ==========================================

function runScenarioStep() {
  const sym = SYMBOLS[currentSymbol];
  stepIndex++;

  switch (activeScenario) {

    case "bid_wall": // Buy Support Wall
      if (stepIndex === 1) {
        // Initialize Wall
        wallPrice = Number((midPrice - (sym.defaultSpread / 2) - 3 * sym.step).toFixed(sym.decimal));
        wallSide = "bid";
        wallSize = getScenarioWallSize();
        logMessage("🧱 SUPPORT WALL PLACED: Institutional buy order of " + wallSize.toLocaleString() + " " + sym.unit + " detected at $" + wallPrice.toFixed(sym.decimal) + ". This creates a price floor.", "bullish");
      } 
      else if (stepIndex === 2) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        logMessage("📉 Market selling pressure ticks price down to $" + midPrice.toFixed(sym.decimal) + ", sliding closer to the support wall.", "info");
      } 
      else if (stepIndex === 3) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        logMessage("📉 Price ticks down to $" + midPrice.toFixed(sym.decimal) + ". The buy wall is now only one step away!", "info");
      } 
      else if (stepIndex === 4) {
        // Wall is tested
        wallSize = Number((wallSize * 0.94).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🛡️ WALL DEFENDED: Sellers hit the wall at $" + wallPrice.toFixed(sym.decimal) + ". Big buyers are absorbing all market sells. Wall size drops slightly.", "bullish");
      } 
      else if (stepIndex === 5) {
        // Rebound
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        wallSize = Number((wallSize * 0.98).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🚀 REBOUND: Selling force is exhausted at the wall. Buyers step in aggressively, pushing price up to $" + midPrice.toFixed(sym.decimal) + ".", "bullish");
      } 
      else if (stepIndex === 6) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("📈 Upward trajectory continues. The support floor successfully prevented a price drop.", "bullish");
        // Clear wall
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

    case "ask_wall": // Sell Resistance Wall
      if (stepIndex === 1) {
        wallPrice = Number((midPrice + (sym.defaultSpread / 2) + 3 * sym.step).toFixed(sym.decimal));
        wallSide = "ask";
        wallSize = getScenarioWallSize();
        logMessage("🧱 RESISTANCE WALL PLACED: Institutional sell order of " + wallSize.toLocaleString() + " " + sym.unit + " detected at $" + wallPrice.toFixed(sym.decimal) + ". This creates a price ceiling.", "bearish");
      } 
      else if (stepIndex === 2) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("📈 Buying volume pushes price up to $" + midPrice.toFixed(sym.decimal) + ", heading towards the sell wall.", "info");
      } 
      else if (stepIndex === 3) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("📈 Price rises to $" + midPrice.toFixed(sym.decimal) + ". The sell wall is now only one tick away!", "info");
      } 
      else if (stepIndex === 4) {
        // Wall is tested
        wallSize = Number((wallSize * 0.94).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🛑 CEILING HIT: Buyers test the sell wall at $" + wallPrice.toFixed(sym.decimal) + ". Supply absorbs all buying volume. Wall size declines.", "bearish");
      } 
      else if (stepIndex === 5) {
        // Rejection
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        wallSize = Number((wallSize * 0.98).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("📉 REJECTION: Buyers fail to crack the wall. Sellers regain control, forcing price down to $" + midPrice.toFixed(sym.decimal) + ".", "bearish");
      } 
      else if (stepIndex === 6) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        logMessage("📉 Rejection completed. The sell wall effectively capped the market.", "bearish");
        // Clear wall
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

    case "breakout": // Ask Wall Eaten & Surge
      if (stepIndex === 1) {
        wallPrice = Number((midPrice + (sym.defaultSpread / 2) + 2 * sym.step).toFixed(sym.decimal));
        wallSide = "ask";
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.

        wallSide = "ask";
        wallSize = Number((getScenarioWallSize() * 0.6).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🧱 RESISTANCE BLOCKED: A medium-large sell wall of " + wallSize.toLocaleString() + " " + sym.unit + " is standing at $" + wallPrice.toFixed(sym.decimal) + ".", "info");
      } 
      else if (stepIndex === 2) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        wallSize = Number((wallSize * 0.5).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚔️ ABSORPTION: Buyers hit the resistance wall at $" + wallPrice.toFixed(sym.decimal) + ". Market buy orders eat 50% of the wall! Remaining: " + wallSize.toLocaleString() + " " + sym.unit + ".", "info");
      } 
      else if (stepIndex === 3) {
        wallSize = Number((wallSize * 0.2).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚔️ CHEWING DEPTH: Buying pressure continues. Wall is thinned down to " + wallSize.toLocaleString() + " " + sym.unit + ". Sellers are capitulating.", "info");
      } 
      else if (stepIndex === 4) {
        // Eat the rest
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("🔥 WALL CLEARED: The resistance wall at $" + midPrice.toFixed(sym.decimal) + " has been completely consumed by buyers. Supply is exhausted!", "bullish");
      } 
      else if (stepIndex === 5) {
        // Surge
        midPrice = Number((midPrice + sym.step * 3).toFixed(sym.decimal));
        // Stack bids
        bids[0].size = Number((sym.normalVol * 4.5).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚡ BREAKOUT RALLY: Price surges violently to $" + midPrice.toFixed(sym.decimal) + "! Short-sellers cover in panic (market buys) and FOMO traders jump in.", "bullish");
      } 
      else if (stepIndex === 6) {
        midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
        logMessage("🚀 MOMENTUM: Breakout extends to $" + midPrice.toFixed(sym.decimal) + ". Heavy buying size is now stacking on the bid side as a new floor.", "bullish");
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

    case "breakdown": // Bid Wall Cleared & Crash
      if (stepIndex === 1) {
        wallPrice = Number((midPrice - (sym.defaultSpread / 2) - 2 * sym.step).toFixed(sym.decimal));
        wallSide = "bid";
        wallSize = Number((getScenarioWallSize() * 0.6).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🧱 SUPPORT ZONE: A support wall of " + wallSize.toLocaleString() + " " + sym.unit + " is holding the bid side at $" + wallPrice.toFixed(sym.decimal) + ".", "info");
      } 
      else if (stepIndex === 2) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        wallSize = Number((wallSize * 0.5).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚔️ ABSORPTION: Sellers hit the support wall at $" + wallPrice.toFixed(sym.decimal) + ". Heavy selling volume consumes 50% of the buy orders. Remaining: " + wallSize.toLocaleString() + " " + sym.unit + ".", "info");
      } 
      else if (stepIndex === 3) {
        wallSize = Number((wallSize * 0.2).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚔️ FLOODING CHEATSHEET: Selling volume increases. Support is thin: only " + wallSize.toLocaleString() + " " + sym.unit + " left on the floor.", "info");
      } 
      else if (stepIndex === 4) {
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        logMessage("🔥 WALL CRACKED: The support floor at $" + midPrice.toFixed(sym.decimal) + " has been completely cleared. Buyers are wiped out!", "bearish");
      } 
      else if (stepIndex === 5) {
        // Panic Drop
        midPrice = Number((midPrice - sym.step * 3).toFixed(sym.decimal));
        // Stack asks
        asks[0].size = Number((sym.normalVol * 4.5).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("⚡ PANIC BREAKDOWN: Price plummets to $" + midPrice.toFixed(sym.decimal) + "! Stop-losses are triggered, causing a waterfall of market sells.", "bearish");
      } 
      else if (stepIndex === 6) {
        midPrice = Number((midPrice - sym.step * 2).toFixed(sym.decimal));
        logMessage("📉 SELL-OFF: Panic extends price down to $" + midPrice.toFixed(sym.decimal) + ". Asks stack heavily as traders rush to exit.", "bearish");
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

    case "spoofing": // Spoofing (Fake Wall vanishes)
      if (stepIndex === 1) {
        wallPrice = Number((midPrice + (sym.defaultSpread / 2) + 3 * sym.step).toFixed(sym.decimal));
        wallSide = "ask";
        wallSize = Number((getScenarioWallSize() * 1.5).toFixed(currentSymbol === "AAPL" ? 0 : 2)); // Massive spoof wall
        logMessage("⚠️ SPOOF WALL PLACED: A massive sell order of " + wallSize.toLocaleString() + " " + sym.unit + " appears at $" + wallPrice.toFixed(sym.decimal) + ", blocking the upside.", "warning");
      } 
      else if (stepIndex === 2) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("📈 Price rises to $" + midPrice.toFixed(sym.decimal) + ". Buyers are slowly stepping up, attempting to test the wall.", "info");
      } 
      else if (stepIndex === 3) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("🔍 Price ticks up to $" + midPrice.toFixed(sym.decimal) + ". Only one step away from the massive wall! Watch if they execute.", "warning");
      } 
      else if (stepIndex === 4) {
        // SPOOF! Wall disappears
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        logMessage("💨 SPOOF ALARM: The massive wall at $" + (midPrice + sym.defaultSpread/2 + sym.step).toFixed(sym.decimal) + " has VANISHED! The order was canceled right before execution. It was a bluff.", "warning");
      } 
      else if (stepIndex === 5) {
        // Easy breakout
        midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
        logMessage("⚡ EASY SURGE: With the fake resistance barrier removed, price easily surges up to $" + midPrice.toFixed(sym.decimal) + " due to lack of supply.", "bullish");
      } 
      else if (stepIndex === 6) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("ℹ️ Spoofing occurs when manipulators place huge orders to influence retail behavior (e.g. force them to sell), then pull the order.", "system");
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

        case "iceberg": // Hidden Institutional Iceberg Order
      if (stepIndex === 1) {
        wallPrice = Number((midPrice - (sym.defaultSpread / 2) - sym.step).toFixed(sym.decimal));
        wallSide = "bid";
        wallSize = Number((getScenarioWallSize() * 0.08).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🧊 ICEBERG ORDER DETECTED: A small visible bid of " + wallSize.toLocaleString() + " " + sym.unit + " appears at $" + wallPrice.toFixed(sym.decimal) + ". Hidden depth reload suspected.", "info");
      }
      else if (stepIndex === 2) {
        logMessage("⚡ ABSORPTION: Sellers hit the bid with market sell orders, but the order immediately replenishes at $" + wallPrice.toFixed(sym.decimal) + "!", "bullish");
      }
      else if (stepIndex === 3) {
        logMessage("🛡️ RELOAD CONFIRMED: Sellers dump another tranche. The iceberg bid absorbs all supply without budging.", "bullish");
      }
      else if (stepIndex === 4) {
        logMessage("💎 ACCUMULATION COMPLETE: Over " + getScenarioWallSize().toLocaleString() + " " + sym.unit + " absorbed quietly. Supply has dried up.", "bullish");
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
      }
      else if (stepIndex === 5) {
        midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
        logMessage("🚀 ROCKET MOVE: With overhead supply cleared by the iceberg, price surges up to $" + midPrice.toFixed(sym.decimal) + ".", "bullish");
      }
      else if (stepIndex === 6) {
        midPrice = Number((midPrice + sym.step).toFixed(sym.decimal));
        logMessage("ℹ️ Iceberg orders split large institutional positions into small visible chunks to avoid moving the market during accumulation.", "system");
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

    case "liquidity_sweep": // Stop Hunt / Liquidity Sweep
      if (stepIndex === 1) {
        wallPrice = Number((midPrice - (sym.defaultSpread / 2) - sym.step).toFixed(sym.decimal));
        wallSide = "bid";
        wallSize = Number((getScenarioWallSize() * 0.35).toFixed(currentSymbol === "AAPL" ? 0 : 2));
        logMessage("🎯 KEY SUPPORT TESTED: Price approaches key support at $" + wallPrice.toFixed(sym.decimal) + " where retail stop-losses are clustered.", "warning");
      }
      else if (stepIndex === 2) {
        midPrice = Number((wallPrice - sym.step).toFixed(sym.decimal));
        wallPrice = null;
        wallSide = null;
        wallSize = 0;
        logMessage("⚠️ BREAKDOWN BREACH: Price pierces support down to $" + midPrice.toFixed(sym.decimal) + ", triggering a cascade of retail stop-loss market sells.", "bearish");
      }
      else if (stepIndex === 3) {
        midPrice = Number((midPrice - sym.step).toFixed(sym.decimal));
        logMessage("🌪️ LIQUIDITY SWEEP: Extreme panic selling as stops trigger. Smart money steps in to absorb the panic liquidity.", "warning");
      }
      else if (stepIndex === 4) {
        midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
        logMessage("⚡ V-SHAPED REVERSAL: Aggressive institutional market buys snap price right back above the broken support level!", "bullish");
      }
      else if (stepIndex === 5) {
        midPrice = Number((midPrice + sym.step * 2).toFixed(sym.decimal));
        logMessage("🚀 SHORT SQUEEZE: Trapped breakout sellers are forced to cover their positions, catapulting price to $" + midPrice.toFixed(sym.decimal) + ".", "bullish");
      }
      else if (stepIndex === 6) {
        logMessage("ℹ️ Liquidity sweeps flush retail stop-loss liquidity into waiting institutional limit orders before resuming the true trend.", "system");
        activeScenario = "normal";
        updateCustomSelectValue("custom-select-scenario", "normal", "Normal Market (Balanced)");
        updateActiveSignalHighlight();
        stepIndex = 0;
      }
      break;

default:
      activeScenario = "normal";
      stepIndex = 0;
  }
}
