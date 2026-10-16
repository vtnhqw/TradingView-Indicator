import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
  Maximize2,
  FlaskConical,
  Info,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createSimulator, SYMBOLS, SCENARIOS } from "@/lib/simulator";

function Picker({ label, value, onChange, options }) {
  return (
    <div className="min-w-0 space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DepthTable({ state }) {
  const sym = SYMBOLS[state.symbol];
  const spread = state.asks[0].price - state.bids[0].price;
  const max = Math.max(
    ...state.asks.map((level) => level.size),
    ...state.bids.map((level) => level.size),
    sym.normalVol * 2,
  );
  const size = (value) =>
    state.symbol === "AAPL"
      ? value.toLocaleString()
      : value.toFixed(state.symbol === "BTC" ? 2 : 1);
  function rows(levels, side) {
    return levels.map((level) => (
      <TableRow
        key={level.price}
        style={{
          background: `linear-gradient(to left, ${side === "ask" ? "rgb(244 63 94 / .09)" : "rgb(16 185 129 / .09)"} ${(level.size / max) * 100}%, transparent 0)`,
        }}
      >
        <TableCell
          className={`pl-5 font-mono tabular-nums ${side === "ask" ? "ask-text" : "bid-text"}`}
        >
          {level.price.toFixed(sym.decimal)}
          <span className="sr-only"> {side}</span>
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {size(level.size)}
          {level.isWall && (
            <span className="ml-2 rounded border px-1 font-sans text-[10px]">
              Wall
            </span>
          )}
        </TableCell>
        <TableCell className="pr-5 text-right font-mono text-muted-foreground tabular-nums">
          {size(level.cumulative)}
        </TableCell>
      </TableRow>
    ));
  }
  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">{sym.name}</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Level II · 5 levels per side
          </CardDescription>
        </div>
        <Badge variant="outline">{sym.class}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table aria-label="Simulated order book">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="pl-5">
                Price (USD{state.symbol === "BTC" ? "T" : ""})
              </TableHead>
              <TableHead className="text-right">Size ({sym.unit})</TableHead>
              <TableHead className="pr-5 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows([...state.asks].reverse(), "ask")}
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell colSpan={3} className="px-5 py-4">
                <div
                  className={`flex items-center gap-2 text-xl font-semibold ${state.midPrice > state.lastPrice ? "bid-text" : state.midPrice < state.lastPrice ? "ask-text" : ""}`}
                >
                  <span
                    data-testid="mid-price"
                    className="font-mono tabular-nums"
                  >
                    {state.midPrice.toFixed(sym.decimal)}
                  </span>
                  {state.midPrice > state.lastPrice ? (
                    <ArrowUp className="size-4" />
                  ) : state.midPrice < state.lastPrice ? (
                    <ArrowDown className="size-4" />
                  ) : (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Spread {spread.toFixed(sym.decimal)} ·{" "}
                  {((spread / state.midPrice) * 100).toFixed(4)}%
                </p>
              </TableCell>
            </TableRow>
            {rows(state.bids, "bid")}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex justify-between border-t px-5 py-3 text-xs">
        <span className="bid-text">● Bids / buyers</span>
        <span className="ask-text">● Asks / sellers</span>
      </div>
    </Card>
  );
}

export function OrderBookLab({ standalone = false, inLibrary = false }) {
  const engine = useRef(null);
  if (!engine.current) engine.current = createSimulator();
  const [state, setState] = useState(() => engine.current.snapshot());
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState("750");
  const [maximized, setMaximized] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  useEffect(() => {
    if (paused || !visible) return;
    const id = setInterval(() => {
      engine.current.tick();
      setState(engine.current.snapshot());
    }, Number(speed));
    return () => clearInterval(id);
  }, [paused, speed, visible]);
  function run(method, value) {
    engine.current[method](value);
    setState(engine.current.snapshot());
  }
  function scenario(value, resume = false) {
    run("selectScenario", value);
    if (resume) setPaused(false);
  }
  const simulator = (
    <div className="space-y-5">
      <Card className="py-5">
        <CardContent className="grid items-end gap-4 px-5 sm:grid-cols-3 lg:grid-cols-[1fr_1.4fr_1fr_auto]">
          <Picker
            label="Asset"
            value={state.symbol}
            onChange={(value) => run("changeSymbol", value)}
            options={Object.entries(SYMBOLS).map(([key, symbol]) => [
              key,
              symbol.name,
            ])}
          />
          <Picker
            label="Scenario"
            value={state.scenario}
            onChange={scenario}
            options={Object.entries(SCENARIOS).map(([key, [name]]) => [
              key,
              name,
            ])}
          />
          <Picker
            label="Update speed"
            value={speed}
            onChange={setSpeed}
            options={[
              ["1500", "Slow · 1.5s"],
              ["750", "Normal · 0.75s"],
              ["300", "Fast · 0.3s"],
            ]}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume simulation" : "Pause simulation"}
            >
              {paused ? <Play /> : <Pause />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Reset book"
              onClick={() => run("reset")}
            >
              <RotateCcw />
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <DepthTable state={state} />
        <div className="space-y-5">
          <Card className="gap-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">What’s happening</CardTitle>
                <Badge variant="secondary">
                  {state.step > 0 ? `Step ${state.step} / 6` : "Observe"}
                </Badge>
              </div>
              <CardDescription>{SCENARIOS[state.scenario][1]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`size-2 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500"}`}
                />
                {paused ? "Simulation paused" : "Simulation running"}
                <span className="ml-auto">Sample data only</span>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Event log</CardTitle>
              <CardDescription className="text-xs">
                Follow each step of the simulated market.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="h-72 space-y-3 overflow-y-auto rounded-md border bg-muted/25 p-3"
                role="region"
                aria-label="Simulation event log"
                tabIndex={0}
              >
                {[...state.logs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className="border-b pb-3 text-xs leading-5 last:border-0"
                  >
                    <span className="mb-1 block font-mono text-[10px] text-muted-foreground">
                      {log.time}
                    </span>
                    <p
                      className={
                        log.type === "bullish"
                          ? "bid-text"
                          : log.type === "bearish"
                            ? "ask-text"
                            : log.type === "warning"
                              ? "text-amber-700 dark:text-amber-400"
                              : ""
                      }
                    >
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Signals to watch
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a scenario to see it unfold in the book.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(SCENARIOS)
            .filter(([key]) => key !== "normal")
            .map(([key, [title, description]], index) => (
              <Button
                key={key}
                variant="outline"
                className={`h-auto min-h-32 flex-col items-start justify-start gap-3 px-4 py-4 text-left whitespace-normal ${state.scenario === key ? "border-primary bg-accent" : ""}`}
                aria-pressed={state.scenario === key}
                aria-label={`Run ${title} scenario`}
                onClick={() => scenario(key, true)}
              >
                <span className="flex w-full items-center justify-between text-sm">
                  <span>{title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    0{index + 1}
                  </span>
                </span>
                <span className="text-xs leading-5 font-normal text-muted-foreground">
                  {description}
                </span>
              </Button>
            ))}
        </div>
      </section>
    </div>
  );
  return (
    <div className={inLibrary ? "space-y-7 pb-8" : "space-y-7 py-10 sm:py-12"}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Market mechanics / Interactive lesson</p>
          <h1 className="page-title">Order Book Lab</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            See liquidity in motion. Explore the relationship between buyers,
            sellers, and price through an interactive Level II order book.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <FlaskConical className="size-3" />
          Interactive simulation
        </Badge>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0" />
          All prices, orders, and events below are simulated.
        </div>
        <div className="flex gap-1">
          <Dialog open={maximized} onOpenChange={setMaximized}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Maximize2 />
                Maximize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[94dvh] w-[96vw] max-w-[96vw] overflow-y-auto sm:max-w-[1400px]">
              <DialogHeader>
                <DialogTitle>Order Book Lab</DialogTitle>
                <DialogDescription>
                  Interactive simulation · Sample data only
                </DialogDescription>
              </DialogHeader>
              {maximized && simulator}
            </DialogContent>
          </Dialog>
          {!standalone && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`${import.meta.env.BASE_URL}note/level2_orderbook_cheatsheet.html`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
                <ArrowUpRight />
              </a>
            </Button>
          )}
        </div>
      </div>
      {!maximized && simulator}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4" />
            Reading the order book
          </CardTitle>
          <CardDescription>
            A few concepts to keep in mind while you explore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {[
              [
                "Bids, asks, and the spread",
                "Bids are resting buy orders; asks are resting sell orders. The spread is the difference between the best ask and best bid. Market orders consume the available liquidity on the opposite side.",
              ],
              [
                "Size and cumulative depth",
                "Size is the quantity offered at a price level. Total accumulates quantity outward from the best price. Larger displayed depth can absorb more orders, but orders may be canceled and hidden liquidity is not fully visible.",
              ],
              [
                "Walls, absorption, and breakouts",
                "A wall is a large displayed order. It can absorb incoming orders, be consumed, or disappear. Watch how size changes as price approaches instead of assuming that a wall guarantees support or resistance.",
              ],
              [
                "What this simulation can and cannot show",
                "These scripted scenarios illustrate concepts with sample prices. They do not predict actual price movement, identify real market participants, or account for every venue, latency, fee, or order type. Use them for education, not trading decisions.",
              ],
            ].map(([title, description]) => (
              <AccordionItem key={title} value={title}>
                <AccordionTrigger>{title}</AccordionTrigger>
                <AccordionContent className="max-w-3xl text-muted-foreground">
                  {description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
