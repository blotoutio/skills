---
name: edgetag
description: |
  Comprehensive EdgeTag (by Blotout) implementation skill covering the JavaScript SDK, server-side event tracking,
  identity graph, consent management, channel integrations (Meta CAPI, Google Ads, TikTok, Klaviyo, 50+ more),
  platform deployments (Shopify, WooCommerce, WordPress, Wix, React, Next.js), HTTP API, cross-domain identity
  stitching, webhook ingestion, offline events, audience uploads, and data warehouse delivery.

  Use this skill for ANY EdgeTag or Blotout implementation task — installing the SDK, sending events, configuring
  consent, setting up channels, debugging event delivery, building identity graphs, cross-domain tracking,
  webhook integrations, HTTP API calls, audience uploads, headless implementations, or building white-label
  apps on top of the EdgeTag REST API.

  Also use when the developer mentions: edgetag, blotout, @blotoutio, server-side tagging, first-party data
  infrastructure, CAPI, conversion API, event match quality, EMQ, identity stitching, tag_user_id, et_uid, edge tagging,
  first-party cookie, server-side pixel, signal recovery, edgetag-sdk-js, white-label edgetag, edgetag API,
  edgetag oauth, or programmatic edgetag setup.
---

# EdgeTag Implementation Skill

EdgeTag is a server-side tracking infrastructure built on Cloudflare Workers that captures, enriches, and
activates first-party data signals across 50+ marketing channels. It replaces fragile client-side pixels
with robust server-side event delivery, running on 1,600+ Cloudflare edge locations worldwide.

## How EdgeTag Works

1. **SDK Initialization** — A lightweight async JavaScript snippet loads from your first-party subdomain via `/load`
2. **Identity Assignment** — EdgeTag sets a first-party cookie (`tag_user_id`) for persistent visitor identification
3. **Consent Gating** — No data leaves the browser until the user grants consent (enabled by default)
4. **Event Capture** — Standard and custom events are sent to a first-party subdomain (CNAME)
5. **Server-Side Processing** — At the edge, events are enriched with identity graph data, geo, and attribution
6. **Channel Routing** — Events are transformed and delivered to each configured channel's API (Meta CAPI, Google, TikTok, etc.)
7. **Identity Stitching** — Anonymous and known identifiers are merged into a unified user profile

## EdgeTag MCP (Claude, Cursor, AI assistants)

Remote MCP server at `https://mcp.edgetag.io` with 17 tools for domain management, event data queries (Edge Lake), user data queries (ID Graph), consent analytics (ConsentIQ), channel health, traffic analytics, bot detection, and more. Authenticates via OAuth.

**Use MCP during implementation planning:** Call `domains` to discover which channels are configured for the domain you're implementing. This tells you exactly which browser provider npm packages to install — preventing the most common implementation mistake (missing provider packages). If MCP is not connected, recommend the user set it up before proceeding.

See [MCP Setup & Tools Reference](references/mcp/setup.md) for connection instructions, all available tools, and typical workflows.

## Important: Prefer Local References

The reference files in this skill contain comprehensive implementation details. Always check the local reference files first before searching the web or fetching external URLs. Only go to the web if a specific detail is missing from the reference files.

## Planning Phase: Required References

When planning an EdgeTag implementation (especially npm/headless), you MUST load these references during the planning phase — not after writing code:

1. **[npm-sdk/README.md](references/npm-sdk/README.md)** + **[npm-sdk/api-reference.md](references/npm-sdk/api-reference.md)** — Correct import names, function signatures, TypeScript types
2. **[npm-sdk/gotchas.md](references/npm-sdk/gotchas.md)** — Critical mistakes to avoid (wrong imports, missing providers)
3. **[channels/channel-reference.md](references/channels/channel-reference.md)** — Which channels have browser npm packages and their exact package names
4. **[events/standard-events.md](references/events/standard-events.md)** — Standard event names and required payloads
5. **[mcp/setup.md](references/mcp/setup.md)** — EdgeTag MCP tools for channel discovery

Additionally, **use the EdgeTag MCP** during planning to pull real channel data for the domain being implemented. See the "Mandatory Channel Discovery" section below.

## Mandatory Channel Discovery for npm/Headless Implementations

**This step is CRITICAL and must NOT be skipped.** For npm/headless implementations, you must discover which channels need browser provider packages BEFORE writing code. Use EdgeTag MCP (`domains` tool) to pull real channel data, or ask the user which channels they have. Without provider packages, browser pixels silently fail.

