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
      for (let [id, name, why, tags] of apps) {
        if (Array.isArray(why)) { tags = why; why = ''; }   // [id, name, ["duo"]] still works
        const a = { id, name, cat, why: why || '', tags: tags || [] };
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
      const r = await fetch('icons.json?v=12', { cache: 'force-cache' });
      iconMeta = await r.json();
    } catch (e) {
      iconMeta = { base: '', suffix: '', icons: {}, sellers: {} };
    }
    return iconMeta;
  }

  // Apple's artwork URLs end in /<w>x<h>bb.jpg; ask for the size we draw at.
  function iconFor(id, px) {
    const m = iconMeta || { icons: {}, base: '', suffix: '' };
    const p = m.icons[id];
    let url = p ? m.base + p + m.suffix : (cache[id] && cache[id].icon) || null;
    if (url && px) url = url.replace(/\/\d+x\d+bb\./, `/${px}x${px}bb.`);
    return url;
  }
  function sellerFor(id) {
    const m = iconMeta || { sellers: {} };
    return m.sellers[id] || (cache[id] && cache[id].seller) || '';
  }
  // Baked metadata: { size, updated, rating, ratings, ios, price }.
  function metaFor(id) { return (iconMeta && iconMeta.meta && iconMeta.meta[id]) || null; }
  function fmtSize(bytes) {
    if (!bytes) return '';
    return bytes >= 1e9 ? (bytes / 1e9).toFixed(1) + ' GB' : Math.round(bytes / 1e6) + ' MB';
  }
  function totalSize(ids) { return ids.reduce((s, id) => s + ((metaFor(id) || {}).size || 0), 0); }
  // Updated in the last 90 days: fresh. Over a year: stale. Else quiet.
  function freshness(id) {
    const m = metaFor(id); if (!m || !m.updated) return '';
    const days = (Date.now() - new Date(m.updated)) / 864e5;
    return days < 90 ? 'fresh' : days > 365 ? 'stale' : '';
  }
  // Setup order: SETUP_ORDER categories first, then page order.
  function setupSort(ids) {
    const order = typeof SETUP_ORDER !== 'undefined' ? SETUP_ORDER : [];
    const rank = (id) => { const a = byId.get(id); const i = a ? order.indexOf(a.cat) : -1; return i < 0 ? order.length : i; };
    const pos = new Map(ordered.map((a, i) => [a.id, i]));
    return [...ids].sort((x, y) => rank(x) - rank(y) || (pos.get(x) ?? 1e9) - (pos.get(y) ?? 1e9));
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
  function iconEl(app, cls, px) {
    const src = iconFor(app.id, px);
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

  // One row of a list: icon, name, developer, Get. Get opens the App Store
  // page (the App Store app itself on an iPhone) and marks the row done.
  function rowEl(app, o) {
    o = o || {};
    const row = document.createElement('div');
    row.className = 'row' + (o.done ? ' done' : '');
    row.append(iconEl(app, 'ic', 128));
    const txt = document.createElement('div'); txt.className = 'txt';
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = app.name;
    const by = document.createElement('div'); by.className = 'by';
    const m = metaFor(app.id), f = freshness(app.id);
    if (f) { const dot = document.createElement('i'); dot.className = 'dot ' + f; dot.title = f === 'fresh' ? 'Updated in the last 90 days' : 'Not updated in over a year'; by.append(dot); }
    by.append(document.createTextNode([sellerFor(app.id), m && fmtSize(m.size)].filter(Boolean).join(' \u00b7 ')));
    txt.append(nm, by);
    if (app.why) { const w = document.createElement('div'); w.className = 'why'; w.textContent = app.why; txt.append(w); }
    row.append(txt);
    if (o.onRemove) {
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'rm'; x.textContent = '\u00d7';
      x.setAttribute('aria-label', 'Remove ' + app.name);
      x.addEventListener('click', o.onRemove);
      row.append(x);
    }
    const get = document.createElement('a');
    get.className = 'get'; get.href = STORE_URL(app.id); get.target = '_blank'; get.rel = 'noopener';
    get.textContent = o.done ? 'Done' : 'Get';
    get.addEventListener('click', () => { row.classList.add('done'); get.textContent = 'Done'; if (o.onGet) o.onGet(); });
    row.append(get);
    return row;
  }

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

  window.AM = { STORE_URL, byId, ordered, loadIcons, iconFor, sellerFor, metaFor, fmtSize, totalSize, freshness, setupSort, hydrate, iconEl, rowEl, encodeList, decodeList, listUrl, appFor };
})();
