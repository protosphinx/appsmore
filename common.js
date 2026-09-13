// Shared helpers for index.html and l.html. No build step, no dependencies.
(function () {
  const STORE_URL = (id) => `https://apps.apple.com/app/id${id}`;
  const LOOKUP_URL = (ids) => `https://itunes.apple.com/lookup?id=${ids.join(',')}&country=us`;

  // ---- catalog -----------------------------------------------------------
  // Flatten CATEGORIES (from apps.js) into a map and an ordered list.
  const byId = new Map();
  const ordered = [];
  if (typeof CATEGORIES !== 'undefined') {
    for (const [cat, apps] of CATEGORIES) {
      for (const [id, name] of apps) {
        const a = { id, name, cat };
        byId.set(id, a);
        ordered.push(a);
      }
    }
  }

  // ---- icons -------------------------------------------------------------
  // icons.json is generated (scripts/icons.mjs). Anything missing from it is
  // looked up live from the App Store API and cached in localStorage.
  let iconMeta = null;
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem('am.icons') || '{}'); } catch (e) {}

  async function loadIcons() {
    if (iconMeta) return iconMeta;
    try {
      const r = await fetch('icons.json', { cache: 'force-cache' });
      iconMeta = await r.json();
    } catch (e) {
      iconMeta = { base: '', suffix: '', icons: {}, sellers: {} };
    }
    return iconMeta;
  }

  function iconFor(id) {
    const m = iconMeta || { icons: {}, base: '', suffix: '' };
    const p = m.icons[id];
    if (p) return m.base + p + m.suffix;
    if (cache[id] && cache[id].icon) return cache[id].icon;
    return null;
  }
  function sellerFor(id) {
    const m = iconMeta || { sellers: {} };
    return m.sellers[id] || (cache[id] && cache[id].seller) || '';
  }

  // Fill in icons/sellers for ids we know nothing about, then call onUpdate.
  async function hydrate(ids, onUpdate) {
    const missing = ids.filter((id) => !iconFor(id) && !(cache[id] && cache[id].tried));
    if (!missing.length) return;
    for (let i = 0; i < missing.length; i += 50) {
      const chunk = missing.slice(i, i + 50);
      try {
        const r = await fetch(LOOKUP_URL(chunk));
        const j = await r.json();
        for (const res of j.results || []) {
          cache[res.trackId] = { icon: res.artworkUrl100, seller: res.sellerName, name: res.trackName, tried: 1 };
        }
      } catch (e) { /* offline or blocked - letter avatars it is */ }
      for (const id of chunk) cache[id] = cache[id] || { tried: 1 };
      try { localStorage.setItem('am.icons', JSON.stringify(cache)); } catch (e) {}
      if (onUpdate) onUpdate();
    }
  }

  // <img> or letter-avatar for an app.
  function iconEl(app, cls) {
    const src = iconFor(app.id);
    if (src) {
      const img = document.createElement('img');
      img.className = cls; img.alt = ''; img.loading = 'lazy'; img.src = src;
      img.onerror = () => img.replaceWith(letterEl(app, cls));
      return img;
    }
    return letterEl(app, cls);
  }
  function letterEl(app, cls) {
    const d = document.createElement('div');
    d.className = cls + ' letter';
    d.textContent = (app.name || '?').trim()[0].toUpperCase();
    d.style.cssText = 'display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;background:' + hue(app.id);
    return d;
  }
  function hue(id) { return `hsl(${(Number(id) * 7) % 360} 45% 55%)`; }

  // ---- list encoding -----------------------------------------------------
  // l.html#<id36>.<id36>... - short, stateless, nothing to host but static files.
  function encodeList(ids) { return ids.map((n) => Number(n).toString(36)).join('.'); }
  function decodeList(s) {
    return (s || '').split(/[.,]/).map((t) => parseInt(t, 36)).filter((n) => Number.isFinite(n) && n > 0);
  }
  function listUrl(ids) {
    const base = location.href.replace(/[^/]*$/, '');
    return base + 'l.html#' + encodeList(ids);
  }
  function appFor(id) {
    return byId.get(id) || { id, name: (cache[id] && cache[id].name) || `App ${id}`, cat: '' };
  }

  window.AM = { STORE_URL, byId, ordered, loadIcons, iconFor, sellerFor, hydrate, iconEl, encodeList, decodeList, listUrl, appFor };
})();
