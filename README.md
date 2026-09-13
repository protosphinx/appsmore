# appsmore

**The good iPhone apps, hand-picked.** Ninite-before-the-installer, for iOS.

A static page with a short, curated list of apps in a few columns. Tick what
you want, get one link (or a QR code), open it on the iPhone, and each
**Get** button drops you into the App Store for that app. Progress is
remembered on the phone.

No build step, no backend, no accounts. The whole list is encoded in the link.

## Files

| File | What it is |
|---|---|
| `apps.js` | **The list.** Hand-edited. One line per app: `[appStoreId, "Name"]`, grouped by category. |
| `icons.json` | Generated icon paths + developer names, keyed by App Store id. |
| `index.html` | The picker. |
| `l.html` | The list page (`l.html#<ids>`), what people open on their phone. |
| `about.html` | Why this exists. |
| `common.js` / `style.css` | Shared code and styles. |
| `scripts/icons.mjs` | Regenerates `icons.json` from `apps.js` using Apple's lookup API. |

## Editing the list

1. Find the app on the App Store. The id is the number after `/id` in the URL
   (`https://apps.apple.com/us/app/signal-private-messenger/id874139669` -> `874139669`).
2. Add `[874139669, "Signal"],` under the right category in `apps.js`. Make a
   new category by adding another `["Name", [...]]` block. Order in the file is
   the order on the page.
3. `node scripts/icons.mjs` to bake the icon (needs network). If you skip this
   the site looks the icon up live from Apple and caches it in the browser.

## Running locally

Any static server works:

    python3 -m http.server 8000

then open http://localhost:8000/. (Opening `index.html` straight from disk
also works, except `icons.json` won't load over `file://` - icons fall back to
live lookup.)

## Deploying

It's five static files. GitHub Pages, Cloudflare Pages, Netlify, or an S3
bucket behind the domain. Point `appsmore.com` at it and you're done.

## How the link works

`l.html#7hq2s.4pw6k.…` - each App Store id in base36, dot-separated. Nothing
is stored server-side, so lists never expire and there is nothing to leak.
