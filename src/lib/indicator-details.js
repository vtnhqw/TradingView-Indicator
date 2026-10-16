export const indicatorDetails = {
  high52: {
    title: "52-Week High",
    sub: "Breakout and proximity framework",
    items: [
      [
        "Adaptive lookback",
        "Uses up to 252 chart bars and safely adapts for newer listings.",
      ],
      [
        "Distance tracking",
        "Shows the current close as a percentage from the active high.",
      ],
      [
        "Visual control",
        "Adjust line style, width, axis marker, and label visibility.",
      ],
      ["Alerts", "Near 52W High and New 52W High conditions."],
    ],
  },
  maSpectrum: {
    title: "MA Spectrum 7",
    sub: "Seven-layer moving-average overlay",
    items: [
      [
        "Fast group",
        "Plots 20, 50, 100, and 200-period averages from a configurable source.",
      ],
      [
        "Long group",
        "Adds 350, 700, and 1,400-period SMA or EMA trend references.",
      ],
      [
        "Flexible methods",
        "The fast group supports SMA, EMA, RMA, WMA, and VWMA calculations.",
      ],
      [
        "Display controls",
        "Toggle either group or each individual average and customize every color.",
      ],
    ],
  },
  mcdx: {
    title: "MCDX Smart Money",
    sub: "RSI-derived momentum classifier",
    items: [
      [
        "Banker strength",
        "An RSI-derived momentum proxy with adjustable sensitivity; not measured institutional order flow.",
      ],
      ["Hot money", "A separate short-term momentum layer."],
      [
        "Retail balance",
        "Fills the remaining oscillator view for fast comparisons.",
      ],
      ["Alerts", "Banker crossovers, strong zones, and retailer dominance."],
    ],
  },
};
