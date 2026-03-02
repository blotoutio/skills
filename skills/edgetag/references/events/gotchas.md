# Common Gotchas & Pitfalls

Mistakes to avoid when tracking events with EdgeTag.

## 1. Missing Required Fields on Cart Events

**The Problem:**
AddToCart, RemoveFromCart, InitiateCheckout, AddShippingInfo, and AddPaymentInfo all require `currency` and `value` parameters. Omitting these causes data loss or channel failures.

**Wrong:**

```javascript
edgetag("tag", "AddToCart", {
  contents: [
    {
      id: "prod-456",
      quantity: 1,
      item_price: 49.99,
    },
  ],
  // Missing currency and value!
});
```

**Right:**

```javascript
edgetag("tag", "AddToCart", {
  currency: "USD",
  value: 49.99,
  contents: [
    {
      id: "prod-456",
      quantity: 1,
      item_price: 49.99,
      title: "Wireless Headphones",
    },
  ],
});
```

---

## 2. Not Setting eventId = orderId for Purchase Deduplication

**The Problem:**  
Without matching eventId to orderId, channels that support deduplication (e.g., Meta) cannot detect duplicate purchases. EdgeTag forwards every event to channels — it does not deduplicate itself. Setting eventId to the orderId enables channels with deduplication support to avoid double-counting the same purchase, especially important when doing purchase backup from server-side.

**Wrong:**

```javascript
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-20240226-001",
  // Missing eventId! EdgeTag generates a random ID
});
```

**Right:**

```javascript
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-20240226-001",
  eventId: "order-20240226-001", // Match orderId for deduplication
});
```

---

## 3. Sending Events Before Consent

See [consent/gotchas.md § Events Silently Blocked Without Consent](../consent/gotchas.md).

---

## 4. Wrong Content Type Fields

**The Problem:**
Content objects have specific required fields (`id`, `quantity`, `item_price`). Missing or using wrong field names breaks channel transformation.

**Wrong:**

```javascript
edgetag("tag", "AddToCart", {
  currency: "USD",
  value: 49.99,
  contents: [
    {
      product_id: "prod-456", // Wrong: should be 'id'
      amount: 49.99, // Wrong: should be 'item_price'
      qty: 1, // Wrong: should be 'quantity'
    },
  ],
});
```

**Right:**

```javascript
edgetag("tag", "AddToCart", {
  currency: "USD",
  value: 49.99,
  contents: [
    {
      id: "prod-456", // Correct
      quantity: 1, // Correct
      item_price: 49.99, // Correct
      title: "Wireless Headphones", // Optional but recommended
    },
  ],
});
```

---

## 5. Not Using Standard Event Names

**The Problem:**
EdgeTag transforms only standard event names. Using custom names like "BuyNow" or "CartAdded" bypasses transformation and channels don't receive data.

**Wrong:**

```javascript
// Custom event name - EdgeTag won't transform this
edgetag("tag", "BuyNow", {
  currency: "USD",
  value: 99.99,
});

// Will likely be ignored by channels
edgetag("tag", "CartAdded", {
  /* ... */
});
```

**Right:**

```javascript
// Use standard event names
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-123",
});

edgetag("tag", "AddToCart", {
  currency: "USD",
  value: 49.99,
});
```

See **events/README.md** for the complete list of standard event names.

---

## 6. Misusing skipTransformation

**The Problem:**
Setting `skipTransformation: true` bypasses all EdgeTag normalization. Your data must match the target channel's exact API requirements or events will fail. Because each channel has its own payload format, you **must** specify which channel the event targets using the `providers` parameter — sending an untransformed payload to all channels will fail for every channel except the one you formatted for.

**Wrong:**

```javascript
// No providers specified — this raw payload gets sent to ALL channels,
// but it only matches Facebook's format. Other channels will reject it.
edgetag("tag", "Purchase", {
  data: [
    {
      event_name: "Purchase",
      event_id: "order-123",
      event_time: Math.floor(Date.now() / 1000),
      user_data: { em: "abc123..." },
      custom_data: { value: 99.99, currency: "USD" },
    },
  ],
  skipTransformation: true,
});
```

