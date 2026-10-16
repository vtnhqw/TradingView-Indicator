import test from "node:test";
import assert from "node:assert/strict";
import { createSimulator, SYMBOLS, SCENARIOS } from "../src/lib/simulator.js";

test("every asset has five ordered levels and correct cumulative depth", () => {
  for (const symbol of Object.keys(SYMBOLS)) {
    const engine = createSimulator();
    engine.changeSymbol(symbol);
    const state = engine.snapshot();
    assert.equal(state.symbol, symbol);
    assert.equal(state.midPrice, SYMBOLS[symbol].basePrice);
    for (const side of ["asks", "bids"]) {
      assert.equal(state[side].length, 5);
      let total = 0;
      state[side].forEach((level) => {
        total += level.size;
        assert.ok(Math.abs(level.cumulative - total) < 0.011);
      });
    }
    assert.ok(state.asks[0].price > state.bids[0].price);
  }
});

test("all seven scripted scenarios complete and return to normal", () => {
  assert.equal(Object.keys(SCENARIOS).length, 8);
  for (const symbol of Object.keys(SYMBOLS)) {
    for (const scenario of Object.keys(SCENARIOS).filter(
      (key) => key !== "normal",
    )) {
      const engine = createSimulator();
      engine.changeSymbol(symbol);
      engine.selectScenario(scenario);
      for (let i = 0; i < 6; i++) engine.tick();
      const state = engine.snapshot();
      assert.equal(state.scenario, "normal", `${symbol}: ${scenario}`);
      assert.ok(state.logs.length >= 6);
      assert.ok(Number.isFinite(state.midPrice));
      assert.ok(state.asks[0].price > state.bids[0].price);
    }
  }
});

test("switching scenario clears walls immediately, reset restores baseline, snapshots are isolated", () => {
  const engine = createSimulator();
  engine.selectScenario("bid_wall");
  engine.tick();
  assert.ok(engine.snapshot().bids.some((level) => level.isWall));
  engine.selectScenario("normal");
  assert.ok(engine.snapshot().bids.every((level) => !level.isWall));
  engine.tick();
  engine.reset();
  assert.equal(engine.snapshot().midPrice, SYMBOLS.BTC.basePrice);
  const state = engine.snapshot();
  state.bids[0].size = -100;
  assert.ok(engine.snapshot().bids[0].size >= 0);
});

test("invalid symbols and scenarios are rejected without corrupting state", () => {
  const engine = createSimulator();
  assert.throws(() => engine.changeSymbol("NOPE"));
  assert.throws(() => engine.selectScenario("NOPE"));
  assert.equal(engine.snapshot().symbol, "BTC");
});
