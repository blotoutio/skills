---
name: consentiq
description: |
  ConsentIQ is Blotout's built-in consent analytics and management feature. It tracks marketing opt-in/opt-out
  rates, consent category breakdowns by region (EU, UK, CA), and consent changes over time. Use this skill
  for consent analytics, opt-in rate reporting, GDPR/CCPA consent compliance monitoring, regional consent
  breakdown, and consent trend analysis.

  Use when the developer mentions: consentiq, consent analytics, consent rates, opt-in rates, opt-out rates,
  marketing consent, consent breakdown, consent by region, GDPR consent tracking, CCPA consent monitoring,
  consent dashboard, consent reporting, consent categories analytics, install consentiq, setup consentiq,
  consentiq shopify app, consentiq API integration, consent collection endpoint, save-data endpoint.
---

# ConsentIQ Skill

ConsentIQ is EdgeTag's built-in consent analytics feature that provides visibility into user consent
decisions across your domains. It tracks marketing opt-in/opt-out rates overall and by region, breaks down
consent by category, and monitors changes over time.

## What ConsentIQ Tracks

1. **Total Profiles** — Count of all user profiles with consent data
2. **Marketing Opt-In/Opt-Out** — Overall and by region (EU, UK, CA)
3. **Consent Categories** — Breakdown by: marketing, analytics, sale of data, preferences
4. **Consent Changes** — Last 24 hours marketing consent changes
5. **Regional Compliance** — EU (GDPR), UK (UK GDPR), CA (CCPA/CPRA) specific rates

## Access Methods

### EdgeTag MCP (Claude, Cursor, AI assistants)

Remote MCP server at `https://mcp.edgetag.io`. Authenticates via OAuth (redirects to EdgeTag login). See [MCP Setup](references/mcp-setup.md) for connection instructions.

| Tool                  | What It Returns                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `consentIQOverview`   | Total profiles, marketing opt-in/out overall and by region, 24h changes                    |
| `consentIQCategories` | Per-category consent (marketing, analytics, sale of data, preferences) by region over time |

### Provider API (programmatic access)

Base URL: `https://api.edgetag.io/v1/provider/consentIQ/{scriptId}`

| Endpoint                                     | Method | What It Returns                                                                  |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `/{scriptId}/analytics/overview`            | GET    | Total profiles, marketing opt-in/out by region, 24h changes                      |
| `/{scriptId}/analytics/categories-chart`    | GET    | Per-category consent by region (marketing, analytics, sale of data, preferences) |
| `/{scriptId}/analytics/marketing-chart`     | GET    | Marketing opt-in/out with top regions                                            |
| `/{scriptId}/analytics/marketing-table`     | GET    | Marketing opt-in counts per region over day/week/month                           |
| `/{scriptId}/analytics/marketing-trending`  | GET    | Marketing consent trends over time                                               |
| `/{scriptId}/analytics/saleofdata-chart`    | GET    | Sale of data opt-in/out with top regions                                         |
| `/{scriptId}/analytics/saleofdata-table`    | GET    | Sale of data opt-in counts per region over day/week/month                        |
| `/{scriptId}/analytics/saleofdata-trending` | GET    | Sale of data consent trends over time                                            |
| `/{scriptId}/analytics/dnt-trending`        | GET    | Do Not Track / GPC signal trends vs marketing consent                            |
| `/{scriptId}/analytics/dnt-table`           | GET    | DNT counts per region over day/week/month                                        |

See [Provider API Reference](references/provider-api.md) for full request/response shapes and authentication.

## Setup

ConsentIQ requires a ConsentIQ channel configured on your domain. There are two installation methods:

1. **Shopify App** — Install from https://apps.shopify.com/blotout-consentiq (Shopify stores only). Handles everything automatically via a theme app embed block.
2. **Manual Setup** — Contact Blotout support (`support@blotout.io`) to add the ConsentIQ channel, or add it via the white-label API (`POST /script` with `providerId: "consentIQ"`). Then integrate consent collection in your site by POSTing consent data to `https://{your-edgetag-domain}/providers/consentIQ/save-data` (browser-side, uses EdgeTag cookie).

See [Setup & Installation](references/setup.md) for full instructions, code examples, and CMP-specific integrations (Shopify Privacy API, OneTrust, Osano).

## Quick Decision Trees

### "I need consent analytics"

- Overall opt-in/opt-out rates → See [references/analytics.md](references/analytics.md) § Overview
- Regional breakdown (EU, UK, CA) → See [references/analytics.md](references/analytics.md) § Regional
- Per-category breakdown → See [references/analytics.md](references/analytics.md) § Categories
- Consent trends over time → See [references/analytics.md](references/analytics.md) § Trends
- Programmatic access from app code → See [references/provider-api.md](references/provider-api.md)

### "I need to install / set up ConsentIQ"

- Shopify store → Install from https://apps.shopify.com/blotout-consentiq. See [references/setup.md](references/setup.md) § Shopify App
- Non-Shopify site → Contact Blotout support or use the white-label API. See [references/setup.md](references/setup.md) § Manual Setup
- Send consent data from browser → POST to `https://{your-edgetag-domain}/providers/consentIQ/save-data`. See [references/setup.md](references/setup.md) § Implementation Example
- OneTrust / Osano / Shopify Privacy API integration → See [references/setup.md](references/setup.md) § CMP-Specific Integrations
- Verify ConsentIQ is working → See [references/setup.md](references/setup.md) § Verifying Setup
- Find ConsentIQ channel ID → Use `domains` MCP tool, find channel with `providerId: "consentIQ"`
- Get overview data → Use `consentIQOverview` MCP tool or `GET /{scriptId}/analytics/overview`
- Get category data → Use `consentIQCategories` MCP tool or `GET /{scriptId}/analytics/categories-chart?range=month`

## Reference Files

| File                                       | Contents                                                                            |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| [Analytics](references/analytics.md)       | Overview metrics, regional breakdown, category breakdown, trends                    |
| [MCP Setup](references/mcp-setup.md)       | How to connect Claude Desktop, Cursor, or Claude Code to EdgeTag MCP                |
| [Provider API](references/provider-api.md) | REST API endpoints, authentication, request/response shapes                         |
| [Setup](references/setup.md)               | Installation methods (Shopify app, manual), consent data endpoint, CMP integrations |
| [Gotchas](references/gotchas.md)           | Common mistakes with consent analytics                                              |