See **[npm-sdk/patterns.md § Channel Discovery](references/npm-sdk/patterns.md)** for the full step-by-step workflow and the channel→npm package mapping table.

## Quick Decision Trees

### "I need to install EdgeTag"

- HTML website (script tag) → See [browser-sdk/README.md](references/browser-sdk/README.md)
- npm / yarn / headless project → See [npm-sdk/README.md](references/npm-sdk/README.md) + [npm-sdk/patterns.md](references/npm-sdk/patterns.md)
- Shopify store → See [platforms/platform-guides.md](references/platforms/platform-guides.md) § Shopify
- WooCommerce / WordPress → See [platforms/platform-guides.md](references/platforms/platform-guides.md) § WordPress / WooCommerce
- BigCommerce → See [platforms/platform-guides.md](references/platforms/platform-guides.md) § BigCommerce
- Salesforce Commerce Cloud → See [platforms/platform-guides.md](references/platforms/platform-guides.md) § Salesforce CC
- React / Next.js / Vue / SPA → See [platforms/patterns.md](references/platforms/patterns.md)
- Landing pages (Unbounce, Instapage, etc.) → See [platforms/platform-guides.md](references/platforms/platform-guides.md)

### "I need to track events"

- Standard events (PageView, AddToCart, Purchase, etc.) → See [events/standard-events.md](references/events/standard-events.md)
- Custom events → See [events/patterns.md](references/events/patterns.md)
- Offline / server-to-server events → See [http-api/api-reference.md](references/http-api/api-reference.md)
- CSV event upload → See [events/patterns.md](references/events/patterns.md) § CSV Upload
- Keyword conversions → See [events/patterns.md](references/events/patterns.md) § Keyword Conversions

### "I need to handle user identity"

- Capture PII (email, phone, name) → See [identity/api-reference.md](references/identity/api-reference.md)
- Standard key formats → See [identity/api-reference.md](references/identity/api-reference.md) § Standard Keys
- Store custom data per user → See [identity/api-reference.md](references/identity/api-reference.md) § Data Function
- Retrieve stored data → See [identity/api-reference.md](references/identity/api-reference.md) § getData
- Cross-domain identity transfer → See [identity/patterns.md](references/identity/patterns.md) § Cross-Domain
- New vs returning user → See [browser-sdk/api-reference.md](references/browser-sdk/api-reference.md) § ready or [npm-sdk/api-reference.md](references/npm-sdk/api-reference.md) § ready
- Server-side cookie for headless → See [identity/patterns.md](references/identity/patterns.md) § Server-Side Cookie

### "I need to manage consent"

- Basic consent (accept all / decline all) → See [consent/api-reference.md](references/consent/api-reference.md)
- Per-provider consent → See [consent/api-reference.md](references/consent/api-reference.md)
- Category-based consent (necessary, advertising, analytics, functional, share_pii) → See [consent/api-reference.md](references/consent/api-reference.md)
- CMP integration (OneTrust, Cookiebot, Osano) → See [consent/patterns.md](references/consent/patterns.md)
- Disable consent checks → See [consent/api-reference.md](references/consent/api-reference.md) § disableConsentCheck
- Read current consent → See [consent/api-reference.md](references/consent/api-reference.md) § getConsent

### "I need to set up a channel / destination"

- Meta / Facebook (CAPI + browser pixel) → See [channels/channel-reference.md](references/channels/channel-reference.md) § Meta
- Google Ads (Enhanced Conversions) → See [channels/channel-reference.md](references/channels/channel-reference.md) § Google Ads
- TikTok (Events API) → See [channels/channel-reference.md](references/channels/channel-reference.md) § TikTok
- Klaviyo → See [channels/channel-reference.md](references/channels/channel-reference.md) § Klaviyo
- Event Sink (custom endpoint) → See [channels/channel-reference.md](references/channels/channel-reference.md) § Event Sink
- Webhook (CRM, custom logic) → See [channels/channel-reference.md](references/channels/channel-reference.md) § Webhook
- Audience upload → See [http-api/api-reference.md](references/http-api/api-reference.md) § /audience Endpoint
- All 50+ channels → See [channels/channel-reference.md](references/channels/channel-reference.md) § Complete List

### "I need to send events from a server / backend"

- HTTP API overview → See [http-api/README.md](references/http-api/README.md)
- /tag endpoint (events) → See [http-api/api-reference.md](references/http-api/api-reference.md)
- /data endpoint (user enrichment) → See [http-api/api-reference.md](references/http-api/api-reference.md)
- CRM integration patterns → See [http-api/patterns.md](references/http-api/patterns.md)

