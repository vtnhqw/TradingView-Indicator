import { lazy, Suspense, useRef } from "react";
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
import { LazyOrderBookLab as OrderBookLab } from "@/components/lazy-order-book-lab";
import { getLesson } from "@/content/lessons";
import { PageBoundary } from "@/components/page-boundary";
import { PageScrollbar } from "@/components/page-scrollbar";
import { usePageNavigation, useRouteEffects } from "@/lib/page-navigation";

const IndicatorLibrary = lazy(() =>
  import("@/components/indicator-library").then((module) => ({
    default: module.IndicatorLibrary,
  })),
);
const LearnPage = lazy(() =>
  import("@/components/learn/learn-page").then((module) => ({
    default: module.LearnPage,
  })),
);
const routes = {
  overview: "Overview",
  indicators: "Indicators",
  learn: "Learn",
};
// Runs inside Suspense, after the destination content is ready to receive focus.
function RouteEffects({ navigation, complete, title, sectionId }) {
  useRouteEffects(navigation, complete, title, sectionId);
  return null;
}
export default function App() {
  const standalone = location.pathname.endsWith(
    "/note/level2_orderbook_cheatsheet.html",
  );
  const { navigation, navigate, complete } = usePageNavigation();
  const [activeRoute, lessonSlug, sectionId] = navigation.route.split("/");
  const lesson = activeRoute === "learn" ? getLesson(lessonSlug) : null;
  const labSession = useRef({});
  const { theme, toggleTheme } = useTheme();
  return (
    <TooltipProvider>
      <div id="page-content" className="flex min-h-dvh flex-col">
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
          <div
            className={`page-wrap flex min-h-16 flex-wrap items-center gap-x-8 gap-y-2 py-3 sm:py-0 ${standalone ? "" : "sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"}`}
          >
            <a
              href={standalone ? "../index.html" : "#overview"}
              className="flex items-center gap-2.5 font-semibold tracking-tight"
              aria-label="Terminal home"
            >
              <TerminalSquare aria-hidden="true" className="size-8 shrink-0" />
              <span>
                terminal<span className="text-muted-foreground">.</span>
              </span>
            </a>
            {!standalone && (
              <nav
                aria-label="Primary navigation"
                className="order-3 flex w-full justify-center gap-1 sm:order-none sm:w-auto"
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
                      className="flex-none"
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
            <div className="ml-auto flex items-center gap-2 sm:justify-self-end">
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
          <PageBoundary key={activeRoute === "learn" ? `${activeRoute}/${lessonSlug || ""}` : activeRoute}>
          <Suspense
            fallback={
              <p role="status" className="py-12 text-sm text-muted-foreground">
                Loading page…
              </p>
            }
          >
          {standalone ? (
            <OrderBookLab standalone session={labSession.current} />
          ) : activeRoute === "indicators" ? (
            <IndicatorLibrary indicatorKey={lessonSlug} navigate={navigate} />
          ) : activeRoute === "learn" ? (
            <LearnPage
              key={lessonSlug || "library"}
              session={labSession.current}
              slug={lessonSlug}
              section={sectionId}
            />
          ) : (
            <Overview theme={theme} />
          )}
            <RouteEffects
              navigation={navigation}
              complete={complete}
              title={standalone ? "Order Book Lab" : lesson?.title || routes[activeRoute]}
              sectionId={activeRoute === "learn" ? sectionId : undefined}
            />
          </Suspense>
          </PageBoundary>
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
        <PageScrollbar />
      </div>
    </TooltipProvider>
  );
}
