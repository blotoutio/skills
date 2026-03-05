# EdgeTag Product Reference (PR)

Use this reference when the user needs a non-implementation explanation of EdgeTag for product planning, stakeholder alignment, or roadmap decisions.

## Who This Is For

- Product managers planning instrumentation and attribution scope
- Growth and marketing stakeholders evaluating channel coverage
- Engineering managers estimating rollout effort and risk
- Solutions teams preparing customer onboarding plans

## One-Sentence Positioning

EdgeTag is first-party, server-side signal infrastructure that captures one event stream and delivers it to many destinations (ads, analytics, CRM) with consent and identity controls.

## Why It Matters (Business Context)

iOS 14.5+ App Tracking Transparency, Intelligent Tracking Prevention (ITP), and ad blockers have eroded client-side tracking. Ad platforms like Meta now report 30-50% fewer conversions than actually occur. The consequences:

- **Broken measurement** — ROAS and CPA metrics are inaccurate, making budget decisions unreliable
- **Degraded ad optimization** — Platform algorithms (Meta Advantage+, Google Smart Bidding) train on incomplete data and underperform
- **Fragmented integrations** — Each channel (Meta CAPI, Google Enhanced Conversions, TikTok Events API) requires its own server-side integration, multiplying engineering effort
- **Identity loss** — Third-party cookies expire or get blocked, so returning visitors look like new users

EdgeTag solves all four by moving tracking server-side, behind a first-party domain the brand owns. One integration, many destinations, with identity and consent built in.

## Architecture (10,000 ft)

```
Browser / App
    │
    ▼
┌─────────────────────────────┐
│  First-Party CNAME Domain   │  ← d.yoursite.com (brand-owned subdomain)
│  (Cloudflare Workers Edge)  │     1,600+ edge locations worldwide
└─────────────┬───────────────┘
              │
    ┌─────────┴─────────┐
    │   EdgeTag Engine   │
    │                    │
    │  • Consent check   │  ← Events only flow to consented channels
    │  • Identity stitch │  ← Merges anonymous + known profiles
    │  • Bot filtering   │  ← ML-powered via Cloudflare WAF
    │  • Geo enrichment  │
    │  • Attribution     │
    │  • Transform       │  ← Adapts payload per channel API
    └────────┬───────────┘
             │
    ┌────────┼────────────────┐
    ▼        ▼                ▼
  Meta    Google Ads     55+ Channels
  CAPI    Enhanced Conv  (TikTok, Klaviyo, GA4, CRM, webhooks, ...)
```

**Key architecture facts:**

- Data stays first-party: the CNAME subdomain means browsers treat it as same-origin, bypassing ITP and most ad blockers
- Edge execution: processing happens at the nearest Cloudflare POP, not a centralized server — sub-3ms pixel delivery
- Self-hosting option: EdgeTag can run inside the customer's own Cloudflare account for full data sovereignty

## How It Compares

| Approach                            | Setup effort                                            | Signal coverage                         | Identity                | Cost                   |
| ----------------------------------- | ------------------------------------------------------- | --------------------------------------- | ----------------------- | ---------------------- |
| **Client-side pixels** (status quo) | Low                                                     | Declining (blocked by ITP, ad blockers) | Third-party cookie only | Free                   |
| **Server-side GTM**                 | High (GCP project, custom containers)                   | Better, but still third-party hosted    | Manual per channel      | GCP hosting + eng time |
| **CDPs** (Segment, mParticle)       | Medium-High                                             | Good                                    | Strong                  | $100K+/yr enterprise   |
| **DIY CAPI integrations**           | High per channel                                        | Good per channel                        | Manual per channel      | Eng time × N channels  |
| **EdgeTag**                         | Low (1-click for Shopify/WooCommerce, npm for headless) | High (first-party + server-side)        | Built-in ID graph       | Fraction of CDP cost   |

EdgeTag's sweet spot: teams that need CDP-grade signal quality without CDP-grade cost or complexity.

## Expected Business Outcomes

