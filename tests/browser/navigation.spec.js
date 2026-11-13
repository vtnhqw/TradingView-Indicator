import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Keep third-party chart availability out of local navigation checks.
  await page.route(/tradingview\.com/, (route) => route.abort());
});

test("reload keeps reading position and page width", async ({ page }) => {
  await page.route("**/assets/learn-page-*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.continue();
  });
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 650));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(650);
  const width = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().width);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeAttached();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(650);
  expect(await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().width)).toBe(width);
  expect(await page.evaluate(() => innerWidth - document.documentElement.clientWidth)).toBe(0);
});

test("repeated visits to the same route keep separate history positions", async ({ page }) => {
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeAttached();
  await page.evaluate(() => window.scrollTo(0, 600));
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await navigation.getByRole("link", { name: "Indicators" }).click();
  await expect(page.getByRole("heading", { name: "A little more perspective." })).toBeVisible();
  await navigation.getByRole("link", { name: "Learn", exact: true }).click();
  await page.getByRole("link", { name: "Read Darvas Box Strategy" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.goBack();
  await page.goBack();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
});

test("navigation and restoration still work with session storage blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get() { throw new Error("Storage disabled"); } });
  });
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeAttached();
  await page.evaluate(() => window.scrollTo(0, 450));
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Indicators" }).click();
  await expect(page.getByRole("heading", { name: "A little more perspective." })).toBeVisible();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(450);
});

test("catalog dialogs preserve layout and Back returns to the catalog", async ({ page }) => {
  await page.goto("/#indicators");
  const button = page.getByRole("button", { name: "Details for 52-Week High" });
  await expect(button).toBeVisible();
  const before = await page.locator("#page-content > header").boundingBox();
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.locator("#page-content > header").boundingBox()).toEqual(before);
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/#indicators$/);
  await expect(button).toBeFocused();
});

test("light and dark layouts stay within the viewport", async ({ page }, testInfo) => {
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeVisible();
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme });
    await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${colorScheme}.png`), animations: "disabled" });
  }
});

test("Back and Forward restore each entry's reading position", async ({ page }) => {
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Indicators" }).click();
  await expect(page.getByRole("heading", { name: "A little more perspective." })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Darvas Box Strategy", exact: true })).toBeAttached();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
});

test("homepage indicator links open the selected details, including after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore MA Spectrum 7" }).click();
  await expect(page).toHaveURL(/#indicators\/maSpectrum$/);
  await expect(page.getByRole("dialog")).toContainText("MA Spectrum 7");
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText("MA Spectrum 7");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/#indicators$/);
});

test("lesson highlighting follows scrolling without changing the URL", async ({ page }) => {
  await page.goto("/#learn/darvas");
  const heading = page.getByRole("heading", { name: "Worked example", exact: true });
  await heading.scrollIntoViewIfNeeded();
  await heading.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Worked example" })).toHaveAttribute("aria-current", "location");
  await expect(page).toHaveURL(/#learn\/darvas$/);
});

test("scrollbar fades and mobile edges do not intercept scrolling", async ({ page, isMobile }) => {
  await page.goto("/#learn/darvas");
  await expect(page.getByRole("scrollbar")).toBeAttached();
  await page.evaluate(() => window.scrollTo(0, 300));
  const thumb = page.locator(".page-scrollbar-thumb");
  await expect(thumb).toHaveCSS("opacity", "0.55");
  await expect(thumb).toHaveCSS("opacity", "0", { timeout: 3000 });
  if (isMobile) {
    const hitRole = await page.evaluate(() => document.elementFromPoint(innerWidth - 4, innerHeight / 2)?.closest('[role="scrollbar"]')?.getAttribute("role"));
    expect(hitRole).toBeUndefined();
  }
});
