# VI Ready

A static, evidence-aware GTA VI PC readiness checker with a separate Leonida historical-reference checker, localized chapter checklists, character guides, and a money-method reference. It supports English, Spanish, and Arabic, including a fully static Arabic RTL document.

The site never invents official PC requirements, benchmark scores, FPS estimates, or Leonida playability. Missing or incompatible evidence returns **Unknown**. Hardware capability and release/playability status are evaluated independently.

## Requirements

- Node.js 20.9+ (Node.js 24 is recommended and used for release verification)
- npm 10+
- A modern Chromium, Firefox, or WebKit browser for local verification

## Install and run

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validate and build

```bash
npm run validate:data
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm run build` validates the datasets, generates localized OG images and SEO files, and exports the site to `out/`. Install the test browser once with:

```bash
npx playwright install chromium
```

Serve the production export locally with:

```bash
npm start
```

Then open `http://localhost:3000`. The Playwright suite starts its own static server on port 4173 and expects a completed build.

## Environment variables

Copy `.env.example` to `.env.local` for development, or configure the same variables in the deployment dashboard.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production builds | Absolute non-local HTTPS origin used for canonical URLs, hreflang, sitemap, robots, and structured data. |
| `NEXT_PUBLIC_GTM_ID` | No | Google Tag Manager container ID. Takes precedence over `NEXT_PUBLIC_GA_ID` when both are set. |
| `NEXT_PUBLIC_GA_ID` | No | Direct GA4 measurement ID fallback when no GTM container is configured. |
| `NEXT_PUBLIC_CLARITY_ID` | No | Clarity project ID. No analytics code is loaded when omitted. |

Analytics requires both explicit consent and the exact HTTPS origin `https://canirungta6.online`. Localhost, preview domains, HTTP, lookalike domains, and every other origin remain blocked even when a production consent value already exists. The site supplies a sanitized initial `page_location` without query strings or hashes; GTM/GA4 tags must be configured in the tag dashboard to use sanitized locations and avoid capturing hardware parameters or form values. Form and result regions use Clarity masking, and raw renderer strings, machine names, serial numbers, imported files, and free-text searches are not sent as analytics parameters.

The checked-in `.env.production` uses the production origin `https://canirungta6.online`. The published contact address is `support@canirungta6.online`. Rebuild after changing the origin or contact information.

## Cloudflare Pages deployment

This project is a Next.js static export and must be deployed as **Cloudflare Pages**, not through the OpenNext Cloudflare Workers adapter.

Configure the Pages project under **Settings → Builds and deployments**:

- **Framework preset:** Next.js (Static HTML Export)
- **Build command:** `npm run build:cloudflare`
- **Build output directory:** `out`
- **Root directory:** repository root
- **Node.js version:** 24.x recommended
- **Environment variables:** set `NEXT_PUBLIC_SITE_URL` and any optional analytics IDs; the checked-in `.env.production` supplies the production origin and GTM container

Do not use `npx opennextjs-cloudflare build` for this repository. OpenNext is for Next.js applications running on Cloudflare Workers and requires an `open-next.config.ts`; this site intentionally uses `output: "export"` and has no Worker runtime or independent backend. If a failed build shows the OpenNext command, correct the Pages build command above and retry the deployment.

No database, server runtime, API route, or independent backend is required. `public/_headers` supplies the CSP and privacy/security headers on Cloudflare Pages. Rebuild after changing the production origin or any public data file.

## Routes

Each language has four core business pages, for 12 core URLs total:

| Page | English | Spanish | Arabic |
| --- | --- | --- | --- |
| GTA VI checker | `/` | `/es/` | `/ar/` |
| Leonida checker | `/can-i-run-leonida/` | `/es/can-i-run-leonida/` | `/ar/can-i-run-leonida/` |
| PC requirements | `/gta-6-pc-requirements/` | `/es/requisitos-gta-6-pc/` | `/ar/gta-6-pc-requirements/` |
| PC release status | `/gta-6-pc/` | `/es/gta-6-pc/` | `/ar/gta-6-pc/` |

Guide pages add 18 localized URLs:

| Page | English | Spanish | Arabic |
| --- | --- | --- | --- |
| Chapters | `/gta-6-chapters/` | `/es/capitulos-gta-6/` | `/ar/فصول-gta-6/` |
| Chapter 3 checklist | `/gta-6-chapters/chapter-3/` | `/es/capitulos-gta-6/capitulo-3/` | `/ar/فصول-gta-6/الفصل-3/` |
| Chapter 4 checklist | `/gta-6-chapters/chapter-4/` | `/es/capitulos-gta-6/capitulo-4/` | `/ar/فصول-gta-6/الفصل-4/` |
| Characters | `/characters/` | `/es/personajes/` | `/ar/الشخصيات/` |
| Mandy | `/characters/mandy/` | `/es/personajes/mandy/` | `/ar/الشخصيات/ماندي/` |
| Money | `/gta-6-money/` | `/es/dinero-gta-6/` | `/ar/مال-gta-6/` |