**Also wrong:**

```javascript
// Using skipTransformation with a standard EdgeTag payload — the standard
// fields won't be transformed into channel-specific format, so no channel
// will understand them.
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-123",
  skipTransformation: true,
});
```

**Right:**

```javascript
// Let EdgeTag transform - it handles channel-specific formatting for all channels
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-123",
  // skipTransformation not set - EdgeTag handles it
});

// Use skipTransformation only with a raw channel-specific payload AND
// target that specific channel via providers
edgetag("tag", "Purchase",
  {
    // Your hand-crafted Facebook Conversion API payload
    data: [
      {
        event_name: "Purchase",
        event_id: "order-123",
        event_time: Math.floor(Date.now() / 1000),
        user_data: { em: "abc123..." },
        custom_data: { value: 99.99, currency: "USD" },
      },
    ],
    skipTransformation: true,
  },
  { facebook: true } // Target only Facebook — the payload is Facebook-specific
);

// If you need to send to multiple channels with skipTransformation,
// send separate events with each channel's specific payload format
edgetag("tag", "Purchase",
  {
    // TikTok-specific payload
    event: "CompletePayment",
    event_id: "order-123",
    timestamp: new Date().toISOString(),
    properties: { value: 99.99, currency: "USD" },
    skipTransformation: true,
  },
  { tiktok: true } // Target only TikTok
);
```

---

## 7. Forgetting to Replace Example Data with Dynamic Values

**The Problem:**
Copying example code and forgetting to replace hardcoded values results in identical data being sent repeatedly, breaking analytics and deduplication.

**Wrong:**

```javascript
// Copy-paste fail - same order every time!
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-20240226-001", // Same every time!
  contents: [
    {
      id: "prod-456", // Same every time!
      quantity: 1,
      item_price: 49.99,
      title: "Wireless Headphones", // Same every time!
    },
  ],
});
```

**Right:**

```javascript
// Use dynamic values from page state or backend
const order = getCurrentOrder(); // Get actual order

edgetag("tag", "Purchase", {
  currency: order.currency, // Dynamic
  value: order.total, // Dynamic
  orderId: order.id, // Dynamic
  eventId: order.id,
  contents: order.items.map((item) => ({
    id: item.sku, // Dynamic
    quantity: item.qty, // Dynamic
    item_price: item.price, // Dynamic
    title: item.name, // Dynamic
    category: item.category, // Dynamic
  })),
});
```

---

## 8. Sending Duplicate Events

**The Problem:**  
Tracking the same event multiple times (double-click handlers, re-running init scripts, event tracking in multiple places, sending it again on reloads) inflates metrics.

**Wrong:**

```javascript
// In global init script
edgetag("tag", "Purchase", {
  /* ... */
});

// Also in checkout page script
edgetag("tag", "Purchase", {
  /* ... */
});

// Also in order confirmation email tracking
edgetag("tag", "Purchase", {
  /* ... */
});
// Same purchase tracked 3 times!
```

**Right:**

```javascript
// Track purchase ONCE - on order confirmation page load
if (window.location.pathname === "/order-confirmation") {
  const orderId = new URLSearchParams(window.location.search).get("order_id");

  edgetag("tag", "Purchase", {
    currency: "USD",
    value: 99.99,
    orderId: orderId,
    eventId: orderId, // Deduplication safety net
  });
}
```

---

## 9. Incorrect Currency Codes

**The Problem:**
Invalid or misspelled currency codes (like 'US' instead of 'USD') may cause channel errors or data rejection.

**Wrong:**

```javascript
edgetag("tag", "Purchase", {
  currency: "US", // Invalid - should be ISO 4217
  value: 99.99,
  orderId: "order-123",
});

edgetag("tag", "AddToCart", {
  currency: "usd", // Wrong case - should be uppercase
  value: 49.99,
});
```

