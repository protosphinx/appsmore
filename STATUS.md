# appsmore - status

**Current state (2026-09-13):** v0 working MVP, static site, no backend.
Picker page + shareable list page + about page. Catalog is a placeholder of
89 well-known apps in 11 categories; it is meant to be replaced by hand-picked
choices in `apps.js`. Not deployed yet, no domain wired up.

## Just shipped

- v0 scaffold: `index.html` (Ninite-style column picker with filter, sticky
  "Get your list" bar, QR code + copyable link), `l.html` (phone checklist,
  App Store deep links, per-list progress in localStorage, Web Share),
  `about.html`, `common.js`, `style.css`.
- List encoding: App Store ids in base36, dot-joined, in the URL hash. No
  server state.
- `apps.js` as the single hand-edited source of truth; `scripts/icons.mjs`
  bakes icons/sellers into `icons.json`; site falls back to live lookup, then
  letter avatars.
- Verified with headless Chromium at desktop and iPhone widths.

## Next up

- Replace the placeholder catalog with the real picks (and drop categories
  that don't earn their place).
- Deploy (GitHub Pages or Cloudflare Pages) and point appsmore.com at it.
- One-line "why" per app, shown on hover / on the list page.
- Test the `Get` flow on a physical iPhone (universal link should open the
  App Store app directly; confirm swipe-back returns to Safari).
- Optional: `?a=` short-link redirector if links get shared widely.
