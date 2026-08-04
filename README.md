# mcp-seo-backlinks

SEO Backlinks MCP — backlink intelligence via DataForSEO Backlinks API

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Seo Backlinks data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
