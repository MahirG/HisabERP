# HisabTech SEO implementation — 22 October 2026

## Objective and verified target

Grow qualified Ethiopian ERP enquiries through accurate, useful product and buying pages. This release does not promise positions, indexing, regulatory approval, customer outcomes or AI-search citations.

Repository: MahirG/HisabERP, main. Production project: Hisab / hisab-erp, prj_wkLKqEZXgQ7Cb42UBAgi4vr2NXat. Public domain: https://hisabtech.com. Baseline production commit: ab061bf35916862e618277d3a8bc94aca7e24788.

## Audit and fixes

| Finding | Evidence and impact | Action |
| --- | --- | --- |
| Root canonical inherited across pages | app/layout.tsx previously declared `/`; many child pages only supplied titles | Removed root canonical; publicMetadata supplies each public page's canonical, social URL and robots |
| Wrong canonical hostname | Live www requests redirect to apex; old sitemap and schema used www | Align site identity, metadata and sitemap with apex |
| Authentication pages inherited index permission | Root robots allowed indexing by default | Root is noindex; intended public pages explicitly opt in; auth paths remain fetchable |
| Build-generated lastmod for unchanged pages | Sitemap used new Date() for most entries | Omit unknown dates; use explicit article modification and comparison review dates |
| Weak comparison coverage | Comparison hub focused on operating models | Add sourced Odoo and ERPNext buying comparisons with disclosure, scope and limitations |
| Unsupported language claim | Ethiopia page claimed Amharic; public-localization/config declare English-only | Correct page and sample preview; preserve current English-only behavior |
| Conflicting branch limits | Homepage showed Growth 3 and Business unlimited; billing/pricing list 2 and 5 | Align homepage with existing commercial catalog |
| SVG social previews | Old pages used logo/dashboard SVG | Add 1200×630 PNG social card and 180×180 touch icon |

Public wording is not treated as proof of every product capability. Evidence reviewed includes lib/config.ts, lib/public-localization.ts, lib/billing/catalog.ts, lib/marketing-pricing.ts, module routes, lib/actions/erp.ts, lib/actions/operational.ts, lib/actions/demo-request.ts and existing access boundaries. Specialist capabilities still require demonstrations and contract scope. No database, authentication identity, prices or payment integration was changed.

## Intent ownership

| Primary intent | URL |
| --- | --- |
| Broad Ethiopian ERP overview | / |
| Localization, implementation and local requirements | /ethiopia |
| Sales and invoicing software | /product/sales-invoicing |
| Inventory management software | /product/inventory |
| Accounting and finance software | /product/finance-cashflow |
| ERP access plans and commercial scope | /pricing |
| ERP budget and quote evaluation | /resources/erp-costs-ethiopia |
| Odoo comparison | /compare/biloo-vs-odoo |
| ERPNext comparison | /compare/biloo-vs-erpnext |
| Buying methodology | /resources/choose-erp-for-ethiopian-business |
| Wholesale inventory evaluation | /resources/inventory-software-wholesale-ethiopia |
| Multi-branch controls | /resources/multi-branch-business-controls |
| Company software development and automation services | /services |

Full rendered route metadata is recorded in route-inventory.csv. No search-volume or ranking estimates were invented. Existing URLs are retained. No city doorway pages or fake translated URLs were created.

## Competitive research

These are observed approaches, not a ranked market-share table. Search snapshots are not Ethiopia-localized rank tracking.

| Provider/source | Observed approach | Hisab response |
| --- | --- | --- |
| Odoo official editions and hosting documentation | Edition and hosting choices affect scope | Compare quoted configurations; reference 19.0 hosting documentation without claiming it is latest |
| 360Ground technology-partners page | Platform implementation and published partnerships | Publish truthful identity and implementation responsibility; invent no credentials |
| DreamTech accounting/finance ERP landing page | Specific workflow and module content | Improve module discoverability and links to evidence |
| Zoha Ethiopia ERP options/cost article | Local buying questions and costs | Publish an original budget checklist without repeating unverified regulatory claims |
| ERPNext official product overview | Open-source model and broad application coverage | Explain ownership and maintenance questions; acknowledge specialist fit |

Sources reviewed:
- https://www.odoo.com/page/editions
- https://www.odoo.com/documentation/19.0/administration/hosting.html
- https://www.odoo.com/pricing
- https://frappe.io/erpnext
- https://360ground.com/solutions/technology-partners/
- https://dreamtech.et/products/business-erp/accounting-finance-software-ethiopia
- https://zohaglobalsolutions.com/erp-software-in-ethiopia/
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

