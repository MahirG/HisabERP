# HisabERP UI repair verification

## Scope and root causes

This release repairs the existing application rather than replacing its identity or business logic.

- Help Center styles existed but were omitted from the internal stylesheet entry point. Guides and workflow steps consequently rendered as browser-default inline text.
- Internal styles were requested only from a client effect, creating a first-paint dependency on hydration. Each internal route family now imports the same canonical stylesheet stack from its server layout.
- Supporting public component styles had also been omitted. Restored migration, comparison, documentation, industry, and integration definitions are scoped to `.marketing-site-v2`, ahead of the existing public brand authority.
- The public footer's five desktop columns required more than 1,000px but remained active at tablet widths. Its responsive breakpoint now follows its actual minimum space requirement.
- Mobile metric collections used wide carousel columns; cards now fit their containers in a vertical stack. Workspace canvas clipping was removed where it masked sizing errors.
- Dialogs and mobile drawers now contain keyboard focus, make background content inert, restore focus to their trigger, and retain Escape dismissal and scroll locking.
- Cookie settings previously used a portal into a footer that could be detached during navigation. The legal footer now renders inside the shared footer component.
- Authentication links no longer prefetch sign-in routes, avoiding speculative requests consuming the existing authentication rate limit. The rate limit itself is unchanged.
- The existing Privacy and Terms documents are correctly classified as public pages. All business routes remain protected.
- Existing Manrope and Nunito Sans fonts are self-hosted with their licenses. Builds no longer depend on downloading Google Fonts, and public fonts comply with the existing CSP.

## Reproduce

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
node scripts/audit-ui-routes.mjs
```

No lint command is configured in this repository. `npm run test:browser -- --update-snapshots` intentionally regenerates visual baselines; review the images before accepting changes. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` supports an explicitly selected local Chromium installation.

## Browser scope

The suite discovers every prerendered public page from the production build manifest, adds the contact and legal pages, and tests widths **320, 360, 375, 390, 430, 768, 1024, 1280, and 1440**. It measures document width, card containment, and control containment, exercises public search, article navigation, hamburger navigation, consent preferences, and native form validation, and checks representative authentication screens.

A separate local-only fixture server bundles the actual workspace shell and UI components with read-only synthetic data. It verifies the dashboard, finance, sales, purchasing, inventory, HR, reconciliation, e-invoicing, and setup documentation at the same nine widths. It also checks guide/title separation, search and empty results, expanded articles, focus containment and return, Escape dismissal, reduced viewport height, enlarged text, long unbroken copy, and mobile navigation. Server actions in this fixture bundle throw if invoked. The fixture is never exposed as a Next.js application route.

Four screenshot baselines cover public and internal Help Center guides on mobile and desktop. These are new regression baselines. The user's supplied screenshot and the initial public-page captures were used as the before-state visual references.

## Explicit limits

- No safe live authenticated test account or session was supplied. The live-authenticated browser test is explicitly skipped until `HISAB_E2E_STORAGE_STATE` is supplied; `HISAB_E2E_BASE_URL` selects the intended environment. Fixtures do not prove database writes, payment processing, live reports, email delivery, or production user permissions.
- Android keyboard behavior is approximated by focusing the search field and reducing the viewport height. A physical-device keyboard run remains outstanding.
- The repository's existing Node suite had **116 failures before this work** (149 passes / 265 tests). These include historical source-string assertions about obsolete layouts and direct root stylesheet imports. They remain visible; they were not disabled or reclassified as passes. The verification comparison must show no additional failures.
- Existing English-only workspace localization and the public language selection were preserved. This release does not claim to restore a second workspace language.

## Result record

Exact final test counts and production deployment evidence are reported with the release commit. See `ui-route-inventory.md` for all 56 implemented page sources and the distinction between source review, fixture checks, and live authenticated coverage.

### Verified local release results

- Production build: passed, including 13 public static-route and prerender gates.
- TypeScript: passed.
- Browser suite: **82 passed, 1 skipped**, including four screenshot comparisons without updating baselines.
- Responsive matrix: nine widths across 57 public pages, four representative authentication pages, and nine workspace component fixtures.
- Existing Node suite plus new repair checks: **154 passed, 116 failed**. All 116 failures also occurred on the untouched baseline; no additional failing test names.
- Source inventory: 56 implemented page sources reviewed and classified.
- No lint command is configured.
