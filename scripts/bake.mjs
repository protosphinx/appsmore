#!/usr/bin/env node
// Pre-render the catalog into index.html so crawlers (and people with JS
// off) see every app name, developer and category without running a
// script. Also writes an ItemList JSON-LD block. Run after editing apps.js:
//   node scripts/icons.mjs && node scripts/bake.mjs
// index.html keeps working unbaked: the page script builds the grid itself
// when it finds the catalog empty.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'apps.js'), 'utf8');
const { CATEGORIES, REMOVED } = new Function(src + '; return { CATEGORIES, REMOVED: typeof REMOVED === "undefined" ? [] : REMOVED };')();
const meta = JSON.parse(readFileSync(join(root, 'icons.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const icon = (id, px) => {
  const p = meta.icons[id];
  return p ? (meta.base + p + meta.suffix).replace(/\/\d+x\d+bb\./, `/${px}x${px}bb.`) : '';
};

// --- catalog HTML ---------------------------------------------------------
let html = '';
const items = [];
let pos = 1;
for (const [cat, apps] of CATEGORIES) {
  html += `<section class="cat" id="${slug(cat)}"><h2>${esc(cat)}</h2><div class="tiles">\n`;
  for (const entry of apps) {
    const [id, name] = entry;
    const why = typeof entry[2] === 'string' ? entry[2] : '';
    const src = icon(id, 256);
    const img = src
      ? `<img class="ic" src="${src}" alt="${esc(name)}" width="64" height="64" loading="lazy">`
      : `<span class="ic letter" aria-hidden="true">${esc(name.trim()[0].toUpperCase())}</span>`;
    html += `<label class="tile" data-id="${id}"><input type="checkbox" aria-label="${esc(name)}"><span class="ico">${img}</span><span class="nm">${esc(name)}</span></label>\n`;
    items.push({
      '@type': 'ListItem', position: pos++,
      item: {
        '@type': 'SoftwareApplication', name, url: `https://apps.apple.com/app/id${id}`,
        operatingSystem: 'iOS', applicationCategory: cat,
        ...(meta.sellers[id] ? { author: { '@type': 'Organization', name: meta.sellers[id] } } : {}),
        ...(src ? { image: src } : {}),
        ...(why ? { description: why } : {}),
      },
    });
  }
  html += `</div></section>\n`;
}
let removed = '';
for (const [name, why] of REMOVED) removed += `<li><b>${esc(name)}</b>: ${esc(why)}</li>\n`;

const ld = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'ItemList',
  name: 'appsmore: hand-picked iPhone apps', url: 'https://appsmore.com/',
  numberOfItems: items.length, itemListOrder: 'https://schema.org/ItemListOrderAscending', itemListElement: items,
});

// --- splice into index.html ---------------------------------------------
const file = join(root, 'index.html');
let page = readFileSync(file, 'utf8');
const splice = (start, end, body) => {
  const a = page.indexOf(start), b = page.indexOf(end);
  if (a < 0 || b < 0) throw new Error(`markers ${start} / ${end} not found in index.html`);
  page = page.slice(0, a + start.length) + '\n' + body + page.slice(b);
};
splice('<!-- catalog:start -->', '<!-- catalog:end -->', html);
splice('<!-- removed:start -->', '<!-- removed:end -->', removed);
splice('<!-- ld:start -->', '<!-- ld:end -->', `<script type="application/ld+json">${ld}</script>`);
writeFileSync(file, page);
console.log(`index.html: baked ${items.length} apps in ${CATEGORIES.length} categories, ${REMOVED.length} removed`);

// --- sitemap.xml with lastmod from git ------------------------------------
// The homepage changes whenever apps.js does, so it takes the newer of the two.
const lastmod = (...files) => {
  let best = '';
  for (const f of files) {
    try {
      const d = execFileSync('git', ['log', '-1', '--format=%cI', '--', f], { cwd: root }).toString().trim().slice(0, 10);
      if (d > best) best = d;
    } catch (e) { /* not a git checkout: leave lastmod out */ }
  }
  return best;
};
const pages = [
  ['https://appsmore.com/', lastmod('apps.js', 'index.html'), 'weekly', '1.0'],
  ['https://appsmore.com/setup.html', lastmod('setup.html'), 'monthly', '0.6'],
  ['https://appsmore.com/about.html', lastmod('about.html'), 'monthly', '0.4'],
];
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(pages.map(([loc, mod, freq, pri]) => `  <url><loc>${loc}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}<changefreq>${freq}</changefreq><priority>${pri}</priority></url>`))
  .concat(['</urlset>', '']).join('\n');
writeFileSync(join(root, 'sitemap.xml'), sm);
console.log(`sitemap.xml: ${pages.length} urls`);
