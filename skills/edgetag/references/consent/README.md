# EdgeTag Consent System

## Overview

The EdgeTag consent system controls which events are sent and to which providers. Consent is **enabled by default**, which means events are blocked until consent is explicitly granted.

## Key Concepts

### Consent Enabled by Default

When EdgeTag initializes, **all events are blocked** until you call `edgetag('consent', ...)` with explicit consent.

```javascript
// Events are BLOCKED until this is called
edgetag('consent', { facebook: true, googleAdsClicks: true });

// OR
edgetag('consent', null, { necessary: true, advertising: true });
```

### Providers vs Categories

EdgeTag supports two ways to manage consent:

**Providers**: Per-channel consent (Facebook, Google, Klaviyo, etc.)

```javascript
edgetag('consent', {
  facebook: true,
  googleAdsClicks: true,
  klaviyo: false
});
```

**Categories**: Per-category consent (GDPR/CCPA compliant)

```javascript
edgetag('consent', null, {
  necessary: true,     // Always required
  advertising: true,   // Marketing/ads
  analytics: true,     // Data analysis
  functional: true,    // Site features
  share_pii: false     // PII sharing
});
```

### How Consent Gates Events

```javascript
// Without consent, event is BLOCKED
edgetag('tag', 'Purchase', { value: 99.99 });

// After consent granted, event is SENT
edgetag('consent', { facebook: true });
edgetag('tag', 'Purchase', { value: 99.99 }); // Now sent to Facebook
```

### CMP Integration

EdgeTag does NOT provide a consent banner UI. Instead, you wire your existing CMP (OneTrust, Cookiebot, etc.) to EdgeTag:

```javascript
// When user makes consent choice in OneTrust
OneTrust.OnConsentChanged(function() {
  const consent = GetConsentFromOneTrust(); // Your code
  edgetag('consent', consent.providers, consent.categories);
});
```

## Getting Started

1. **Choose consent approach** - Providers, categories, or both
2. **Wire your CMP** - Connect OneTrust, Cookiebot, TrustArc, or custom banner
3. **Call edgetag('consent', ...)** - Pass consent decision from CMP
4. **Verify events flow** - Check that events are sent after consent

## Reference Files

- **[API Reference](./api-reference.md)** - Complete function signatures
- **[Gotchas](./gotchas.md)** - Common mistakes to avoid
- **[Patterns](./patterns.md)** - Implementation examples (OneTrust, Cookiebot, simple accept/decline)

## Quick Start

```javascript
// Initialize EdgeTag (events blocked by default)
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// User clicks "Accept All"
edgetag('consent', { all: true });

// Now events are sent
edgetag('tag', 'Purchase', { value: 99.99 });

// Or use categories
edgetag('consent', null, {
  necessary: true,
  advertising: true,
  analytics: true
});

// Check current consent
edgetag('getConsent', (consent, error, categories) => {
  console.log('Consent:', consent);
  console.log('Categories:', categories);
});
```

## Important Notes

- **At least one of `providers` or `categories` must be provided** to `edgetag('consent', ...)`
- `**necessary` category is always enabled** (cannot opt-out)
- **Use `disableConsentCheck` only if not subject to GDPR/CCPA**
- **Events remain blocked until consent is granted**

