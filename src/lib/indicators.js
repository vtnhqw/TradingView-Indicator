import high52 from "../../indicators/52-week-high-line.pine?raw";
import maSpectrum from "../../indicators/MA-Spectrum-7.pine?raw";
import mcdx from "../../indicators/MCDX-SmartMoney.pine?raw";
import { indicatorDetails } from "./indicator-details";
export const indicators = [
  {
    key: "high52",
    file: "52-week-high-line.pine",
    type: "overlay",
    label: "Price reference",
    title: "52-Week High",
    description:
      "Put today’s price in perspective. Track the high, distance, and proximity across an adaptive 252-chart-bar lookback.",
    alerts: 2,
    tags: ["Adaptive lookback", "2 alerts"],
    source: high52,
  },
  {
    key: "maSpectrum",
    file: "MA-Spectrum-7.pine",
    type: "overlay",
    label: "Trend analysis",
    title: "MA Spectrum 7",
    description:
      "See the trend at every scale. Seven configurable moving averages spanning 20 to 1,400 periods.",
    alerts: 0,
    tags: ["7 averages", "5 fast-group methods"],
    source: maSpectrum,
  },
  {
    key: "mcdx",
    file: "MCDX-SmartMoney.pine",
    type: "pane",
    label: "Momentum",
    title: "MCDX Smart Money",
    description:
      "Explore shifting momentum through RSI-derived Banker, Hot Money, and Retailer components in a dedicated pane.",
    alerts: 5,
    tags: ["RSI-based model", "5 alerts"],
    source: mcdx,
  },
].map((indicator) => ({
  ...indicator,
  details: indicatorDetails[indicator.key],
}));
