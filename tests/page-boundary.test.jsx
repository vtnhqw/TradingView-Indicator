import { lazy, Suspense } from "react";
import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageBoundary } from "../src/components/page-boundary";

it("offers recovery when a page download rejects and allows another route", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const Unavailable = lazy(() => Promise.reject(new Error("Download failed")));
  const view = render(
    <PageBoundary key="unavailable">
      <Suspense fallback={<p>Loading page</p>}><Unavailable /></Suspense>
    </PageBoundary>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Page unavailable");
  expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  view.rerender(
    <PageBoundary key="another-route"><h1>Available page</h1></PageBoundary>,
  );
  expect(screen.getByRole("heading", { name: "Available page" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
