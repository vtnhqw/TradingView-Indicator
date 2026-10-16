import { darvasSections, darvasSources } from "./darvas";

// Add lessons here to populate the library and lesson navigation together.
// Guides use the shared article renderer; interactive lessons select a component.
export const lessons = [
  {
    slug: "order-book",
    title: "Order Book Lab",
    category: "Market mechanics",
    format: "Interactive lab",
    level: "Beginner",
    duration: "Explore at your pace",
    description:
      "See buyers, sellers, and liquidity in motion. Explore spreads, depth, and seven market scenarios.",
    kind: "lab",
    action: "Open Order Book Lab",
    outcomes: [
      "Read bids, asks, and spreads",
      "Watch liquidity change",
      "Explore market scenarios",
    ],
  },
  {
    slug: "darvas",
    title: "Darvas Box Strategy",
    category: "Trading strategies",
    format: "Reading guide",
    level: "Intermediate",
    duration: "8 min read",
    description:
      "Follow price from consolidation to breakout. Learn how boxes frame entries, exits, and planned risk.",
    kind: "guide",
    action: "Read Darvas Box Strategy",
    outcomes: [
      "Identify a price box",
      "Understand breakout rules",
      "Work through a risk example",
    ],
    sections: darvasSections,
    sources: darvasSources,
  },
];
export function getLesson(slug) {
  return lessons.find((lesson) => lesson.slug === slug);
}
export function lessonHref(slug, section) {
  return `#learn/${slug}${section ? `/${section}` : ""}`;
}
