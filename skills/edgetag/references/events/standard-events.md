# Standard Events Reference

Complete reference for all 11 EdgeTag standard events with parameters, type definitions, and code examples.

## IMPORTANT: Maximize Data Richness

When implementing events, **always populate ALL fields that the source data can provide** — not just the required ones. The more data you send, the better ad platforms can match, attribute, and optimize. For example, a `contents` array with only `{ id, quantity }` is a missed opportunity — always include `item_price`, `title`, `category`, `brand`, `sku`, `variantId`, `image`, `url`, and any other fields available in the source data model.

Inspect the application's product/cart/order data structures and map every available property to the corresponding Content field. **Minimal payloads lead to poor event match quality and weaker ad optimization.**

## Content Type Definition

Used by several events to describe products or items:

```typescript
type Content = {
  id: string // Required: unique product identifier
  quantity: number // Required: quantity of this item
  item_price: number // Required: price per unit
  variantId?: string // Optional: product variant ID
  sku?: string // Optional: stock keeping unit
  title?: string // Optional: product name
  description?: string // Optional: product description
  category?: string // Optional: comma-separated categories
  brand?: string // Optional: brand name
  type?: 'product' | 'product_group' // Optional: item type
  image?: string // Optional: URL to product image
  url?: string // Optional: URL to product page
}
```

## Discount Type Definition

Used by Purchase events:

```typescript
type Discount = {
  code: string // Required: discount code or ID
  type?: 'FLAT' | 'PERCENTAGE' // Optional: discount type
  value?: string // Optional: discount amount or percentage
}
```

## Additional Event Parameters

These parameters can be added to any event payload:

```typescript
{
  eventId?: string;        // Custom event ID passed to channels for deduplication (default: auto-generated)
  skipTransformation?: boolean; // Pass data through without transformation (must target a specific channel via providers)
}
```

---

## 1. PageView

Default pixel tracking for page visits. Automatically fired when tracking pixel loads.

| Parameter                | Type | Required | Notes                           |
| ------------------------ | ---- | -------- | ------------------------------- |
| (no required parameters) | -    | -        | Captures page URL automatically |

**Code Example:**

```javascript
edgetag('tag', 'PageView')

// PageView with custom event ID
edgetag('tag', 'PageView', {
  eventId: 'pageview-abc123',
})
```

**When to use:**

- once page is loaded
- for SPA it should be for every page navigation

---

## 2. ViewContent

User visits a product or landing page. Used to track content consumption.

| Parameter | Type      | Required | Notes                              |
| --------- | --------- | -------- | ---------------------------------- |
| currency  | string    | Optional | ISO 4217 code (e.g., 'USD', 'EUR') |
| value     | number    | Optional | Total value of viewed content      |
| contents  | Content[] | Optional | Array of Content objects           |

**Code Example:**

```javascript
edgetag('tag', 'ViewContent', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio,electronics',
      brand: 'SoundMax',
      image: 'https://example.com/headphones.jpg',
    },
  ],
})
```

**When to use:**

- User lands on product page
- User browses category or collection
- User reads blog post or article

---

## 3. AddToCart

Product added to shopping cart.

| Parameter   | Type      | Required     | Notes                |
| ----------- | --------- | ------------ | -------------------- |
| currency    | string    | **Required** | ISO 4217 code        |
| value       | number    | **Required** | Total cart value     |
| contents    | Content[] | Optional     | Items added to cart  |
| checkoutUrl | string    | Optional     | URL to checkout page |

**Code Example:**

```javascript
edgetag('tag', 'AddToCart', {
  currency: 'USD',
  value: 49.99,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio',
      sku: 'WH-500-BLK',
    },
  ],
  checkoutUrl: 'https://example.com/checkout',
})
```

**When to use:**

- User clicks "Add to Cart" button
- Item added via AJAX
- Cart updated programmatically

---

## 4. RemoveFromCart

Product removed from shopping cart.

