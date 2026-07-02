interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * SEO Backlinks MCP — backlink intelligence via DataForSEO Backlinks API
 * (dataforseo.com). Completes the SEO suite: SERP + Keywords + Competitors +
 * AI-visibility + Backlinks.
 *
 * Tools:
 * - seo_backlinks_summary    : backlink summary + domain rank for a target
 * - seo_backlinks_list       : the actual backlinks pointing at a target
 * - seo_referring_domains    : domains that link to a target
 * - seo_backlinks_anchors    : anchor-text distribution
 * - seo_backlinks_history    : backlink/referring-domain growth over time
 *
 * Auth: DataForSEO HTTP Basic. Pass _apiKey = base64("login:password").
 * NOTE: the Backlinks API requires a SEPARATE DataForSEO subscription ($100/mo
 * minimum, spendable balance) — until activated, calls return 40204 "Access
 * denied" which this pack surfaces as an actionable error.
 *
 * Wave 1 = BYO-key only. Wave 2 adds a measured `cost` CostModel + realCogs gate.
 * Uniform DataForSEO cost: $0.02/request + $0.00003/row (price to capped rows).
 */


const BASE_URL = 'https://api.dataforseo.com';

const tools: McpToolExport['tools'] = [
  {
    name: 'seo_backlinks_summary',
    description:
      'Backlink profile summary for `<domain>` — total backlinks, referring domains, domain rank, dofollow/nofollow split, and spam score, via DataForSEO. The "how strong is this domain\'s link profile" overview. Example: seo_backlinks_summary({ target: "nike.com", _apiKey: "your-base64-key" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Domain, subdomain, or URL to analyze (no protocol for a domain), e.g. "nike.com"' },
        backlinks_status_type: { type: 'string', description: '"live" (default), "all", or "lost"' },
        include_subdomains: { type: 'boolean', description: 'Include subdomains (default true)' },
        _apiKey: { type: 'string', description: 'DataForSEO API key = base64("login:password")' },
      },
      required: ['target', '_apiKey'],
    },
  },
  {
    name: 'seo_backlinks_list',
    description:
      'Backlinks pointing at `<domain>` — the actual list of linking pages with source domain, anchor text, dofollow flag, and first/last seen dates, via DataForSEO. "Who links to this site". Example: seo_backlinks_list({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Domain, subdomain, or URL, e.g. "nike.com"' },
        mode: { type: 'string', description: '"as_is" (default), "one_per_domain", or "one_per_anchor"' },
        limit: { type: 'integer', description: 'Max backlinks to return (default 50, max 200)' },
        backlinks_status_type: { type: 'string', description: '"live" (default), "all", or "lost"' },
        _apiKey: { type: 'string', description: 'DataForSEO API key = base64("login:password")' },
      },
      required: ['target', '_apiKey'],
    },
  },
  {
    name: 'seo_referring_domains',
    description:
      'Referring domains for `<domain>` — the domains that link to a target, with each one\'s rank, backlink count, and spam score, via DataForSEO. "Which sites link to this domain". Example: seo_referring_domains({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Domain, subdomain, or URL, e.g. "nike.com"' },
        limit: { type: 'integer', description: 'Max referring domains to return (default 50, max 200)' },
        backlinks_status_type: { type: 'string', description: '"live" (default), "all", or "lost"' },
        _apiKey: { type: 'string', description: 'DataForSEO API key = base64("login:password")' },
      },
      required: ['target', '_apiKey'],
    },
  },
  {
    name: 'seo_backlinks_anchors',
    description:
      'Anchor-text distribution for `<domain>` — the anchor texts used in backlinks to a target, each with backlink and referring-domain counts, via DataForSEO. "What anchor text do links to this site use". Example: seo_backlinks_anchors({ target: "nike.com", limit: 50, _apiKey: "your-base64-key" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Domain, subdomain, or URL, e.g. "nike.com"' },
        limit: { type: 'integer', description: 'Max anchors to return (default 50, max 200)' },
        backlinks_status_type: { type: 'string', description: '"live" (default), "all", or "lost"' },
        _apiKey: { type: 'string', description: 'DataForSEO API key = base64("login:password")' },
      },
      required: ['target', '_apiKey'],
    },
  },
  {
    name: 'seo_backlinks_history',
    description:
      "Backlink growth over time for `<domain>` — monthly history of backlinks, new/lost referring domains, and rank, via DataForSEO. \"Is this domain gaining or losing links\". Example: seo_backlinks_history({ target: \"nike.com\", date_from: \"2024-01-01\", _apiKey: \"your-base64-key\" })",
    inputSchema: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Domain, subdomain, or URL, e.g. "nike.com"' },
        date_from: { type: 'string', description: 'Start date YYYY-MM-DD (min 2019-01-01; default 1 year ago)' },
        date_to: { type: 'string', description: 'End date YYYY-MM-DD (default today)' },
        _apiKey: { type: 'string', description: 'DataForSEO API key = base64("login:password")' },
      },
      required: ['target', '_apiKey'],
    },
  },
];

