# EdgeTag npm SDK Reference

The npm SDK gives you full control over EdgeTag in modern JavaScript projects. Install via npm, use named imports, and manage the lifecycle directly — ideal for React, Vue, Angular, Next.js, and any project with a bundler.

## When to Use the npm SDK

- React, Vue, Angular, or other SPA frameworks
- Next.js, Nuxt, or other SSR frameworks
- Any project using npm/yarn with a bundler (webpack, Vite, esbuild, etc.)
- Need direct control over initialization lifecycle
- Want tree-shakeable imports
- TypeScript projects
- Server-side rendering with client hydration

For traditional server-rendered websites or static sites without a bundler, see [browser-sdk/](../browser-sdk/README.md) instead.

## Installation

```bash
npm install @blotoutio/edgetag-sdk-js
```

### Provider Packages

With the npm approach, browser pixels (Meta, Google Ads, TikTok, etc.) are **not** loaded automatically. You must install and import provider packages for each pixel that you use. Example:

```bash
npm install @blotoutio/providers-facebook-sdk
npm install @blotoutio/providers-google-ads-clicks-sdk
```


| Platform      | Package Name                                 |
| ------------- | -------------------------------------------- |
| Meta/Facebook | `@blotoutio/providers-facebook-sdk`          |
| Google Ads    | `@blotoutio/providers-google-ads-clicks-sdk` |


For the full list of available provider packages, see [Channel Reference](../channels/channel-reference.md).

If you only need server-side conversion APIs (no browser pixels), you can skip provider packages entirely.

## Quick Start

```javascript
import { init, tag, user, data, consent } from "@blotoutio/edgetag-sdk-js";
import facebook from "@blotoutio/providers-facebook-sdk";
import googleAds from "@blotoutio/providers-google-ads-clicks-sdk";

// Initialize once at app startup
init({
  edgeURL: "https://d.mysite.com",
  providers: [facebook, googleAds],
});

// Set user identity
user("email", "user@example.com");

// Track an event
tag("PageView");
```

## Key Concepts

### Named Imports

The SDK exports named functions — there is no default export and no `edgeTag` export. The event tracking function is called **`tag`** (not `edgeTag`):

```javascript
// CORRECT
import { init, tag, user, data, consent } from "@blotoutio/edgetag-sdk-js";

// WRONG — no default export
import edgetag from "@blotoutio/edgetag-sdk-js";

// WRONG — there is no "edgeTag" export, the function is called "tag"
import { edgeTag } from "@blotoutio/edgetag-sdk-js";
```

### Providers Array

Pass provider instances to `init()` so EdgeTag can load their browser pixels:

```javascript
import facebook from "@blotoutio/providers-facebook-sdk";
import googleAds from "@blotoutio/providers-google-ads-clicks-sdk";
import tiktok from "@blotoutio/providers-tiktok-sdk";

init({
  edgeURL: "https://d.mysite.com",
  providers: [facebook, googleAds, tiktok],
});
```

Without providers, server-side conversion APIs still work, but browser pixels won't fire.

### First-Party Domain (CNAME)

EdgeTag operates through your own domain (e.g., `d.mysite.com`), not a third-party domain. This:

- Complies with third-party cookie restrictions (ITP, ETP)
- Sets a first-party `tag_user_id` cookie for persistent visitor identification
- Improves data matching with advertising platforms

### Consent Management

By default, events are blocked until user consent is granted:

```javascript
import { consent } from "@blotoutio/edgetag-sdk-js";

consent(
  { facebook: true, googleAdsClicks: true },
  { advertising: true, analytics: true },
);
```

## Available Exports

```javascript
import {
  init, // Initialize EdgeTag
  tag, // Track events
  user, // Set single user attribute
  data, // Set multiple user attributes
  consent, // Grant consent
  getConsent, // Read current consent
  getData, // Get multiple user attributes
  getUserId, // Get tag_user_id
  setConfig, // Update runtime config
  ready, // SDK ready callback
} from "@blotoutio/edgetag-sdk-js";
```

## Documentation Structure

- **[README.md](README.md)** — This overview and quick start (you are here)
- **[api-reference.md](api-reference.md)** — All 10 functions with named import signatures and TypeScript types
- **[patterns.md](patterns.md)** — React integration, consent hooks, progressive identity, testing, and more
- **[gotchas.md](gotchas.md)** — Common mistakes with npm installations and how to avoid them

