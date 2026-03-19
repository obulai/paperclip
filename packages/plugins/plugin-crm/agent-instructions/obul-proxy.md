# Obul Proxy — Shared Reference

## Proxy URL Pattern

All Obul-proxied API calls use this format:

```
https://proxy.obul.ai/proxy/https/{upstream_host}/{path}
```

Auth header (required on every request):
```
x-obul-api-key: $OBUL_API_KEY
```

`OBUL_API_KEY` is available in the agent's environment. Never log or expose it.

## How It Works

Obul implements the x402 payment protocol — each request automatically deducts the service cost from the Obul account. No separate billing setup is needed per service. You pay only for what you call.

## Error Handling

| HTTP Status | Meaning | Action |
|------------|---------|--------|
| 200–299 | Success | Continue |
| 402 | Payment required / insufficient balance | Stop, log error |
| 429 | Rate limited | Back off, retry after 30s |
| 401 | Invalid API key | Stop, report misconfiguration |
| 5xx | Upstream error | Log, skip this lead, continue |

## Cost Tracking

After **every** Obul API call, invoke the `obul-log-cost` tool:

```
obul-log-cost(service="<skill-name>", operation="<operation>", costCents=<N>, requestCount=1)
```

This records the spend so it shows up in the Obul dashboard.

## Known Service Upstreams

| Obul Skill | Upstream Host | Auth |
|-----------|--------------|------|
| `obul-twit` | `x402.twit.sh` | x-obul-api-key |
| `obul-ortho-apollo` | `x402.orth.sh` (path: `/apollo/`) | x-obul-api-key |
| `obul-ortho-hunter` | `x402.orth.sh` (path: `/hunter/`) | x-obul-api-key |
| `obul-x402endpoints-firecrawl` | `firecrawl.x402endpoints.com` | x-obul-api-key |
| `obul-stableenrich-reddit` | `x402.stable.sh` (path: `/reddit/`) | x-obul-api-key |
| `obul-scrape-creators` | `scrape.x402endpoints.com` | x-obul-api-key |
