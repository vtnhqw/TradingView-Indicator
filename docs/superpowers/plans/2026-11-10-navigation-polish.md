# Navigation and scrolling implementation plan

**Goal:** Complete the five accepted review improvements and remove verified dead code.
**Architecture:** Keep native page scrolling; use history-entry state to restore positions after content loads, route indicator details by key, and derive the active lesson section from heading positions. Keep the current React/Vite structure.
**Constraints:** Preserve existing working-tree changes, Pine files, theme and standalone entry page. No deployment. User approved implementation of all review items.

- [x] Fix touch edge interception; retain desktop drag, idle fade and keyboard controls. Test touch input and desktop drag.
- [x] Extract route/scroll handling into a focused module. Store per-history-entry coordinates, restore reload/Back/Forward after Suspense resolves, reset on new navigation, and preserve direct section anchors. Test navigation, reload, duplicate routes, and missing storage support.
- [x] Route `#indicators/<key>` to its details dialog; make homepage cards link there; preserve copying, closing/focus, unknown-key fallback and Back behavior. Test direct and clicked entry.
- [x] Update lesson section highlighting on scroll without rewriting URLs or stealing focus. Verify section changes and effect cleanup.
- [x] Add repeatable browser tests for refresh width/position, history restoration, mobile edge hit testing, direct details, section highlighting and dialogs. Run the unit suite, production build and browser suite.
- [x] Audit imports, exports, files and metadata for unreachable code. Remove only confirmed unused code; keep dynamic imports, compatibility aliases and Pine assets. Repeat checks after cleanup.

## Execution notes

Work stays in the existing checkout to retain this conversation's uncommitted changes. Browser checks use an isolated automated test browser, not the user's Chrome profile. Record concrete blockers and do not equate jsdom tests with visual browser verification.

## Verification

- `npm test`: 6 Node tests and 37 React tests passed.
- `npm run check:unused`: no findings; unused imports also inspected with an AST scan.
- `npm run test:browser`: 27 tests passed across Chromium, WebKit, and iPhone emulation, including the production build.
- Desktop dark and mobile light screenshots inspected; no scrollbar gutter or horizontal overflow.
- `git diff --check`: clean. Pine sources unchanged.
- Chromium regression fixes: snapshot scroll immediately for reload and capture outgoing position on popstate before the final scroll event. WebKit fix: store the clicked dialog trigger instead of relying on mouse clicks to focus buttons.
- Independent read-only review found no important issues. Mobile browser coverage verifies edge hit-testing; physical touch gestures are not simulated. Desktop dragging is covered by the component regression test.