interface DfsResponse {
  status_code: number;
  status_message: string;
  tasks?: Array<{
    status_code: number;
    status_message: string;
    cost: number;
    result?: Array<Record<string, unknown>> | null;
  }>;
}

async function dfsPost(path: string, body: unknown, apiKey: string, tool: string) {
  if (!apiKey) {
    throw new Error(
      `${tool} requires a DataForSEO API key. Pass _apiKey = base64("login:password") from your DataForSEO account (sign up at dataforseo.com). This is a paid data source — bring your own key, or add credits at https://pipeworx.io/account.`,
    );
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `DataForSEO auth failed (HTTP ${res.status}). Check _apiKey is base64("login:password") and your account is funded/verified. Re-encode credentials and retry.`,
    );
  }
  if (!res.ok) throw new Error(`DataForSEO ${tool} error: HTTP ${res.status}`);
  const data = (await res.json()) as DfsResponse;
  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO ${tool}: ${data.status_code} ${data.status_message}`);
  }
  const task = data.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    // 40204 = Backlinks API not activated on this account.
    if (task?.status_code === 40204) {
      throw new Error(
        `DataForSEO Backlinks API is not activated on this account (40204 Access denied). Activate the Backlinks subscription in your DataForSEO dashboard (Access Subscriptions → Backlinks API; $100/mo minimum, spendable across your account), then retry.`,
      );
    }
    throw new Error(`DataForSEO ${tool}: ${task?.status_code ?? 'no task'} ${task?.status_message ?? ''}`.trim());
  }
  return task;
}

const num = (v: unknown) => (typeof v === 'number' ? v : null);
const str = (v: unknown) => (typeof v === 'string' ? v : null);
const clampLimit = (v: unknown, def: number, max: number) => Math.min(Math.max(Number(v ?? def), 1), max);

function targetOf(args: Record<string, unknown>, tool: string): string {
  const target = args.target as string;
  if (!target) throw new Error(`${tool} requires a \`target\` domain/URL (e.g. "nike.com").`);
  return target;
}

async function backlinksSummary(args: Record<string, unknown>, apiKey: string) {
  const target = targetOf(args, 'seo_backlinks_summary');
  const body = {
    target,
    backlinks_status_type: (args.backlinks_status_type as string) ?? 'live',
    include_subdomains: args.include_subdomains !== false,
  };
  const task = await dfsPost('/v3/backlinks/summary/live', [body], apiKey, 'seo_backlinks_summary');
  const r = (task.result?.[0] ?? {}) as Record<string, unknown>;
  return {
    target,
    rank: num(r.rank),
    backlinks: num(r.backlinks),
    referring_domains: num(r.referring_domains),
    referring_main_domains: num(r.referring_main_domains),
    referring_pages: num(r.referring_pages),
    backlinks_spam_score: num(r.backlinks_spam_score),
    referring_links_attributes: r.referring_links_attributes ?? null,
    referring_links_types: r.referring_links_types ?? null,
  };
}