- **Signal recovery**: 30-50% more conversions captured vs client-side-only tracking (Meta's own reporting gap)
- **Faster optimization**: True ROAS visibility typically within 7 days of going live
- **Higher match quality**: EMQ scores improve as more PII fields are captured server-side
- **Reduced eng overhead**: One event schema serves 55+ channels instead of N separate integrations
- **Future-proof**: Server-side architecture is unaffected by further browser privacy changes

## System Model (PM View)

1. Website/app sends events to a first-party EdgeTag domain (CNAME).
2. Consent state determines which channels can receive each event.
3. EdgeTag enriches events with identity graph data, geo, attribution, and bot score.
4. Real-time transformation plugins adapt payloads per channel API format.
5. Events are delivered to all configured channels simultaneously.
6. Teams monitor quality through analytics dashboards, error rates, and EMQ.

## Core Product Pillars

- First-party data collection through customer-owned subdomain
- Consent-aware routing across providers and categories
- Identity stitching (anonymous + known user paths)
- Multi-channel delivery (browser + server where supported)
- Analytics and debugging visibility for operations

## Supported Platforms

| Platform                       | Install method                                                   | Effort  |
| ------------------------------ | ---------------------------------------------------------------- | ------- |
| Shopify                        | 1-click app (App Pixel auto-enabled) + optional App Embed toggle | ~5 min  |
| WooCommerce / WordPress        | App/plugin install                                               | ~10 min |
| Wix                            | App install                                                      | ~10 min |
| BigCommerce                    | App install                                                      | ~10 min |
| Salesforce Commerce Cloud      | Cartridge                                                        | ~15 min |
| React / Next.js / Vue (SPA)    | npm package + providers                                          | ~30 min |
| Custom / headless              | npm or script tag + server-side cookie (`truid`)                 | ~1 hr   |
| Landing pages (Unbounce, etc.) | Script tag snippet                                               | ~5 min  |

## Key Differentiators

- **First-party by default** — runs on a brand-owned CNAME subdomain, not a third-party domain
- **Edge-native** — built on Cloudflare Workers (1,600+ locations), not a centralized server
- **Bot protection** — ML-powered bot detection via Cloudflare WAF filters invalid traffic before it reaches channels
- **Transformation plugins** — real-time signal modification (e.g., new vs returning customer segmentation, keyword-based conversion mapping)
- **Self-hosting** — can deploy into the customer's own Cloudflare account for full data control
- **One event, many destinations** — single event schema is transformed per-channel, eliminating per-platform integration work
- **Consent built-in** — consent enforcement is on by default, not an afterthought

## PM-Relevant Terminology

- `tag_user_id`: First-party EdgeTag user cookie
- `et_uid`: URL parameter for cross-domain identity transfer
- Channel: Destination integration (Meta, Google Ads, TikTok, etc.)
- Consent categories: `necessary`, `advertising`, `analytics`, `functional`, `share_pii`
- EMQ: Meta Event Match Quality indicator

## Typical Rollout Phases

### Phase 1: Foundation

- DNS/CNAME setup and verification
- SDK installation (script tag or npm)
- Base event schema and standard events

### Phase 2: Data Quality

- Consent wiring from CMP
- Early identity capture points
- Payload validation and QA checklist

### Phase 3: Activation

- Priority channel enablement (Meta/Google/TikTok/Klaviyo)
- Conversion validation and deduplication checks
- Baseline reporting

### Phase 4: Scale

- Additional channels and webhook use cases
- Offline/server-side event sources via HTTP API
- Advanced analytics via Edge Lake and ConsentIQ

## KPI Framework

### Business KPIs

- Reported conversions vs actual conversions (signal recovery gap)
- ROAS accuracy before vs after EdgeTag
- Ad platform match quality (Meta EMQ, Google diagnostic scores)
- Customer acquisition cost (CAC) trend after improved signal

### Operational KPIs

- Event delivery success rate by channel
- Match quality (EMQ) score for Meta (target: 6.0+)
- Consent opt-in rates by region and category
- Share of standard events with complete required fields (field completeness)
- Bot traffic filtered rate
- Time from integration start to first verified conversion signal

## Compliance & Data Privacy

Blotout (the company behind EdgeTag) maintains:

- **SOC 2 Type 2** certified
- **HIPAA** compliant
- **Do not sell, do not share** — Blotout never sells or shares customer data

Managed hosting customers inherit these compliance guarantees without additional effort. Self-hosted customers manage their own Cloudflare account compliance but still benefit from EdgeTag's data handling policies.

This positioning simplifies procurement and legal review — EdgeTag is not a data broker, and the first-party architecture means customer data stays under the brand's domain.

## Risks and Mitigations

- Risk: Consent wired after tracking calls
  Mitigation: enforce consent initialization before high-value events
- Risk: Weak identity coverage lowers match rates
  Mitigation: capture email/phone at multiple lifecycle points
- Risk: DNS misconfiguration delays launch
  Mitigation: add explicit DNS verification gate in rollout checklist
- Risk: Team treats each channel separately
  Mitigation: use one-event-many-destinations operating model

## Stakeholder Readout Template

- Objective: what business outcome this integration supports
- Scope: events, channels, and platforms in current release
- Readiness: DNS, consent, identity, QA status
- Health: delivery, errors, EMQ, opt-in trends
- Next iteration: channels/features prioritized for next milestone
