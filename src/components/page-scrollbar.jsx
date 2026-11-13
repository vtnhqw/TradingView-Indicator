import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function PageScrollbar() {
  const [metrics, setMetrics] = useState({ viewport: 0, height: 0, top: 0 });
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const timer = useRef();
  const drag = useRef(null);
  const reveal = useCallback(() => {
    setActive(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), 900);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const measure = () => setMetrics({
      viewport: root.clientHeight,
      height: root.scrollHeight,
      top: window.scrollY,
    });
    const onScroll = () => { measure(); reveal(); };
    root.classList.add("has-page-scrollbar");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      root.classList.remove("has-page-scrollbar");
      observer.disconnect();
      clearTimeout(timer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [reveal]);

  const max = Math.max(0, metrics.height - metrics.viewport);
  if (!max || !metrics.viewport) return null;
  const trackHeight = Math.max(0, metrics.viewport - 8);
  const thumbHeight = Math.min(trackHeight, Math.max(32, trackHeight * metrics.viewport / metrics.height));
  const travel = trackHeight - thumbHeight;
  const progress = Math.min(1, Math.max(0, metrics.top / max));
  const scrollTo = (top) => {
    window.scrollTo({ top: Math.min(max, Math.max(0, top)), behavior: "instant" });
    reveal();
  };

  return (
    <div
      className="page-scrollbar"
      role="scrollbar"
      aria-label="Scroll page"
      aria-controls="page-content"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      data-active={active || dragging}
      onPointerDown={(event) => {
        if (event.pointerType === "touch" || event.button !== 0 || !travel) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const onThumb = event.target !== event.currentTarget;
        const nextTop = onThumb ? metrics.top :
          (event.clientY - event.currentTarget.getBoundingClientRect().top - thumbHeight / 2) / travel * max;
        drag.current = { y: event.clientY, top: Math.min(max, Math.max(0, nextTop)) };
        setDragging(true);
        scrollTo(nextTop);
      }}
      onPointerMove={(event) => {
        if (drag.current && travel) scrollTo(drag.current.top + (event.clientY - drag.current.y) / travel * max);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        drag.current = null;
        setDragging(false);
        reveal();
      }}
      onPointerCancel={() => { drag.current = null; setDragging(false); }}
      onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
      onKeyDown={(event) => {
        const destinations = {
          ArrowDown: metrics.top + 40, ArrowUp: metrics.top - 40,
          PageDown: metrics.top + metrics.viewport * 0.9,
          PageUp: metrics.top - metrics.viewport * 0.9,
          Home: 0, End: max,
        };
        if (Object.hasOwn(destinations, event.key)) {
          event.preventDefault();
          scrollTo(destinations[event.key]);
        }
      }}
    >
      <div className="page-scrollbar-thumb" style={{ height: thumbHeight, transform: `translateY(${progress * travel}px)` }} />
    </div>
  );
}
