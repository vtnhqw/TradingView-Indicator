import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Layers,
  Bell,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketChart } from "./market-chart";
import { IndicatorArt } from "./indicator-art";
import { lessons } from "@/content/lessons";
import { indicators } from "@/lib/indicators";

export function Overview({ theme }) {
  return (
    <div className="space-y-12 py-10 sm:py-14">
      <section className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
        <div className="py-3">
          <Badge
            variant="outline"
            className="mb-6 gap-2 rounded-full px-3 py-1 font-normal"
          >
            <span className="size-1.5 rounded-full bg-blue-500" />
            Open source. Built for clarity.
          </Badge>
          <h1 className="text-4xl leading-[1.12] font-semibold tracking-[-.045em] sm:text-5xl xl:text-6xl">
            A clearer view
            <br />
            of every move<span className="text-blue-500">.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Less noise. More understanding. Explore thoughtful TradingView
            indicators and learn how markets work, one interaction at a time.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#indicators">
                Explore indicators
                <ArrowRight />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#learn">
                <BookOpen />
                Explore lessons
              </a>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              Readable source
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              Pine Script v6
            </span>
          </div>
        </div>
        <MarketChart theme={theme} />
      </section>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
        {[
          [Code2, "03", "Open-source indicators"],
          [Bell, "07", "Available alert conditions"],
          [Layers, "07", "Moving-average layers"],
          [
            BookOpen,
            String(lessons.length).padStart(2, "0"),
            "Learning resources",
          ],
        ].map(([Icon, number, label]) => (
          <div key={label} className="bg-card px-5 py-5 sm:px-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-2xl tracking-tight">
                {number}
              </span>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">A focused toolkit</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Find the context you’re missing.
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="#indicators">
              View all indicators
              <ArrowRight />
            </a>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {indicators.map((item) => (
            <Card
              key={item.key}
              className="gap-0 overflow-hidden py-0 shadow-xs"
            >
              <IndicatorArt kind={item.key} compact />
              <CardHeader className="pt-5">
                <p className="eyebrow">{item.label}</p>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="leading-6">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 pb-5">
                <Button variant="link" className="h-auto p-0" asChild>
                  <a href="#indicators" aria-label={`Explore ${item.title}`}>
                    Explore indicator
                    <ArrowUpRight />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="grid gap-6 rounded-xl border bg-muted/30 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="size-4 text-blue-500" />
            <p className="eyebrow">Learn by doing</p>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Go beyond the chart.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Watch liquidity form, walls get tested, and spreads change. Build
            your understanding in a hands-on order book simulation.
          </p>
        </div>
        <Button asChild>
          <a href="#learn/order-book">
            Enter the Order Book Lab
            <ArrowRight />
          </a>
        </Button>
      </section>
    </div>
  );
}
