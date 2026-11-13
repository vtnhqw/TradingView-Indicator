import { useCallback, useLayoutEffect, useRef, useState } from "react";

const aliases = { home: "overview", note: "learn/order-book", lab: "learn/order-book" };
function routeFromHash(hash) {
  const route = hash.slice(1);
  if (Object.hasOwn(aliases, route)) return aliases[route];
  return /^(overview|indicators|learn)(\/|$)/.test(route) ? route : "overview";
}

function readEntry() {
  const saved = history.state?.terminalNavigation;
  if (saved?.href === location.href && typeof saved.key === "string") {
    try {
      const latest = JSON.parse(sessionStorage.getItem("terminal-scroll"));
      if (latest?.key === saved.key && latest.href === saved.href && Number.isFinite(latest.position)) return latest;
    } catch { /* History state still works when browser storage is unavailable. */ }
    return saved;
  }
  return { key: crypto.randomUUID(), href: location.href, position: null };
}

function saveEntry(entry) {
  history.replaceState({ ...history.state, terminalNavigation: entry }, "");
}

function saveLatest(entry, position) {
  try {
    sessionStorage.setItem("terminal-scroll", JSON.stringify({ ...entry, position }));
  } catch { /* Storage restrictions must not break navigation. */ }
}

export function usePageNavigation() {
  const [navigation, setNavigation] = useState(() => {
    const entry = readEntry();
    return { entry, route: routeFromHash(location.hash), restore: entry.position, focus: false };
  });
  const current = useRef(navigation);
  const positions = useRef(new Map());
  const ready = useRef(false);

  const persist = useCallback(() => {
    const { entry } = current.current;
    if (!ready.current || entry.href !== location.href) return;
    positions.current.set(entry.key, window.scrollY);
    saveLatest(entry, window.scrollY);
    saveEntry({ ...entry, position: window.scrollY });
  }, []);

  const navigate = useCallback((hash, { replace = false, preserveScroll = false } = {}) => {
    persist();
    const href = new URL(hash, location.href).href;
    const entry = { key: crypto.randomUUID(), href, position: preserveScroll ? window.scrollY : null };
    const next = {
      entry, route: routeFromHash(hash), restore: entry.position,
      focus: !preserveScroll && !!document.getElementById("main")?.contains(document.activeElement),
    };
    history[replace ? "replaceState" : "pushState"]({ ...history.state, terminalNavigation: entry }, "", href);
    ready.current = false;
    current.current = next;
    setNavigation(next);
  }, [persist]);

  const complete = useCallback((key) => {
    if (current.current.entry.key !== key) return;
    ready.current = true;
  }, []);

  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    saveEntry(current.current.entry);
    let timer;
    const onScroll = () => {
      if (!ready.current || current.current.entry.href !== location.href) return;
      positions.current.set(current.current.entry.key, window.scrollY);
      saveLatest(current.current.entry, window.scrollY);
      if (!timer) {
        persist();
        timer = setTimeout(() => { timer = null; persist(); }, 150);
      }
    };
    const changed = () => {
      const entry = readEntry();
      if (entry.key === current.current.entry.key && entry.href === current.current.entry.href) return;
      // popstate can arrive before the outgoing page's final scroll event.
      if (ready.current) positions.current.set(current.current.entry.key, window.scrollY);
      clearTimeout(timer);
      timer = null;
      const next = {
        entry, route: routeFromHash(location.hash),
        restore: positions.current.get(entry.key) ?? entry.position, focus: false,
      };
      ready.current = false;
      current.current = next;
      saveEntry(entry);
      setNavigation(next);
    };
    const clicked = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !/^#(overview|home|indicators|learn|lab|note)(\/|$)/.test(url.hash)) return;
      event.preventDefault();
      navigate(url.hash);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", changed);
    window.addEventListener("hashchange", changed);
    window.addEventListener("pagehide", persist);
    document.addEventListener("click", clicked);
    return () => {
      persist();
      clearTimeout(timer);
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", changed);
      window.removeEventListener("hashchange", changed);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("click", clicked);
    };
  }, [navigate, persist]);

  return { navigation, navigate, complete };
}

// Mount inside Suspense so lazy content has its final height before restoring.
export function useRouteEffects(navigation, complete, title, sectionId) {
  useLayoutEffect(() => {
    document.title = `${title} | Terminal`;
    const section = sectionId ? document.getElementById(`section-${sectionId}`) : null;
    if (Number.isFinite(navigation.restore)) {
      window.scrollTo({ top: navigation.restore, behavior: "instant" });
    } else if (section) {
      section.scrollIntoView({ behavior: "instant", block: "start" });
      section.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (navigation.focus) {
        const heading = document.querySelector("main h1");
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      }
    }
    complete(navigation.entry.key);
  }, [navigation, complete, title, sectionId]);
}
