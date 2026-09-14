# appsmore - status

**Current state (2026-09-14):** v0.5 live at https://appsmore.com (also
www and https://appsmore.build.host), valid Let's Encrypt certificates on all
three, HTTP redirects to HTTPS. Static site, no backend. One picker page laid
out for the iPhone Duo's two screens, a shareable list page, an about page.
Catalog is a first real cut: 67 obvious picks in 12 categories, chosen for
restraint rather than coverage, and meant to be pruned by hand from here.
Public launch is after the Duo ships (Oct 23, 2026); the site is online now
so search engines can find it.

## Hosting

- Source: https://github.com/protosphinx/appsmore (public, `main`).
- Host: build.host, project `appsmore` (static pack, nginx, no build step),
  server `5.78.195.200`. Deploys are the repo at HEAD of `main`.
- Auto-deploy on push is not wired yet (the GitHub App installation does not
  cover this repo). Until it is, redeploy by hand after a push:
  `POST https://build.host/api/projects/<uuid>/deploy` with the account key.
- Domain: `appsmore.com` + `www` attached to the project (`PATCH domains`);
  Cloudflare `A` record to the server, proxy off. build.host issued Let's
  Encrypt certs for both about 20 minutes after the DNS change (certs dated
  2026-09-13 22:13 UTC, valid to 2026-12-12). Until then the custom domains
  served a placeholder cert and port 80 fell through to build.host's own
  site; that was a propagation window, not a platform fault. If it happens
  again after a domain change: wait, don't redeploy in a loop.
- Mail on the domain is Google Workspace (5 MX + SPF TXT); never touch those.

## Just shipped

- v0.5 substance plumbing: `apps.js` lines take an optional "why" sentence
  (shown in lists) and tags; `SETUP_ORDER` sorts every list into install
  order (passwords first); `icons.json` now bakes size, last update, ratings,
  min iOS and price; lists show total download size, per-app size and a
  freshness dot (green under 90 days, orange over a year); `REMOVED`
  renders a "Not on the list, on purpose" strip; `PACKS` renders one-tap
  starter packs when defined. Owner still to write: the why lines, the
  packs, more graveyard entries, the curator line.
- Correction: the v0.1 note below says Hulu was "folded into Disney+". It
  was not; the Hulu app is alive (updated 2026-09-08). It was simply cut.
- v0.4 design, fresh start: the icons are the design. Dark ground, iOS-style
  home-screen grid per category (64px icons, 4 across on the closed Duo, 6
  open, 72px on laptops), tap an icon to pick it (blue ring + check badge),
  "Your list" as a grouped dark panel with Get buttons. Icons fetched at
  256px (128px in lists) from the same mzstatic path. Ninite stays the
  philosophy (curation, restraint), not the look.
- v0.3 design: grey page, white category cards flowing into columns, "Your
  list" as a card with an explainer when empty, real h1 + one line. Review
  loop from here: ship, the owner screenshots the live site, change, ship.
- v0.2 design: Ninite-plain and Duo-first. No hero, no steps, no filter; one
  sentence then the list. Breakpoints are the Duo's CSS viewports: 466 closed
  (2 columns), 626 open portrait (3 columns), 890 open landscape (catalog on
  the left half, "Your list" with Get buttons on the right, 40px gap on the
  crease). Get works on-device without a link; the link + QR remain for
  setting up another phone. Sticky "Your list" bar on phone widths only.
- `apps.js` accepts an optional third field, tags (e.g. `["duo"]`), for apps
  verified on a Duo. None set yet; the claim stays off the page until true.
- SEO plumbing: title/description/canonical/OG, WebSite JSON-LD, robots.txt,
  sitemap.xml. `l.html` stays noindex.
- Repo created and pushed; first deploy to build.host (12 s build, all nine
  files served, Let's Encrypt cert on `appsmore.build.host`).

- v0.1 catalog: replaced the 89-app placeholder with 67 apps in 12
  categories (Messaging, Social, Google, AI, Work, Passwords & 2FA, Watch &
  listen, Read & learn, Getting around, Money & shopping, Health, Browsers).
  Dropped Shopping-as-a-category junk (Wish, Temu, SHEIN), Hulu (folded into
  Disney+), Flipboard, Tile, Shazam (built into iOS), VPNs, and the
  Fitbit/Sleep Cycle device-tied picks. Added Gemini. Every id re-verified
  against Apple's lookup API; fixed 1Password pointing at the legacy
  "1Password 7" listing (now 1511601750).
- `icons.json` regenerated for the new set. Removed `scripts/catalog.tsv`
  (a second copy of the list; `apps.js` is the only source of truth).
- One line of hero copy for people setting up a new iPhone, iPhone Duo
  included.
- v0 scaffold: `index.html` (Ninite-style column picker with filter, sticky
  "Get your list" bar, QR code + copyable link), `l.html` (phone checklist,
  App Store deep links, per-list progress in localStorage, Web Share),
  `about.html`, `common.js`, `style.css`. List encoding: App Store ids in
  base36, dot-joined, in the URL hash. No server state.

## Next up

- Wire push-to-deploy: add `protosphinx/appsmore` to the Build Host GitHub
  App installation, then set `is_auto_deploy_enabled`.
- Prune the v0.1 catalog by hand; drop any category that doesn't earn its
  place.
- After Oct 23: try apps on a Duo, tag the ones that use the inner display
  (`["duo"]`), then say so on the page.
- One-line "why" per app, shown on hover / on the list page.
- Test the `Get` flow on a physical iPhone (universal link should open the
  App Store app directly; confirm swipe-back returns to Safari).
- Optional: `?a=` short-link redirector if links get shared widely.
