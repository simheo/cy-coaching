# CY Coaching Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the CY Coaching marketing site as an Astro static site with a warm "Chaleureux & Naturel" visual identity, an improved per-discipline information architecture, automated Google reviews, and a new Transformations section — deployed to GitHub Pages on the existing domain.

**Architecture:** A single Astro project at the repository root. Presentational, reusable `.astro` components compose a small set of pages. Content that changes (transformations, FAQ, pricing) lives in typed TypeScript data modules under `src/data/`. Google reviews are fetched client-side via the Maps JavaScript Places library with a static fallback. The site builds to static HTML/CSS and deploys via GitHub Actions to GitHub Pages, preserving `www.cy-coaching.com`.

**Tech Stack:** Astro 5, TypeScript, Vitest + `astro/container` (component render tests), `@fontsource-variable/fraunces` + `@fontsource/nunito-sans` (self-hosted fonts), `astro-icon` + Phosphor icons, `@astrojs/sitemap`, Formspree (contact form), Google Maps JS Places library (reviews), Google Analytics (gtag).

## Global Constraints

- **Language:** All user-facing copy in French. `<html lang="fr">`.
- **Palette (CSS variables, exact values):** `--terracotta:#c76a43`; `--terracotta-dark:#a9552f`; `--clay:#e6b98f`; `--olive:#7a8a5f`; `--cream:#f6ede1`; `--cream-2:#efe0cf`; `--ink:#3a2e26`; `--ink-soft:#5c4d42`; `--bg:#fffdfa`.
- **Fonts:** Headings `Fraunces` (weights 500/600); body `Nunito Sans` (400/600/700/800). Self-hosted via fontsource — no CDN font links.
- **Radii:** 16–24px on cards/tiles; 999px on buttons/chips.
- **Existing URLs are preserved exactly:** `/`, `/boxe`, `/a-propos`, `/tarif`, `/contact`. New pages: `/musculation`, `/self-defense`, `/coaching-entreprise`.
- **Preserved integrations:** Google Analytics gtag `G-TTRMH9G96E`; Formspree endpoint `mbjenzqk`; Instagram `https://www.instagram.com/cy.coaching/`; phone `0608703251`; email `yoann.cycoaching@gmail.com`.
- **Site URL:** `https://www.cy-coaching.com` (custom domain root, no base path).
- **Photo credibility:** transformation faces are blurred in source images — never un-blur or replace them.
- **Commit discipline:** small commits per task; Conventional Commits messages. Do NOT push (repo is local-only for now).

---

## File Structure

Created/modified in this plan:

```
astro.config.mjs               # Astro config: site, integrations (sitemap, astro-icon)
package.json / tsconfig.json    # deps + TS config
vitest.config.ts                # Vitest + Container API
.env.example                    # documents PUBLIC_GOOGLE_MAPS_API_KEY / PUBLIC_GOOGLE_PLACE_ID
public/CNAME                    # www.cy-coaching.com
public/robots.txt
public/favicon.ico              # copied from old site
src/styles/global.css           # design tokens + base element styles + shared utility classes
src/layouts/Base.astro          # <head>, GA, structured-data slot, Header + Footer wrapper
src/components/Header.astro      # sticky header, nav, Prestations dropdown, mobile burger, CTA
src/components/Footer.astro
src/components/SectionHead.astro # eyebrow + h2 + optional lede
src/components/Button.astro      # <a> styled as button (variants: solid, ghost, light)
src/components/CtaBand.astro     # photo + heading + CTA band
src/components/Hero.astro        # full-bleed hero (image + overlay + copy)
src/components/DisciplineTile.astro
src/components/AudienceCard.astro
src/components/MethodItem.astro
src/components/TransformationCard.astro
src/components/ReviewCard.astro
src/components/Reviews.astro     # client-side Google reviews island + fallback
src/components/FaqItem.astro     # <details>-based accordion
src/data/transformations.ts      # typed transformation entries
src/data/faq.ts                   # typed FAQ entries
src/data/reviews-fallback.ts      # static fallback reviews
src/lib/reviews.ts                # pure helpers: mapGoogleReview, starArray, truncateWords
src/assets/images/*               # coach photos copied + optimized from old site
src/assets/transformations/*.png  # cropped before/after photos
src/pages/index.astro             # Accueil
src/pages/boxe.astro
src/pages/musculation.astro
src/pages/self-defense.astro
src/pages/coaching-entreprise.astro
src/pages/a-propos.astro
src/pages/tarif.astro
src/pages/contact.astro
.github/workflows/deploy.yml
tests/**                          # Vitest specs mirroring components/lib
```

---

## Phase 0 — Foundation

### Task 1: Scaffold Astro project + test harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `src/pages/_healthcheck.astro`
- Test: `tests/healthcheck.test.ts`
- Modify: `.gitignore` (add `cycoaching/` so the old site stays a local reference, not committed)

**Interfaces:**
- Produces: a working `npm run build`, `npm run check`, `npm run test`; the Container API test pattern reused by all later component tasks.

- [ ] **Step 1: Add the old site to .gitignore (keep as local reference only)**

Append to `.gitignore`:

```
# Legacy site (kept locally for reference; not part of the new build)
cycoaching/
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "cy-coaching",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "astro-icon": "^1.1.5",
    "@iconify-json/ph": "^1.2.0",
    "@fontsource-variable/fraunces": "^5.1.0",
    "@fontsource/nunito-sans": "^5.1.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create config files**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://www.cy-coaching.com',
  integrations: [sitemap(), icon()],
});
```

`tsconfig.json`:

```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist", "cycoaching"] }
```

`vitest.config.ts`:

```ts
/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
export default getViteConfig({ test: { globals: true, environment: 'node' } });
```

`.env.example`:

```
# Public (exposed in client bundle) — restrict the key by HTTP referrer in Google Cloud.
PUBLIC_GOOGLE_MAPS_API_KEY=
PUBLIC_GOOGLE_PLACE_ID=
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: completes, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 5: Create a healthcheck page + write the failing test**

`src/pages/_healthcheck.astro`:

```astro
---
---
<p id="ok">ok</p>
```

`tests/healthcheck.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Healthcheck from '../src/pages/_healthcheck.astro';

test('container renders a component to string', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Healthcheck);
  expect(html).toContain('id="ok"');
});
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS (1 test). This confirms the Container API harness works.

- [ ] **Step 7: Verify build + type check**

Run: `npm run build && npm run check`
Expected: build succeeds; check reports 0 errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with Vitest container test harness"
```

---

### Task 2: Design tokens + Base layout

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`
- Test: `tests/base-layout.test.ts`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; canonical?: string; jsonLd?: object }`. Wraps page content in `<slot />` between `Header` and `Footer` (added in Tasks 3–4; until then use placeholders as noted).

- [ ] **Step 1: Create `src/styles/global.css`** (tokens + base + shared utilities reused by every page)

```css
:root{
  --terracotta:#c76a43; --terracotta-dark:#a9552f; --clay:#e6b98f; --olive:#7a8a5f;
  --cream:#f6ede1; --cream-2:#efe0cf; --ink:#3a2e26; --ink-soft:#5c4d42; --bg:#fffdfa;
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Nunito Sans',sans-serif;color:var(--ink);background:var(--bg);line-height:1.6;}
h1,h2,h3{font-family:'Fraunces Variable',serif;font-weight:600;line-height:1.08;color:var(--ink);}
img{display:block;max-width:100%;}
a{color:inherit;}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--terracotta);font-weight:700;}
.section{padding:80px 0;}
.section-head{text-align:center;max-width:660px;margin:0 auto 48px;}
.section-head h2{font-size:40px;margin-top:10px;}
.section-head p{color:var(--ink-soft);margin-top:14px;font-size:17px;}
@media(max-width:900px){.section-head h2{font-size:30px;}}
```

- [ ] **Step 2: Write the failing test**

`tests/base-layout.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Base from '../src/layouts/Base.astro';

