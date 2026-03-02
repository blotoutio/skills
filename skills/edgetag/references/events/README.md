# EdgeTag Events Reference

EdgeTag's event system provides a unified way to track user actions across your website or application. Send events once using standard event names, and EdgeTag automatically transforms and forwards them to all configured channels.

## How It Works

1. **Write Once**: Use standard event names like `Purchase`, `AddToCart`, `PageView`, etc.
2. **Transform Everywhere**: EdgeTag normalizes your event data and sends it to all connected channels (Facebook, Google Ads, TikTok, Klaviyo, etc.)
3. **Flexible Parameters**: Required parameters ensure completeness, optional parameters add richer context

## The 11 Standard Events

| Event | Purpose | Key Data |
|-------|---------|----------|
| **PageView** | Track page visits | No required parameters |
| **ViewContent** | Product or landing page visits | Optional: currency, value, contents |
| **AddToCart** | Product added to shopping cart | Required: currency, value |
| **RemoveFromCart** | Product removed from cart | Required: currency, value |
| **InitiateCheckout** | User enters checkout flow | Required: currency, value |
| **AddShippingInfo** | Shipping address submitted | Required: currency, value |
| **AddPaymentInfo** | Payment method added | Required: currency, value |
| **Purchase** | Transaction completed | Required: currency, value, orderId |
| **Subscribe** | Paid subscription created | Optional: currency, value, sourceId |
| **Search** | Search query performed | Optional: currency, value, search |
| **Lead** | Sign-up or lead capture | Optional: currency, value, name, category |

## Getting Started

- **[Standard Events Reference](./standard-events.md)** - Complete parameter tables, type definitions, and code examples for all 11 events
- **[Gotchas & Pitfalls](./gotchas.md)** - Common mistakes to avoid when tracking events
- **[Patterns & Best Practices](./patterns.md)** - Real-world tracking patterns (funnels, consent routing, beacon usage, etc.)

## Quick Example

```javascript
// Track a purchase
edgetag('tag', 'Purchase', {
  currency: 'USD',
  value: 99.99,
  orderId: 'order-12345',
  contents: [
    {
      id: 'sku-789',
      quantity: 1,
      item_price: 99.99,
      title: 'Premium Widget',
      category: 'electronics'
    }
  ]
});
```

## Implementation Guide

EdgeTag provides the `edgetag()` function with signature:

```javascript
edgetag('tag', eventName, data?, providers?, options?)
```

For detailed implementation patterns, see [Patterns & Best Practices](./patterns.md).