**Right:**

```javascript
edgetag("tag", "Purchase", {
  currency: "USD", // Correct ISO 4217 code
  value: 99.99,
  orderId: "order-123",
});

edgetag("tag", "AddToCart", {
  currency: "EUR", // Correct
  value: 49.99,
});
```

---

## 10. Missing Content Required Fields

**The Problem:**
Content objects require `id`, `quantity`, and `item_price`. These are essential for channel transformation and omitting them breaks product-level tracking.

**Wrong:**

```javascript
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-123",
  contents: [
    {
      title: "Wireless Headphones",
      // Missing: id, quantity, item_price
    },
  ],
});
```

**Right:**

```javascript
edgetag("tag", "Purchase", {
  currency: "USD",
  value: 99.99,
  orderId: "order-123",
  contents: [
    {
      id: "prod-456",
      quantity: 1,
      item_price: 99.99,
      title: "Wireless Headphones",
      category: "audio",
      brand: "SoundMax",
    },
  ],
});
```

---

## 11. Wrong Beacon Usage

**The Problem:**
The beacon method (`method: 'beacon'`) uses `navigator.sendBeacon`, which survives page navigation. Use it when the user's action both triggers an event **and** causes an immediate redirect — without beacon, the standard fetch request gets canceled when the page navigates away and the event is lost.

Do not use beacon for events where the user stays on the same page. Standard fetch is more reliable in those cases and provides better error feedback.

**Wrong — beacon on a non-navigating event:**

```javascript
// User stays on the page after viewing content — beacon is unnecessary here
edgetag(
  "tag",
  "ViewContent",
  {
    currency: "USD",
    value: 49.99,
  },
  null,
  {
    method: "beacon", // Wrong — no navigation happening, use standard fetch
  },
);
```

**Wrong — no beacon when page immediately redirects:**

```javascript
// User clicks "Add to Cart" and page redirects to cart — event will be lost!
document.getElementById("add-to-cart").addEventListener("click", () => {
  edgetag("tag", "AddToCart", {
    currency: "USD",
    value: 49.99,
  });
  // Page redirects to /cart — the fetch above gets canceled mid-flight
  window.location.href = "/cart";
});
```

**Right:**

```javascript
// Action causes immediate redirect — use beacon so the event survives navigation
document.getElementById("add-to-cart").addEventListener("click", () => {
  edgetag(
    "tag",
    "AddToCart",
    {
      currency: "USD",
      value: 49.99,
    },
    null,
    {
      method: "beacon", // Survives the redirect to /cart
    },
  );
  window.location.href = "/cart";
});

// Checkout button redirects to payment provider
document.getElementById("checkout-button").addEventListener("click", () => {
  edgetag(
    "tag",
    "InitiateCheckout",
    {
      currency: "USD",
      value: 199.99,
    },
    null,
    {
      method: "beacon", // Survives redirect to payment page
    },
  );
  window.location.href = paymentProviderUrl;
});

// Page exit / tab close — also needs beacon
window.addEventListener("beforeunload", () => {
  edgetag("tag", "SessionEnd", { sessionDuration: Date.now() - sessionStart }, null, {
    method: "beacon",
  });
});

// Normal events where user stays on page — standard fetch, no beacon needed
edgetag("tag", "ViewContent", {
  currency: "USD",
  value: 49.99,
});
```

---

## Quick Checklist

Before shipping event tracking code:

- All required parameters present (currency, value for cart events; orderId for Purchase)
- Event names match standard names exactly
- eventId = orderId for Purchase events
- Content objects have id, quantity, item_price
- Currency codes are valid ISO 4217 (USD, EUR, etc.)
- Data is dynamic, not hardcoded from examples
- Events tracked only once per action
- Consent set via `consent()` before firing events (EdgeTag skips non-consented channels automatically)
- No skipTransformation unless absolutely necessary — and always with `providers` targeting a specific channel

