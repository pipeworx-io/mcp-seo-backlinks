# mcp-seo-backlinks

SEO Backlinks MCP — backlink intelligence via DataForSEO Backlinks API (dataforseo.com). Completes the SEO suite: SERP + Keywords + Competitors + AI-visibility + Backlinks.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1857+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

| Tool | Description |
|------|-------------|
| `seo_backlinks_summary` | Backlink profile summary for `<domain>` — total backlinks, referring domains, domain rank, dofollow/nofollow split, and spam score, via DataForSEO. The "how strong is this domain's link profile" overview. Example: seo_backlinks_summary({ target: "nike.com", _apiKey: "your-base64-key" }) |
| `seo_backlinks_list` | Backlinks pointing at `<domain>` — the actual list of linking pages with source domain, anchor text, dofollow flag, and first/last seen dates, via DataForSEO. "Who links to this site". Example: seo_backlinks_list({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" }) |
| `seo_referring_domains` | Referring domains for `<domain>` — the domains that link to a target, with each one's rank, backlink count, and spam score, via DataForSEO. "Which sites link to this domain". Example: seo_referring_domains({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" }) |
| `seo_backlinks_anchors` | Anchor-text distribution for `<domain>` — the anchor texts used in backlinks to a target, each with backlink and referring-domain counts, via DataForSEO. "What anchor text do links to this site use". Example: seo_backlinks_anchors({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" }) |
| `seo_backlinks_history` | Backlink growth over time for `<domain>` — monthly history of backlinks, new/lost referring domains, and rank, via DataForSEO. "Is this domain gaining or losing links". Example: seo_backlinks_history({ target: "nike.com", date_from: "2024-01-01", _apiKey: "your-base64-key" }) |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "seo-backlinks": {
      "url": "https://gateway.pipeworx.io/seo-backlinks/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/seo-backlinks/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1857+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/seo_backlinks_summary`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-seo-backlinks` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/seo-backlinks/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "seo-backlinks": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-seo-backlinks"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Seo Backlinks data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
