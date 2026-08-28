# RootSystems site

The RootSystems parent-brand website — the site that will live at
**rootsystems.app**. A separate Express/EJS project from the product apps
(Offboarding Proof, TPRA, etc.) — no shared views, styles, or components,
and deliberately not a single static HTML file, so adding pages later
(a blog, more products, more sections) stays simple.

## Design direction

**v4 — "retro-terminal hybrid."** Warm-cream background (not dark), a
serif/sans type pairing (Merriweather headlines, Open Sans body), and
skeuomorphic hard-shadow "3D" buttons carry over from the v3 retro pass —
but v4 brings back the hacker-brand edge from the original v1/v2 brief:
a terminal-green accent (`--terminal-green`) reserved *exclusively* for
LIVE/verified signal (status tags, the hero's blinking cursor, the stats
strip), JetBrains Mono for those terminal-flavored bits (status tags, step
numbers, stat tags), and a faint CSS-only grid texture behind the hero
only (masked to fade out, so it reads as texture, not decoration).

v4 also adds actual motion, via `public/js/site.js` (vanilla JS, no
dependencies, everything degrades gracefully with JS off or
`prefers-reduced-motion` on):

- **Hero typewriter** — cycles the headline through a few lines
  (`data-typewriter` attribute on the `<span>` in `home.ejs` holds the
  JSON array). The first line is server-rendered, so there's no
  flash-of-empty-content and no-JS visitors just see a static headline.
- **Scroll-reveal** — any section with class `reveal` fades/slides in via
  `IntersectionObserver` the first time it enters the viewport. Content is
  fully present in the HTML regardless; this only ever animates opacity/
  transform.
- **Count-up stats** — the stats strip's numbers (`data-count-to`) animate
  from 0 up to their real value on scroll-into-view. The values themselves
  come from `src/controllers/siteController.js`, derived from
  `products.js` (e.g. LIVE count) — never hand-typed, consistent with the
  site's own "if it can't be verified, it doesn't ship" rule applying to
  its own copy.

See `public/css/style.css` for the full token/component system — it
intentionally shares no class names or visual language with the product
apps.

## Run

```
npm install
npm run dev
```

Visit http://localhost:4300

## Logo

**Placeholder, not the final art.** `public/images/logo.svg` is a
hand-recreated approximation (sprout + root fan, cream on a saffron
gradient) of the real "THE ROOT" logo, built because the actual logo file
has only ever existed as an image pasted into chat, not a file anyone has
saved to disk. It's referenced by both:

- `src/views/partials/header.ejs` (the `<img class="brand__mark">`)
- `src/views/partials/head.ejs` (the favicon `<link rel="icon">`, inlined
  as a matching data-URI so the browser tab matches the header)

Once you have the real logo file (SVG preferred, PNG fine), overwrite
`public/images/logo.svg` — or save it under a different name and update the
one `src`/`href` in each of those two files to match. The header's
`onerror` handler hides the `<img>` rather than showing a broken image icon
if the file is ever missing, so nothing looks broken in the meantime.

## Domain / routing

This app mounts at `/` — the whole thing **is** rootsystems.app. Individual
products are meant to live at **subfolder** paths on this same domain
(`rootsystems.app/tpra`, `rootsystems.app/offboarding-proof`, etc.), not on
subdomains — subfolders keep one domain's SEO authority in one place
instead of splitting it across `tpra.rootsystems.app` and friends.

`src/app.js` has a detailed comment block on exactly how to wire a product
in later, once one's ready to go live under a subfolder: either a
reverse-proxy rule at the Cloudflare/edge layer (routing `/tpra/*` to
wherever the TPRA app is actually deployed — no code changes needed here),
or mounting the product's Express app instance directly in this process
(`app.use("/tpra", tpraApp)`), which needs the product app to export its
`app` instance instead of calling `.listen()` itself, plus any of its
absolute internal paths made relative/prefixed with `req.baseUrl`.

## Adding pages/sections later

- New top-level routes: add a file in `src/routes/`, require + mount it in
  `src/app.js` (there's a comment marking where), following the pattern
  `siteRoutes.js` already uses.
- New nav links: `src/views/partials/header.ejs` has a comment marking
  where to add them.
- Blog/long-form Resources section (separate from the "Tools We Use" list
  below): `<section id="blog" class="field">` in `src/views/pages/home.ejs`
  is currently three honestly-labeled "Coming soon" placeholder cards, not
  fake posts. Once real posts exist, replace the hardcoded cards with a
  loop over real data the same way the products grid works, and update the
  card markup/`.field-card` styles in `style.css` as needed.
- More products: just add entries to `src/data/products.js` — the grid
  renders off that array, no template changes needed. Set `href` once a
  product is actually reachable at its subfolder path (see Domain/routing
  above) and its row becomes a real link automatically.
- "Tools We Use" (`src/data/resources.js`): each entry's `href` is `null`
  until you have a real affiliate/referral link for that tool — **never**
  fabricate one. Until `href` is set, that item renders as plain text with
  a small "(link pending)" note instead of a clickable link. The disclosure
  line above the list on the homepage is already honest/accurate regardless
  of how many links are filled in.
# Contact-form email

Contact submissions are delivered to the RootSystems mailbox over SMTP. For
local development, copy `.env.example` to `.env.local` and set
`SMTP_APP_PASSWORD` to a Google App Password for the mailbox. Never commit the
real password. In production, add the same variables from `.env.example` to the
hosting provider's encrypted environment settings.

The server sets the visitor as `Reply-To`, so replying to the notification goes
directly to the person who submitted the form. A local JSON record is also kept
as a best-effort backup and is excluded from Git.
