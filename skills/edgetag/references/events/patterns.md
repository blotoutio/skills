# Common Patterns & Best Practices

Real-world event tracking patterns using EdgeTag standard events.

---

## Pattern 1: E-Commerce Funnel Tracking

Track the complete customer journey from discovery to purchase.

```javascript
// 1. User lands on website
edgetag('tag', 'PageView')

// 2. User views product page
edgetag('tag', 'ViewContent', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio,electronics',
      brand: 'SoundMax',
      image: 'https://example.com/headphones.jpg',
      url: 'https://example.com/products/headphones',
    },
  ],
})

// 3. User adds to cart
edgetag('tag', 'AddToCart', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio',
    },
  ],
  checkoutUrl: 'https://example.com/checkout',
})

// 4. User proceeds to checkout
edgetag('tag', 'InitiateCheckout', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 49.99,
    },
  ],
})

// 5. User enters shipping info
edgetag('tag', 'AddShippingInfo', {
  currency: 'USD',
  value: 49.99,
})

// 6. User enters payment info
edgetag('tag', 'AddPaymentInfo', {
  currency: 'USD',
  value: 49.99,
})

// 7. Purchase completes
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 49.99,
  orderId: 'order-20240226-001',
  eventId: 'order-20240226-001', // Deduplication
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
    },
  ],
})
```

**Why this pattern works:**

- Captures each step of the conversion funnel
- Enables funnel analysis in all channels
- Multiple products tracked through complete journey
- Deduplication prevents counting same purchase twice

**Analysis enabled:**

- View-to-cart conversion rate
- Cart abandonment
- Checkout completion rate
- ROI by traffic source

---

## Pattern 2: Lead Generation Tracking

Track sign-ups, form submissions, and content engagement.

```javascript
// User downloads whitepaper
edgetag('tag', 'Lead', {
  name: 'Enterprise Security Whitepaper',
  category: 'whitepaper-download',
})

// User signs up for newsletter
edgetag('tag', 'Lead', {
  name: 'Weekly Product Updates',
  category: 'newsletter-signup',
})

// User requests product demo
edgetag('tag', 'Lead', {
  name: 'Premium Plan Demo',
  category: 'demo-request',
  currency: 'USD',
  value: 0, // No immediate revenue
})

// User starts free trial
edgetag('tag', 'Lead', {
  category: 'free-trial-signup',
  // Don't expose user name if not collected
})

// User converts free trial to paid subscription
edgetag('tag', 'Subscribe', {
  currency: 'USD',
  value: 29.99,
  sourceId: 'stripe-sub-abc123',
})
```

**When to use Lead vs Subscribe:**

- **Lead**: Any form submission, sign-up, or gated content access
- **Subscribe**: Paid subscription or recurring billing initiated

**CSV Import for Lead:**
If importing leads from CRM or backend database:

```csv
email,name,category,timestamp
john@example.com,John Smith,demo-request,1708959600000
jane@example.com,Jane Doe,newsletter,1708963200000
bob@example.com,Bob Johnson,trial-signup,1708966800000
```

---

## Pattern 3: Search Tracking

Track user searches and search-driven purchases.

```javascript
// User performs search
const searchQuery = 'wireless headphones under 50'
edgetag('tag', 'Search', {
  search: searchQuery,
  contents: [
    {
      id: 'sku-456',
      quantity: 1,
      item_price: 39.99,
      title: 'Budget Wireless Headphones',
      category: 'audio',
    },
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 49.99,
      title: 'Standard Wireless Headphones',
    },
  ],
})

// User buys from search results
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 39.99,
  orderId: 'order-20240226-002',
  eventId: 'order-20240226-002',
  contents: [
    {
      id: 'sku-456',
      quantity: 1,
      item_price: 39.99,
      title: 'Budget Wireless Headphones',
      category: 'audio',
    },
  ],
})
```

**Use case:**

- Internal site search analysis
- Search term popularity and conversion
- Product discovery metrics
- Search-to-purchase attribution

---

## Pattern 4: Multi-Product Cart Purchase

Customer adds multiple items before checking out.

```javascript
// Add first item
edgetag('tag', 'AddToCart', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'sku-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
    },
  ],
})

// Add second item
edgetag('tag', 'AddToCart', {
  currency: 'USD',
  value: 149.98, // Updated cart total
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 99.99,
      title: 'Phone Stand',
    },
  ],
})

// Purchase both items
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 149.98,
  orderId: 'order-20240226-003',
  eventId: 'order-20240226-003',
  contents: [
    {
      id: 'sku-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio',
    },
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 99.99,
      title: 'Phone Stand',
      category: 'accessories',
    },
  ],
  discounts: [
    {
      code: 'BUNDLE10',
      type: 'FLAT',
      value: '10',
    },
  ],
})
```

**Why track this way:**

- Shows item-level performance
- Enables product affinity analysis
- Bundle discount visibility
- AOV (Average Order Value) calculations

---

## Pattern 5: Beacon for Pre-Navigation Events

Use `method: 'beacon'` when the user's action triggers both an event **and** an immediate page redirect. Without beacon, the standard fetch request gets canceled when the browser navigates away — and the event is lost.

