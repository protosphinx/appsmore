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
| `apps.js` | **The list.** Hand-edited. One line per app: `[appStoreId, "Name", "why", ["tags"]]`, grouped by category; `why` and `tags` are optional. Also `SETUP_ORDER` (install order for lists), `REMOVED` (what came off and why), `PACKS` (one-tap sets). |
| `icons.json` | Generated: icon paths, developer names, size, last update, ratings, min iOS, price, keyed by App Store id. |
| `index.html` | The picker. |
| `list.html` | The list page (`list.html#1password.gmail.whatsapp`), what people open on their phone. `l.html` redirects there for old links. |
| `about.html` | Why this exists. |
| `setup.html` | New iPhone setup, in the right order. Links into the picker with `?pack=<slug>`. |
| `common.js` / `style.css` | Shared code and styles. |
| `scripts/icons.mjs` | Regenerates `icons.json` from `apps.js` using Apple's lookup API. |
| `scripts/bake.mjs` | Pre-renders the catalog + ItemList JSON-LD into `index.html` between markers (so crawlers see every app without JavaScript) and writes `sitemap.xml` with git `lastmod`. The page still works unbaked. |
| `og.png` | Social preview image (1200x630). |
| `<key>.txt` | IndexNow key file, so Bing and friends get pinged when the list changes. |
| `worker/` | Cloudflare Worker for short links (`appsmore.com/tigereatsapple`). The only server code, and the site works without it. |
| `robots.txt` / `sitemap.xml` | Search engine plumbing. `l.html` is noindex. |

## Editing the list

1. Find the app on the App Store. The id is the number after `/id` in the URL
   (`https://apps.apple.com/us/app/signal-private-messenger/id874139669` -> `874139669`).
2. Add `[874139669, "Signal", "The one messenger I'd give my parents."],` under
   the right category in `apps.js` (the sentence is optional but is the point).
   Make a new category by adding another `["Name", [...]]` block. Order in the
   file is the order on the page. Lists sort by `SETUP_ORDER` so the password
   manager comes first on a fresh phone.
3. `node scripts/icons.mjs && node scripts/bake.mjs` to bake the icon, size
   and update date into `icons.json` and pre-render the grid into `index.html`
   (needs network). If you skip this the site still works: it looks icons up
   live from Apple and builds the grid in the browser; crawlers just see less.
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

`list.html#1password.gmail.whatsapp` - the words are the apps (name, lowercased,
hyphenated), dot-separated. You can type or edit one by hand, and
`index.html#signal.spotify` opens the picker with those selected. Nothing is
stored server-side, so lists never expire and there is nothing to leak. Older
links with base36 App Store ids still decode.

"Short link" asks the Worker in `worker/` for a phrase (`appsmore.com/tigereatsapple`)
that redirects to the long link. Only the phrase and the list are stored, for a
year from last use.