test('Base sets lang, title, meta description and GA id', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Base, {
    props: { title: 'Titre test', description: 'Desc test' },
    slots: { default: '<main>contenu</main>' },
  });
  expect(html).toContain('lang="fr"');
  expect(html).toContain('<title>Titre test</title>');
  expect(html).toContain('Desc test');
  expect(html).toContain('G-TTRMH9G96E');
  expect(html).toContain('contenu');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test -- base-layout`
Expected: FAIL (cannot find `Base.astro`).

- [ ] **Step 4: Create `src/layouts/Base.astro`**

```astro
---
import '@fontsource-variable/fraunces';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props { title: string; description: string; canonical?: string; jsonLd?: object; }
const { title, description, canonical, jsonLd } = Astro.props;
const canonicalURL = canonical ?? new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  {jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-TTRMH9G96E"></script>
  <script is:inline>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-TTRMH9G96E');
  </script>
</head>
<body>
  <Header />
  <slot />
  <Footer />
</body>
</html>
```

- [ ] **Step 5: Create temporary stubs so the layout compiles**

Create `src/components/Header.astro` with body `<header></header>` and `src/components/Footer.astro` with `<footer></footer>` (replaced in Tasks 3–4).

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test -- base-layout`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and Base layout with SEO head + GA"
```

---

## Phase 1 — Shared chrome & UI

### Task 3: Header (nav, Prestations dropdown, mobile burger, CTA)

**Files:**
- Modify: `src/components/Header.astro`
- Test: `tests/header.test.ts`

**Interfaces:**
- Produces: `Header.astro` (no props). Renders links to `/`, `/musculation`, `/boxe`, `/self-defense`, `/coaching-entreprise`, `/a-propos`, `/tarif`, `/contact`, plus a "Séance offerte" CTA to `/contact`.

- [ ] **Step 1: Write the failing test**

`tests/header.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from '../src/components/Header.astro';

test('header exposes all nav destinations and the CTA', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header);
  for (const href of ['/','/musculation','/boxe','/self-defense','/coaching-entreprise','/a-propos','/tarif','/contact']) {
    expect(html).toContain(`href="${href}"`);
  }
  expect(html).toContain('Séance offerte');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- header`
Expected: FAIL (assertions not met — stub is empty).

- [ ] **Step 3: Implement `src/components/Header.astro`**

```astro
---
const nav = [
  { href: '/', label: 'Accueil' },
  { href: '/musculation', label: 'Musculation' },
  { href: '/boxe', label: 'Boxe' },
  { href: '/self-defense', label: 'Self-défense' },
  { href: '/coaching-entreprise', label: 'Entreprises' },
  { href: '/a-propos', label: 'Qui suis-je ?' },
  { href: '/tarif', label: 'Tarifs' },
];
---
<header>
  <div class="wrap bar">
    <a href="/" class="logo">CY<span>·</span>Coaching</a>
    <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Menu" />
    <label for="nav-toggle" class="burger"><span></span></label>
    <nav class="menu">
      <ul>
        {nav.map((n) => <li><a href={n.href}>{n.label}</a></li>)}
      </ul>
    </nav>
    <a href="/contact" class="cta">Séance offerte</a>
  </div>
</header>

<style>
  header{position:sticky;top:0;z-index:30;background:rgba(255,253,250,.92);backdrop-filter:blur(8px);border-bottom:1px solid #efe3d5;}
  .bar{display:flex;align-items:center;justify-content:space-between;height:74px;gap:20px;}
  .logo{font-family:'Fraunces Variable',serif;font-weight:600;font-size:22px;text-decoration:none;}
  .logo span{color:var(--terracotta);}
  .menu ul{display:flex;gap:26px;list-style:none;}
  .menu a{text-decoration:none;color:var(--ink-soft);font-weight:600;font-size:15px;}
  .menu a:hover{color:var(--terracotta);}
  .cta{display:inline-block;background:var(--terracotta);color:#fff;padding:11px 20px;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap;}
  .cta:hover{background:var(--terracotta-dark);}
  .nav-toggle,.burger{display:none;}
  @media(max-width:960px){
    .burger{display:block;cursor:pointer;width:26px;height:20px;position:relative;}
    .burger span,.burger span::before,.burger span::after{content:'';position:absolute;left:0;width:100%;height:2px;background:var(--ink);border-radius:2px;transition:.2s;}
    .burger span{top:9px;} .burger span::before{top:-7px;} .burger span::after{top:7px;}
    .menu{position:absolute;top:74px;left:0;right:0;background:var(--bg);border-bottom:1px solid #efe3d5;max-height:0;overflow:hidden;transition:max-height .25s;}
    .menu ul{flex-direction:column;gap:0;padding:0 24px;}
    .menu li{padding:14px 0;border-top:1px solid #f0e6d8;}
    .nav-toggle:checked ~ .menu{max-height:60vh;}
    .cta{margin-left:auto;}
  }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- header`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sticky header with responsive nav and CTA"
```

---

### Task 4: Footer

**Files:**
- Modify: `src/components/Footer.astro`
- Test: `tests/footer.test.ts`

**Interfaces:**
- Produces: `Footer.astro` (no props). Renders nav links, phone, email (mailto), Instagram.

- [ ] **Step 1: Write the failing test**

`tests/footer.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Footer from '../src/components/Footer.astro';

test('footer shows contact channels', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer);
  expect(html).toContain('instagram.com/cy.coaching');
  expect(html).toContain('mailto:yoann.cycoaching@gmail.com');
  expect(html).toContain('0608703251');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- footer`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/Footer.astro`**

```astro
---
const nav = [
  { href: '/', label: 'Accueil' }, { href: '/boxe', label: 'Boxe' },
  { href: '/a-propos', label: 'Qui suis-je ?' }, { href: '/tarif', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
];
---
<footer>
  <div class="wrap grid">
    <div>
      <div class="logo">CY<span>·</span>Coaching</div>
      <p class="tag">Coach sportif à domicile ou en salle à Toulouse et alentours.</p>
    </div>
    <nav><h4>Navigation</h4>{nav.map((n)=><a href={n.href}>{n.label}</a>)}</nav>
    <div><h4>Contact</h4>
      <a href="tel:0608703251">06 08 70 32 51</a>
      <a href="mailto:yoann.cycoaching@gmail.com">yoann.cycoaching@gmail.com</a>
      <a href="https://www.instagram.com/cy.coaching/" target="_blank" rel="noopener">@cy.coaching</a>
    </div>
  </div>
</footer>
<style>
  footer{background:var(--ink);color:#e8ddce;padding:56px 0 30px;margin-top:80px;}
  .grid{display:flex;justify-content:space-between;gap:30px;flex-wrap:wrap;}
  .logo{font-family:'Fraunces Variable',serif;font-size:24px;color:#fff;} .logo span{color:var(--clay);}
  .tag{opacity:.7;margin-top:12px;font-size:14px;max-width:26ch;}
  h4{font-family:'Nunito Sans';text-transform:uppercase;letter-spacing:.1em;font-size:12px;margin-bottom:16px;opacity:.6;}
  footer a{display:block;color:#e8ddce;text-decoration:none;margin-bottom:8px;font-size:15px;opacity:.85;}
  footer a:hover{opacity:1;}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- footer`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add site footer with contact channels"
```

---

### Task 5: Presentational primitives — Button, SectionHead, CtaBand

**Files:**
- Create: `src/components/Button.astro`, `src/components/SectionHead.astro`, `src/components/CtaBand.astro`
- Test: `tests/primitives.test.ts`

**Interfaces:**
- Produces:
  - `Button.astro` props `{ href: string; variant?: 'solid'|'ghost'|'light' }`, renders `<a class="btn btn--{variant}">` with slot label.
  - `SectionHead.astro` props `{ eyebrow?: string; title: string; lede?: string }`.
  - `CtaBand.astro` props `{ title: string; text: string; href?: string; cta?: string }`.

- [ ] **Step 1: Write the failing test**

`tests/primitives.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Button from '../src/components/Button.astro';
import SectionHead from '../src/components/SectionHead.astro';
import CtaBand from '../src/components/CtaBand.astro';

test('Button renders anchor with variant class and label', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Button, { props: { href: '/contact', variant: 'ghost' }, slots: { default: 'Clique' } });
  expect(html).toContain('href="/contact"');
  expect(html).toContain('btn--ghost');
  expect(html).toContain('Clique');
});

test('SectionHead renders eyebrow, title, lede', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(SectionHead, { props: { eyebrow: 'Pour qui', title: 'À qui je m’adresse', lede: 'Peu importe le départ.' } });
  expect(html).toContain('Pour qui');
  expect(html).toContain('À qui je m’adresse');
  expect(html).toContain('Peu importe le départ.');
});

test('CtaBand renders title and cta link', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(CtaBand, { props: { title: 'Prêt ?', text: 'Séance offerte.', href: '/contact', cta: 'Réserver' } });
  expect(html).toContain('Prêt ?');
  expect(html).toContain('href="/contact"');
  expect(html).toContain('Réserver');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- primitives`
Expected: FAIL (components missing).

- [ ] **Step 3: Implement the three components**

`src/components/Button.astro`:

```astro
---
interface Props { href: string; variant?: 'solid'|'ghost'|'light'; }
const { href, variant='solid' } = Astro.props;
---
<a href={href} class={`btn btn--${variant}`}><slot /></a>
<style>
  .btn{display:inline-block;padding:14px 26px;border-radius:999px;font-weight:700;font-size:15px;text-decoration:none;transition:transform .2s,background .2s;}
  .btn:hover{transform:translateY(-2px);}
  .btn--solid{background:var(--terracotta);color:#fff;} .btn--solid:hover{background:var(--terracotta-dark);}
  .btn--ghost{background:transparent;color:var(--ink);border:2px solid var(--ink);}
  .btn--light{background:#fff;color:var(--terracotta);}
</style>
```

`src/components/SectionHead.astro`:

```astro
---
interface Props { eyebrow?: string; title: string; lede?: string; }
const { eyebrow, title, lede } = Astro.props;
---
<div class="section-head">
  {eyebrow && <div class="eyebrow">{eyebrow}</div>}
  <h2>{title}</h2>
  {lede && <p>{lede}</p>}
</div>
```

`src/components/CtaBand.astro`:

```astro
---
import Button from './Button.astro';
interface Props { title: string; text: string; href?: string; cta?: string; }
const { title, text, href='/contact', cta='Réserver ma séance offerte' } = Astro.props;
---
<section class="section" style="padding-top:0;">
  <div class="wrap band">
    <h2>{title}</h2>
    <p>{text}</p>
    <Button href={href} variant="light">{cta}</Button>
  </div>
</section>
<style>
  .band{background:var(--terracotta);color:#fff;border-radius:28px;padding:56px 24px;text-align:center;}
  .band h2{color:#fff;font-size:38px;}
  .band p{margin:14px auto 26px;max-width:46ch;opacity:.95;font-size:17px;}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- primitives`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Button, SectionHead, CtaBand primitives"
```

---

## Phase 2 — Assets & data

### Task 6: Import & optimize images from the old site

**Files:**
- Create: `src/assets/images/` (copied JPGs)
- Copy: `public/favicon.ico`

**Interfaces:**
- Produces: image files importable via `astro:assets` in later tasks. Names preserved from the old site (e.g. `image_accueil.jpg`, `photo-profil.jpg`, `a-propos.jpg`, `contact.jpg`, `boxe-profil.jpg`, `boxe-groupe.jpg`, `boxe-solo.jpg`, `self-defense-coaching.jpg`, `coaching-individuel.jpg`, `coaching-groupe.jpg`).

- [ ] **Step 1: Copy images and favicon**

Run:

```bash
mkdir -p src/assets/images public
cp cycoaching/static/assets/img/*.jpg src/assets/images/
cp cycoaching/static/assets/img/favicon.ico public/favicon.ico
ls src/assets/images
```

Expected: the JPGs listed above are present.

- [ ] **Step 2: Verify build still passes** (Astro validates asset imports only when used, so just ensure nothing broke)

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: import coach photos and favicon from legacy site"
```

---

### Task 7: Crop & import transformation photos + typed data

**Files:**
- Create: `src/assets/transformations/transfo-1.png` … `transfo-6.png`
- Create: `src/data/transformations.ts`
- Test: `tests/transformations-data.test.ts`

**Interfaces:**
- Produces: `transformations` — `readonly Transformation[]` where
  `interface Transformation { id: number; image: ImageMetadata; title: string; freq: string; tag: string; badge?: string; }`
  (import type from `astro`). Consumed by `TransformationCard`/`Reviews`/pages.

- [ ] **Step 1: Crop the six source photos (removes baked-in blue/yellow banner + frame)**

Run:

```bash
mkdir -p src/assets/transformations
cd "Transformations Physiques 6png"
for n in 1 2 3 4 5 6; do
  ffmpeg -y -loglevel error -i $n.png -vf "crop=1066:840:7:6" "../src/assets/transformations/transfo-$n.png"
done
cd ..
ls src/assets/transformations
```

Expected: six `transfo-N.png` files (1066×840).

- [ ] **Step 2: Write the failing test**

`tests/transformations-data.test.ts`:

```ts
import { expect, test } from 'vitest';
import { transformations } from '../src/data/transformations';

test('there are 6 transformations, each fully described', () => {
  expect(transformations).toHaveLength(6);
  for (const t of transformations) {
    expect(t.image.src).toBeTruthy();
    expect(t.title.length).toBeGreaterThan(0);
    expect(t.freq.length).toBeGreaterThan(0);
    expect(t.tag.length).toBeGreaterThan(0);
  }
});

test('two entries carry an age/profile badge', () => {
  expect(transformations.filter((t) => t.badge).length).toBe(3);
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test -- transformations-data`
Expected: FAIL (module missing).

- [ ] **Step 4: Create `src/data/transformations.ts`**

```ts
import type { ImageMetadata } from 'astro';
import t1 from '../assets/transformations/transfo-1.png';
import t2 from '../assets/transformations/transfo-2.png';
import t3 from '../assets/transformations/transfo-3.png';
import t4 from '../assets/transformations/transfo-4.png';
import t5 from '../assets/transformations/transfo-5.png';
import t6 from '../assets/transformations/transfo-6.png';

export interface Transformation {
  id: number; image: ImageMetadata; title: string; freq: string; tag: string; badge?: string;
}

export const transformations: readonly Transformation[] = [
  { id: 1, image: t1, title: 'Perte de 8 kg en 1 an', freq: '2 séances par semaine', tag: 'Remise en forme', badge: '60 ans' },
  { id: 2, image: t2, title: 'Perte de 7,3 kg en 3 mois', freq: '3 séances par semaine', tag: 'Perte de poids' },
  { id: 3, image: t3, title: 'Recomposition corporelle', freq: 'en 4 mois', tag: 'Recomposition', badge: '60 ans' },
  { id: 4, image: t4, title: 'Prise de 4 kg en 3 mois', freq: '4 séances par semaine', tag: 'Prise de masse' },
  { id: 5, image: t5, title: 'Prise de 2 kg en 2 mois', freq: 'Préparation physique', tag: 'Performance', badge: 'Danseur pro' },
  { id: 6, image: t6, title: '+2,2 kg & +7 cm de fessiers', freq: '4 séances par semaine', tag: 'Renforcement' },
];
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm run test -- transformations-data`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: crop transformation photos and add typed transformation data"
```

---

### Task 8: FAQ + fallback-reviews data

**Files:**
- Create: `src/data/faq.ts`, `src/data/reviews-fallback.ts`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces:
  - `faq` — `readonly { q: string; a: string }[]`.
  - `fallbackReviews` — `readonly { author: string; rating: number; text: string }[]` (the 5 best current Google reviews, used when the live API fails).

- [ ] **Step 1: Write the failing test**

`tests/data.test.ts`:

```ts
import { expect, test } from 'vitest';
import { faq } from '../src/data/faq';
import { fallbackReviews } from '../src/data/reviews-fallback';

test('faq has at least 5 complete entries', () => {
  expect(faq.length).toBeGreaterThanOrEqual(5);
  for (const f of faq) { expect(f.q).toBeTruthy(); expect(f.a).toBeTruthy(); }
});

test('fallback has exactly 5 reviews rated 1..5', () => {
  expect(fallbackReviews).toHaveLength(5);
  for (const r of fallbackReviews) { expect(r.rating).toBeGreaterThanOrEqual(1); expect(r.rating).toBeLessThanOrEqual(5); }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- data.test`
Expected: FAIL.

- [ ] **Step 3: Create the data modules**

`src/data/faq.ts`:

```ts
export const faq: readonly { q: string; a: string }[] = [
  { q: 'À domicile ou en salle ?', a: 'Les deux. J’interviens à domicile ou en salle, à Toulouse et dans ses alentours, selon ce qui vous convient le mieux.' },
  { q: 'Faut-il déjà être en forme ou avoir du matériel ?', a: 'Non. Je m’adapte à votre niveau de départ et je construis les séances avec ce que vous avez. On progresse pas à pas.' },
  { q: 'Comment se passe la première séance ?', a: 'La première séance est offerte : on fait connaissance, on parle de vos objectifs et on pose ensemble les bases d’un plan sur mesure.' },
  { q: 'À quelle fréquence s’entraîner pour voir des résultats ?', a: '2 à 4 séances par semaine donnent d’excellents résultats, comme le montrent les transformations. On cale un rythme réaliste pour votre vie.' },
  { q: 'Proposez-vous des séances en petit groupe ou en entreprise ?', a: 'Oui : mini-groupes de 2 à 5 personnes, et interventions en entreprise pour le bien-être et la cohésion des équipes.' },
  { q: 'Comment fonctionnent les programmes à distance ?', a: 'Vous recevez une programmation adaptée à votre objectif, avec des retours réguliers. Trois formules existent, de la découverte au suivi confirmé.' },
];
```

`src/data/reviews-fallback.ts` (curated from existing Google reviews):

```ts
export const fallbackReviews: readonly { author: string; rating: number; text: string }[] = [
  { author: 'Orane Z.', rating: 5, text: 'Yoann m’a fait énormément progresser dans la musculation, toujours avec sourire et bonne humeur. Honnête, plein d’énergie et passionné par ce qu’il fait.' },
  { author: 'Elodie C.', rating: 5, text: 'Rapidement en confiance même pour les novices. Bienveillance naturelle, patience, et des progrès palpables et réels. Je recommande les yeux fermés.' },
  { author: 'Virginie P.', rating: 5, text: 'À l’écoute de nos demandes et de nos besoins, il s’adapte à nos objectifs et difficultés. J’ai atteint mes objectifs et vu mon corps évoluer.' },
  { author: 'Julien T.', rating: 5, text: 'Un super coach qui a parfaitement compris mes attentes et objectifs. Avenant et de bonne humeur, ce qui rend les séances vraiment top !' },
  { author: 'Clara M.', rating: 5, text: 'Très professionnel, Yoann saura vous mettre à l’aise et s’adapter peu importe votre niveau. On se sent plus armé dès la première séance.' },
];
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- data.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add FAQ content and fallback reviews data"
```

---

## Phase 3 — Content components

### Task 9: Content tiles — DisciplineTile, AudienceCard, MethodItem

**Files:**
- Create: `src/components/DisciplineTile.astro`, `src/components/AudienceCard.astro`, `src/components/MethodItem.astro`
- Test: `tests/tiles.test.ts`

**Interfaces:**
- Produces:
  - `DisciplineTile.astro` props `{ image: ImageMetadata; title: string; text: string; href: string }` (uses `astro:assets` `<Image>`).
  - `AudienceCard.astro` props `{ icon: string; title: string; text: string }` (`icon` = Phosphor name, e.g. `ph:buildings`).
  - `MethodItem.astro` props `{ icon: string; title: string; text: string }`.

- [ ] **Step 1: Write the failing test**

`tests/tiles.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AudienceCard from '../src/components/AudienceCard.astro';
import MethodItem from '../src/components/MethodItem.astro';

test('AudienceCard renders title and text', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(AudienceCard, { props: { icon: 'ph:heartbeat', title: 'Remise en forme', text: 'Retrouver de l’énergie.' } });
  expect(html).toContain('Remise en forme');
  expect(html).toContain('Retrouver de l’énergie.');
});

test('MethodItem renders title and text', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(MethodItem, { props: { icon: 'ph:flask', title: 'Basée sur la science', text: 'Selon les dernières études.' } });
  expect(html).toContain('Basée sur la science');
});
```

*(DisciplineTile uses `<Image>`, which needs a real ImageMetadata import; it is covered indirectly by the page build in Task 12. Unit-test the two icon cards here.)*

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- tiles`
Expected: FAIL.

- [ ] **Step 3: Implement the three components**

`src/components/AudienceCard.astro`:

```astro
---
import { Icon } from 'astro-icon/components';
interface Props { icon: string; title: string; text: string; }
const { icon, title, text } = Astro.props;
---
<div class="card">
  <div class="ic"><Icon name={icon} width={26} height={26} /></div>
  <h3>{title}</h3>
  <p>{text}</p>
</div>
<style>
  .card{background:#fff;border:1px solid #f0e6d8;border-radius:20px;padding:30px 24px;transition:transform .2s,box-shadow .2s;height:100%;}
  .card:hover{transform:translateY(-6px);box-shadow:0 16px 36px rgba(58,46,38,.12);}
  .ic{width:56px;height:56px;border-radius:16px;background:var(--cream);display:flex;align-items:center;justify-content:center;color:var(--terracotta);margin-bottom:18px;}
  h3{font-size:20px;margin-bottom:10px;} p{font-size:15px;color:var(--ink-soft);}
</style>
```

`src/components/MethodItem.astro`:

```astro
---
import { Icon } from 'astro-icon/components';
interface Props { icon: string; title: string; text: string; }
const { icon, title, text } = Astro.props;
---
<div class="mitem">
  <div class="mic"><Icon name={icon} width={20} height={20} /></div>
  <div><h3>{title}</h3><p>{text}</p></div>
</div>
<style>
  .mitem{display:flex;gap:16px;}
  .mic{flex:0 0 44px;height:44px;border-radius:12px;background:var(--terracotta);color:#fff;display:flex;align-items:center;justify-content:center;}
  h3{font-size:18px;margin-bottom:2px;} p{font-size:14.5px;color:var(--ink-soft);}
</style>
```

`src/components/DisciplineTile.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
interface Props { image: ImageMetadata; title: string; text: string; href: string; }
const { image, title, text, href } = Astro.props;
---
<a class="tile" href={href}>
  <Image src={image} alt={title} width={480} height={560} />
  <div class="cap"><h3>{title}</h3><p>{text}</p></div>
</a>
<style>
  .tile{position:relative;display:block;border-radius:22px;overflow:hidden;height:360px;box-shadow:0 12px 30px rgba(58,46,38,.14);text-decoration:none;}
  .tile img{width:100%;height:100%;object-fit:cover;transition:transform .5s;}
  .tile:hover img{transform:scale(1.06);}
  .tile::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(58,46,38,0) 40%,rgba(58,46,38,.85) 100%);}
  .cap{position:absolute;z-index:2;bottom:0;padding:24px;color:#fff;}
  .cap h3{color:#fff;font-size:24px;} .cap p{font-size:14px;opacity:.9;margin-top:4px;}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- tiles`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add discipline tile, audience card, method item components"
```

---

### Task 10: Hero + TransformationCard

**Files:**
- Create: `src/components/Hero.astro`, `src/components/TransformationCard.astro`
- Test: `tests/transformation-card.test.ts`

**Interfaces:**
- Produces:
  - `Hero.astro` props `{ image: ImageMetadata; eyebrow: string; title: string; lede: string }` with two CTA slots via fixed buttons to `/contact` and `#methode`.
  - `TransformationCard.astro` props `{ t: Transformation }` (type from `src/data/transformations.ts`).

- [ ] **Step 1: Write the failing test**

`tests/transformation-card.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TransformationCard from '../src/components/TransformationCard.astro';
import { transformations } from '../src/data/transformations';

test('card shows title, freq, tag, before/after labels and badge when present', async () => {
  const c = await AstroContainer.create();
  const withBadge = transformations.find((t) => t.badge)!;
  const html = await c.renderToString(TransformationCard, { props: { t: withBadge } });
  expect(html).toContain(withBadge.title);
  expect(html).toContain(withBadge.freq);
  expect(html).toContain(withBadge.tag);
  expect(html).toContain('Avant');
  expect(html).toContain('Après');
  expect(html).toContain(withBadge.badge!);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- transformation-card`
Expected: FAIL.

- [ ] **Step 3: Implement both components**

`src/components/TransformationCard.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { Transformation } from '../data/transformations';
interface Props { t: Transformation; }
const { t } = Astro.props;
---
<article class="tcard">
  <div class="tphoto">
    <span class="ba before">Avant</span><span class="ba after">Après</span>
    <Image src={t.image} alt={`Transformation — ${t.title}`} width={533} height={420} />
    {t.badge && <span class="badge">{t.badge}</span>}
  </div>
  <div class="tcap"><h3>{t.title}</h3><div class="freq">{t.freq}</div><span class="tag">{t.tag}</span></div>
</article>
<style>
  .tcard{background:#fff;border:1px solid #f0e6d8;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(58,46,38,.08);transition:transform .2s,box-shadow .2s;}
  .tcard:hover{transform:translateY(-5px);box-shadow:0 16px 36px rgba(58,46,38,.14);}
  .tphoto{position:relative;aspect-ratio:1066/840;background:var(--cream-2);}
  .tphoto img{width:100%;height:100%;object-fit:cover;}
  .ba{position:absolute;top:12px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:rgba(58,46,38,.72);padding:4px 10px;border-radius:999px;}
  .ba.before{left:12px;} .ba.after{right:12px;background:var(--terracotta);}
  .badge{position:absolute;bottom:12px;right:12px;background:var(--olive);color:#fff;font-weight:800;font-size:12px;padding:6px 12px;border-radius:999px;}
  .tcap{padding:20px 22px 24px;}
  .tcap h3{font-size:23px;} .tcap .freq{color:var(--ink-soft);font-size:14.5px;font-style:italic;margin-top:4px;}
  .tcap .tag{display:inline-block;margin-top:12px;font-size:12px;font-weight:700;color:var(--terracotta);background:var(--cream);padding:5px 12px;border-radius:999px;}
</style>
```

`src/components/Hero.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import Button from './Button.astro';
interface Props { image: ImageMetadata; eyebrow: string; title: string; lede: string; }
const { image, eyebrow, title, lede } = Astro.props;
---
<section class="hero">
  <Image class="hero-bg" src={image} alt="" width={1600} height={1000} />
  <div class="wrap inner">
    <div class="eyebrow light">{eyebrow}</div>
    <h1 set:html={title} />
    <p class="lede">{lede}</p>
    <div class="ctas">
      <Button href="/contact">Réserver ma séance offerte</Button>
      <Button href="#methode" variant="ghost">Découvrir la méthode</Button>
    </div>
    <div class="trust"><span class="stars">★★★★★</span> 5,0 · plus de 15 avis clients</div>
  </div>
</section>
<style>
  .hero{position:relative;min-height:82vh;display:flex;align-items:center;color:#fff;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 28%;}
  .hero::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(58,46,38,.82),rgba(58,46,38,.55) 45%,rgba(58,46,38,.15));}
  .inner{position:relative;z-index:2;padding:60px 24px;}
  .eyebrow.light{color:var(--clay);}
  .hero h1{font-size:60px;color:#fff;margin-top:16px;}
  .lede{font-size:20px;margin:22px 0 32px;max-width:32ch;color:#f3e8dc;}
  .ctas{display:flex;gap:14px;flex-wrap:wrap;}
  .hero :global(.btn--ghost){color:#fff;border-color:rgba(255,255,255,.7);}
  .trust{display:flex;gap:12px;margin-top:28px;color:#f3e8dc;font-size:14px;}
  .stars{color:#f0c04b;letter-spacing:2px;}
  @media(max-width:900px){.hero h1{font-size:40px;} .hero::after{background:linear-gradient(180deg,rgba(58,46,38,.4),rgba(58,46,38,.85));}}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- transformation-card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Hero and TransformationCard components"
```

---

### Task 11: Reviews logic + ReviewCard + Reviews island

**Files:**
- Create: `src/lib/reviews.ts`, `src/components/ReviewCard.astro`, `src/components/Reviews.astro`
- Test: `tests/reviews.test.ts`

**Interfaces:**
- Produces:
  - `src/lib/reviews.ts`:
    - `truncateWords(text: string, max: number): string` — first `max` words, appends `…` if truncated.
    - `starArray(rating: number): number[]` — `[1..round(rating)]` capped at 5.
    - `mapGoogleReview(r: { author_name: string; rating: number; text: string }): { author: string; rating: number; text: string }`.
  - `ReviewCard.astro` props `{ author: string; rating: number; text: string }`.
  - `Reviews.astro` (no props) — renders fallback markup server-side, then a client script that swaps in live Google reviews when the API + key are available.

- [ ] **Step 1: Write the failing test (pure logic — strict TDD)**

`tests/reviews.test.ts`:

```ts
import { expect, test } from 'vitest';
import { truncateWords, starArray, mapGoogleReview } from '../src/lib/reviews';

test('truncateWords keeps short text unchanged', () => {
  expect(truncateWords('a b c', 5)).toBe('a b c');
});
test('truncateWords cuts and adds ellipsis', () => {
  expect(truncateWords('a b c d e f', 3)).toBe('a b c…');
});
test('starArray rounds and caps at 5', () => {
  expect(starArray(5)).toHaveLength(5);
  expect(starArray(4.6)).toHaveLength(5);
  expect(starArray(3.2)).toHaveLength(3);
  expect(starArray(9)).toHaveLength(5);
});
test('mapGoogleReview normalizes field names', () => {
  expect(mapGoogleReview({ author_name: 'Jean D.', rating: 5, text: 'Top' }))
    .toEqual({ author: 'Jean D.', rating: 5, text: 'Top' });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- reviews`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `src/lib/reviews.ts`**

```ts
export function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return words.join(' ');
  return words.slice(0, max).join(' ') + '…';
}

export function starArray(rating: number): number[] {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return Array.from({ length: n }, (_, i) => i + 1);
}

export function mapGoogleReview(r: { author_name: string; rating: number; text: string }) {
  return { author: r.author_name, rating: r.rating, text: r.text };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- reviews`
Expected: PASS (4 tests).

- [ ] **Step 5: Implement `src/components/ReviewCard.astro`**

```astro
---
import { starArray, truncateWords } from '../lib/reviews';
interface Props { author: string; rating: number; text: string; }
const { author, rating, text } = Astro.props;
---
<article class="rev">
  <div class="stars">{starArray(rating).map(() => '★').join('')}</div>
  <p>{truncateWords(text, 40)}</p>
  <div class="who">{author}</div>
</article>
<style>
  .rev{background:#fff;border:1px solid #f0e6d8;border-radius:20px;padding:26px;}
  .stars{color:#e0a63c;letter-spacing:2px;margin-bottom:12px;}
  p{font-size:15px;color:var(--ink-soft);font-style:italic;}
  .who{margin-top:16px;font-weight:800;}
</style>
```

- [ ] **Step 6: Implement `src/components/Reviews.astro`** (SSR fallback + progressive live swap)

```astro
---
import ReviewCard from './ReviewCard.astro';
import { fallbackReviews } from '../data/reviews-fallback';
const key = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
const placeId = import.meta.env.PUBLIC_GOOGLE_PLACE_ID;
---
<section class="section reviews">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">Ils m’ont fait confiance</div>
      <h2>Des sourires, des résultats</h2>
    </div>
    <div class="rev-grid" id="reviews-grid">
      {fallbackReviews.map((r) => <ReviewCard author={r.author} rating={r.rating} text={r.text} />)}
    </div>
  </div>
</section>

{key && placeId && (
  <script is:inline define:vars={{ key, placeId }}>
    // Live Google reviews via the Maps JS Places library (max 5). Falls back silently to SSR cards on any error.
    (function () {
      function truncate(t, m){var w=t.trim().split(/\s+/);return w.length<=m?w.join(' '):w.slice(0,m).join(' ')+'…';}
      function render(reviews){
        var grid=document.getElementById('reviews-grid'); if(!grid||!reviews||!reviews.length) return;
        grid.innerHTML=reviews.slice(0,5).map(function(r){
          var stars='★'.repeat(Math.min(5,Math.round(r.rating)));
          return '<article class="rev"><div class="stars">'+stars+'</div><p>'+truncate(r.text||'',40)+'</p><div class="who">'+(r.author_name||'')+'</div></article>';
        }).join('');
      }
      window.__initReviews=function(){
        try{
          var svc=new google.maps.places.PlacesService(document.createElement('div'));
          svc.getDetails({placeId:placeId,fields:['reviews'],language:'fr'},function(place,status){
            if(status===google.maps.places.PlacesServiceStatus.OK && place && place.reviews) render(place.reviews);
          });
        }catch(e){/* keep fallback */}
      };
      var s=document.createElement('script');
      s.src='https://maps.googleapis.com/maps/api/js?key='+key+'&libraries=places&language=fr&callback=__initReviews';
      s.async=true; document.head.appendChild(s);
    })();
  </script>
)}

<style>
  .reviews{background:var(--cream);}
  .rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  @media(max-width:900px){.rev-grid{grid-template-columns:1fr;}}
  /* card styles duplicated for injected markup */
  .rev-grid :global(.rev){background:#fff;border:1px solid #f0e6d8;border-radius:20px;padding:26px;}
  .rev-grid :global(.stars){color:#e0a63c;letter-spacing:2px;margin-bottom:12px;}
  .rev-grid :global(.rev p){font-size:15px;color:var(--ink-soft);font-style:italic;}
  .rev-grid :global(.who){margin-top:16px;font-weight:800;}
</style>
```

- [ ] **Step 7: Verify build + tests**

Run: `npm run build && npm run test`
Expected: build success; all tests pass. (Live reviews are only wired when env vars are set; unset in CI, so the fallback renders — this is intended.)

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add reviews logic, ReviewCard, and live-reviews island with fallback"
```

---

### Task 12: FaqItem component

**Files:**
- Create: `src/components/FaqItem.astro`
- Test: `tests/faq-item.test.ts`

**Interfaces:**
- Produces: `FaqItem.astro` props `{ q: string; a: string }` using native `<details>/<summary>` (accessible, zero-JS accordion).

- [ ] **Step 1: Write the failing test**

`tests/faq-item.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import FaqItem from '../src/components/FaqItem.astro';

test('FaqItem renders question and answer in details/summary', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(FaqItem, { props: { q: 'À domicile ?', a: 'Oui, à Toulouse.' } });
  expect(html).toContain('<details');
  expect(html).toContain('À domicile ?');
  expect(html).toContain('Oui, à Toulouse.');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- faq-item`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/FaqItem.astro`**

```astro
---
interface Props { q: string; a: string; }
const { q, a } = Astro.props;
---
<details class="faq">
  <summary>{q}<span class="chev">＋</span></summary>
  <p>{a}</p>
</details>
<style>
  .faq{background:#fff;border:1px solid #f0e6d8;border-radius:16px;padding:4px 22px;margin-bottom:12px;}
  summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;font-weight:700;font-size:17px;}
  summary::-webkit-details-marker{display:none;}
  .chev{color:var(--terracotta);font-size:22px;transition:transform .2s;}
  details[open] .chev{transform:rotate(45deg);}
  .faq p{color:var(--ink-soft);padding:0 0 20px;font-size:15.5px;}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- faq-item`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add accessible FAQ accordion item"
```

---

## Phase 4 — Pages

### Task 13: Homepage (`/`)

**Files:**
- Create: `src/pages/index.astro`
- Test: `tests/pages-build.test.ts` (created here, extended by later page tasks)

**Interfaces:**
- Consumes: `Base`, `Hero`, `SectionHead`, `DisciplineTile`, `AudienceCard`, `MethodItem`, `TransformationCard`, `Reviews`, `FaqItem`, `CtaBand`; images from `src/assets/images`; `transformations`, `faq` data.

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import SectionHead from '../components/SectionHead.astro';
import DisciplineTile from '../components/DisciplineTile.astro';
import AudienceCard from '../components/AudienceCard.astro';
import MethodItem from '../components/MethodItem.astro';
import TransformationCard from '../components/TransformationCard.astro';
import Reviews from '../components/Reviews.astro';
import FaqItem from '../components/FaqItem.astro';
import CtaBand from '../components/CtaBand.astro';
import { transformations } from '../data/transformations';
import { faq } from '../data/faq';

import heroImg from '../assets/images/image_accueil.jpg';
import muscuImg from '../assets/images/coaching-individuel.jpg';
import boxeImg from '../assets/images/boxe-profil.jpg';
import selfImg from '../assets/images/self-defense-coaching.jpg';
import methodImg from '../assets/images/coaching-groupe.jpg';
import aboutImg from '../assets/images/a-propos.jpg';

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'CY Coaching',
  description: 'Coach sportif à Toulouse : musculation, boxe pieds-poings et self-défense.',
  areaServed: 'Toulouse', telephone: '+33608703251', url: 'https://www.cy-coaching.com',
  sameAs: ['https://www.instagram.com/cy.coaching/'],
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '15' },
};
---
<Base title="Coach Sportif à Toulouse — CY Coaching"
      description="CY Coaching, coach sportif à Toulouse : musculation, remise en forme, boxe pieds-poings et self-défense féminine. Progressez avec le sourire — première séance offerte."
      jsonLd={jsonLd}>
  <Hero image={heroImg} eyebrow="Coach sportif · Toulouse"
        title="Progresser<br>avec le sourire"
        lede="Musculation, boxe pieds-poings et self-défense — un accompagnement sur mesure, dans la bienveillance et la bonne humeur." />

  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Mes spécialités" title="Trois façons de se dépasser" lede="Chaque pratique, adaptée à votre niveau et à vos envies." />
      <div class="disc-grid">
        <DisciplineTile image={muscuImg} title="Musculation" text="Recomposition, remise en forme, prise de masse." href="/musculation" />
        <DisciplineTile image={boxeImg} title="Boxe pieds-poings" text="Technique, cardio et défoulement dans la bonne humeur." href="/boxe" />
        <DisciplineTile image={selfImg} title="Self-défense" text="Pour les femmes : confiance et réflexes." href="/self-defense" />
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0;">
    <div class="wrap">
      <SectionHead eyebrow="Pour qui ?" title="À qui je m’adresse" lede="Quel que soit votre point de départ, on construit un chemin qui vous ressemble." />
      <div class="grid4">
        <AudienceCard icon="ph:buildings" title="Aux entreprises" text="Bien-être et cohésion des équipes, moins de stress et de maux liés aux postures." />
        <AudienceCard icon="ph:heartbeat" title="Se remettre en forme" text="Se tonifier, retrouver de l’énergie et optimiser sa santé au quotidien." />
        <AudienceCard icon="ph:boxing-glove" title="Aux aventureux" text="Découvrir une nouvelle pratique, notamment les sports de combat." />
        <AudienceCard icon="ph:shield-check" title="Self-défense" text="Pour les femmes : gagner en confiance et savoir réagir face à une agression." />
      </div>
    </div>
  </section>

  <section class="section method" id="methode">
    <div class="wrap split">
      <Image src={methodImg} alt="Séance de coaching" width={640} height={480} />
      <div>
        <SectionHead eyebrow="Ma méthode" title="La clé de votre réussite" />
        <div class="mlist">
          <MethodItem icon="ph:flask" title="Basée sur la science" text="Une progression optimisée d’après les dernières études." />
          <MethodItem icon="ph:barbell" title="+3000h de terrain" text="Expérience en musculation et en boxe." />
          <MethodItem icon="ph:smiley" title="Bonne humeur" text="Se dépasser sans pression, avec plaisir." />
          <MethodItem icon="ph:person-simple-run" title="Multisport" text="Une pratique variée pour coller à vos besoins." />
        </div>
      </div>
    </div>
  </section>

  <section class="section about">
    <div class="wrap split">
      <div>
        <SectionHead eyebrow="Qui suis-je ?" title="Bonjour, moi c’est Yoann" />
        <p class="prose">Passionné de sport sous toutes ses formes, j’ai fait de la transmission mon métier. Mon truc : vous faire prendre du plaisir pendant l’effort, pour que la progression devienne une évidence.</p>
        <p class="prose">Bienveillance, écoute et bonne humeur — c’est là-dessus que se construit chacune de nos séances.</p>
        <a class="link" href="/a-propos">En savoir plus sur mon parcours →</a>
      </div>
      <Image src={aboutImg} alt="Yoann, coach sportif" width={560} height={520} />
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Transformations" title="De vrais résultats, de vraies personnes" lede="Quelques parcours accompagnés par Yoann — le fruit d’un travail régulier et d’un plaisir retrouvé à l’entraînement." />
      <div class="grid3">{transformations.map((t) => <TransformationCard t={t} />)}</div>
    </div>
  </section>

  <Reviews />

  <section class="section faq">
    <div class="wrap narrow">
      <SectionHead eyebrow="Questions fréquentes" title="Tout ce que vous vous demandez" />
      {faq.map((f) => <FaqItem q={f.q} a={f.a} />)}
    </div>
  </section>

  <CtaBand title="Prêt à commencer ?" text="La première séance est offerte. On fait connaissance, on définit vos objectifs, et on se lance ensemble." />
</Base>

<style>
  .disc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
  .split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
  .split img{width:100%;border-radius:24px;object-fit:cover;box-shadow:0 16px 40px rgba(58,46,38,.16);}
  .method{background:var(--cream);}
  .mlist{margin-top:8px;display:flex;flex-direction:column;gap:20px;}
  .prose{color:var(--ink-soft);font-size:16px;margin-bottom:14px;}
  .link{color:var(--terracotta);font-weight:700;text-decoration:none;}
  .narrow{max-width:760px;}
  @media(max-width:900px){.disc-grid,.grid3,.split{grid-template-columns:1fr;} .grid4{grid-template-columns:1fr 1fr;}}
</style>
```

- [ ] **Step 2: Write the page-build smoke test**

`tests/pages-build.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../src/pages/index.astro';

test('homepage renders hero headline, 6 transformations and FAQ', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Index);
  expect(html).toContain('avec le sourire');
  expect((html.match(/class="tcard"/g) || []).length).toBe(6);
  expect(html).toContain('Questions fréquentes');
});
```

- [ ] **Step 3: Run the test**

Run: `npm run test -- pages-build`
Expected: PASS.

- [ ] **Step 4: Full build + type check**

Run: `npm run build && npm run check`
Expected: `/index.html` generated; 0 type errors. Verify Phosphor icon names resolve (if any warns as missing, replace with the closest `ph:` name and re-run).

- [ ] **Step 5: Visual verification**

Run: `npm run dev` and open `http://localhost:4321/`. Confirm: hero image + gradient, three discipline tiles, four audience cards, method split, about split, six transformation cards with Avant/Après + badges, review cards (fallback), FAQ accordion opens, terracotta CTA band.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build homepage with all sections"
```

---

### Task 14: Boxe page (`/boxe`)

**Files:**
- Create: `src/pages/boxe.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, `Button`, `CtaBand`, images `boxe-groupe.jpg`, `boxe-solo.jpg`.

- [ ] **Step 1: Create `src/pages/boxe.astro`** (copy reused from legacy `boxe/index.html`)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import Button from '../components/Button.astro';
import CtaBand from '../components/CtaBand.astro';
import boxeGroupe from '../assets/images/boxe-groupe.jpg';
import boxeSolo from '../assets/images/boxe-solo.jpg';
---
<Base title="Cours de Boxe pieds-poings à Toulouse — CY Coaching"
      description="Cours de boxe pieds-poings pour débutants à Toulouse avec CY Coaching. Défoulez-vous, évacuez le stress et travaillez votre cardio dans la bonne humeur.">
  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Boxe pieds-poings" title="Initiation à la boxe : maîtrisez les fondamentaux" />
      <div class="split">
        <Image src={boxeGroupe} alt="Cours d'initiation à la boxe en groupe à Toulouse" width={640} height={480} />
        <div class="prose">
          <p>Vous avez envie de découvrir une discipline qui vous permette de vous défouler, <strong>d’évacuer votre stress et de bosser votre cardio</strong> ?</p>
          <p>Je propose des cours de boxe pour débutants, pour vous transmettre ma passion de ce sport et vous aider à évacuer les tracas du quotidien à travers une discipline incroyable.</p>
          <Button href="/contact">Prêt(e) à mettre les gants ?</Button>
        </div>
      </div>
      <Image class="wide" src={boxeSolo} alt="Cours d'initiation à la boxe en individuel à Toulouse" width={1120} height={620} />
    </div>
  </section>
  <CtaBand title="Envie d’essayer ?" text="Première séance offerte : on met les gants et on voit si le courant passe." cta="Réserver ma séance" />
</Base>
<style>
  .split{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
  .split img{width:100%;border-radius:24px;object-fit:cover;}
  .prose p{color:var(--ink-soft);font-size:16px;margin-bottom:14px;}
  .wide{width:100%;border-radius:24px;margin-top:40px;object-fit:cover;}
  @media(max-width:900px){.split{grid-template-columns:1fr;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import Boxe from '../src/pages/boxe.astro';
test('boxe page renders headline and CTA', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Boxe);
  expect(html).toContain('maîtrisez les fondamentaux');
  expect(html).toContain('Prêt(e) à mettre les gants ?');
});
```

- [ ] **Step 3: Run test + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/boxe/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add boxe page"
```

---

### Task 15: Self-défense page (`/self-defense`)

**Files:**
- Create: `src/pages/self-defense.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, `Button`, `CtaBand`, image `self-defense-coaching.jpg`.

- [ ] **Step 1: Create `src/pages/self-defense.astro`** (copy from legacy self-defense section)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import Button from '../components/Button.astro';
import CtaBand from '../components/CtaBand.astro';
import selfImg from '../assets/images/self-defense-coaching.jpg';
---
<Base title="Self-défense féminine à Toulouse — CY Coaching"
      description="Cours de self-défense féminine à Toulouse avec CY Coaching : prévention, protection et détermination. Gagnez en confiance et apprenez à réagir face à une agression.">
  <section class="section">
    <div class="wrap split">
      <div class="prose">
        <SectionHead eyebrow="Self-défense (femmes)" title="Autonomie et sécurité" />
        <p>Vous souhaitez apprendre les rudiments d’une <strong>self-défense simple et efficace</strong> pour optimiser votre sécurité ?</p>
        <p>Nous aborderons ensemble les notions de <strong>prévention, de protection et de détermination</strong>. Ces bases, complétées d’un panel technique développé durant les séances, seront éprouvées lors de mises en situation.</p>
        <Button href="/contact">Réserver ma séance offerte</Button>
      </div>
      <Image src={selfImg} alt="Cours de self-défense féminine à Toulouse" width={560} height={620} />
    </div>
  </section>
  <CtaBand title="Gagnez en confiance" text="Dès la première séance (offerte), on pose les bases pour vous sentir plus sûre de vous." cta="Je réserve" />
</Base>
<style>
  .split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
  .split img{width:100%;border-radius:24px;object-fit:cover;}
  .prose p{color:var(--ink-soft);font-size:16px;margin-bottom:14px;}
  @media(max-width:900px){.split{grid-template-columns:1fr;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import Self from '../src/pages/self-defense.astro';
test('self-defense page renders key notions', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Self);
  expect(html).toContain('prévention, de protection et de détermination');
});
```

- [ ] **Step 3: Run test + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/self-defense/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add self-defense page"
```

---

### Task 16: Musculation page (`/musculation`) with featured transformations

**Files:**
- Create: `src/pages/musculation.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, `Button`, `TransformationCard`, `CtaBand`, images `coaching-individuel.jpg`, `coaching-groupe.jpg`, first 3 `transformations`.

- [ ] **Step 1: Create `src/pages/musculation.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import Button from '../components/Button.astro';
import TransformationCard from '../components/TransformationCard.astro';
import CtaBand from '../components/CtaBand.astro';
import { transformations } from '../data/transformations';
import muscuImg from '../assets/images/coaching-individuel.jpg';
const featured = transformations.slice(0, 3);
---
<Base title="Coach Musculation & Remise en forme à Toulouse — CY Coaching"
      description="Coaching musculation, remise en forme et recomposition corporelle à Toulouse. Programmes personnalisés basés sur la science, pour la prise de masse comme la tonification.">
  <section class="section">
    <div class="wrap split">
      <div class="prose">
        <SectionHead eyebrow="Musculation & remise en forme" title="Sculptez le corps que vous visez" />
        <p>Que votre objectif soit la <strong>prise de masse musculaire</strong>, la <strong>tonification</strong> ou une remise en forme générale, je conçois des programmes personnalisés qui respectent votre santé et votre progression.</p>
        <p>Chaque séance mêle rigueur technique, méthode fondée sur les dernières études, et surtout du plaisir — parce qu’on progresse mieux en s’amusant.</p>
        <Button href="/contact">Réserver ma séance offerte</Button>
      </div>
      <Image src={muscuImg} alt="Séance de coaching musculation à Toulouse" width={560} height={620} />
    </div>
  </section>
  <section class="section" style="background:var(--cream);">
    <div class="wrap">
      <SectionHead eyebrow="Transformations" title="Ce que donne un suivi régulier" />
      <div class="grid3">{featured.map((t) => <TransformationCard t={t} />)}</div>
    </div>
  </section>
  <CtaBand title="Votre transformation commence ici" text="Première séance offerte. On définit vos objectifs et on construit votre plan." />
</Base>
<style>
  .split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
  .split img{width:100%;border-radius:24px;object-fit:cover;}
  .prose p{color:var(--ink-soft);font-size:16px;margin-bottom:14px;}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
  @media(max-width:900px){.split,.grid3{grid-template-columns:1fr;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import Muscu from '../src/pages/musculation.astro';
test('musculation page renders headline and 3 featured transformations', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Muscu);
  expect(html).toContain('Sculptez le corps que vous visez');
  expect((html.match(/class="tcard"/g) || []).length).toBe(3);
});
```

- [ ] **Step 3: Run test + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/musculation/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add musculation page with featured transformations"
```

---

### Task 17: Entreprises page (`/coaching-entreprise`) — no photos

**Files:**
- Create: `src/pages/coaching-entreprise.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, `AudienceCard` (reused for benefit tiles), `CtaBand`. No images — warm color blocks + icons only.

- [ ] **Step 1: Create `src/pages/coaching-entreprise.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import AudienceCard from '../components/AudienceCard.astro';
import CtaBand from '../components/CtaBand.astro';
---
<Base title="Coaching sportif en entreprise à Toulouse — CY Coaching"
      description="Coaching sportif en entreprise à Toulouse : bien-être, cohésion et santé des équipes. Réduisez le stress et les maux liés aux mauvaises postures au travail.">
  <section class="hero-lite">
    <div class="wrap">
      <div class="eyebrow light">Entreprises</div>
      <h1>Investissez dans vos équipes</h1>
      <p class="lede">Le sport en entreprise, c’est moins de stress, plus de cohésion, et des collaborateurs en meilleure santé — donc plus épanouis au travail.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Les bénéfices" title="Pourquoi bouger au travail" />
      <div class="grid3">
        <AudienceCard icon="ph:users-three" title="Cohésion d’équipe" text="Des séances collectives qui renforcent le lien social et l’esprit d’équipe." />
        <AudienceCard icon="ph:heartbeat" title="Santé & bien-être" text="Moins de stress, moins de maux liés aux mauvaises postures au poste de travail." />
        <AudienceCard icon="ph:trend-up" title="Investissement au travail" text="Des collaborateurs en forme sont plus concentrés, plus motivés, plus présents." />
      </div>
    </div>
  </section>
  <section class="section" style="background:var(--cream);">
    <div class="wrap narrow">
      <SectionHead eyebrow="Comment ça marche" title="Une intervention sur mesure" />
      <p class="prose">Je me déplace dans vos locaux ou dans une salle proche, à Toulouse et alentours. On définit ensemble le format (séances hebdomadaires, ateliers ponctuels, événements) et le contenu selon les envies et le niveau de vos équipes.</p>
    </div>
  </section>
  <CtaBand title="Parlons de vos besoins" text="Contactez-moi pour construire une offre adaptée à votre entreprise." cta="Discutons-en" />
</Base>
<style>
  .hero-lite{background:linear-gradient(160deg,var(--ink),#5c4436);color:#fff;padding:90px 0;}
  .hero-lite h1{color:#fff;font-size:52px;margin-top:12px;}
  .hero-lite .lede{color:#f3e8dc;font-size:19px;max-width:44ch;margin-top:18px;}
  .eyebrow.light{color:var(--clay);}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  .prose{color:var(--ink-soft);font-size:16px;text-align:center;}
  .narrow{max-width:720px;}
  @media(max-width:900px){.grid3{grid-template-columns:1fr;} .hero-lite h1{font-size:36px;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import Ent from '../src/pages/coaching-entreprise.astro';
test('entreprise page renders without images, shows benefits', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Ent);
  expect(html).toContain('Investissez dans vos équipes');
  expect(html).toContain('Cohésion d’équipe');
  expect(html).not.toContain('<img'); // no photos yet by design
});
```

- [ ] **Step 3: Run test + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/coaching-entreprise/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add entreprises page (text/illustration only)"
```

---

### Task 18: Qui suis-je page (`/a-propos`)

**Files:**
- Create: `src/pages/a-propos.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, `CtaBand`, image `a-propos.jpg`. Person structured data.

- [ ] **Step 1: Create `src/pages/a-propos.astro`** (copy from legacy a-propos)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import CtaBand from '../components/CtaBand.astro';
import aboutImg from '../assets/images/a-propos.jpg';
const jsonLd = { '@context':'https://schema.org','@type':'Person', name:'Yoann', jobTitle:'Coach sportif',
  worksFor:{'@type':'Organization',name:'CY Coaching'}, areaServed:'Toulouse', url:'https://www.cy-coaching.com/a-propos' };
---
<Base title="Qui suis-je ? Yoann, coach sportif à Toulouse — CY Coaching"
      description="Yoann, coach sportif à Toulouse, titulaire de deux Licences STAPS. Spécialiste en prise de masse, remise en forme, boxe pieds-poings et self-défense féminine."
      jsonLd={jsonLd}>
  <section class="section">
    <div class="wrap split">
      <Image src={aboutImg} alt="Yoann, coach sportif à Toulouse" width={560} height={620} />
      <div class="prose">
        <SectionHead eyebrow="Qui suis-je ?" title="Yoann, votre coach à Toulouse" />
        <p>Je suis titulaire de deux Licences STAPS — Entraînement Sportif et Métiers de la Forme — obtenues à Toulouse. Ma formation académique, complétée par de nombreuses expériences de terrain, m’a doté d’une solide expertise en coaching sportif.</p>
        <p><strong>J’ai toujours eu à cœur d’aider les autres à atteindre leurs objectifs de bien-être ou de performance.</strong> C’est pour cela que j’ai choisi ce métier qui me passionne.</p>
        <h3>Mes spécialités</h3>
        <ul>
          <li><strong>Prise de masse musculaire</strong> — programmes personnalisés pour stimuler l’hypertrophie en respectant votre santé.</li>
          <li><strong>Remise en forme et tonification</strong> — des techniques variées pour sculpter votre corps et améliorer votre condition physique.</li>
          <li><strong>Boxe pieds-poings</strong> — fondamentaux et techniques avancées, pour tous niveaux, dans une ambiance dynamique et sécuritaire.</li>
          <li><strong>Self-défense féminine</strong> — apprendre à se défendre tout en gagnant en confiance et en force.</li>
        </ul>
        <p>Au-delà de ces spécialités, je m’engage à créer un environnement motivant et bienveillant, où le respect et l’écoute sont primordiaux. Chaque séance est une occasion d’apprendre et de grandir ensemble.</p>
      </div>
    </div>
  </section>
  <CtaBand title="On travaille ensemble ?" text="Discutons de vos objectifs lors d’une première séance offerte." />
</Base>
<style>
  .split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;}
  .split img{width:100%;border-radius:24px;object-fit:cover;position:sticky;top:100px;}
  .prose p{color:var(--ink-soft);font-size:16px;margin-bottom:14px;}
  .prose h3{font-size:24px;margin:22px 0 12px;}
  .prose ul{padding-left:20px;color:var(--ink-soft);margin-bottom:16px;} .prose li{margin-bottom:10px;}
  @media(max-width:900px){.split{grid-template-columns:1fr;} .split img{position:static;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import About from '../src/pages/a-propos.astro';
test('a-propos page shows STAPS credentials', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(About);
  expect(html).toContain('deux Licences STAPS');
});
```

- [ ] **Step 3: Run test + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/a-propos/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add qui-suis-je (a-propos) page"
```

---

### Task 19: Tarifs page (`/tarif`)

**Files:**
- Create: `src/pages/tarif.astro`, `src/data/pricing.ts`
- Test: `tests/pricing-data.test.ts` + extend `tests/pages-build.test.ts`

**Interfaces:**
- Produces: `pricing` — three groups `{ title: string; note?: string; items: { label: string; price: string }[] }[]`.
- Consumes: `Base`, `SectionHead`, `CtaBand`.

- [ ] **Step 1: Write failing data test**

`tests/pricing-data.test.ts`:

```ts
import { expect, test } from 'vitest';
import { pricing } from '../src/data/pricing';
test('pricing has 3 groups, each with items', () => {
  expect(pricing).toHaveLength(3);
  for (const g of pricing) { expect(g.title).toBeTruthy(); expect(g.items.length).toBeGreaterThan(0); }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -- pricing-data`
Expected: FAIL.

- [ ] **Step 3: Create `src/data/pricing.ts`** (values from legacy tarif page)

```ts
export interface PriceGroup { title: string; note?: string; items: { label: string; price: string }[]; }
export const pricing: readonly PriceGroup[] = [
  { title: 'Coaching individuel', items: [
    { label: 'À l’unité', price: '60 €' },
    { label: 'Carnet de 10 séances', price: '550 €' },
    { label: 'Carnet de 20 séances + 1 accessoire fitness', price: '1000 € (50 €/séance)' },
  ]},
  { title: 'Mini-groupe (2 à 5 personnes)', note: 'par personne', items: [
    { label: 'À deux', price: '35 €' },
    { label: 'À trois', price: '30 €' },
    { label: 'Quatre et plus', price: '25 €' },
  ]},
  { title: 'Programmes à distance', note: 'par mois', items: [
    { label: 'Découverte — programmation générique pour découvrir les bases', price: '40 €/mois' },
    { label: 'Débutant — programme personnalisé + retours vidéo hebdo', price: '80 €/mois' },
    { label: 'Confirmé — programme + analyses vidéo + plan alimentaire + retours 7j/7', price: '120 €/mois' },
  ]},
];
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -- pricing-data`
Expected: PASS.

- [ ] **Step 5: Create `src/pages/tarif.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import CtaBand from '../components/CtaBand.astro';
import { pricing } from '../data/pricing';
---
<Base title="Tarifs du coaching sportif à Toulouse — CY Coaching"
      description="Découvrez les tarifs CY Coaching à Toulouse : coaching individuel, mini-groupe et programmes à distance. Des formules adaptées à tous les objectifs et budgets.">
  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Tarifs" title="Des formules pour chaque objectif" lede="Coaching individuel, en petit groupe, ou programmes à distance — vous choisissez ce qui vous convient." />
      <div class="cards">
        {pricing.map((g) => (
          <div class="pcard">
            <h3>{g.title}</h3>
            {g.note && <div class="note">{g.note}</div>}
            <ul>{g.items.map((it) => <li><span>{it.label}</span><b>{it.price}</b></li>)}</ul>
          </div>
        ))}
      </div>
      <p class="foot-note">Les programmes à distance seront bientôt souscriptibles directement en ligne.</p>
    </div>
  </section>
  <CtaBand title="Une question sur les tarifs ?" text="La première séance est offerte — parlons de la formule idéale pour vous." />
</Base>
<style>
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start;}
  .pcard{background:#fff;border:1px solid #f0e6d8;border-radius:22px;padding:30px 26px;box-shadow:0 8px 24px rgba(58,46,38,.08);}
  .pcard h3{font-size:22px;} .note{color:var(--terracotta);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin-top:4px;}
  .pcard ul{list-style:none;margin-top:18px;}
  .pcard li{display:flex;justify-content:space-between;gap:14px;padding:14px 0;border-top:1px solid #f0e6d8;font-size:15px;}
  .pcard li span{color:var(--ink-soft);} .pcard li b{white-space:nowrap;}
  .foot-note{text-align:center;color:var(--ink-soft);font-style:italic;margin-top:28px;}
  @media(max-width:900px){.cards{grid-template-columns:1fr;}}
</style>
```

- [ ] **Step 6: Add to `tests/pages-build.test.ts`**

```ts
import Tarif from '../src/pages/tarif.astro';
test('tarif page shows all three pricing groups', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Tarif);
  expect(html).toContain('Coaching individuel');
  expect(html).toContain('Mini-groupe (2 à 5 personnes)');
  expect(html).toContain('Programmes à distance');
});
```

- [ ] **Step 7: Run tests + build**

Run: `npm run test && npm run build`
Expected: PASS; `/tarif/index.html` generated.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add tarifs page with typed pricing data"
```

---

### Task 20: Contact page (`/contact`) with Formspree

**Files:**
- Create: `src/pages/contact.astro`
- Test: extend `tests/pages-build.test.ts`

**Interfaces:**
- Consumes: `Base`, `SectionHead`, image `contact.jpg`. Form posts to `https://formspree.io/f/mbjenzqk`.

- [ ] **Step 1: Create `src/pages/contact.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import SectionHead from '../components/SectionHead.astro';
import contactImg from '../assets/images/contact.jpg';
---
<Base title="Contact — CY Coaching, coach sportif à Toulouse"
      description="Contactez CY Coaching à Toulouse : coaching à domicile ou en salle. Appelez le 06 08 70 32 51, écrivez à yoann.cycoaching@gmail.com ou remplissez le formulaire.">
  <section class="section">
    <div class="wrap">
      <SectionHead eyebrow="Contact" title="On se rencontre ?" lede="Coaching à domicile ou en salle, à Toulouse et alentours. Je m’engage à vous répondre dans les plus brefs délais." />
      <div class="split">
        <Image src={contactImg} alt="Séance de coaching personnalisé à Toulouse" width={560} height={620} />
        <form action="https://formspree.io/f/mbjenzqk" method="POST">
          <label>Ton nom<input type="text" name="nom" required /></label>
          <label>Ton e-mail<input type="email" name="email" required /></label>
          <label>Ton téléphone<input type="tel" name="telephone" required /></label>
          <label>Message<textarea name="message" rows="5" required></textarea></label>
          <button type="submit">Envoyer</button>
        </form>
      </div>
      <p class="direct">Ou directement : <a href="tel:0608703251">06 08 70 32 51</a> · <a href="mailto:yoann.cycoaching@gmail.com">yoann.cycoaching@gmail.com</a></p>
    </div>
  </section>
</Base>
<style>
  .split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;}
  .split img{width:100%;border-radius:24px;object-fit:cover;}
  form{display:flex;flex-direction:column;gap:16px;}
  label{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px;color:var(--ink);}
  input,textarea{font:inherit;padding:12px 14px;border:1px solid #e0d3c1;border-radius:12px;background:#fff;}
  input:focus,textarea:focus{outline:2px solid var(--terracotta);border-color:transparent;}
  button{background:var(--terracotta);color:#fff;border:none;padding:14px;border-radius:999px;font-weight:700;font-size:15px;cursor:pointer;}
  button:hover{background:var(--terracotta-dark);}
  .direct{text-align:center;margin-top:28px;color:var(--ink-soft);}
  @media(max-width:900px){.split{grid-template-columns:1fr;}}
</style>
```

- [ ] **Step 2: Add to `tests/pages-build.test.ts`**

```ts
import Contact from '../src/pages/contact.astro';
test('contact page posts to the Formspree endpoint with all fields', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Contact);
  expect(html).toContain('https://formspree.io/f/mbjenzqk');
  for (const n of ['nom','email','telephone','message']) expect(html).toContain(`name="${n}"`);
});
```

- [ ] **Step 3: Run tests + build**

Run: `npm run test -- pages-build && npm run build`
Expected: PASS; `/contact/index.html` generated.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add contact page with Formspree form"
```

---

## Phase 5 — SEO polish & deploy

### Task 21: SEO essentials — robots, CNAME, sitemap verification

**Files:**
- Create: `public/robots.txt`, `public/CNAME`
- Verify: sitemap output

**Interfaces:**
- Produces: `robots.txt` referencing the sitemap; `CNAME` preserving the domain; `@astrojs/sitemap` output at `/sitemap-index.xml`.

- [ ] **Step 1: Create `public/CNAME`**

File content (single line, no trailing spaces):

```
www.cy-coaching.com
```

- [ ] **Step 2: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://www.cy-coaching.com/sitemap-index.xml
```

- [ ] **Step 3: Build and verify SEO artifacts**

Run: `npm run build`
Then verify:

```bash
test -f dist/CNAME && echo "CNAME ok"
test -f dist/robots.txt && echo "robots ok"
ls dist/sitemap-index.xml && echo "sitemap ok"
```

Expected: all three print their "ok" line (sitemap generated by the integration; CNAME + robots copied from `public/`).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add robots.txt, CNAME and verify sitemap output"
```

---

### Task 22: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: a GitHub Actions workflow that builds Astro and deploys `dist/` to GitHub Pages on push to `main`. (Requires, later, enabling Pages "GitHub Actions" source and adding the two `PUBLIC_*` repo secrets/variables — documented in the step, not executed here.)

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        env:
          PUBLIC_GOOGLE_MAPS_API_KEY: ${{ vars.PUBLIC_GOOGLE_MAPS_API_KEY }}
          PUBLIC_GOOGLE_PLACE_ID: ${{ vars.PUBLIC_GOOGLE_PLACE_ID }}
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document the one-time manual setup (do NOT run — repo is local-only for now)**

Add these as a comment block at the top of the workflow file so it's not forgotten:

```yaml
# One-time setup when this repo is pushed to GitHub:
# 1. Repo Settings → Pages → Source: "GitHub Actions".
# 2. Repo Settings → Secrets and variables → Actions → Variables:
#    PUBLIC_GOOGLE_MAPS_API_KEY (referrer-restricted to www.cy-coaching.com)
#    PUBLIC_GOOGLE_PLACE_ID (CY Coaching place id — resolve via Google Place ID finder)
# 3. First deploy runs on push to main.
```

- [ ] **Step 3: Verify the workflow is valid YAML and the local build still succeeds**

Run: `npm run build`
Expected: success. (The workflow itself only runs on GitHub; nothing to execute locally.)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "ci: add GitHub Pages deploy workflow for Astro"
```

---

## Final verification

- [ ] Run the full suite: `npm run test` → all pass.
- [ ] Type check: `npm run check` → 0 errors.
- [ ] Full build: `npm run build` → all 8 pages (`/`, `/musculation`, `/boxe`, `/self-defense`, `/coaching-entreprise`, `/a-propos`, `/tarif`, `/contact`) plus `sitemap-index.xml`, `robots.txt`, `CNAME` present in `dist/`.
- [ ] `npm run dev` visual pass on every page: header nav + mobile burger, footer contact, warm palette, fonts loaded, images crisp, transformation Avant/Après + badges, FAQ toggles, contact form present.
- [ ] Reviews: with real `PUBLIC_*` env vars in `.env`, confirm live Google reviews replace the fallback in the browser; without them, fallback renders.

---

## Notes for the implementer

- **Phosphor icon names** (`astro-icon` + `@iconify-json/ph`): if any name in Task 13/17 doesn't resolve, pick the nearest from https://icones.js.org (`ph:` set) and update the prop. Candidates used: `ph:buildings`, `ph:heartbeat`, `ph:boxing-glove`, `ph:shield-check`, `ph:flask`, `ph:barbell`, `ph:smiley`, `ph:person-simple-run`, `ph:users-three`, `ph:trend-up`.
- **Legacy folder:** `cycoaching/` is gitignored and kept only as a copy source/reference. Its images were imported in Task 6; nothing at build time depends on it.
- **Google Place ID:** the Maps URL feature id (`0x…:0x…`) is not the Places `placeId`. Resolve the real id via Google's Place ID Finder before setting `PUBLIC_GOOGLE_PLACE_ID`.
- **YAGNI reminder:** booking and online payment are explicitly out of scope; the Tarifs page merely leaves a sentence hinting at future online subscription. Do not build payment flows.
- **Container tests + integrations:** `vitest.config.ts` uses `getViteConfig`, which loads `astro.config.mjs` (including `astro-icon` and `astro:assets`), so `<Icon>` and `<Image>` resolve inside `renderToString`. Task 9's `tiles` test is the first to exercise `<Icon>`; if it errors on a missing virtual module, confirm `icon()` is present in `astro.config.mjs` and that `@iconify-json/ph` is installed before debugging further.
