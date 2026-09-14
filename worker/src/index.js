// appsmore short links. Runs on appsmore.com/* at Cloudflare's edge.
//   GET  /tigereatsapple      -> 302 to /list.html#1password.gmail.whatsapp
//   POST /api/short {list}    -> { phrase, url }  (same list always gets the same phrase)
// Everything else passes through to the static site untouched.
// Storage: one KV namespace. p:<phrase> = list, h:<sha256 list> = phrase,
// both with a one-year TTL that is refreshed on use. Nothing else is kept.

const YEAR = 365 * 24 * 3600;
const PHRASE = /^[a-z]{8,40}$/;
const LIST = /^[a-z0-9-]{1,40}(\.[a-z0-9-]{1,40}){0,120}$/;

const NOUNS = 'apple bear bird boat book cake camel cat cloud comet crab crane crow deer dog dove duck eagle egg elk fern fig fish flag fox frog gecko goat goose grape hawk heron horse ibis jade kite koala lamb leaf lemon lion llama lynx mango maple mole moon moose moth mouse mule newt oak olive onion otter owl panda peach pear pig pine plum pony puma quail rabbit raven robin rose seal shark sheep sloth snail snake spider squid stork swan tiger toad trout tuna turtle viper walrus wasp whale wolf worm yak zebra acorn anvil arrow badge bagel bell bench brick broom bucket button cabin candle canoe carrot cello chair cherry clock coin comb cookie crayon cup dice drum feather fiddle flute garlic guitar hammer helmet jacket kettle ladder lantern magnet marble mitten muffin needle noodle oboe paddle pencil pepper piano pickle pillow pirate pocket pretzel pumpkin puzzle radish ribbon rocket saddle sandal scarf shovel sock spoon stamp sugar teapot ticket toaster tomato towel trumpet tulip violin waffle wagon walnut whistle window yogurt zipper'.split(' ');
const VERBS = 'eats hugs finds likes meets needs paints pets pokes reads sees sells sends ships shows sings takes tells wants wears fixes grabs holds keeps kicks lifts loves makes moves names owns packs pulls pushes rides rolls saves seeks spins stacks steals tastes throws tickles tows trades trims wakes walks warms washes waters weighs'.split(' ');

const pick = (arr, bytes, i) => arr[((bytes[i] << 8) | bytes[i + 1]) % arr.length];
function phrase() {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return pick(NOUNS, b, 0) + pick(VERBS, b, 2) + pick(NOUNS, b, 4);
}
async function sha(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/short') {
      if (request.method !== 'POST') return json({ error: 'POST only' }, 405);
      if (request.headers.get('origin') && new URL(request.headers.get('origin')).host !== url.host) return json({ error: 'same origin only' }, 403);
      let body; try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
      const list = String(body.list || '').toLowerCase();
      if (!LIST.test(list)) return json({ error: 'bad list' }, 400);

      // Light rate limit: 30 new links per IP per hour.
      const ip = request.headers.get('cf-connecting-ip') || 'x';
      const rk = 'r:' + (await sha(ip)).slice(0, 16) + ':' + Math.floor(Date.now() / 3600e3);
      const n = Number((await env.LINKS.get(rk)) || 0);
      if (n >= 30) return json({ error: 'slow down' }, 429);

      const hk = 'h:' + (await sha(list));
      let p = await env.LINKS.get(hk);
      if (!p) {
        for (let i = 0; i < 5 && !p; i++) { const c = phrase(); if (!(await env.LINKS.get('p:' + c))) p = c; }
        if (!p) return json({ error: 'try again' }, 503);
        await Promise.all([
          env.LINKS.put('p:' + p, list, { expirationTtl: YEAR }),
          env.LINKS.put(hk, p, { expirationTtl: YEAR }),
          env.LINKS.put(rk, String(n + 1), { expirationTtl: 3600 }),
        ]);
      }
      return json({ phrase: p, url: `${url.origin}/${p}` });
    }

    // A bare phrase: look it up and send the phone to the list page.
    const m = path.match(/^\/([a-z]{8,40})$/);
    if (m && request.method === 'GET') {
      const list = await env.LINKS.get('p:' + m[1]);
      if (list) {
        // Refresh the TTL in the background so links people use keep living.
        env.LINKS.put('p:' + m[1], list, { expirationTtl: YEAR }).catch(() => {});
        return Response.redirect(`${url.origin}/list.html#${list}`, 302);
      }
    }

    return fetch(request);   // the static site
  },
};
