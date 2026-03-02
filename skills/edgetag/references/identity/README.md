# EdgeTag Identity System

## Overview

The EdgeTag identity system enables persistent user tracking across domains and converts anonymous browsing into identified user profiles through the identity graph.

## Key Concepts

### First-Party Cookie: `tag_user_id`

- **What it is**: A first-party cookie set by EdgeTag server in your domain
- **Persistence**: Up to 400 days per domain
- **Purpose**: Uniquely identifies a user within your domain
- **Automatic**: Set automatically when EdgeTag initializes

### Cross-Domain Transfer: `et_uid`

- **What it is**: A URL query parameter (NOT a cookie)
- **Purpose**: Transfer identity between different domains
- **How it works**: Append `et_uid` to URLs on the sending domain, then read it from the URL and pass it as `userId` on the receiving domain
- **Not automatic**: EdgeTag does NOT read `et_uid` from the URL automatically. You must extract it yourself and pass it to the SDK. The only exception is the Shopify app, which handles `et_uid` automatically.
- **Scope**: Query parameter only—never stored as a cookie

### Identity Graph

The EdgeTag identity graph stitches together:

- Anonymous browsing sessions
- Known user profiles (when identity is captured)
- Cross-domain activity
- CRM data (orders, customer records)

When a user identifies themselves (e.g., sign-in, form submission), EdgeTag automatically links all anonymous activity to their profile.

## Getting Started

1. **Capture identity progressively** - Don't wait for complete profile data
2. **Use standard key formats** - Email (lowercase), phone (E.164), name (lowercase), etc.
3. **Cross-domain linking** - Append `et_uid` query parameter to URLs on the sending domain, and read it from the URL on the receiving domain (not automatic except on Shopify)
4. **Headless sites** - Create an additional server-side cookie (e.g., `truid`) on your backend for full browser coverage. Does not replace the EdgeTag user ID. See [platforms/patterns.md § Pattern 3](../platforms/patterns.md)
5. **CRM connections** - Link Shopify orders for new/returning customer detection

## Reference Files

- **[API Reference](./api-reference.md)** - Complete function signatures and endpoints
- **[Gotchas](./gotchas.md)** - Common mistakes to avoid
- **[Patterns](./patterns.md)** - Implementation best practices

## Quick Start

```javascript
// Get the user ID
const userId = edgetag('getUserId');

// Set a single standard key
edgetag('user', 'email', 'user@example.com');

// Set multiple keys (standard or custom)
edgetag('data', {
  email: 'user@example.com',
  phone: '+1234567890',
  customAttribute: 'value'
});

// Retrieve identity data (standard keys return {keyExists: boolean})
edgetag('getData', ['email', 'phone'], (data) => {
  console.log(data); // { emailExists: true, phoneExists: true }
});
```