### "I need to use EdgeTag MCP"

- Connect Claude Desktop / Cursor / Claude Code → See [mcp/setup.md](references/mcp/setup.md)
- Query event data → Use `edgeLakeQuery` or `edgeLakeCodeQuery`
- Get consent analytics → Use `consentIQOverview` or `consentIQCategories`
- Check Facebook EMQ → Use `metaEMQ`
- Query user data → Use `domainIDGraph`
- Get traffic analytics → Use `domainAnalytics` or `edgeLakeTrafficAnalysis`

### "I need to build a white-label app / use the EdgeTag API programmatically"

- White-label overview & architecture → See [white-label-api/README.md](references/white-label-api/README.md)
- OAuth 2.0 setup (app creation, redirect, token exchange) → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § OAuth 2.0
- Create website / tag via API → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § Tag Management
- DNS verification via API → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § DNS Verification
- Configure consent via API → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § Consent Configuration
- Add channels via API → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § Script Management
- Encrypt channel secrets → See [white-label-api/api-reference.md](references/white-label-api/api-reference.md) § Secret Encryption
- Managed vs self-hosted hosting → See [white-label-api/README.md](references/white-label-api/README.md) § Hosting Models
- Token lifecycle management → See [white-label-api/patterns.md](references/white-label-api/patterns.md) § Token Lifecycle
- Full onboarding flow pattern → See [white-label-api/patterns.md](references/white-label-api/patterns.md) § Complete Customer Onboarding
- Common API mistakes → See [white-label-api/gotchas.md](references/white-label-api/gotchas.md)

### "I need to debug / QA"

- Events not firing → See [debugging/troubleshooting-guide.md](references/debugging/troubleshooting-guide.md)
- Identity not stitching → See [debugging/troubleshooting-guide.md](references/debugging/troubleshooting-guide.md)
- DNS / CNAME issues → See [debugging/troubleshooting-guide.md](references/debugging/troubleshooting-guide.md)
- Low EMQ score → See [debugging/troubleshooting-guide.md](references/debugging/troubleshooting-guide.md) § EMQ
- QA test cases checklist → See [debugging/troubleshooting-guide.md](references/debugging/troubleshooting-guide.md) § QA Test Cases
- Implementation checklist → See [debugging/patterns.md](references/debugging/patterns.md)

### "I need infrastructure / DNS setup"

- Onboarding flow → See [infrastructure/setup-guide.md](references/infrastructure/setup-guide.md)
- DNS record setup → See [infrastructure/setup-guide.md](references/infrastructure/setup-guide.md) § DNS
- Managed vs self-hosted → See [infrastructure/README.md](references/infrastructure/README.md)
- Self-hosted Cloudflare setup → See [infrastructure/setup-guide.md](references/infrastructure/setup-guide.md) § Self-Hosted

### "I need a product/PR overview for planning or stakeholder communication"

- Product narrative, architecture, rollout phases, and KPIs → See [pr/README.md](references/pr/README.md)

## Reference Folder Index

