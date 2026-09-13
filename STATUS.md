# appsmore - status

**Current state (2026-09-13):** v0.1, live at https://appsmore.build.host.
Static site, no backend. Picker page + shareable list page + about page.
Catalog is a first real cut: 67 obvious picks in 12 categories, chosen for
restraint rather than coverage, and meant to be pruned by hand from here.
appsmore.com is being pointed at it (DNS on Cloudflare, mail stays on Google
Workspace).

## Hosting

- Source: https://github.com/protosphinx/appsmore (public, `main`).
- Host: build.host, project `appsmore` (static pack, nginx, no build step),
  server `5.78.195.200`. Deploys are the repo at HEAD of `main`.
- Auto-deploy on push is not wired yet (the GitHub App installation does not
  cover this repo). Until it is, redeploy by hand after a push:
  `POST https://build.host/api/projects/<uuid>/deploy` with the account key.
- Domain: `appsmore.com` + `www` attached to the project; Cloudflare `A`
  record to the server, proxy off, so build.host can issue its own TLS.

## Just shipped

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

- Prune the v0.1 catalog by hand; drop any category that doesn't earn its
  place.
- Deploy (GitHub Pages or Cloudflare Pages) and point appsmore.com at it.
- One-line "why" per app, shown on hover / on the list page.
- Test the `Get` flow on a physical iPhone (universal link should open the
  App Store app directly; confirm swipe-back returns to Safari).
- Optional: `?a=` short-link redirector if links get shared widely.
