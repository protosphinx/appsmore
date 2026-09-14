# appsmore

**The good iPhone apps, hand-picked.** Ninite-before-the-installer, for iOS,
laid out for the iPhone Duo's two screens.

A static page with a short, curated list of apps in a few columns. Tick what
you want; on the phone, tap **Get** in your list and each one drops you into
the App Store. To set up another phone, send it one link (or scan the QR
code). Progress is remembered on the phone.

Layout follows the Duo's CSS viewports: 466px closed (two columns), 626px
open (three), 890px open landscape (catalog on one half, your list on the
other, nothing across the crease). Safari exposes no fold API, so width is
all we use.

No build step, no backend, no accounts. The whole list is encoded in the link.

## Files

| File | What it is |
|---|---|
| `apps.js` | **The list.** Hand-edited. One line per app: `[appStoreId, "Name"]`, grouped by category. Optional third field: tags, e.g. `["duo"]`. |
| `icons.json` | Generated icon paths + developer names, keyed by App Store id. |
| `index.html` | The picker. |
| `l.html` | The list page (`l.html#<ids>`), what people open on their phone. |
| `about.html` | Why this exists. |
| `common.js` / `style.css` | Shared code and styles. |
| `scripts/icons.mjs` | Regenerates `icons.json` from `apps.js` using Apple's lookup API. |
| `robots.txt` / `sitemap.xml` | Search engine plumbing. `l.html` is noindex. |

## Editing the list

1. Find the app on the App Store. The id is the number after `/id` in the URL
   (`https://apps.apple.com/us/app/signal-private-messenger/id874139669` -> `874139669`).
2. Add `[874139669, "Signal"],` under the right category in `apps.js`. Make a
   new category by adding another `["Name", [...]]` block. Order in the file is
   the order on the page.
3. `node scripts/icons.mjs` to bake the icon (needs network). If you skip this
   the site looks the icon up live from Apple and caches it in the browser.
4. Bump the `?v=` on the `style.css` / `apps.js` / `common.js` references in
   the three HTML files (and `icons.json` in `common.js`) whenever those files
   change, so browsers don't keep the old copies.

## Running locally

Any static server works:

    python3 -m http.server 8000

then open http://localhost:8000/. (Opening `index.html` straight from disk
also works, except `icons.json` won't load over `file://` - icons fall back to
live lookup.)

## Deploying

Static files, no build. Currently on build.host (project `appsmore`,
static pack) at https://appsmore.build.host, deploying `main` from this repo;
`appsmore.com` points at it. Any static host works.

## How the link works

`l.html#7hq2s.4pw6k.…` - each App Store id in base36, dot-separated. Nothing
is stored server-side, so lists never expire and there is nothing to leak.
