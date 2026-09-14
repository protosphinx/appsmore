#!/usr/bin/env node
// Bake icon paths, seller names and a little metadata (size, last update,
// ratings, min iOS, price) for every app in apps.js into icons.json.
// Run after editing apps.js:  node scripts/icons.mjs
// Needs network access to itunes.apple.com. Apps it can't find are reported
// and left out (the site then looks them up live, or shows a letter avatar).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'apps.js'), 'utf8');
const CATEGORIES = new Function(src + '; return CATEGORIES;')();

const BASE = 'https://is1-ssl.mzstatic.com/image/thumb/';
const SUFFIX = '/100x100bb.jpg';
const ids = CATEGORIES.flatMap(([, apps]) => apps.map(([id]) => id));
const icons = {}, sellers = {}, meta = {}, missing = [];

for (let i = 0; i < ids.length; i += 50) {
  const chunk = ids.slice(i, i + 50);
  const r = await fetch(`https://itunes.apple.com/lookup?id=${chunk.join(',')}&country=us`);
  const j = await r.json();
  const seen = new Set();
  for (const a of j.results) {
    seen.add(a.trackId);
    const u = a.artworkUrl100 || '';
    icons[a.trackId] = u.startsWith(BASE) && u.endsWith(SUFFIX) ? u.slice(BASE.length, -SUFFIX.length) : u;
    sellers[a.trackId] = a.sellerName;
    meta[a.trackId] = {
      size: Number(a.fileSizeBytes) || 0,
      updated: (a.currentVersionReleaseDate || '').slice(0, 10),
      rating: Math.round((a.averageUserRating || 0) * 10) / 10,
      ratings: a.userRatingCount || 0,
      ios: a.minimumOsVersion || '',
      price: a.formattedPrice || '',
    };
  }
  for (const id of chunk) if (!seen.has(id)) missing.push(id);
}

writeFileSync(join(root, 'icons.json'), JSON.stringify({ base: BASE, suffix: SUFFIX, baked: new Date().toISOString().slice(0, 10), icons, sellers, meta }, null, 0) + '\n');
console.log(`icons.json: ${Object.keys(icons).length} apps`);
if (missing.length) console.log('not found on the App Store (check the ids):', missing.join(', '));
