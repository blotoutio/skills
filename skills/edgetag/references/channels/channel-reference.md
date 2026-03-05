# Channel Reference

Complete reference for all EdgeTag channels with setup details, npm packages, and integration notes.

---

## Meta (Facebook)

**Channel Name (SDK)**: `facebook`

**NPM Package**: `@blotoutio/providers-facebook-sdk`

**Event Flow**: Browser + Server (hybrid)

**Server API Version**: v24.0

**Description**:
Meta provides both browser pixel (Conversions API) and server-side API. Use the same `eventId` for both paths to enable deduplication and prevent double-counting.

**Setup Requirements**:

- Install browser pixel package: `npm install @blotoutio/providers-facebook-sdk`
- Configure Meta Conversions API credentials in EdgeTag dashboard
- Create custom events for server-side data (not available via pixel)
- Same eventId used for dedup across browser + server paths

**Key Features**:

- Browser pixel executes in user's browser
- Server API sends events from EdgeTag backend
- Supports custom events via server API only
- Both paths contribute to conversion tracking

**Gotchas**:

- Must install npm package if using browser pixel
- Custom events require server-side setup
- eventId matching critical for dedup

---

## Google Ads

**Channel Name (SDK)**: `googleAdsClicks`

**NPM Package**: `@blotoutio/providers-google-ads-clicks-sdk`

**Event Flow**: Browser + Server (configurable)

**Server API Version**: N/A (REST API)

**Description**:
Google Ads supports multiple delivery methods. You can choose to send events via browser pixel (gtag), server API, or browser-first with fallback to API.

**Setup Requirements**:

- Install browser package: `npm install @blotoutio/providers-google-ads-clicks-sdk`
- Configure conversion actions in Google Ads dashboard
- Choose delivery mode: API only, browser only, or browser-first-fallback-to-API
- Specify conversion action IDs in EdgeTag dashboard

**Key Features**:

- Browser: gtag pixel fires directly in browser
- Server: EdgeTag sends conversion events to Google Ads API
- Fallback mode: tries browser first, API if browser fails
- Conversion action configuration required

**Gotchas**:

- Must define conversion actions before setup
- Missing npm package breaks browser delivery
- Delivery method mismatch causes tracking gaps

---

## TikTok

**Channel Name (SDK)**: `tiktok`

**NPM Package**: `@blotoutio/providers-tiktok-sdk`

**Event Flow**: Browser + Server (hybrid)

**Server API Version**: v1.3

**Description**:
TikTok uses browser pixel and server API in parallel. Same `eventId` used for both to prevent duplication.

**Setup Requirements**:

- Install browser package: `npm install @blotoutio/providers-tiktok-sdk`
- Configure TikTok Conversions API credentials in EdgeTag dashboard
- Use same eventId across both paths for dedup

**Key Features**:

- Browser pixel: TikTok Pixel fires in user's browser
- Server API: Events sent from EdgeTag backend
- Deduplication via eventId matching
- Both paths contribute to conversion tracking

**Gotchas**:

- npm package required for browser pixel
- eventId mismatch disables dedup
- Server API credentials must be current

---

## Google Analytics 4 (GA4)

**Channel Name (SDK)**: `googleAnalytics4`

**NPM Package**: None (server-side only)

**Event Flow**: Server-side only

**Server API Version**: Measurement Protocol

**Description**:
GA4 receives events exclusively via server-side Measurement Protocol. No browser pixel available. EdgeTag forwards all events to Google Analytics servers.

**Setup Requirements**:

- Configure GA4 Measurement ID in EdgeTag dashboard
- No npm package needed
- Events sent via Measurement Protocol from EdgeTag servers
- User and session ID matching for attribution

**Key Features**:

- Server-side only (no browser pixel)
- Measurement Protocol format
- Automatic session tracking
- Attribution preserved via user/session IDs

**Gotchas**:

- Browser pixel not available for GA4
- Requires GA4 property setup in Google Analytics
- Session IDs must be consistent

---

## Klaviyo

**Channel Name (SDK)**: `klaviyo`

**NPM Package**: None (server-side only)

**Event Flow**: Server-side only

**Server API Version**: REST API

**Description**:
Klaviyo is email/SMS marketing platform. EdgeTag sends events via server API only. No browser pixel available. Typically used for email list management and lifecycle campaigns.

**Setup Requirements**:

- Configure Klaviyo API key in EdgeTag dashboard
- Events sent from EdgeTag servers only
- No npm package or browser setup needed
- Email/phone data mapped to Klaviyo profiles

**Key Features**:

- Server-side events only
- Email and SMS marketing integration
- Customer profile syncing
- Lifecycle campaign tracking

**Gotchas**:

- No browser pixel component
- Relies entirely on server-side delivery
- Requires valid API key configuration
- Email/phone fields must be populated

---

## Event Sink

**Channel Name (SDK)**: `eventSink`

**NPM Package**: None

**Event Flow**: Server-side only

**Server API Version**: Custom (your endpoint)