async function backlinksList(args: Record<string, unknown>, apiKey: string) {
  const target = targetOf(args, 'seo_backlinks_list');
  const limit = clampLimit(args.limit, 50, 200);
  const body = {
    target,
    mode: (args.mode as string) ?? 'as_is',
    limit,
    backlinks_status_type: (args.backlinks_status_type as string) ?? 'live',
  };
  const task = await dfsPost('/v3/backlinks/backlinks/live', [body], apiKey, 'seo_backlinks_list');
  const r = (task.result?.[0] ?? {}) as { total_count?: number; items?: Array<Record<string, unknown>> };
  const items = (r.items ?? []).map((it) => ({
    domain_from: str(it.domain_from),
    url_from: str(it.url_from),
    url_to: str(it.url_to),
    anchor: str(it.anchor),
    dofollow: typeof it.dofollow === 'boolean' ? it.dofollow : null,
    domain_from_rank: num(it.domain_from_rank),
    first_seen: str(it.first_seen),
    last_seen: str(it.last_seen),
    is_lost: typeof it.is_lost === 'boolean' ? it.is_lost : null,
  }));
  return { target, total: num(r.total_count), backlinks: items };
}

async function referringDomains(args: Record<string, unknown>, apiKey: string) {
  const target = targetOf(args, 'seo_referring_domains');
  const limit = clampLimit(args.limit, 50, 200);
  const body = { target, limit, backlinks_status_type: (args.backlinks_status_type as string) ?? 'live' };
  const task = await dfsPost('/v3/backlinks/referring_domains/live', [body], apiKey, 'seo_referring_domains');
  const r = (task.result?.[0] ?? {}) as { total_count?: number; items?: Array<Record<string, unknown>> };
  const items = (r.items ?? []).map((it) => ({
    domain: str(it.domain),
    rank: num(it.rank),
    backlinks: num(it.backlinks),
    referring_domains: num(it.referring_domains),
    backlinks_spam_score: num(it.backlinks_spam_score),
    first_seen: str(it.first_seen),
    lost_date: str(it.lost_date),
  }));
  return { target, total: num(r.total_count), referring_domains: items };
}

async function backlinksAnchors(args: Record<string, unknown>, apiKey: string) {
  const target = targetOf(args, 'seo_backlinks_anchors');
  const limit = clampLimit(args.limit, 50, 200);
  const body = { target, limit, backlinks_status_type: (args.backlinks_status_type as string) ?? 'live' };
  const task = await dfsPost('/v3/backlinks/anchors/live', [body], apiKey, 'seo_backlinks_anchors');
  const r = (task.result?.[0] ?? {}) as { total_count?: number; items?: Array<Record<string, unknown>> };
  const items = (r.items ?? []).map((it) => ({
    anchor: str(it.anchor),
    rank: num(it.rank),
    backlinks: num(it.backlinks),
    referring_domains: num(it.referring_domains),
    first_seen: str(it.first_seen),
    lost_date: str(it.lost_date),
  }));
  return { target, total: num(r.total_count), anchors: items };
}

async function backlinksHistory(args: Record<string, unknown>, apiKey: string) {
  const target = targetOf(args, 'seo_backlinks_history');
  const body: Record<string, unknown> = { target };
  if (args.date_from) body.date_from = args.date_from;
  if (args.date_to) body.date_to = args.date_to;
  const task = await dfsPost('/v3/backlinks/history/live', [body], apiKey, 'seo_backlinks_history');
  const r = (task.result?.[0] ?? {}) as { items?: Array<Record<string, unknown>> };
  const items = (r.items ?? []).map((it) => ({
    date: str(it.date),
    rank: num(it.rank),
    backlinks: num(it.backlinks),
    referring_domains: num(it.referring_domains),
    new_referring_domains: num(it.new_referring_domains),
    lost_referring_domains: num(it.lost_referring_domains),
    broken_backlinks: num(it.broken_backlinks),
  }));
  return { target, history: items };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  switch (name) {
    case 'seo_backlinks_summary':
      return backlinksSummary(args, apiKey);
    case 'seo_backlinks_list':
      return backlinksList(args, apiKey);
    case 'seo_referring_domains':
      return referringDomains(args, apiKey);
    case 'seo_backlinks_anchors':
      return backlinksAnchors(args, apiKey);
    case 'seo_backlinks_history':
      return backlinksHistory(args, apiKey);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Wave 1 (BYO-only): nominal access meter; user's own key bears DataForSEO COGS.
// Wave 2: measured `cost` CostModel — $0.02/request + $0.00003/row, priced to the
// row caps above (≈$0.02 summary, ≈$0.026 at limit 200) ×1.5 + realCogs gate.
export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
