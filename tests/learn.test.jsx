import React from "react";
import { it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

it("opens Learn as a library without mounting the order book", () => {
  window.location.hash = "#learn";
  render(<App />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Learn the market, one lesson at a time.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Read Darvas Box Strategy" }),
  ).toHaveAttribute("href", "#learn/darvas");
  expect(
    screen.getByRole("link", { name: "Open Order Book Lab" }),
  ).toHaveAttribute("href", "#learn/order-book");
  expect(
    screen.queryByRole("table", { name: "Simulated order book" }),
  ).not.toBeInTheDocument();
});
it("opens the Darvas documentation independently, with Learn active and working section links", async () => {
  window.location.hash = "#learn";
  render(<App />);
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("link", { name: "Read Darvas Box Strategy" }),
  );
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Darvas Box Strategy",
    }),
  ).toBeInTheDocument();
  expect(
    within(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).getByRole("link", { name: "Learn" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    screen.queryByRole("table", { name: "Simulated order book" }),
  ).not.toBeInTheDocument();
  await user.click(
    within(screen.getByRole("navigation", { name: "On this page" })).getByRole(
      "link",
      { name: "Worked example" },
    ),
  );
  await waitFor(() =>
    expect(window.location.hash).toBe("#learn/darvas/worked-example"),
  );
  expect(screen.getByRole("heading", { name: "Worked example" })).toHaveFocus();
});
it("supports direct section links and falls back safely for an unknown lesson", async () => {
  window.location.hash = "#learn/darvas/risk-and-exits";
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Darvas Box Strategy" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Risk and exits" })).toHaveFocus();
  window.location.hash = "#learn/missing-lesson";
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Lesson not found" }),
    ).toBeInTheDocument(),
  );
  expect(
    screen.getByRole("link", { name: "Browse all lessons" }),
  ).toHaveAttribute("href", "#learn");
});
it("navigates between independent lessons and releases the simulator timer", async () => {
  window.location.hash = "#learn/order-book";
  const intervals = vi.spyOn(window, "setInterval");
  const clear = vi.spyOn(window, "clearInterval");
  render(<App />);
  const timer = intervals.mock.results[0].value;
  const user = userEvent.setup();
  expect(
    screen.getByRole("heading", { name: "Order Book Lab" }),
  ).toBeInTheDocument();
  await user.click(
    within(screen.getByRole("navigation", { name: "Lessons" })).getByRole(
      "link",
      { name: "Darvas Box Strategy" },
    ),
  );
  expect(
    await screen.findByRole("heading", { name: "Darvas Box Strategy" }),
  ).toBeInTheDocument();
  expect(clear).toHaveBeenCalledWith(timer);
  await user.click(
    within(screen.getByRole("navigation", { name: "Lessons" })).getByRole(
      "link",
      { name: "All lessons" },
    ),
  );
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Learn the market, one lesson at a time.",
    }),
  ).toBeInTheDocument();
});

it("lets readers reveal diagram stages and the practice explanation", async () => {
  window.location.hash = "#learn/darvas";
  render(<App />);
  const user = userEvent.setup();
  expect(screen.queryByText("Initial stop $44.80")).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "2. Breakout" }));
  expect(screen.getByText("Initial stop $44.80")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "3. Higher box" }));
  expect(screen.getByText("New floor $52")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reveal explanation" }));
  expect(
    screen.getByText(/You must wait for the required subsequent observations/),
  ).toBeInTheDocument();
});
it("can revisit the current section after scrolling elsewhere", async () => {
  window.location.hash = "#learn/darvas/worked-example";
  render(<App />);
  const user = userEvent.setup();
  screen.getByRole("heading", { name: "Practice on a chart" }).focus();
  await user.click(
    within(screen.getByRole("navigation", { name: "On this page" })).getByRole(
      "link",
      { name: "Worked example" },
    ),
  );
  expect(screen.getByRole("heading", { name: "Worked example" })).toHaveFocus();
});
