import { it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderBookLab } from "../src/components/order-book-lab";

it("pauses on completion, preserves the final book, and replays the scenario", () => {
  vi.useFakeTimers();
  try {
    render(<OrderBookLab />);
    act(() => screen.getByRole("button", { name: "Run Breakout scenario" }).click());
    act(() => vi.advanceTimersByTime(4500));
    expect(screen.getByText("Scenario completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume simulation" })).toBeInTheDocument();
    const finalPrice = screen.getByTestId("mid-price").textContent;
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId("mid-price")).toHaveTextContent(finalPrice);
    act(() => screen.getByRole("button", { name: "Replay Breakout" }).click());
    expect(screen.queryByText("Scenario completed")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Step 1 / 6")).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

it("restores the book, scenario, speed and paused state after leaving the lab", async () => {
  const session = {};
  const user = userEvent.setup();
  const first = render(<OrderBookLab session={session} />);
  await user.click(screen.getByRole("button", { name: "Pause simulation" }));
  await user.click(screen.getByRole("combobox", { name: "Asset" }));
  await user.click(screen.getByRole("option", { name: "AAPL (Apple Inc.)" }));
  await user.click(screen.getByRole("combobox", { name: "Update speed" }));
  await user.click(screen.getByRole("option", { name: "Slow · 1.5s" }));
  await user.click(screen.getByRole("combobox", { name: "Scenario" }));
  await user.click(screen.getByRole("option", { name: "Bid wall" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
  const price = screen.getByTestId("mid-price").textContent;
  const events = screen.getByRole("region", { name: "Simulation event log" }).textContent;
  first.unmount();
  render(<OrderBookLab session={session} />);
  expect(screen.getByRole("combobox", { name: "Asset" })).toHaveTextContent("AAPL");
  expect(screen.getByRole("combobox", { name: "Update speed" })).toHaveTextContent("Slow");
  expect(screen.getByRole("button", { name: "Resume simulation" })).toBeInTheDocument();
  expect(screen.getByText("Step 1 / 6")).toBeInTheDocument();
  expect(screen.getByTestId("mid-price")).toHaveTextContent(price);
  expect(screen.getByRole("region", { name: "Simulation event log" }).textContent).toBe(events);
});
