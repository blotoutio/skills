# White-Label API Reference

## Overview

The EdgeTag White-Label API lets developers build their own app or dashboard on top of EdgeTag's server-side tracking infrastructure. Instead of sending customers to `app.edgetag.io`, you implement EdgeTag's REST APIs directly in your product — managing websites, DNS, channels, consent, and deployments programmatically.

This is the path for platforms, agencies, and SaaS products that want to offer EdgeTag capabilities under their own brand.

## When to Use

- Building a custom dashboard that manages EdgeTag domains and channels
- White-labeling EdgeTag as part of your SaaS product
- Automating customer onboarding (website creation → DNS → consent → channels)
- Programmatic management of multiple EdgeTag domains at scale
- Integrating EdgeTag setup into an existing admin panel or CLI tool

If you only need to **send events** from a backend, see [http-api/](../http-api/README.md) instead.
If you only need to **query data**, see the [MCP setup](../mcp/setup.md) or Edge Lake skill.

## Architecture

```
┌─────────────────────┐
│   Your App / UI     │  ← Your white-label dashboard
└─────────┬───────────┘
          │ REST API calls
          ▼
┌─────────────────────┐
│  EdgeTag REST API   │  ← api.edgetag.io / api-sandbox.edgetag.io
│  (OAuth or token)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  EdgeTag Platform   │  ← Cloudflare Workers infrastructure
│  (per-domain        │     Isolated per customer
│   isolated bubbles) │
└─────────────────────┘
```

## Environments

| Environment | App URL                          | API Base URL                     |
| ----------- | -------------------------------- | -------------------------------- |
| Sandbox     | `https://app-sandbox.edgetag.io` | `https://api-sandbox.edgetag.io` |
| Production  | `https://app.edgetag.io`         | `https://api.edgetag.io`         |

Always develop and test against sandbox first. Production requires a separate account.

## Authentication

All API requests require:

| Header          | Value                   | Description                                                      |
| --------------- | ----------------------- | ---------------------------------------------------------------- |
| `Authorization` | `Bearer {access_token}` | Access token (OAuth 2.0 or personal access token)                |
| `Team-Id`       | `{team_id}`             | The team scope for the request (not required for `GET /user/me`) |

There are two ways to authenticate:

### Option A: OAuth 2.0 (Customer's Own Account)

Each customer authenticates with their own EdgeTag account via OAuth. Your app receives an access token scoped to their account.

**Advantages**: Customers own their data, can bring existing EdgeTag accounts and domains, full isolation between customers.

**Trade-off**: Requires implementing the OAuth redirect flow (login page → authorization code → token exchange).

See [api-reference.md](api-reference.md) § OAuth 2.0 for the full flow.

### Option B: Personal Access Token (Single Account)

Use your own EdgeTag account's access token directly. All customers are managed under your single account — no OAuth redirect needed.

**When to use**:

- Simpler integration — skip the OAuth flow entirely, just use your access token in API calls
- Self-hosted deployments — required when deploying customers in your own Cloudflare account, since all domains must belong to a single account that owns the Cloudflare infrastructure

**Trade-off**: All customers live under one account. Customers cannot bring their own existing EdgeTag account or domain. You manage everything centrally.

To get a personal access token, contact EdgeTag support ([support@edgetag.io](mailto:support@edgetag.io)).

## Onboarding Flow

Once you have an access token (via either authentication method), the onboarding steps are the same:

```
1. Authenticate         → OAuth flow or personal access token (one-time setup)
2. Create Website (Tag) → POST /tag → get tagId + domain
3. Setup DNS            → GET /tag/verify/mapping/{tagId} → customer adds records
4. Configure Consent    → PUT /tag/{tagId} → set consent mode
5. Add Channels         → POST /script → add Meta, Google, etc.
6. Deploy               → Channels go live, add SDK snippet to website
```

For OAuth, step 1 also requires creating an OAuth app first (see [api-reference.md](api-reference.md) § OAuth 2.0). For personal access tokens, step 1 is a one-time setup — contact EdgeTag support to get your token.

## Hosting Models

### Managed (Recommended for white-label)

- EdgeTag runs infrastructure on Blotout's Cloudflare account
- Set `managed: true` and `hostId: ""` when creating tags
- No Cloudflare account needed from your customers
- Turnkey — EdgeTag handles all infrastructure

### Self-Hosted

- Your customer's own Cloudflare account
- Create a host in the EdgeTag dashboard first, then use the `hostId` when creating tags via API
- Set `managed: false`
- Full control over infrastructure

**You cannot migrate between hosting models after creation.**

## Key Concepts

### Tags (Websites/Domains)

A **tag** represents a single website in EdgeTag. Creating a tag (`POST /tag`) generates a `tagId` and a first-party `domain` subdomain. All subsequent operations reference this `tagId`.

### Scripts (Channels)

A **script** represents a channel integration (Meta CAPI, Google Ads, Klaviyo, etc.). Each channel is added via `POST /script` with a `providerId` identifying the platform and encrypted `secrets` for API credentials.

### Secret Encryption

All channel credentials (API keys, tokens, pixels) must be **encrypted client-side** before sending to the API. EdgeTag uses hybrid AES + RSA encryption. See [api-reference.md](api-reference.md) § Secret Encryption.

### Deployments

After adding or modifying channels, changes are deployed to the Cloudflare Workers infrastructure. Set `shouldDeploy: true` on channel creation to deploy immediately, or trigger deployment separately.

## Documentation Structure

- **[README.md](README.md)** — This overview (you are here)
- **[api-reference.md](api-reference.md)** — Complete API endpoints for OAuth, tags, channels, DNS, hosts, and encryption
- **[gotchas.md](gotchas.md)** — Common mistakes and critical issues
- **[patterns.md](patterns.md)** — End-to-end implementation patterns and real-world examples
