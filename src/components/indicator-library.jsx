import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Code2, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { indicators } from "@/lib/indicators";
import { IndicatorArt } from "./indicator-art";

export function CopyButton({ indicator, onFailure }) {
  const [state, setState] = useState("idle");
  const pending = useRef(false);
  const alive = useRef(true);
  const timer = useRef();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  async function copy() {
    if (pending.current) return;
    pending.current = true;
    setState("loading");
    try {
      await navigator.clipboard.writeText(indicator.source);
      if (!alive.current) return;
      setState("copied");
      toast.success("Source copied", {
        description: `${indicator.title} is ready to paste into Pine Editor.`,
      });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 2000);
    } catch {
      if (!alive.current) return;
      setState("idle");
      onFailure(indicator);
    } finally {
      pending.current = false;
    }
  }
  return (
    <Button
      className="min-w-32"
      onClick={copy}
      aria-busy={state === "loading"}
      aria-disabled={state === "loading"}
      aria-label={
        state === "copied"
          ? `Source copied for ${indicator.title}`
          : `Copy source for ${indicator.title}`
      }
    >
      {state === "copied" ? <Check /> : <Copy />}
      {state === "loading"
        ? "Copying…"
        : state === "copied"
          ? "Copied"
          : "Copy source"}
    </Button>
  );
}

export function IndicatorLibrary() {
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [manual, setManual] = useState(false);
  const [expanded, setExpanded] = useState("");
  const trigger = useRef(null);
  const source = useRef(null);
  const filtered = indicators.filter(
    (item) => filter === "all" || item.type === filter,
  );
  function openDetails(indicator, fallback = false) {
    trigger.current = document.activeElement;
    setDetail(indicator);
    setManual(fallback);
    setExpanded(fallback ? "source" : "");
  }
  useEffect(() => {
    if (manual && detail) {
      source.current?.focus();
      source.current?.select();
    }
  }, [manual, detail]);
  return (
    <div className="space-y-8 py-10 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">The indicator library</p>
          <h1 className="page-title">A little more perspective.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Open-source tools for understanding price, trends, and momentum.
            Explore the logic, then make it part of your chart.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Code2 className="size-3" />
          Pine Script v6
        </Badge>
      </header>
      <Tabs value={filter} onValueChange={setFilter} className="gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
          <TabsList aria-label="Filter indicators">
            <TabsTrigger value="all">All indicators</TabsTrigger>
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="pane">Separate pane</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground" role="status">
            {filtered.length}{" "}
            {filtered.length === 1 ? "indicator" : "indicators"}
          </span>
        </div>
        <TabsContent value={filter}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((indicator) => (
              <Card
                key={indicator.key}
                className="gap-0 overflow-hidden py-0 shadow-xs"
              >
                <IndicatorArt kind={indicator.key} />
                <CardHeader className="gap-3 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">{indicator.label}</span>
                    <Badge variant="secondary">
                      {indicator.type === "overlay"
                        ? "Overlay"
                        : "Separate pane"}
                    </Badge>
                  </div>
                  <CardTitle>
                    <h2 className="text-xl tracking-tight">
                      {indicator.title}
                    </h2>
                  </CardTitle>
                  <CardDescription className="min-h-20 leading-6">
                    {indicator.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-5 pb-6">
                  {indicator.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
                <CardFooter className="mt-auto flex-wrap justify-between gap-2 border-t bg-muted/20 px-6 py-4">
                  <Button
                    variant="outline"
                    aria-label={`Details for ${indicator.title}`}
                    onClick={() => openDetails(indicator)}
                  >
                    View details
                  </Button>
                  <CopyButton
                    indicator={indicator}
                    onFailure={(item) => openDetails(item, true)}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <Alert className="bg-muted/30">
        <Info />
        <AlertDescription>
          Indicators provide chart context, not trading advice. MCDX labels
          describe RSI-derived momentum proxies, not measured institutional
          order flow.
        </AlertDescription>
      </Alert>
      <section className="rounded-xl border">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">From source to chart</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four steps to your next chart setup.
          </p>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Copy the source", "Choose an indicator and select Copy source."],
            [
              "Open Pine Editor",
              "Open a TradingView chart and find Pine Editor.",
            ],
            [
              "Paste and save",
              "Replace the template with the full source and save.",
            ],
            [
              "Add to chart",
              "Adjust the inputs and configure the alerts you need.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <div className="mb-4 flex size-8 items-center justify-center rounded-full border bg-muted/50 font-mono text-xs">
                0{i + 1}
              </div>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) {
            setDetail(null);
            setManual(false);
          }
        }}
      >
        {detail && (
          <DialogContent
            className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
          >
            <DialogHeader>
              <Badge variant="secondary" className="mb-2 w-fit">
                {detail.label}
              </Badge>
              <DialogTitle className="text-2xl">{detail.title}</DialogTitle>
              <DialogDescription>{detail.details.sub}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              {detail.details.items.map(([title, text]) => (
                <div key={title} className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-medium">{title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
            {manual && (
              <Alert>
                <Info />
                <AlertDescription>
                  Automatic copying is unavailable. Select the source below and
                  copy it manually.
                </AlertDescription>
              </Alert>
            )}
            <Accordion
              type="single"
              collapsible
              value={expanded}
              onValueChange={setExpanded}
            >
              <AccordionItem value="source">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Code2 className="size-4" />
                    Pine Script source
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Textarea
                    ref={source}
                    aria-label="Pine Script source"
                    readOnly
                    value={detail.source}
                    className="h-64 resize-none font-mono text-xs"
                    spellCheck={false}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      source.current.focus();
                      source.current.select();
                    }}
                  >
                    Select all source
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter>
              <Button variant="outline" asChild>
                <a
                  href={`${import.meta.env.BASE_URL}indicators/${detail.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open source file
                  <ArrowUpRight />
                </a>
              </Button>
              <CopyButton
                key={detail.key}
                indicator={detail}
                onFailure={() => {
                  setManual(true);
                  setExpanded("source");
                }}
              />
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
