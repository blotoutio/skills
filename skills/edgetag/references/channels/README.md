# Channels Reference

## Overview

Channels are the destinations where EdgeTag sends tracking events. A single event can be routed to multiple channels simultaneously, enabling you to synchronize data across all your marketing and analytics platforms from a single implementation.

## How Channels Work

EdgeTag follows a **one event → many destinations** model:

1. **Event Creation**: Your site/app generates an event (page view, purchase, etc.)
2. **Channel Routing**: EdgeTag automatically routes the event to all configured channels
3. **Transformation**: Each channel receives the event in its required format
4. **Delivery**: Browser pixels fire or server API calls are made to the destination

## Event Flow: Browser vs Server

EdgeTag channels operate in two ways:

- **Browser Events**: JavaScript pixels execute in the user's browser (Meta, Google Ads, TikTok)
- **Server Events**: Backend API calls from EdgeTag servers (Klaviyo, GA4, Salesforce, all channels via CAPI)
- **Hybrid**: Some channels support both (Meta, Google Ads, TikTok) for redundancy and deduplication

## Channel Configuration

Channels are configured in the EdgeTag dashboard:

- Enable/disable channels per domain
- Set channel-specific options (API keys, conversion actions, etc.)
- Control browser vs server event delivery
- Map event properties to channel-specific fields

## SDK: Named Imports & Channel Names

When integrating with headless platforms (React, Next.js, Vue), you install the npm SDK:

```bash
npm install @blotoutio/edgetag-sdk-js
```

Use named imports (not default imports):

```javascript
import { init } from '@blotoutio/edgetag-sdk-js'
```

For browser pixels, also install provider npm packages for each channel you are using. See [Channel Reference](./channel-reference.md) for the full list of available packages. Examples:

```bash
npm install @blotoutio/providers-facebook-sdk
npm install @blotoutio/providers-google-ads-clicks-sdk
npm install @blotoutio/providers-tiktok-sdk
```

## Channel Names in Code

Use exact channel names in SDK initialization and consent/providers arrays:

- `facebook`
- `googleAdsClicks`
- `tiktok`
- `klaviyo`
- `googleAnalytics4`
- `eventSink`
- `webhook`
- And 40+ others (see [Channel Reference](./channel-reference.md))

## Key Concepts

### Deduplication

Meta, Google Ads, and TikTok track the same `eventId` across browser and server events, preventing double-counting when both paths are enabled.

### Consent Integration

Channel names in your providers array must match SDK channel names exactly. Mismatches prevent events from reaching intended destinations.

### Event Sink Pattern

The `eventSink` channel forwards all events as raw POST requests to a custom URL, allowing you to build custom integration logic.

### Webhook Channel

The `webhook` channel receives events from external systems (e.g., Shopify order webhooks, Salesforce triggers, your backend) and forwards them into EdgeTag's channel pipeline. A custom JavaScript script (`process(params)`) runs on EdgeTag servers to parse the incoming request, optionally enrich data in external systems (e.g., upsert a Salesforce lead), and call `params.handleTag()` to route the event to all configured channels (Meta, Google Ads, TikTok, etc.).

## What's Next

- **Channel Details**: See [channel-reference.md](./channel-reference.md) for detailed setup per channel
- **Common Pitfalls**: See [gotchas.md](./gotchas.md) to avoid integration mistakes
- **Implementation Patterns**: See [patterns.md](./patterns.md) for real-world setup examples
