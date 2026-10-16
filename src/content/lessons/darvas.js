export const darvasSections = [
  {
    id: "the-idea",
    title: "The idea behind the boxes",
    paragraphs: [
      "Nicolas Darvas developed a trend-following approach around stocks showing price strength and unusual trading activity. A box marks a pause in that advance: a ceiling where price has stalled and a floor where it has found support. The approach looks for movement into a higher range, rather than trying to buy the lowest price.",
      "His stock selection also considered business growth. Drawing rectangles alone does not reproduce the complete method. This lesson introduces the long-side setup; it is an educational framework, not a tested trading system or a recommendation.",
    ],
    sources: ["cfi"],
    callout:
      "By the end: identify a box, explain a breakout trigger, and calculate the planned risk in a hypothetical trade.",
  },
  {
    id: "build-the-box",
    title: "Build the box",
    paragraphs: [
      "One historical description confirms a ceiling after a high remains unbroken for three subsequent days, then a floor after a low holds for three subsequent days. These are confirmation rules, not a fixed three-day window.",
      "Modern implementations vary in their lookbacks and filters. Choose the definition before reviewing results; do not redraw a box using information that was unavailable at the time.",
    ],
    sources: ["investopedia", "whitebox"],
    figure: "darvas",
  },
  {
    id: "breakout",
    title: "Read the breakout",
    paragraphs: [
      "The upper boundary becomes a potential entry reference. Price leaving the range to the upside, together with increased volume, is the setup to investigate. A touch of the ceiling is not the same as moving beyond it.",
      "For your study, record whether the trigger is an intraday crossing or a completed close. These are different rules and can produce different trades. Specify the volume comparison as well; “high volume” should not be a judgment made only after seeing the outcome.",
    ],
    sources: ["cfi", "whitebox"],
    bullets: [
      "Mark the confirmed boundaries before the breakout.",
      "Write down the trigger, order type, and invalidation level.",
      "Keep the original plan visible when reviewing what happened next.",
    ],
  },
  {
    id: "risk-and-exits",
    title: "Risk and exits",
    paragraphs: [
      "A common description places the initial protective stop below the box floor and raises it beneath the floor of a newly completed higher box. The hypothetical example below uses that convention.",
      "A stop order becomes a market order when triggered. Its fill can be worse than the stop price, especially through gaps or fast moves. A stop-limit order constrains price but may not execute. Planned risk is therefore not a guaranteed maximum loss.",
    ],
    sources: ["investopedia", "sec"],
    callout:
      "Define the exit before the entry. Treat position size, available cash, fees, and execution assumptions as separate parts of the plan.",
  },
  {
    id: "worked-example",
    title: "Worked example",
    paragraphs: [
      "Imagine a fictional stock consolidating between $45 and $50. For this exercise only, assume an entry fill at $50.20 and a planned stop at $44.80. The chosen buffers are illustrative, not Darvas rules.",
    ],
    table: {
      headers: ["Input", "Hypothetical value"],
      rows: [
        ["Box floor / ceiling", "$45.00 / $50.00"],
        ["Assumed entry / planned stop", "$50.20 / $44.80"],
        ["Planned risk per share", "$50.20 − $44.80 = $5.40"],
        ["Illustrative account / risk budget", "$10,000 / $50 (0.5%)"],
        ["Whole shares within that budget", "floor($50 ÷ $5.40) = 9 shares"],
        ["Position cost / planned price risk", "$451.80 / $48.60"],
      ],
    },
    paragraphsAfter: [
      "The arithmetic excludes fees, slippage, and gaps and assumes enough uncommitted cash. If the exit fills at $43 instead, the nine-share price loss is $64.80, already above the $50 budget.",
      "If a later box forms between $52 and $57, this example would move its stop reference below $52 only after that box is confirmed. If price instead falls back and reaches the original stop, the planned outcome is an exit—not a larger position to recover the loss.",
    ],
  },
  {
    id: "common-mistakes",
    title: "Common mistakes",
    bullets: [
      "Looking ahead: a floor confirmed three days later was not confirmed on the day of the low.",
      "Changing the rules mid-example: moving from a close-based trigger to an intraday trigger changes the setup.",
      "Confusing the diagram with a forecast: a breakout can reverse instead of forming the next higher box.",
      "Ignoring execution: a gap can skip a planned entry or stop price.",
      "Only collecting winners: keep failed setups and costs in any evaluation.",
    ],
    callout:
      "A clean historical illustration does not establish an edge. Any claimed performance needs reproducible testing with realistic costs and unseen data.",
  },
  {
    id: "practice",
    title: "Practice on a chart",
    paragraphs: [
      "Use chart replay or a paper journal for this exercise. Reveal one bar at a time so later prices cannot influence earlier decisions.",
    ],
    bullets: [
      "Choose a daily stock chart and write down your box-confirmation rule.",
      "Mark when the ceiling and floor actually become confirmed.",
      "Record the entry trigger, volume comparison, planned exit, and position-size calculation.",
      "Advance the chart. Record whether the entry occurs and which price assumptions were realistic.",
      "Review both successful and failed breakouts using the same rules.",
    ],
    question: {
      prompt:
        "A chart shows a low today, but your rule requires three later days without a lower low. Can you treat the floor as confirmed today?",
      answer:
        "No. You must wait for the required subsequent observations. Using that future confirmation to enter today would introduce look-ahead bias.",
    },
  },
  {
    id: "references",
    title: "References and further reading",
    references: true,
    paragraphs: [
      "The guide combines a historical overview with an explicitly hypothetical worked example. Implementation details differ; the Whitebox documentation is an example of a modern variant, not a universal definition.",
    ],
  },
];

export const darvasSources = {
  cfi: {
    title: "CFI — Darvas Box Theory",
    url: "https://corporatefinanceinstitute.com/resources/equities/darvas-box-theory/",
  },
  investopedia: {
    title: "Investopedia — The Darvas Box: A Timeless Classic",
    url: "https://www.investopedia.com/articles/trading/07/darvas-box.asp",
  },
  whitebox: {
    title: "Whitebox — Darvas Box strategy implementation",
    url: "https://docs.whitebox.so/whitebox-originals/darvas-box-strategy",
  },
  sec: {
    title: "Investor.gov — Stop, Stop-Limit, and Trailing Stop Orders",
    url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-15",
  },
};
