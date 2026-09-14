# appsmore-links

Short links for appsmore: `appsmore.com/tigereatsapple` redirects to the
readable list link. One Cloudflare Worker on the route `appsmore.com/*`, one
KV namespace, no other state. Everything that isn't a phrase or `/api/short`
passes through to the static site on build.host.

Deploy (needs `CLOUDFLARE_API_TOKEN` with Workers Scripts, Workers KV, Workers
Routes permissions and `CLOUDFLARE_ACCOUNT_ID`):

    cd worker
    npx wrangler@4 kv namespace create LINKS      # once; paste the id into wrangler.jsonc
    npx wrangler@4 deploy

The site itself stays dependency-free; wrangler runs via npx and nothing is
installed into the repo.
