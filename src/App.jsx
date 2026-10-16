import { useEffect, useRef, useState } from "react";
import brandIcon from "../assets/favicon.svg";
import {
  ArrowUpRight,
  BookOpen,
  GitFork,
  LayoutDashboard,
  Layers,
  Moon,
  Sun,
  TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/lib/use-theme";
import { Overview } from "@/components/overview";
import { IndicatorLibrary } from "@/components/indicator-library";
import { OrderBookLab } from "@/components/order-book-lab";
import { LearnPage } from "@/components/learn/learn-page";
import { getLesson } from "@/content/lessons";
const routes = {
  overview: "Overview",
  indicators: "Indicators",
  learn: "Learn",
};
function readRoute() {
  const hash = location.hash.slice(1);
  const aliases = {
    home: "overview",
    note: "learn/order-book",
    lab: "learn/order-book",
  };
  if (Object.hasOwn(aliases, hash)) return aliases[hash];
  return hash.startsWith("learn/") || Object.hasOwn(routes, hash)
    ? hash
    : "overview";
}
export default function App() {
  const standalone = location.pathname.endsWith(
    "/note/level2_orderbook_cheatsheet.html",
  );
  const [route, setRoute] = useState(readRoute);
  const [activeRoute, lessonSlug, sectionId] = route.split("/");
  const lesson = activeRoute === "learn" ? getLesson(lessonSlug) : null;
  const moveFocus = useRef(false);
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    const changed = () => {
      moveFocus.current = document
        .getElementById("main")
        ?.contains(document.activeElement);
      setRoute(readRoute());
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    document.title = `${standalone ? "Order Book Lab" : lesson?.title || routes[activeRoute]} — Terminal`;
    const section =
      activeRoute === "learn" && sectionId
        ? document.getElementById(`section-${sectionId}`)
        : null;
    if (section) {
      section.scrollIntoView({ behavior: "instant", block: "start" });
      section.focus({ preventScroll: true });
      moveFocus.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    if (moveFocus.current) {
      const heading = document.querySelector("main h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      moveFocus.current = false;
    }
  }, [route, standalone, activeRoute, lesson, sectionId]);
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("main").focus();
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
          <div className="page-wrap flex min-h-16 flex-wrap items-center gap-x-8 gap-y-2 py-3 sm:py-0">
            <a
              href={standalone ? "../index.html" : "#overview"}
              className="flex items-center gap-2.5 font-semibold tracking-tight"
              aria-label="Terminal home"
            >
              <img src={brandIcon} alt="" className="size-8 rounded-lg dark:invert" />
              <span>
                terminal<span className="text-muted-foreground">.</span>
              </span>
            </a>
            {!standalone && (
              <nav
                aria-label="Primary navigation"
                className="order-3 flex w-full gap-1 sm:order-none sm:w-auto"
              >
                {Object.entries(routes).map(([key, name]) => {
                  const Icon =
                    key === "overview"
                      ? LayoutDashboard
                      : key === "indicators"
                        ? Layers
                        : BookOpen;
                  return (
                    <Button
                      key={key}
                      variant={activeRoute === key ? "secondary" : "ghost"}
                      size="sm"
                      className="flex-1 sm:flex-none"
                      asChild
                    >
                      <a
                        href={`#${key}`}
                        aria-current={activeRoute === key ? "page" : undefined}
                      >
                        <Icon className="size-3.5" />
                        {name}
                      </a>
                    </Button>
                  );
                })}
              </nav>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Badge
                variant="outline"
                className="hidden text-[10px] font-normal lg:inline-flex"
              >
                Pine Script v6
              </Badge>
              <Separator
                orientation="vertical"
                className="mx-1 hidden h-5! sm:block"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    {theme === "dark" ? <Sun /> : <Moon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch appearance</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/vtnhqw/TradingView-Indicator"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View repository on GitHub"
                >
                  <GitFork />
                </a>
              </Button>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="page-wrap flex-1 outline-none">
          {standalone ? (
            <OrderBookLab standalone />
          ) : route === "indicators" ? (
            <IndicatorLibrary />
          ) : activeRoute === "learn" ? (
            <LearnPage
              key={lessonSlug || "library"}
              slug={lessonSlug}
              section={sectionId}
            />
          ) : (
            <Overview theme={theme} />
          )}
        </main>
        <footer className="mt-8 border-t">
          <div className="page-wrap flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <TerminalSquare className="size-4" />
              <span>Terminal · Open-source chart tools</span>
            </div>
            <span>For education and chart analysis. Not financial advice.</span>
            <a
              href="https://github.com/vtnhqw/TradingView-Indicator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 underline-offset-4 hover:underline"
            >
              View source
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </footer>
        <Toaster theme={theme} richColors closeButton />
      </div>
    </TooltipProvider>
  );
}
