# Platforms Reference

## Overview

EdgeTag supports integration with 6+ ecommerce platforms plus fully custom/headless implementations. Choose your integration path based on your platform.

## Supported Platforms

### No-Code Platforms (App/Plugin Install)

Simplest setup. Just install the app or plugin, enable features in dashboard. No code required.

- **Shopify** (apps.shopify.com/edgetag)
- **BigCommerce**
- **Salesforce Commerce Cloud**
- **WooCommerce** (wordpress.org/plugins/blotout-edgetag)
- **WordPress** (wordpress.org/plugins/blotout-edgetag)
- **Wix** (Wix App Market)

Setup time: 10-30 minutes

### Pro-Code Platforms (SDK Integration)

Maximum control. Install npm package, write integration code. Required for custom/headless sites.

- **React** (hooks-based)
- **Next.js** (App Router or Pages Router)
- **Vue.js**
- **Custom/Headless** (any JavaScript framework)

Setup time: 30-60 minutes

## Quick Comparison

| Platform        | Type | Setup Time | Code Required | Browser Support             | CRM Support               |
| --------------- | ---- | ---------- | ------------- | --------------------------- | ------------------------- |
| Shopify         | App  | 10 min     | No            | Yes (App Pixel + App Embed) | Yes (checks every 15 min) |
| BigCommerce     | App  | 10 min     | No            | Yes                         | Yes                       |
| Salesforce CC   | App  | 30 min     | No            | Yes                         | Native                    |
| WooCommerce     | App  | 15 min     | No            | Yes                         | Yes                       |
| WordPress       | App  | 15 min     | No            | Yes                         | Yes                       |
| Wix             | App  | 10 min     | No            | Yes                         | Yes                       |
| React           | SDK  | 30 min     | Yes           | Yes                         | Via webhook               |
| Next.js         | SDK  | 30 min     | Yes           | Yes                         | Via webhook               |
| Vue             | SDK  | 30 min     | Yes           | Yes                         | Via webhook               |
| Custom/Headless | SDK  | 45-60 min  | Yes           | Yes (if needed)             | Via webhook               |

## Integration Paths

### Path 1: Fully No-Code (Shopify, BigCommerce, Salesforce CC, WooCommerce, WordPress, Wix)

1. Install app or plugin from marketplace
2. Authenticate with platform
3. Enable App Embed (Shopify only — for PageView, Lead, and upper-funnel PII)
4. Configure settings (minimal, WordPress/WooCommerce only)
5. Set up CRM connection (optional)
6. Start tracking immediately

**Best for**: Non-technical teams, rapid deployment, pre-built integrations

**Limitations**: Fixed feature set, less customization. WordPress/WooCommerce may have theme compatibility issues.

### Path 2: Pro-Code (React, Next.js, Vue, Custom)

1. Install npm package: `npm install @blotoutio/edgetag-sdk-js`
2. Install provider packages (for browser pixels)
3. Initialize SDK in app startup
4. Track events with `tag()` calls
5. Deploy and monitor

**Best for**: Engineers, custom builds, maximum control

**Advantages**: Full customization, browser + server events, fine-grained control

## Key Features by Platform

### Server-Side CRM Connection

Shopify, BigCommerce, Salesforce CC automatically sync orders to CRM (if configured). Checks every 15 minutes.

### Browser Events

All platforms support real-time browser pixel firing (Meta, Google Ads, TikTok). Enable in dashboard.

### Server Events

All platforms support server-side event delivery (Klaviyo, GA4, CAPI, etc.). No SDK required.

### Audience Upload

All platforms support uploading customer segments via Audience API. Build in custom/headless, sync to ad platforms.

### Event Validation

Test payloads before production using Payload Validator channel.

## What's Next

- **Common Pitfalls**: See [gotchas.md](./gotchas.md) to avoid integration mistakes
- **Implementation Patterns**: See [patterns.md](./patterns.md) for real-world examples
