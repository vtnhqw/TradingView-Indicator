import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RefreshCw, WifiOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mountMarketChart } from "@/lib/market";

export function MarketChart({ theme }) {
  const ref = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(
    () => mountMarketChart(ref.current, theme, setStatus),
    [theme, attempt],
  );
  useEffect(() => {
    const retry = () => setAttempt((value) => value + 1);
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border bg-muted font-semibold">
            A
          </div>
          <div>
            <h2 className="text-sm font-semibold">Apple Inc.</h2>
            <p className="text-xs text-muted-foreground">NASDAQ: AAPL</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span
            className={`size-1.5 rounded-full ${status === "error" ? "bg-amber-500" : status === "ready" ? "bg-emerald-500" : "bg-muted-foreground"}`}
          />
          {status === "loading"
            ? "Connecting"
            : status === "error"
              ? "Unavailable"
              : "Market chart"}
        </Badge>
      </div>
      <CardContent className="relative h-[350px] p-0 sm:h-[400px]">
        <div ref={ref} className="h-full w-full" hidden={status === "error"} />
        {status !== "ready" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card p-6 text-center"
            role="status"
          >
            {status === "error" ? (
              <WifiOff className="size-6 text-muted-foreground" />
            ) : (
              <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {status === "error"
                  ? "Market chart unavailable"
                  : "Connecting to the market"}
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {status === "error"
                  ? "Check your connection, retry, or view Apple directly on TradingView."
                  : "Loading Apple’s price chart from TradingView."}
              </p>
            </div>
            {status === "error" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAttempt((value) => value + 1)}
              >
                <RefreshCw />
                Try again
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
        <span>Data by TradingView · May be delayed</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reload market chart"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshCw />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://www.tradingview.com/symbols/NASDAQ-AAPL/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open AAPL
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