Odoo pages could not be fetched directly by the research service, so only information independently surfaced from official search results is described. Exact edition-level feature parity and current Odoo prices are not asserted. Competitor claims about accreditation, awards, regulation or customer counts are not adopted.

## Measurement and account-dependent work

Search Console and Google Analytics account access are unavailable in this session. No property, DNS verification token, historical baseline, ranking, backlink count or lead conversion rate has been fabricated. No optional analytics vendor was silently activated.

Owner setup:
1. Open https://search.google.com/search-console and add the Domain property `hisabtech.com`.
2. Add Google's exact TXT record at the authoritative DNS provider, retaining any existing verification records.
3. Verify ownership and keep the record in place.
4. Submit https://hisabtech.com/sitemap.xml.
5. Inspect the homepage, pricing, a module, a comparison and a new guide; request indexing where appropriate.
6. Filter Performance by Ethiopia, page/query cluster and comparable dates; separate branded from non-branded searches.

Alternative: add the URL-prefix property https://hisabtech.com/ and configure GOOGLE_SITE_VERIFICATION with the meta tag's content token, then redeploy. Domain properties require DNS verification; a meta tag is not a substitute for them.

Measurement specification for the owner's analytics property:
- page_view: approved public pathname only; omit query strings and hashes.
- demo_cta_click: distinguish a click from an accepted enquiry.
- demo_accepted: emit from an authoritative accepted submission, not a spoofable success URL; deduplicate by request reference.
- signup_completed: only after actual account creation, with no credentials or email in analytics.
- qualified_lead / sale: require a documented sales process and attribution window.
- Exclude private ERP routes and form contents. Honor the existing explicit analytics consent choice; use no advertising identifiers by default.
- If manually integrating GA4 pageviews later, disable automatic page/history measurement in property settings to avoid duplicates and query leakage. Review CSP and consent before activation.

Field Core Web Vitals are not available. Targets remain LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile. A successful build is not a performance score.

## Validation

- Production build, typecheck and existing public prerender gates.
- i18n check and translation-quality check; no new language was enabled.
- `npm run seo:verify`: all sitemap pages have intended metadata; dynamic public page checked; login/sign-up and submission/error states noindex; anonymous workspace/account/finance requests redirect; unknown comparison returns genuine 404; JSON-LD parses; evaluation CSV columns agree.
- Baseline full legacy suite: 329 tests, 206 passed, 123 failed before edits. These include stale historical layout expectations. Affected expectations were updated for requested copy, shared metadata and explicit sample labels. No unrelated failing suite was rewritten.
- Local Playwright browser download failed with a truncated archive. Do not claim local screenshot, mobile-device or full authenticated browser coverage from that attempt. Production browser inspection is recorded separately when completed.
- No live enquiry email or payment was submitted during testing.
- Production browser confirmed the homepage and guide/comparison navigation, canonical metadata, article/breadcrumb schema, desktop layout without horizontal overflow and required-field form validation. No site-origin browser exception was observed; browser-extension errors were separate. The initial live download check caught the CSV being sent through authentication; the exact public template URL was added to the existing asset allowlist and to the HTTP regression check. Private-route protection was not broadened.

## Operational backlog

| Window | Work | Dependency / acceptance |
| --- | --- | --- |
| Days 1–14 | Verify Search Console; record impressions, clicks, queries and public indexation | Owner verification and property access; no fixed growth promises |
| Days 15–30 | Validate top product claims with representative workflows; add approved product evidence | Named product owner; demonstrate essential capabilities |
| Days 31–60 | Improve guides based on real questions; review comparison sources and implementation costs | Query/sales evidence and editorial review; no padded content |
| Days 31–60 | Assess legitimate Business Profile eligibility and contact consistency | Actual operating model and owner-controlled profile; no fake branches |
| Days 61–90 | Improve pages with impressions but weak qualified outcomes; earn relevant editorial references | Sufficient sample; no purchased ranking links or unauthorized outreach |
| Ongoing | Monitor field vitals, crawl errors, outdated claims and form delivery | Real telemetry and accountable owner |

Future publication still needs factual review for new compliance statements and customer evidence. This release neither sends outreach nor creates external directory accounts.
