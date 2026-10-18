import { lazy } from "react";

export const LazyOrderBookLab = lazy(() =>
  import("./order-book-lab").then((module) => ({ default: module.OrderBookLab })),
);
