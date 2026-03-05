# EdgeTag Consent API Reference

## Core Functions

### consent(providers?, categories?, options?)

Set user consent for providers and/or categories. Events are blocked until this is called.

```javascript
// Provider-based consent
edgetag('consent', {
  facebook: true,
  googleAdsClicks: true,
  klaviyo: false,
})

// Category-based consent (GDPR/CCPA)
edgetag('consent', null, {
  necessary: true,
  advertising: true,
  analytics: true,
  functional: false,
  share_pii: false,
})

// Both providers and categories
edgetag(
  'consent',
  {
    facebook: true,
    googleAdsClicks: false,
  },
  {
    advertising: true,
    analytics: false,
  },
)

// Enable all, then override specific ones
edgetag(
  'consent',
  {
    all: true,
    facebook: false, // Opt out of Facebook
  },
  {
    all: true,
    share_pii: false, // Opt out of PII sharing
  },
)
```

**Parameters**:

- `providers` (object or null): Provider names as keys, boolean values
  - `null` to skip provider consent, set only categories
  - Provider examples: `facebook`, `googleAdsClicks`, `klaviyo`, `linkedIn`, `tiktok`, etc.
  - Set specific provider to true/false, or use `all: true` then override
- `categories` (object, optional): Category names as keys, boolean values
  - Examples: `necessary`, `advertising`, `analytics`, `functional`, `share_pii`
  - `necessary` is always enabled (cannot be overridden)
- `options` (object, optional): Additional options
  - `localSave` (boolean): If `true`, save consent locally only without sending to the server
  - `destination` (string): For multiple EdgeTag instances, specify which instance

**Behavior**:

- If consent hasn't changed (same as existing), the call is a no-op
- If called before `init()`, consent is queued and applied after initialization
- `necessary` category is always set to `true` on the server regardless of what you pass

**Examples**:

```javascript
// Valid: Providers only
edgetag('consent', { facebook: true })

// Valid: Categories only
edgetag('consent', null, { advertising: true })

// Valid: Both
edgetag('consent', { facebook: true }, { advertising: true })

// INVALID: Neither provided
edgetag('consent') // Error
edgetag('consent', null) // Error (no categories either)
```

---

### getConsent(callback, options?)

Retrieve the current consent settings for the user.

```javascript
edgetag('getConsent', (consent, error, consentCategories) => {
  console.log('Provider Consent:', consent)
  // { facebook: true, googleAdsClicks: true, klaviyo: false, ... }

  console.log('Category Consent:', consentCategories)
  // { necessary: true, advertising: true, analytics: false, ... }

  if (error) {
    console.error('Failed to retrieve consent:', error)
  }
})
```

**Parameters**:

- `callback` (function): Called with `(consent, error?, consentCategories?)` when ready
  - `consent` (object | null): Provider consent settings, or `null` if not found
  - `error` (Error | undefined): Error object if retrieval failed (e.g., consent not found for user)
  - `consentCategories` (object | null): Category consent settings
- `options` (object, optional): Additional options
  - `destination` (string): For multiple EdgeTag instances

**Return Values in Callback**:

```javascript
{
  // Provider consent
  facebook: true,
  googleAdsClicks: false,
  klaviyo: true,
  linkedIn: true,
  tiktok: false,
  // ...other providers

  // Category consent (also returned separately)
  necessary: true,
  advertising: true,
  analytics: false,
  functional: true,
  share_pii: false
}
```

---

## Categories Reference

### Available Categories

| Category      | Purpose                            | Can Opt Out? | Notes                              |
| ------------- | ---------------------------------- | ------------ | ---------------------------------- |
| `necessary`   | Essential site functionality       | No           | Always enabled, cannot be disabled |
| `advertising` | Marketing, retargeting, ads        | Yes          | GDPR/CCPA compliant                |
| `analytics`   | Data analysis, insights            | Yes          | GDPR/CCPA compliant                |
| `functional`  | Enhanced features, preferences     | Yes          | Non-essential functionality        |
| `share_pii`   | Share personal data with providers | Yes          | Controls PII distribution          |

---

## Providers Reference

### Common Providers

EdgeTag supports consent for many providers. Common ones include:

- `facebook` - Facebook pixel and conversions
- `googleAdsClicks` - Google Ads tracking
- `googleAnalytics4` - Google Analytics 4
- `klaviyo` - Klaviyo email/marketing
- `linkedIn` - LinkedIn Insight Tag
- `tiktok` - TikTok Pixel
- `pinterest` - Pinterest Tag
- `snapchat` - Snapchat Pixel

For a complete list, check your EdgeTag dashboard or API documentation.

---

## Options Parameter

### Multiple EdgeTag Instances

If you have multiple EdgeTag instances on one page, use `destination`:

```javascript
// Instance 1
edgetag('init', { edgeURL: 'https://d.mysite.com', destination: 'instance1' })

// Instance 2
edgetag('init', {
  edgeURL: 'https://d.instance2.com',
  destination: 'instance2',
})

// Set consent for instance 1
edgetag('consent', { facebook: true }, null, { destination: 'instance1' })

// Set consent for instance 2
edgetag('consent', { googleAdsClicks: true }, null, {
  destination: 'instance2',
})

// Get consent from instance 1
edgetag(
  'getConsent',
  (consent) => {
    console.log('Instance 1 consent:', consent)
  },
  { destination: 'instance1' },
)
```

---

## disableConsentCheck Option

### Bypass Consent Gating

In non-GDPR/CCPA regions or for internal sites, you can disable consent gating entirely:

```javascript
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true, // Events sent without consent checks
})

// With disableConsentCheck, events are sent immediately
edgetag('tag', 'Purchase', { value: 99.99 }) // Sent immediately, no consent needed

// You can still set and retrieve consent if desired
edgetag('consent', { facebook: true })
edgetag('getConsent', (consent) => {
  console.log('Consent (for CMP UI):', consent)
})
```

**Use Cases**:

- Internal applications
- Non-GDPR/CCPA regions (US-only sites, etc.)
- Testing environments
- B2B applications without privacy regulations

**Important**: `disableConsentCheck` only affects whether events are blocked. Identity and provider routing still respects the data you choose to send.

---

## ConsentIQ Integration

### Built-in Consent Analytics

If using EdgeTag's ConsentIQ feature, consent data is automatically tracked:

```javascript
// No additional code needed
// ConsentIQ automatically captures:
// - Consent opt-in/opt-out counts
// - Per-category consent breakdown
// - Geographic variations (EU, UK, CA)
// - Consent changes over time

// Access data via EdgeTag Dashboard or API
// Reports available in ConsentIQ section
```

---

## Common Consent Workflows

### Accept All

```javascript
edgetag(
  'consent',
  {
    all: true, // Enable all providers
  },
  {
    all: true, // Enable all categories (except share_pii might be per-law)
  },
)
```

### Reject All

```javascript
edgetag(
  'consent',
  {
    all: false, // Disable all providers
  },
  {
    necessary: true, // Only necessary category
    // Others default to false
  },
)
```

### Granular Provider Consent

```javascript
edgetag('consent', {
  facebook: true,
  googleAdsClicks: false,
  klaviyo: true,
})
```

### Granular Category Consent

```javascript
edgetag('consent', null, {
  necessary: true,
  advertising: true,
  analytics: false,
  functional: true,
  share_pii: false,
})
```

### Category-Based with Provider Override

```javascript
// Set categories and override a specific provider in one call
edgetag(
  'consent',
  {
    facebook: false, // Opt out of Facebook despite advertising category
  },
  {
    advertising: true,
    analytics: true,
  },
)
```