```javascript
// Add to Cart where page immediately redirects to cart
document.getElementById('add-to-cart').addEventListener('click', () => {
  edgetag(
    'tag',
    'AddToCart',
    {
      currency: 'USD',
      value: 49.99,
    },
    null,
    {
      method: 'beacon', // Survives the redirect to /cart
    },
  )
  window.location.href = '/cart'
})

// Checkout button redirects to external payment provider
document.getElementById('checkout-button').addEventListener('click', () => {
  edgetag(
    'tag',
    'InitiateCheckout',
    {
      currency: 'USD',
      value: 199.99,
    },
    null,
    {
      method: 'beacon', // Survives redirect to payment page
    },
  )
  window.location.href = paymentProviderUrl
})

// Page exit / tab close
window.addEventListener('beforeunload', () => {
  edgetag(
    'tag',
    'SessionEnd',
    {
      sessionDuration: Date.now() - sessionStart,
    },
    null,
    {
      method: 'beacon', // Survives tab close
    },
  )
})

// Normal event where user stays on page — no beacon needed
edgetag('tag', 'ViewContent', {
  currency: 'USD',
  value: 49.99,
})
```

**When to use beacon:**

- The user's action causes an immediate redirect (Add to Cart → cart page, checkout → payment provider, outbound link click)
- Page exit events (`beforeunload`, tab close)
- Any scenario where `fetch` would be canceled by navigation

**When NOT to use beacon:**

- Events where the user stays on the same page (ViewContent, Search, form interactions)
- Standard fetch is more reliable in these cases and provides better error feedback

**How it works:**

- `navigator.sendBeacon` hands the request to the browser to deliver — it completes even after the page unloads
- Standard fetch is tied to the page lifecycle and gets aborted on navigation

---

## Pattern 6: Targeting Specific Channels with Providers

Use the `providers` parameter to send a custom event to a specific channel. This is useful when you have a channel-specific event that doesn't apply to all channels. Do **not** use `providers` for consent — handle consent with the `consent()` function and EdgeTag will automatically skip non-consented channels.

```javascript
// Custom event only relevant to Klaviyo (e.g., email-specific tracking)
edgetag(
  'tag',
  'NewsletterSignup',
  {
    category: 'footer-form',
  },
  {
    klaviyo: true,
  },
)

// Custom event only relevant to Facebook
edgetag(
  'tag',
  'ViewCategory',
  {
    category: 'electronics',
  },
  {
    facebook: true,
  },
)

// Standard events go to all channels — no providers needed
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 99.99,
  orderId: 'order-123',
})
// EdgeTag sends to all consented channels automatically
```

---

## Pattern 7: Custom Conversion Events via Keyword Matching

Automatically fire conversion events when specific keywords are found in product data.

**Setup in dashboard:**
In EdgeTag plugins/settings, configure keyword conversions:

- Keyword: "premium" → Maps to custom conversion "Premium Product Purchase"
- Keyword: "sale" → Maps to custom conversion "Sale Item Purchase"
- Keyword: "bundle" → Maps to custom conversion "Bundle Purchase"

**How it works:**
When you track a Purchase event with these keywords, the mapped conversion fires automatically:

```javascript
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 199.99,
  orderId: 'order-123',
  contents: [
    {
      id: 'sku-premium-bundle',
      quantity: 1,
      item_price: 199.99,
      title: 'Premium Wireless Headphones Bundle', // Contains "Premium" and "Bundle"
      description: 'High-end audio sale item', // Contains "sale"
      brand: 'SoundMax Premium', // Contains "Premium"
    },
  ],
})

// EdgeTag detects keywords and fires:
// - "Premium Product Purchase" conversion
// - "Bundle Purchase" conversion
// - "Sale Item Purchase" conversion
```

**Keyword matching rules:**

- Text transformation: lowercase, remove word-contract chars ('\_-), replace with spaces
- Example: "premium-bundle" becomes "premium bundle"
- Searches across: contents.title, contents.brand, contents.description, keywords field
- Case-insensitive matching

**Use cases:**

- Track high-value product purchases
- Monitor seasonal sales performance
- Bundle purchase attribution
- Brand-specific conversion tracking

---

## Pattern 8: Sync vs Async Event Execution

Choose between waiting for all channels or proceeding immediately.

```javascript
// Async (default) - fire and forget
// Fastest, events may not complete before navigation
edgetag('tag', 'ViewContent', {
  currency: 'USD',
  value: 49.99,
})

// Async (explicit)
edgetag(
  'tag',
  'Purchase',
  {
    currency: 'USD',
    value: 99.99,
    orderId: 'order-123',
  },
  null,
  {
    sync: false, // Default behavior
  },
)

// Sync - wait for all channels to respond
// Slower, but ensures event completion before page exit
edgetag(
  'tag',
  'Purchase',
  {
    currency: 'USD',
    value: 99.99,
    orderId: 'order-123',
  },
  null,
  {
    sync: true, // Wait for all channels
  },
)
```

**When to use sync:**

- Critical tracking (Purchase, high-value Lead)
- Just before page navigation
- Small number of channels

**When to use async (default):**

- PageView and lighter events
- Normal navigation flow
- Performance-critical pages

**Note:** Sync may cause some channel requests to be canceled if page unloads quickly. Use beacon method for reliability on page exit.

---

## Troubleshooting Common Pattern Issues

### Pattern 1: Cart value not updated

Always update `value` parameter to current cart total when items change.

### Pattern 2: Duplicate purchases

Always set `eventId = orderId` on Purchase events.

### Pattern 3: Missing product data

Include `contents` array with required fields (id, quantity, item_price) whenever possible.

### Pattern 4: No data in channels

Verify standard event names match exactly (PageView, Purchase, etc., not PurchaseComplete).

### Pattern 5: Consent not working

Call `consent()` before firing events — EdgeTag skips non-consented channels automatically. Do not use the `providers` parameter for consent routing.

### Pattern 6: Events lost on redirect

Use `method: 'beacon'` when the user's action causes an immediate page redirect (e.g., Add to Cart → cart page). For `beforeunload`, use `beforeunload` not `unload`. Test with network tab open to verify sendBeacon calls.
