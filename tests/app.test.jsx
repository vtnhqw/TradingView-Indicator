import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { indicators } from "../src/lib/indicators";

it("restores a saved history entry after the page mounts", async () => {
  window.history.replaceState({ terminalNavigation: {
    key: "reload-test", href: new URL("#learn/darvas", window.location.href).href, position: 650,
  } }, "", "#learn/darvas");
  window.scrollTo.mockClear();
  render(<App />);
  await screen.findByRole("heading", { name: "Darvas Box Strategy", level: 1 });
  await waitFor(() => expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 650, behavior: "instant" }));
});

it("opens the selected homepage indicator directly", async () => {
  window.location.hash = "#overview";
  render(<App />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("link", { name: "Explore MA Spectrum 7" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("heading", { name: "MA Spectrum 7" })).toBeInTheDocument();
  expect(window.location.hash).toBe("#indicators/maSpectrum");
});

it("opens indicator details from a direct URL and closes back to the catalog", async () => {
  window.location.hash = "#indicators/mcdx";
  render(<App />);
  const user = userEvent.setup();
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("heading", { name: "MCDX Smart Money" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(window.location.hash).toBe("#indicators");
});

it("keeps unknown indicator URLs usable", async () => {
  window.location.hash = "#indicators/missing";
  render(<App />);
  expect(await screen.findByRole("heading", { name: "A little more perspective." })).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("advances one scenario step and stays paused until resumed", async () => {
  try {
    window.location.hash = "#learn/order-book";
    render(<App />);
  await screen.findByRole("heading", { level: 1 });
    vi.useFakeTimers();
    act(() => screen.getByRole("button", { name: "Run Bid wall scenario" }).click());
    act(() => screen.getByRole("button", { name: "Next step" }).click());
    expect(screen.getByText("Step 1 / 6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume simulation" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("Step 1 / 6")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Next step" }).click());
    expect(screen.getByText("Step 2 / 6")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Resume simulation" }).click());
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Step 3 / 6")).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

async function openCatalog() {
  window.location.hash = "#indicators";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  return userEvent.setup();
}

it("keeps a paused scenario when navigating away from the lab and back", async () => {
  window.location.hash = "#learn/order-book";
  render(<App />);
  await screen.findByRole("heading", { name: "Order Book Lab" });
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Run Bid wall scenario" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
  const step = screen.getByText(/Step \d \/ 6/).textContent;
  const price = screen.getByTestId("mid-price").textContent;
  await user.click(screen.getByRole("link", { name: "Indicators" }));
  await screen.findByRole("heading", { level: 1, name: "A little more perspective." });
  await user.click(screen.getByRole("link", { name: "Learn" }));
  await user.click(await screen.findByRole("link", { name: "Open Order Book Lab" }));
  await screen.findByRole("heading", { name: "Order Book Lab" });
  expect(screen.getByText(step)).toBeInTheDocument();
  expect(screen.getByTestId("mid-price")).toHaveTextContent(price);
  expect(screen.getByRole("button", { name: "Resume simulation" })).toBeInTheDocument();
});
describe("indicator library", async () => {
  it("filters cards and shows the exact source in an accessible details dialog", async () => {
    const user = await openCatalog();
    await user.click(screen.getByRole("tab", { name: "Separate pane" }));
    expect(
      screen.queryByRole("heading", { name: "52-Week High" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "MCDX Smart Money" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Details for MCDX Smart Money" }),
    );
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Pine Script source" }),
    );
    expect(
      within(dialog).getByRole("textbox", { name: "Pine Script source" }),
    ).toHaveValue(indicators[2].source);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("copies the complete Pine source and confirms success", async () => {
    const user = await openCatalog();
    const write = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    await user.click(
      screen.getByRole("button", { name: "Copy source for 52-Week High" }),
    );
    expect(write).toHaveBeenCalledWith(indicators[0].source);
    expect(
      screen.getByRole("button", { name: /Source copied for 52-Week High/ }),
    ).toBeInTheDocument();
  });
  it("offers manual copying when clipboard access fails", async () => {
    const user = await openCatalog();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Denied"),
    );
    await user.click(
      screen.getByRole("button", { name: "Copy source for 52-Week High" }),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Pine Script source" }),
    ).toHaveValue(indicators[0].source);
    expect(
      screen.queryByRole("button", { name: /Source copied/ }),
    ).not.toBeInTheDocument();
  });
  it("does not reopen a dialog if copying fails after navigation", async () => {
    const user = await openCatalog();
    let reject;
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      () =>
        new Promise((_, r) => {
          reject = r;
        }),
    );
    await user.click(
      screen.getByRole("button", { name: "Copy source for 52-Week High" }),
    );
    await user.click(screen.getByRole("link", { name: "Learn" }));
    await act(async () => reject(new Error("Denied")));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Learn the market, one lesson at a time.",
      }),
    ).toBeInTheDocument();
  });
});
it("supports route aliases and pauses the simulator while controls remain usable", async () => {
  window.location.hash = "#lab";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  expect(
    screen.getByRole("heading", { name: "Order Book Lab" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Pause simulation" }));
  expect(
    screen.getByRole("button", { name: "Resume simulation" }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: /Run Bid wall scenario/ }),
  );
  expect(
    screen.getByRole("button", { name: "Pause simulation" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reset book" }));
  expect(screen.getByTestId("mid-price")).toHaveTextContent("95200.00");
});
it("persists the selected theme", async () => {
  window.location.hash = "#indicators";
  localStorage.setItem("signal-theme", "light");
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(localStorage.getItem("signal-theme")).toBe("dark");
});

it("renders the overview with the chart and all three indicator previews", async () => {
  window.location.hash = "#overview";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "A clearer view",
  );
  expect(
    screen.getByRole("link", { name: "Explore indicators" }),
  ).toHaveAttribute("href", "#indicators");
  expect(
    screen.getByRole("button", { name: "Reload market chart" }),
  ).toBeInTheDocument();
  for (const indicator of indicators)
    expect(
      screen.getByRole("link", { name: `Explore ${indicator.title}` }),
    ).toBeInTheDocument();
});

it("preserves a paused book across maximization and restores focus on Escape", async () => {
  window.location.hash = "#learn/order-book";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Pause simulation" }));
  const price = screen.getByTestId("mid-price").textContent;
  await user.click(screen.getByRole("button", { name: "Maximize" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByTestId("mid-price")).toHaveTextContent(price);
  expect(
    within(dialog).getByRole("button", { name: "Resume simulation" }),
  ).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByTestId("mid-price")).toHaveTextContent(price);
  expect(screen.getByRole("button", { name: "Maximize" })).toHaveFocus();
});

it("selects assets and scenarios with the shadcn keyboard controls while paused", async () => {
  window.location.hash = "#learn/order-book";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Pause simulation" }));
  await user.click(screen.getByRole("combobox", { name: "Asset" }));
  await user.click(screen.getByRole("option", { name: "AAPL (Apple Inc.)" }));
  expect(screen.getByTestId("mid-price")).toHaveTextContent("182.50");
  await user.click(screen.getByRole("combobox", { name: "Scenario" }));
  await user.click(screen.getByRole("option", { name: "Iceberg order" }));
  expect(
    screen.getByRole("button", { name: "Run Iceberg order scenario" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: "Resume simulation" }),
  ).toBeInTheDocument();
});

it("stops the simulation interval when leaving the lab", async () => {
  window.location.hash = "#learn/order-book";
  const set = vi.spyOn(window, "setInterval");
  const clear = vi.spyOn(window, "clearInterval");
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const interval = set.mock.results[set.mock.calls.findIndex((call) => call[1] === 750)].value;
  const user = userEvent.setup();
  await user.click(screen.getByRole("link", { name: "Indicators" }));
  await waitFor(() => expect(clear).toHaveBeenCalledWith(interval));
});

it("renders the standalone lesson without the catalog navigation", async () => {
  window.history.replaceState({}, "", "/note/level2_orderbook_cheatsheet.html");
  try {
    render(<App />);
  await screen.findByRole("heading", { level: 1 });
    expect(
      screen.getByRole("heading", { name: "Order Book Lab" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terminal home" })).toHaveAttribute(
      "href",
      "../index.html",
    );
  } finally {
    window.history.replaceState({}, "", "/");
  }
});

it("moves keyboard focus to the destination heading after a content navigation link", async () => {
  window.location.hash = "#overview";
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  const user = userEvent.setup();
  screen.getByRole("link", { name: "Explore lessons" }).focus();
  await user.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      screen.getByRole("heading", {
        name: "Learn the market, one lesson at a time.",
      }),
    ).toHaveFocus(),
  );
});