| Parameter   | Type      | Required     | Notes                          |
| ----------- | --------- | ------------ | ------------------------------ |
| currency    | string    | **Required** | ISO 4217 code                  |
| value       | number    | **Required** | Total cart value after removal |
| contents    | Content[] | Optional     | Items removed from cart        |
| checkoutUrl | string    | Optional     | URL to checkout page           |

**Code Example:**

```javascript
edgetag('tag', 'RemoveFromCart', {
  currency: 'USD',
  value: 99.99,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
    },
  ],
})
```

**When to use:**

- User removes item from cart
- Cart is modified (quantity decreased)

---

## 5. InitiateCheckout

User enters the checkout flow.

| Parameter   | Type      | Required     | Notes                |
| ----------- | --------- | ------------ | -------------------- |
| currency    | string    | **Required** | ISO 4217 code        |
| value       | number    | **Required** | Cart total value     |
| contents    | Content[] | Optional     | Items in cart        |
| checkoutUrl | string    | Optional     | URL to checkout page |

**Code Example:**

```javascript
edgetag('tag', 'InitiateCheckout', {
  currency: 'USD',
  value: 149.98,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
    },
    {
      id: 'prod-789',
      quantity: 1,
      item_price: 99.99,
      title: 'Phone Stand',
    },
  ],
  checkoutUrl: 'https://example.com/checkout',
})
```

**When to use:**

- User clicks "Proceed to Checkout" or "Buy Now"
- Checkout page loads

---

## 6. AddShippingInfo

Shipping address submitted during checkout.

| Parameter | Type      | Required     | Notes               |
| --------- | --------- | ------------ | ------------------- |
| currency  | string    | **Required** | ISO 4217 code       |
| value     | number    | **Required** | Cart total value    |
| contents  | Content[] | Optional     | Items being shipped |

**Code Example:**

```javascript
edgetag('tag', 'AddShippingInfo', {
  currency: 'USD',
  value: 149.98,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
    },
  ],
})
```

**When to use:**

- User submits shipping address form
- Shipping method selected

---

## 7. AddPaymentInfo

Payment method added during checkout.

| Parameter | Type      | Required     | Notes                 |
| --------- | --------- | ------------ | --------------------- |
| currency  | string    | **Required** | ISO 4217 code         |
| value     | number    | **Required** | Cart total value      |
| contents  | Content[] | Optional     | Items being purchased |

**Code Example:**

```javascript
edgetag('tag', 'AddPaymentInfo', {
  currency: 'USD',
  value: 149.98,
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
    },
  ],
})
```

**When to use:**

- User enters credit card information
- Payment method selected (PayPal, Apple Pay, etc.)
- Billing address confirmed

---

## 8. Purchase

Purchase completed successfully.

| Parameter | Type       | Required     | Notes                   |
| --------- | ---------- | ------------ | ----------------------- |
| currency  | string     | **Required** | ISO 4217 code           |
| value     | number     | **Required** | Total transaction value |
| orderId   | string     | **Required** | Unique order identifier |
| contents  | Content[]  | Optional     | Items purchased         |
| discounts | Discount[] | Optional     | Applied discounts       |

**Code Example:**

```javascript
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 134.98,
  orderId: 'order-20240226-001',
  eventId: 'order-20240226-001', // TIP: set eventId = orderId for deduplication
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Wireless Headphones',
      category: 'audio',
    },
    {
      id: 'prod-789',
      quantity: 1,
      item_price: 99.99,
      title: 'Phone Stand',
    },
  ],
  discounts: [
    {
      code: 'SAVE20',
      type: 'PERCENTAGE',
      value: '20',
    },
  ],
})
```

**When to use:**

- Payment processed successfully
- Order confirmation page loads
- Order confirmation email sent

**Important:** Always set `eventId = orderId` so channels that support deduplication (e.g., Meta) can avoid double-counting the same purchase. EdgeTag forwards every event to channels — it does not deduplicate itself.

---

## 9. Subscribe

Paid subscription created or renewed.

