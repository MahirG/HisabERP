# Public website motion and performance verification

Date: 22 October 2026. Baseline: `bd2400f2be69875fb5859fee68290f8e84ab870d`.

## Changes

- Native scrolling, once-only 12px/320ms section entrances, and stable sticky-header elevation. First-screen content stays visible; no initial reveal dependency or document-wide mutation observer.
- Shared 180–240ms control, drawer and search transitions. Escape restores dropdown focus; switching to desktop closes the mobile drawer. Reduced-motion changes cancel active section animations immediately.
- Public sample charts use responsive SVG with readable data descriptions and keyboard/pointer tooltips. Recharts remains available to authenticated workspace charts.
- The root public-route gate defers private workspace navigation and command-center code. Public links in shared chrome and the homepage prefetch on hover/focus, respecting Save-Data and slow connections.
- The existing Manrope and Nunito fonts use managed local loading and optional display, preventing late font substitution. On a sufficiently slow first visit the browser may retain its fallback font for that document.
- The footer attribution is rendered with the page rather than appended after hydration. Existing legacy email links are normalized once per route.
- Duplicate form submissions are blocked while pending, with existing completion and timeout recovery preserved. No external email or account mutations were performed during QA.

## Mobile lab comparison

Medians of three cold browser contexts per page, Chromium 153, 390×844 viewport, 4× CPU slowdown, 150ms network latency, 200,000 bytes/s download, and 93,750 bytes/s upload. Observed through the load event plus two seconds. Same local production server setup for baseline and implementation.

| Page | Decoded JS before → after | Requests before → after | LCP before → after | CLS before → after | Long-task blocking before → after |
| --- | --- | --- | --- | --- | --- |
| Homepage | 1,096,553 → 615,382 bytes | 52 → 26 | 1,132 → 1,204 ms | 0.0035 → 0 | 683 → 321 ms |
| Pricing | 1,096,553 → 554,253 bytes | 48 → 24 | 1,016 → 1,088 ms | 0.1131 → 0 | 279 → 233 ms |
| Services | 737,776 → 598,441 bytes | 52 → 31 | 900 → 1,048 ms | 0.0678 → 0 | 150 → 173 ms |

Homepage decoded JavaScript fell 43.9%, requests halved, and the recorded long-task blocking fell 53.0%. All observed LCP values remain below 2.5 seconds. Text paint was slightly later with the stable font-loading policy; services did not improve in every timing metric. These are local lab observations, not a field Core Web Vitals or INP certification. Decoded resource bytes include prefetch and are not compressed transfer sizes. The long-task column sums duration beyond 50ms and is not Lighthouse's TBT.

Raw results and configuration: `mobile-before-after.json`. Reproduce with a production server running:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node scripts/measure-public-performance.mjs --base-url http://127.0.0.1:41773 --output performance-lab-report.json
```

## Checks

- Production build passes; 13 required public routes remain prerendered.
- TypeScript, localization coverage and source-copy integrity pass.
- SEO contract passes: 62 prerendered public pages, one dynamic page, 63 sitemap URLs.
- 24 targeted browser checks pass: public content without JavaScript; reveal cancellation and once-only behavior; menu focus, Escape, backdrop and resize; anchor offsets and browser-back scroll restoration; product switching and keyboard chart tooltips; contact validation and duplicate-submit protection; seven representative public/auth pages at 320, 390, 768 and 1440px; nine read-only workspace screens at nine widths; workspace hamburger interactions.
- No JavaScript errors in the checked responsive public/auth pages.
- The legacy unit suite has 206 passes and 123 failures, identical to the untouched baseline. There are no newly failing legacy tests. Many existing failures assert superseded CSS and markup. This suite is not reported as passing.
- Authenticated workspace checks use the repository's read-only fixtures. Real account sign-in, database writes, payment completion and email delivery were not exercised.

## Remaining evidence

Real-user p75 LCP, INP and CLS require production traffic after release. Mobile Lighthouse results are recorded separately because Lighthouse's simulated throttling differs from the browser-observation method above.


## Mobile Lighthouse 13.0.1

One production-build run per listed page, sequentially on the same host with Lighthouse's default mobile simulated throttling and Chromium 153. Separate from the direct CDP observations above; scores fluctuate between runs.

| Page | Performance score | Simulated LCP | TBT | CLS |
| --- | --- | --- | --- | --- |
| Homepage baseline | 86 | 3.58 s | 197 ms | 0.0032 |
| Homepage updated | 93 | 3.13 s | 28 ms | 0 |
| Pricing updated | 98 | 2.29 s | 37 ms | 0 |
| Services updated | 96 | 2.75 s | 30 ms | 0 |

All three updated pages exceed the requested 90-point performance goal. Lighthouse's simulated LCP for the homepage and services still exceeds 2.5 seconds; these results do not establish that the field p75 LCP goal is met. Further critical-CSS reduction could help. Summary and throttle settings: `lighthouse-summary.json`.
