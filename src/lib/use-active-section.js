import { useEffect, useState } from "react";

export function useActiveSection(sections, requestedSection) {
  const [active, setActive] = useState(requestedSection || sections[0]?.id);
  useEffect(() => {
    let frame;
    const headings = sections.map(({ id }) => document.getElementById(`section-${id}`));
    const update = () => {
      frame = null;
      const root = document.documentElement;
      const atBottom = root.scrollHeight > root.clientHeight &&
        window.scrollY + root.clientHeight >= root.scrollHeight - 2;
      let current = sections[0]?.id;
      headings.forEach((heading, index) => {
        if (!heading) return;
        const offset = parseFloat(getComputedStyle(heading).scrollMarginTop) || 96;
        if (heading.getBoundingClientRect().top <= offset + 1) current = sections[index].id;
      });
      setActive(atBottom ? sections.at(-1)?.id : current);
    };
    const schedule = () => { if (frame == null) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections, requestedSection]);
  return active;
}