Localized support and policy pages add 15 URLs, bringing the generated sitemap to **45 URLs**:

| Page | English | Spanish | Arabic |
| --- | --- | --- | --- |
| Methodology | `/methodology/` | `/es/metodologia/` | `/ar/المنهجية/` |
| Privacy | `/privacy/` | `/es/privacidad/` | `/ar/الخصوصية/` |
| Terms | `/terms/` | `/es/terminos/` | `/ar/الشروط/` |
| Cookies | `/cookies/` | `/es/cookies/` | `/ar/ملفات-تعريف-الارتباط/` |
| About | `/about/` | `/es/acerca-de/` | `/ar/من-نحن/` |

The policy pages use an effective date of 2026-11-24, link to the published support mailbox, and cross-link to the other legal pages. Independent route-group root layouts emit the correct `lang` and `dir` attributes without duplicate locale segments.

## Data and evidence maintenance

Current verified library coverage is **15 CPUs and 22 GPUs** (37 records), backed by **53 registered evidence sources**. This is intentionally smaller than an unverified bulk catalog.

- `src/data/cpus.json`: CPU identities, variants, aliases, factual specifications, and source IDs.
- `src/data/gpus.json`: GPU identities, desktop/laptop variants, VRAM, factual specifications, aliases, and source IDs.
- `src/data/sources.json`: publisher, title, HTTPS URL, check date, accessibility, stale status, license, and notes.
- `src/data/profiles/gta6.json`: official-evidence gap profile; no invented thresholds.
- `src/data/profiles/leonida-low.json`: stale historical 1080p Low community profile.
- `src/data/profiles/leonida-high.json`: stale historical console-comparable community profile.
- `src/data/status/gta6.json`: official PC availability status.
- `src/data/status/leonida.json`: separate upstream and playability status.
- `src/data/routes.json`: localized route slugs and indexability.
- `src/data/guides.json`: secondary-source chapter summaries, Chapter 3/4 mission IDs, cast credits, money-method metadata, and page source references.

To add or update hardware:

1. Add or update the manufacturer or otherwise reliable evidence record in `sources.json`.
2. Add the model with a unique ID and registered `sourceIds`.
3. Keep RTX 3060 8GB, 12GB, and Laptop records distinct; do not merge laptop and desktop variants.
4. Leave benchmark fields `null` unless a licensed, reproducible, same-dataset benchmark is actually available.
5. Update `updatedAt` and the evidence check date.
6. Run `npm run validate:data`, `npm test`, and `npm run build`.

The validator rejects duplicate IDs, alias collisions, missing or unknown sources, insecure source URLs, invalid numeric ranges, invalid benchmark values, broken profile references, duplicate mission IDs, mission-count mismatches, and invalid guide page references. Test-only benchmark values live in `tests/fixtures/benchmarks.ts` and never enter production data.

Run a read-only live source check without modifying evidence records:

```bash
npm run check:sources
npm run check:sources -- --write-report reports/source-check.json
```

The checker follows redirects, limits concurrent requests and response hashing, and reports accessibility, redirect, content-hash, and network changes. Reusing a report file enables comparison with the previous run. Review the evidence manually before changing `checkedAt`, `accessible`, or `stale`.

## P1 enhancements

- **Local DxDiag import:** UTF-8/UTF-16 text reports up to 2 MB are parsed in the browser. Only recognized CPU, GPU, and approximate RAM values can be applied after review. Machine names, serial numbers, and unrelated fields are neither displayed nor uploaded.
- **Upgrade simulation:** CPU, GPU, and RAM alternatives are evaluated against the same profile and version. The completed baseline remains immutable, reset restores it, and no FPS or percentage improvement is invented.
- **PNG sharing:** Canvas generates a localized 1200×630 reference report in English, Spanish, and Arabic RTL without external images or machine identifiers.
- **Expanded evidence-backed catalog:** adds current desktop CPU/GPU models from official manufacturer pages while leaving unsupported benchmark, FPS, TGP, and compatibility fields null.

## Guide pages

- **Chapter checklists:** Chapter 3 has 27 reported entries including one optional mission; Chapter 4 has 25. GamesRadar redacts the final Chapter 4 title, so the secondary-source title is labeled separately. Counts are not presented as official Rockstar data.
- **Local progress:** checkbox state uses the versioned `vi-ready-guide-progress-v1:` localStorage namespace, filters unknown and other-chapter IDs, requires two clicks to reset, and never uploads progress.
- **Characters and Mandy:** Rockstar's credits support cast pairings. Mandy's fan theory is explicitly unconfirmed and separated from verified facts.
- **Money:** methods and payouts are approximate secondary-source reports, with bank/cash distinctions and patch warnings. The page explicitly excludes game files, cracks, private servers, and T3-code routes and contains no links to them. PC-port claims remain on the existing status page.

Tailwind CSS and `@tailwindcss/postcss` are intentionally pinned to 4.3.3. Newer 4.3.x dependency resolution pulled an ESM-only `magic-string` version into a CommonJS build path and broke static CSS generation.

