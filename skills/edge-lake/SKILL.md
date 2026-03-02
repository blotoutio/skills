---
name: edge-lake
description: |
  Edge Lake is Blotout's event data lake built on Cloudflare R2 that stores all website and shop events
  (page views, purchases, add to carts, etc.) and makes them queryable via SQL. Use this skill for
  querying event data, building analytics dashboards, funnel analysis, attribution reporting,
  traffic analysis, bot detection, and WAF attack analysis.

  Use this skill when the developer mentions: edge lake, event data lake, R2 data lake, event queries,
  SQL events, funnel analysis, attribution analysis, bot score, WAF attack score, traffic analysis,
  conversion funnel, revenue reporting, event analytics, lake.events, edgeLakeQuery, edgeLakeCodeQuery,
  or provider API edge lake.
---

# Edge Lake Skill

Edge Lake is a per-domain event data lake built on Cloudflare R2 that captures and stores all website/shop
event data. Events are queryable via SQL (R2 SQL) for analytics, funnel analysis, attribution reporting,
and more.

## How Edge Lake Works

1. **Event Capture** — EdgeTag captures browser events (PageView, Purchase, etc.) at the edge
2. **Storage** — Events are stored in Cloudflare R2 as structured data, partitioned by timestamp
3. **Query** — Use R2 SQL to query the `lake.events` table for analysis
4. **Code Queries** — For complex analysis (joins, funnels), use server-side JavaScript with multiple parallel queries

## Adding Edge Lake to a Domain

Edge Lake is a singleton channel — only one per domain. Three ways to add it:

1. **Shopify App** — Install from [https://apps.shopify.com/blotout-datanexus](https://apps.shopify.com/blotout-datanexus) (Shopify stores only). Adds Edge Lake automatically with the default schema.
2. **Contact Blotout Support** — Email `support@blotout.io` to have Edge Lake enabled on your domain.
3. **Script API** — If you have white-label API access, `POST https://api.edgetag.io/v1/script` with `providerId: "edgeLake"` and the JSON schema as a secret.

See [Setup Guide](references/setup.md) for full details on all methods, required secrets, and schema customization.

## Access Methods

### EdgeTag MCP (Claude, Cursor, AI assistants)

Remote MCP server at `https://mcp.edgetag.io`. Authenticates via OAuth (redirects to EdgeTag login). See [MCP Setup](references/mcp-setup.md) for connection instructions.


| Tool                      | When to Use                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- |
| `edgeLakeQuery`           | Simple single SQL queries with small result sets                                  |
| `edgeLakeCodeQuery`       | Complex analysis: multiple queries + JS processing (funnels, joins, aggregations) |
| `edgeLakeTrafficAnalysis` | Pre-built traffic overview (browsers, OS, devices, countries)                     |
| `edgeLakeBotScore`        | Bot detection analysis by Cloudflare bot scores                                   |
| `edgeLakeAttackAnalysis`  | WAF attack classification analysis                                                |


### Provider API (programmatic access)

Base URL: `https://api.edgetag.io/v1/provider/edgeLake/{scriptId}`


| Endpoint                           | Method | When to Use                                        |
| ---------------------------------- | ------ | -------------------------------------------------- |
| `/{scriptId}/query`               | POST   | Execute SQL queries against `lake.events`          |
| `/{scriptId}/funnel`              | POST   | Conversion funnel analysis (PageView → Purchase)   |
| `/{scriptId}/traffic-analysis`    | POST   | Traffic breakdown by browser, OS, device, country  |
| `/{scriptId}/bot-score`           | POST   | Bot detection by Cloudflare bot scores             |
| `/{scriptId}/attack-analysis`     | POST   | WAF attack classification                          |
| `/{scriptId}/bot-categories`      | POST   | Bot traffic grouped by verified bot category       |
| `/{scriptId}/bot-category-detail` | POST   | User agents for a specific bot category            |


See [Provider API Reference](references/provider-api.md) for full request/response shapes and authentication.

## Quick Decision Trees

### "I need to add Edge Lake to a domain"

- Shopify store → Install from [https://apps.shopify.com/blotout-datanexus](https://apps.shopify.com/blotout-datanexus). See [references/setup.md](references/setup.md) § Shopify App
- Non-Shopify site → Contact Blotout support (`support@blotout.io`). See [references/setup.md](references/setup.md) § Contact Support
- Via white-label API → See [references/setup.md](references/setup.md) § Script API
- Customize the event schema → See [references/setup.md](references/setup.md) § Schema

### "I need to query event data"

- Simple query (one table, one filter) → See [references/sql-reference.md](references/sql-reference.md)
- Complex analysis (funnels, joins, aggregations) → See [references/code-queries.md](references/code-queries.md)
- Traffic overview (browsers, devices, countries) → Use `edgeLakeTrafficAnalysis` MCP tool or `POST /{scriptId}/traffic-analysis`
- Bot detection → Use `edgeLakeBotScore` MCP tool or `POST /{scriptId}/bot-score`
- Security analysis → Use `edgeLakeAttackAnalysis` MCP tool or `POST /{scriptId}/attack-analysis`
- Programmatic access from app code → See [references/provider-api.md](references/provider-api.md)

### "I need to build a report"

- Revenue by channel/UTM source → See [references/code-queries.md](references/code-queries.md) § Attribution
- Conversion funnel (PageView → Purchase) → See [references/code-queries.md](references/code-queries.md) § Funnels
- Daily/weekly trends → See [references/code-queries.md](references/code-queries.md) § Trends
- User behavior analysis → See [references/code-queries.md](references/code-queries.md) § Users

## Reference Files


| File                                         | Contents                                                             |
| -------------------------------------------- | -------------------------------------------------------------------- |
| [Setup Guide](references/setup.md)           | How to add Edge Lake via dashboard or API, schema customization      |
| [SQL Reference](references/sql-reference.md) | Table schema, column reference, R2 SQL syntax and limitations        |
| [Code Queries](references/code-queries.md)   | Multi-query patterns with JavaScript processing                      |
| [MCP Setup](references/mcp-setup.md)         | How to connect Claude Desktop, Cursor, or Claude Code to EdgeTag MCP |
| [Provider API](references/provider-api.md)   | REST API endpoints, authentication, request/response shapes          |
| [Gotchas](references/gotchas.md)             | Common query mistakes and R2 SQL pitfalls                            |


## Key Constraints

- **Read-only**: Only SELECT statements allowed
- **Single table**: All queries against `lake.events`
- **No JOINs**: Use `edgeLakeCodeQuery` for multi-query joins in JavaScript
- **No subqueries, CTEs, UNION, window functions, IN lists**
- **ALWAYS filter on `event_timestamp`** for performance (enables R2 file pruning)
- **LIMIT max 10,000 rows** per query
