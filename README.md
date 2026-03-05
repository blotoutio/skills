# Blotout Skills

A collection of [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) for implementing Blotout — server-side tracking infrastructure, first-party data activation, identity stitching, consent management, and 50+ marketing channel integrations.

## Installing

These skills work with any agent that supports the Agent Skills standard, including Claude Code, Cursor, OpenCode, OpenAI Codex, and Pi.

### Claude Code

Install using the [plugin marketplace](https://code.claude.com/docs/en/discover-plugins#add-from-github):

```
/plugin marketplace add blotoutio/skills
/plugin install blotout@blotoutio
```

### Cursor

Install from the Cursor Marketplace or add manually via **Settings > Rules > Add Rule > Remote Rule (Github)** with `blotoutio/skills`.

### Codex

Provide this instruction to Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/blotoutio/skills/refs/heads/main/.codex/INSTALL.md
```

### OpenCode

Provide this instruction to OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/blotoutio/skills/refs/heads/main/.opencode/INSTALL.md
```

### npx skills

Install using the `[npx skills](https://skills.sh)` CLI:

```
npx skills add https://github.com/blotoutio/skills
```

### Clone / Copy

Clone this repo and copy the skill folders into the appropriate directory for your agent:

| Agent        | Skill Directory              | Docs                                                                               |
| ------------ | ---------------------------- | ---------------------------------------------------------------------------------- |
| Claude Code  | `~/.claude/skills/`          | [docs](https://code.claude.com/docs/en/skills)                                     |
| Cursor       | `~/.cursor/skills/`          | [docs](https://cursor.com/docs/context/skills)                                     |
| OpenCode     | `~/.config/opencode/skills/` | [docs](https://opencode.ai/docs/skills/)                                           |
| OpenAI Codex | `~/.codex/skills/`           | [docs](https://developers.openai.com/codex/skills/)                                |
| Pi           | `~/.pi/agent/skills/`        | [docs](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent#skills) |

## Skills

Skills are contextual and auto-loaded based on your conversation. When a request matches a skill's triggers, the agent loads and applies the relevant skill to provide accurate, up-to-date guidance.

| Skill     | Useful for                                                                                                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| edgetag   | Comprehensive EdgeTag skill covering the JS SDK, server-side event tracking, identity graph, consent management, 50+ channel integrations (Meta CAPI, Google Ads, TikTok, Klaviyo), platform deployments (Shopify, WooCommerce, React, Next.js), HTTP API, cross-domain identity stitching, and debugging |
| consentiq | Consent analytics and compliance monitoring — marketing opt-in/opt-out rates, per-category breakdown, regional analysis (EU, UK, CA), and consent trends over time                                                                                                                                        |
| edge-lake | Querying event data via SQL on Cloudflare R2, funnel analysis, attribution reporting, revenue trends, traffic analysis, bot detection, and WAF attack analysis                                                                                                                                            |

## What's Covered

### JavaScript SDK

Installation via script tag or npm (`@blotoutio/edgetag-sdk-js`), initialization, event tracking, user identification, consent API, and configuration.

### Event Tracking

11 standard events (PageView, ViewContent, AddToCart, Purchase, etc.), custom events, Content/Discount types, offline events, and CSV uploads.

### Identity & Cross-Domain

First-party cookie (`tag_user_id`), cross-domain parameter (`et_uid`), PII capture, identity graph stitching, and server-side cookie strategies.

### Consent Management

Provider-based and category-based consent, CMP integrations (OneTrust, Cookiebot, Osano), and consent gating.

### Channel Integrations

50+ destinations including Meta CAPI, Google Ads Enhanced Conversions, TikTok Events API, Klaviyo, GA4, Snapchat, Pinterest, LinkedIn, Event Sink, Webhook, and more.

### Platform Deployments

Shopify, WooCommerce, WordPress, Wix, BigCommerce, Salesforce Commerce Cloud, React, Next.js, Vue, landing page builders, and headless implementations.

### HTTP API

Server-to-server `/tag` and `/data` endpoints for offline events, CRM integration, and backend event forwarding.

### Infrastructure

Cloudflare Workers architecture, DNS/CNAME setup, managed vs self-hosted deployments, and onboarding flows.

### Debugging

Browser dev tools, Payload Validator channel, live logs, EMQ scoring, troubleshooting guides, and QA checklists.

## Support

- **Email**: [support@blotout.io](mailto:support@blotout.io)
- **Community Slack**: [Join the Blotout Slack](https://join.slack.com/t/blotout-shared/shared_invite/zt-nzwq4zpj-hOpfoZUs9Ar0n~fSxPBaSw)

## Resources

- [EdgeTag Documentation](https://docs.edgetag.io)
- [Standard Events Reference](https://docs.edgetag.io/overview/standard-events)
- [Browser SDK Guide](https://docs.edgetag.io/implementation/browser)
- [HTTP API Reference](https://docs.edgetag.io/implementation/http)
- [REST API Docs](https://docs.edgetag.io/api)
- [NPM Package](https://www.npmjs.com/package/@blotoutio/edgetag-sdk-js)