## Switching or versioning profiles

Profiles are selected by stable ID and are rendered with their version and review date. Leonida uses its own profile selector; GTA VI currently has one unknown-reference profile.

When reliable official PC requirements become available:

1. Create a new versioned official profile rather than silently rewriting the historical profile.
2. Populate thresholds only from traceable official evidence.
3. Keep `availability` in the status data independent from hardware matching.
4. Add unit coverage for the new profile and confirm historical reports retain their original profile version.
5. Rebuild all localized pages and review source dates.

The current Rockstar evidence lists GTA VI for PS5 and Xbox Series X|S and does not establish official PC requirements or a PC release date. The recorded Leonida project site and upstream repository were unavailable during the 2026-11-24 check; its community tiers remain explicitly stale and cannot establish a playable build.

## Shared state and privacy

The checker uses a whitelist of hardware IDs, enum values, and bounded numeric parameters for share URLs. Invalid, hostile, or oversized values fall back to safe defaults. Saved specifications use a versioned localStorage schema and never store raw renderer strings or machine identifiers. Guide progress stores only whitelisted mission IDs under a separate versioned key. Language switches preserve the current page, including nested guide routes, and query parameters.

## Testing scope

Unit tests cover same-dataset benchmark comparison, null/zero handling, GTA VI Unknown policy, Leonida historical matching, independent playability status, capacity gaps, RTX 3060 variants, software renderers, URL safety, dataset validation, dictionary parity, canonical URLs, hreflang, DxDiag parsing and sensitive-field exclusion, source-check behavior, nested guide routes, evidence integrity, local progress filtering, analytics origin allowlisting, tri-state consent, location sanitization, local event suppression, and GTM/direct-GA4 dispatch.

Playwright covers the acceptance matrix in Chromium: 12 static business routes, 18 localized guide routes, 9 localized policy routes, production stylesheet loading, empty state, keyboard selection, detection fallback, low-reference explanations, benchmark gaps, Leonida non-playability, OS/Vulkan uncertainty, share recovery, language preservation, Arabic RTL, 320–1440px layouts, production-domain canonical/hreflang/sitemap output, legal-page navigation and contact links, zero local analytics requests with and without prior consent, stale evidence labels, same-profile upgrade simulation, local DxDiag import with trilingual PNG downloads, checklist persistence/reset, corrupt-progress filtering, and money-page link safety.

P2 remains out of scope. Qualitative multi-resolution performance models and laptop TGP comparisons require reliable external evidence and are not implemented. The requested guide expansion is complete; T3-code pages are intentionally excluded.

## Release verification (2026-11-24)

- Clean `npm ci` on Node.js 24.19.0 completed with zero audit vulnerabilities.
- TypeScript, ESLint, data validation, 69 unit tests, static export, and 26 Chromium acceptance tests passed.
- All 12 core pages, 18 localized guide pages, and 9 localized policy pages export without error-page markers or unresolved content placeholders.
- Browser checks covered 10 desktop/mobile English, Spanish, and Arabic route/viewport combinations plus 6 legal-page desktop/mobile combinations. Every page had zero horizontal overflow and no console/runtime errors; checklist state persisted after reload and no analytics requests were sent.
- Canonical URLs, hreflang, structured-data origins, sitemap, and robots use `https://canirungta6.online`; the generated sitemap contains 45 unique localized URLs and no provisional-domain references.
- Lighthouse 13.6.0 mobile simulation on the final local static export:

| Page | Performance | SEO | Accessibility | Best practices | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| English homepage | 99 | 100 | 100 | 100 | 0.98 s | 0 |
| Arabic RTL homepage | 96 | 100 | 100 | 100 | 1.15 s | 0 |
| English Chapter 3 checklist | 99 | 100 | 100 | 100 | 0.96 s | 0 |

Full results are recorded in `reports/lighthouse-home-mobile.json`, `reports/lighthouse-arabic-mobile.json`, and `reports/lighthouse-chapter3-mobile.json`. Visual screenshots and interaction metrics are in `reports/browser-*.png` and `reports/browser-verification.json`.

The live source check in `reports/source-check-2026-11-24.json` found 49/53 sources accessible. The four inaccessible records are the three already-stale Leonida sources and games.gg, which now records HTTP 403 and unavailable/stale state; Bilibili and Rockstar's official credits responded successfully.

Not verified in this environment: Firefox/WebKit, the live GTM/GA4 consent and tag-delivery flow, field real-user Core Web Vitals, DNS/TLS and the live `https://canirungta6.online` deployment. Local and preview zero-request behavior is covered by unit and Chromium tests. Official GTA VI PC requirements and reproducible PC benchmark evidence remain unavailable, so production capability results stay Unknown.

## Independence

VI Ready is independent and is not affiliated with, endorsed by, or operated by Rockstar Games or Take-Two Interactive. It does not host game files, keys, cracks, protection bypasses, or third-party installers.