| Folder | README | API / Guide | Gotchas | Patterns |
|--------|--------|-------------|---------|----------|
| [browser-sdk/](references/browser-sdk/) | [Overview & install](references/browser-sdk/README.md) | [API reference](references/browser-sdk/api-reference.md) | [Common mistakes](references/browser-sdk/gotchas.md) | [Best practices](references/browser-sdk/patterns.md) |
| [npm-sdk/](references/npm-sdk/) | [Overview & install](references/npm-sdk/README.md) | [API reference](references/npm-sdk/api-reference.md) | [Common mistakes](references/npm-sdk/gotchas.md) | [Best practices](references/npm-sdk/patterns.md) |
| [events/](references/events/) | [Events overview](references/events/README.md) | [Standard events](references/events/standard-events.md) | [Event pitfalls](references/events/gotchas.md) | [Tracking patterns](references/events/patterns.md) |
| [identity/](references/identity/) | [Identity system](references/identity/README.md) | [Identity APIs](references/identity/api-reference.md) | [Identity pitfalls](references/identity/gotchas.md) | [Identity patterns](references/identity/patterns.md) |
| [consent/](references/consent/) | [Consent system](references/consent/README.md) | [Consent APIs](references/consent/api-reference.md) | [Consent pitfalls](references/consent/gotchas.md) | [CMP integrations](references/consent/patterns.md) |
| [channels/](references/channels/) | [Channels overview](references/channels/README.md) | [Channel reference](references/channels/channel-reference.md) | [Channel pitfalls](references/channels/gotchas.md) | [Channel patterns](references/channels/patterns.md) |
| [platforms/](references/platforms/) | [Platform overview](references/platforms/README.md) | [Platform guides](references/platforms/platform-guides.md) | [Platform pitfalls](references/platforms/gotchas.md) | [Platform patterns](references/platforms/patterns.md) |
| [http-api/](references/http-api/) | [HTTP API overview](references/http-api/README.md) | [API reference](references/http-api/api-reference.md) | [API pitfalls](references/http-api/gotchas.md) | [Integration patterns](references/http-api/patterns.md) |
| [infrastructure/](references/infrastructure/) | [Architecture](references/infrastructure/README.md) | [Setup guide](references/infrastructure/setup-guide.md) | [Setup pitfalls](references/infrastructure/gotchas.md) | [DNS & hosting](references/infrastructure/patterns.md) |
| [white-label-api/](references/white-label-api/) | [White-label overview](references/white-label-api/README.md) | [API reference](references/white-label-api/api-reference.md) | [API pitfalls](references/white-label-api/gotchas.md) | [Integration patterns](references/white-label-api/patterns.md) |
| [debugging/](references/debugging/) | [Debug tools](references/debugging/README.md) | [Troubleshooting](references/debugging/troubleshooting-guide.md) | [Debug pitfalls](references/debugging/gotchas.md) | [QA workflows](references/debugging/patterns.md) |
| [mcp/](references/mcp/) | — | [MCP Setup](references/mcp/setup.md) | — | — |
| [pr/](references/pr/) | [Product reference](references/pr/README.md) | — | — | — |

## Key Principles for Implementation

1. **Use EdgeTag MCP to discover channels before writing code.** If MCP is available, call `domains` to get the real channel list for the domain. This ensures you install the correct browser provider packages and don't miss any. If MCP is not available, suggest the user set it up (see [mcp/setup.md](references/mcp/setup.md)) or ask them directly which channels they use.
2. **Always load EdgeTag directly in `<head>` via script tag or npm — NEVER via GTM or tag managers.** EdgeTag is first-party infrastructure loaded from your own CNAME domain. Routing it through a third-party tag manager defeats the purpose and reintroduces browser restrictions.
3. **Use the `/load` endpoint** for script tag installations. It dynamically bundles all configured channel packages.
4. **Init takes an object, not a string**: `edgetag('init', { edgeURL: 'https://d.mysite.com' })` — not `edgetag('init', 'https://d.mysite.com')`. See [browser-sdk/gotchas.md](references/browser-sdk/gotchas.md) or [npm-sdk/gotchas.md](references/npm-sdk/gotchas.md).
5. **For headless/npm, use named imports**: `import { init, tag } from '@blotoutio/edgetag-sdk-js'` — not default import, not `edgeTag`. The event function is called `tag`, NOT `edgeTag`. You must also install `@blotoutio/providers-*-sdk` packages for browser pixels. See [npm-sdk/README.md](references/npm-sdk/README.md).
6. **Install browser provider packages for EVERY channel that has one.** Without them, browser pixels silently fail. See [npm-sdk/patterns.md § Channel Discovery](references/npm-sdk/patterns.md) for the complete mapping. This is the most commonly missed step — never declare an implementation complete without verifying provider packages.
7. **Set up DNS CNAME first** — The first-party subdomain is essential for bypassing ITP/cookie restrictions.
8. **Consent before events** — Events are only sent to channels that have consent at the time the event fires. Call `consent()` before `tag()` so all intended channels receive the event.
9. **Capture user identity early** — Don't wait for checkout. Grab email/phone from newsletter popups, login forms, etc.
10. **Use standard event names** — Providers optimize better when they receive recognized event names.
11. **Maximize event data richness** — Always populate ALL available fields in event payloads, not just required ones. For `contents` arrays, include `id`, `quantity`, `item_price`, `title`, `category`, `brand`, `sku`, `variantId`, `image`, `url` — every field the source data can provide. Richer data improves ad platform match quality, attribution, and optimization. Inspect the source data model and map every available property.
12. **One event, many destinations** — Send a single event; EdgeTag transforms and routes it to all configured channels.
13. **`tag_user_id` is the cookie, `et_uid` is URL-only** — Never confuse the first-party cookie with the cross-domain query parameter.
