import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PageScrollbar } from "../src/components/page-scrollbar";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800);
  vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
});
afterEach(() => vi.useRealTimers());

it("shows during scrolling, follows the page, and hides after activity stops", () => {
  render(<PageScrollbar />);
  const bar = screen.getByRole("scrollbar");
  expect(bar).toHaveAttribute("data-active", "false");
  vi.spyOn(window, "scrollY", "get").mockReturnValue(800);
  fireEvent.scroll(window);
  expect(bar).toHaveAttribute("aria-valuenow", "50");
  expect(bar).toHaveAttribute("data-active", "true");
  act(() => vi.advanceTimersByTime(2000));
  expect(bar).toHaveAttribute("data-active", "false");
});

it("does not show a scrollbar for a page that fits in the viewport", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(800);
  render(<PageScrollbar />);
  expect(screen.queryByRole("scrollbar")).not.toBeInTheDocument();
});

it("supports keyboard scrolling to both ends", () => {
  render(<PageScrollbar />);
  const bar = screen.getByRole("scrollbar");
  fireEvent.keyDown(bar, { key: "End" });
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1600, behavior: "instant" });
  fireEvent.keyDown(bar, { key: "Home" });
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
});

it("restores the native scrollbar when unmounted", () => {
  const { unmount } = render(<PageScrollbar />);
  expect(document.documentElement).toHaveClass("has-page-scrollbar");
  unmount();
  expect(document.documentElement).not.toHaveClass("has-page-scrollbar");
});

it("drags the thumb proportionally and stops dragging on release", () => {
  render(<PageScrollbar />);
  const bar = screen.getByRole("scrollbar");
  fireEvent.pointerDown(bar.firstChild, { button: 0, pointerId: 1, clientY: 100 });
  fireEvent.pointerMove(bar, { pointerId: 1, clientY: 364 });
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: "instant" });
  fireEvent.pointerUp(bar, { pointerId: 1 });
  window.scrollTo.mockClear();
  fireEvent.pointerMove(bar, { pointerId: 1, clientY: 500 });
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it("removes the control when resized content no longer overflows", () => {
  render(<PageScrollbar />);
  expect(screen.getByRole("scrollbar")).toBeInTheDocument();
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(800);
  fireEvent(window, new Event("resize"));
  expect(screen.queryByRole("scrollbar")).not.toBeInTheDocument();
});

it("does not turn a touch swipe into a scrollbar jump", () => {
  render(<PageScrollbar />);
  const bar = screen.getByRole("scrollbar");
  window.scrollTo.mockClear();
  fireEvent.pointerDown(bar, { button: 0, pointerType: "touch", pointerId: 1, clientY: 300 });
  fireEvent.pointerMove(bar, { pointerType: "touch", pointerId: 1, clientY: 500 });
  expect(window.scrollTo).not.toHaveBeenCalled();
});