| Parameter | Type   | Required | Notes                          |
| --------- | ------ | -------- | ------------------------------ |
| currency  | string | Optional | ISO 4217 code                  |
| value     | number | Optional | Subscription price             |
| sourceId  | string | Optional | Subscription source identifier |

**Code Example:**

```javascript
edgetag('tag', 'Subscribe', {
  currency: 'USD',
  value: 9.99,
  sourceId: 'stripe-sub-12345',
})

// Minimal example
edgetag('tag', 'Subscribe')
```

**When to use:**

- User completes subscription signup
- Subscription renewed automatically
- Free trial converted to paid

---

## 10. Search

Search query performed by user.

| Parameter | Type      | Required | Notes                        |
| --------- | --------- | -------- | ---------------------------- |
| currency  | string    | Optional | ISO 4217 code (if monetized) |
| value     | number    | Optional | Revenue from search results  |
| contents  | Content[] | Optional | Search results/items         |
| search    | string    | Optional | Search query string          |

**Code Example:**

```javascript
edgetag('tag', 'Search', {
  search: 'wireless headphones under 50',
  contents: [
    {
      id: 'prod-456',
      quantity: 1,
      item_price: 49.99,
      title: 'Budget Wireless Headphones',
    },
  ],
})

// With revenue tracking
edgetag('tag', 'Search', {
  search: 'premium headphones',
  currency: 'USD',
  value: 199.99,
  contents: [
    {
      id: 'prod-999',
      quantity: 1,
      item_price: 199.99,
      title: 'Premium Studio Headphones',
    },
  ],
})
```

**When to use:**

- User submits search form
- Search results displayed
- Search-driven purchase made

---

## 11. Lead

Sign-up, form submission, or lead capture.

| Parameter | Type   | Required | Notes              |
| --------- | ------ | -------- | ------------------ |
| currency  | string | Optional | ISO 4217 code      |
| value     | number | Optional | Lead value         |
| name      | string | Optional | Product/page title |
| category  | string | Optional | Lead category      |

**Code Example:**

```javascript
edgetag('tag', 'Lead', {
  name: 'Newsletter Signup',
  category: 'newsletter',
})

// With value
edgetag('tag', 'Lead', {
  name: 'Product Demo Request',
  category: 'demo-request',
  currency: 'USD',
  value: 0,
})

// Minimal example
edgetag('tag', 'Lead')
```

**When to use:**

- User signs up for newsletter
- Contact form submitted
- Demo request sent
- Account created
- Whitepaper downloaded (gated content)

---

## Function Signature

```javascript
edgetag(command, eventName, data?, providers?, options?)
```

### Parameters

| Parameter | Type                    | Required     | Notes                                                                                                                                       |
| --------- | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| command   | 'tag'                   | **Required** | Always 'tag' for event tracking                                                                                                             |
| eventName | string                  | **Required** | Standard event name (PageView, Purchase, etc.)                                                                                              |
| data      | object                  | Optional     | Event parameters and values                                                                                                                 |
| providers | Record<string, boolean> | Optional     | Target specific channels for custom events (default: all consented channels). Do not use for consent — use the `consent()` function instead |
| options   | object                  | Optional     | Execution options                                                                                                                           |

### Options Object

```typescript
{
  method?: 'beacon';      // Use navigator.sendBeacon — for events fired right before page navigation/redirect
  sync?: true;            // Wait for all channels to complete (may cancel events)
  destination?: string;   // Target specific EdgeTag instance URL
}
```

**Example — targeting a specific channel for a custom event:**

```javascript
// Custom event only relevant to Klaviyo
edgetag(
  'tag',
  'NewsletterSignup',
  { category: 'footer-form' },
  { klaviyo: true },
)
```

**Example — beacon for pre-navigation event:**

```javascript
// Purchase tracked right before redirect to thank-you page
edgetag(
  'tag',
  'Purchase',
  {
    currency: 'USD',
    value: 99.99,
    orderId: 'order-123',
  },
  null, // all consented channels
  {
    method: 'beacon', // Survives page navigation
  },
)
```