**Description**:
Event Sink forwards all events as POST requests to a custom URL that you control. Useful for forwarding to your own backend, data warehouse, or custom analytics platform.

**Setup Requirements**:

- Configure destination URL in EdgeTag dashboard
- EdgeTag will POST all events to this endpoint
- Include custom headers for authentication
- Handle POST payloads in your backend

**Request Format**:

```json
{
  "eventId": "...",
  "eventName": "Purchase",
  "eventTimestamp": 1234567890,
  "userId": "user123",
  "payload": {
    /* event-specific data */
  }
}
```

**Key Features**:

- Custom endpoint for all events
- Include custom headers (auth tokens, etc.)
- Real-time event forwarding
- Full event payload sent as JSON

**Gotchas**:

- Must handle HTTP POST in your backend
- Custom headers required for auth
- No retry logic on endpoint failure
- Endpoint must respond quickly

---

## Webhook Channel

**Channel Name (SDK)**: `webhook`

**NPM Package**: None

**Event Flow**: Server-side with custom logic

**Server API Version**: Custom JavaScript

**Description**:
Webhook channel receives events from external systems (e.g., Shopify order webhooks, Salesforce triggers, your backend) and forwards them into EdgeTag's channel pipeline. A custom JavaScript script (`process(params)`) runs on EdgeTag servers to parse the incoming request, optionally enrich data in external systems, and call `params.handleTag()` to route the event to all configured channels.

**Setup Requirements**:

- Configure custom JavaScript handler (`process(params)`) in EdgeTag dashboard
- JavaScript runs on EdgeTag servers (not browser)
- Add secrets (API keys, tokens) via dashboard — accessible as `params.secrets`
- External system sends HTTP requests to the webhook endpoint

**Example Use Cases**:

- Receive Shopify order webhooks and forward Purchase events to all channels (Meta, Google Ads, TikTok, etc.)
- Ingest Salesforce events, upsert leads/opportunities, and route to ad platforms
- Receive events from your backend and enrich with ID graph data before channel delivery

**Key Features**:

- Custom JavaScript execution on EdgeTag servers
- `params.request` — access incoming HTTP request
- `params.secrets` — securely access configured credentials
- `params.getUsersByEmail(email)` — look up users in the ID graph
- `params.handleTag(payload, user)` — forward event to all configured channels
- `params.writeError(label, error)` — log errors to EdgeTag dashboard

**Gotchas**:

- Requires custom JavaScript knowledge
- Endpoint integration complexity
- Error handling in custom code critical
- Testing needed before production

---

## Payload Validator

**Channel Name (SDK)**: `payloadValidator`

**NPM Package**: None

**Event Flow**: Server-side only

**Server API Version**: N/A (testing only)

**Description**:
Testing/debugging channel that validates event payloads during implementation. MUST be disabled before going to production. Does not send events anywhere; only validates structure.

**Setup Requirements**:

- Enable in EdgeTag dashboard during implementation
- Logs validation results for debugging
- Events are validated but not forwarded

**Key Features**:

- Payload structure validation
- Error reporting for debugging
- No event delivery (testing only)

**CRITICAL**: Remove after implementation is complete. Leaving it enabled wastes processing.

**Gotchas**:

- MUST disable before production
- Events do not reach real channels while enabled
- Only for implementation phase
- Easy to forget to disable

---

## Complete Channel List (50+)

### Advertising

- `facebook` (Meta) — NPM: `@blotoutio/providers-facebook-sdk`
- `googleAdsClicks` — NPM: `@blotoutio/providers-google-ads-clicks-sdk`
- `tiktok` — NPM: `@blotoutio/providers-tiktok-sdk`
- `pinterest` — NPM: `@blotoutio/providers-pinterest-sdk`
- `snapchat` — NPM: `@blotoutio/providers-snapchat-sdk`
- `linkedin` — server-side only (no npm package)
- `reddit` — server-side only (no npm package)
- `bing` — server-side only (no npm package)
- `criteo`
- `trade_desk`
- `taboola`
- `outbrain`
- `stackadapt`

### Email & SMS

- `klaviyo` — server-side only (no npm package)
- `attentive` (SMS)
- `postscript` (SMS)

### Analytics

- `googleAnalytics4` — NPM: `@blotoutio/providers-google-analytics-4-sdk`
- `amplitude`
- `mixpanel`
- `segment`

### Affiliate & Performance

- `applovin`
- `adjust`
- `branch`

### Custom

- `eventSink` (custom HTTP endpoint)
- `webhook` (custom JavaScript)

### Testing

- `payloadValidator` (validation only)

---

## Channel Integration Checklist

Before enabling any channel in production:

- Channel name matches SDK exactly
- NPM packages installed (if browser pixel needed)
- Credentials/API keys configured in dashboard
- Conversion actions created (Google Ads)
- Event structure validated against channel requirements
- Browser vs server delivery mode chosen
- Testing completed in staging
- Payload Validator disabled
- CRM connections tested (if applicable)
