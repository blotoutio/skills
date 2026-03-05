# EdgeTag Identity: Implementation Patterns

## Pattern 1: Progressive Identity Capture

**When to use**: Any site with multi-step user journey (signup → profile → checkout)

**Goal**: Capture identity incrementally without waiting for complete profile

```javascript
// Step 1: Sign-up form
document.getElementById('signupBtn').addEventListener('click', (e) => {
  const email = document.getElementById('email').value
  edgetag('user', 'email', email.toLowerCase().trim())
  // At this point, user is now identified in the identity graph
})

// Step 2: Profile completion (later)
document.getElementById('profileBtn').addEventListener('click', (e) => {
  const firstName = document.getElementById('firstName').value
  const lastName = document.getElementById('lastName').value
  const phone = document.getElementById('phone').value

  edgetag('data', {
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
    phone: formatPhone(phone), // E.164 format
  })
})

// Step 3: Checkout
document.getElementById('checkoutBtn').addEventListener('click', (e) => {
  const state = document.getElementById('state').value
  const zip = document.getElementById('zip').value

  edgetag('data', {
    state: state.toLowerCase(),
    zip: zip.replace(/\D/g, ''),
  })
})

// Helper: Format phone to E.164
function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}` // Assume US
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return `+${digits}` // Fallback
}
```

**Benefits**:

- Links partial data to user immediately
- All events from signup onward attributed to user
- Doesn't require waiting for complete profile
- Email alone is enough to stitch identity

---

## Pattern 2: Cross-Domain Linking

**When to use**: Multiple domains (e.g., site.com, shop.site.com, blog.site.com)

**Goal**: Transfer identity when users navigate between domains

```javascript
// On domain-a.com
function linkToDomainB() {
  const userId = edgetag('getUserId')
  if (!userId) {
    console.warn('User not yet identified')
    return
  }

  // Build URL with et_uid parameter
  const targetUrl = new URL('https://shop.domain.com/products')
  targetUrl.searchParams.set('et_uid', userId)

  window.location.href = targetUrl.toString()
}

// HTML
;<button onclick="linkToDomainB()">Go to Shop</button>
```

**On domain-b.com** (must read et_uid from URL):

> **Important**: EdgeTag does NOT automatically capture `et_uid` from URL query parameters. You must read it yourself and pass it to the SDK. The only exception is the Shopify app, which handles `et_uid` automatically.

```javascript
// Read et_uid from URL query parameter
const urlParams = new URLSearchParams(window.location.search)
const etUid = urlParams.get('et_uid')

// Pass it as the userId when initializing EdgeTag
edgetag('init', {
  edgeURL: 'https://d.shop-domain.com',
  userId: etUid || undefined, // Falls back to generating a new ID if not present
})
```

**Verification**:

```javascript
// On domain-b.com, should see same user ID from domain-a
window.addEventListener('edgetag-initialized', () => {
  const userId = edgetag('getUserId')
  console.log('Same user across domains:', userId)
})
```

---

## Pattern 3: Server-Side Cookie for Headless Sites

On headless sites, we recommend creating an additional server-side cookie (e.g., `truid`) on your backend for full browser coverage. This does not replace the EdgeTag user ID — it is an additional persistence optimization.

See [platforms/patterns.md § Pattern 3: Server-Side Cookie Creation Code](../platforms/patterns.md) for full implementation examples.

---

## Pattern 4: Offline Event User Matching

**When to use**: Matching offline events (CRM, offline orders) to online profiles

**Goal**: Link events from non-web sources to user identities

**Option A: Via EdgeTag ID**

First, save the EdgeTag user ID against your own user identifier in your database:

```javascript
// On the browser — when user is identified (e.g., login, signup, checkout)
edgetag('getUserId', (edgeTagId) => {
  // Save edgeTagId alongside your internal user/customer ID
  fetch('/api/save-edgetag-id', {
    method: 'POST',
    body: JSON.stringify({ userId: yourUserId, edgeTagId }),
  })
})
```

Then, on your server, retrieve the stored EdgeTag ID when sending events:

```javascript
// On your server — retrieve the stored EdgeTag ID for this user
const edgeTagId = await db.getEdgeTagId(yourUserId)

fetch('https://d.mysite.com/tag', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    EdgeTagUserId: edgeTagId,
  },
  body: JSON.stringify({
    eventName: 'Purchase',
    timestamp: Date.now(),
    data: { value: 99.99, currency: 'USD' },
  }),
})
```

**Option B: Via Email**

```javascript
// If you only have email (CRM/order data)
const customerEmail = 'user@example.com'

fetch('https://d.mysite.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    EdgeTagUserId: customerEmail, // EdgeTag matches via email
  },
  body: JSON.stringify({
    email: customerEmail.toLowerCase(),
    orderValue: 99.99,
    orderDate: '2025-02-26',
  }),
})
```

**Option C: Via CRM Integration**

```javascript
// EdgeTag Shopify integration example:
// Checks orders every 15 minutes
// Automatically determines if user is new customer (NC) or returning (RC)
// No code needed—just connect your Shopify store

// NC/RC is set automatically via the user function, not via tag
// edgetag('user', 'isNewCustomer', true)  — set by Shopify integration
// edgetag('user', 'isNewCustomer', false) — for returning customers
```

---

## Pattern 5: CRM Connection for New/Returning Customer Detection

**When to use**: E-commerce sites with Shopify or other CRM

**Goal**: Automatically detect if user is new or returning customer

> **Important**: NC/RC status must be set via `edgetag('user', 'isNewCustomer', ...)`, not via `tag`. This is identity data, not event data.

**Shopify Setup**:

```javascript
// EdgeTag automatically connects to Shopify
// No additional code needed

// Features:
// - Checks orders every 15 minutes
// - NC: New customer (first purchase)
// - RC: Returning customer (2+ purchases)
// - isNewCustomer is set automatically via the user function

// Shopify integration calls this internally:
// edgetag('user', 'isNewCustomer', true)  — for new customers
// edgetag('user', 'isNewCustomer', false) — for returning customers
```

**Manual CRM Lookup**:

```javascript
// For non-Shopify systems, manually check and set NC/RC
async function setCustomerType(email) {
  const response = await fetch('/api/customer-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const { orderCount } = await response.json()
  const isNew = orderCount <= 1

  // Set NC/RC via user function (NOT tag)
  edgetag('user', 'isNewCustomer', isNew)
}
```

---

## Pattern 6: Mobile App + Web Identity Sync

**When to use**: Native app with web experience, need unified identity

**Goal**: Sync user identity between mobile app and web

**Step 1: App generates identifier**

```javascript
// Mobile app (native code)
// Generate or retrieve your app user ID
const appUserId = 'app-user-12345'

// Deep link to web with app user ID
const webUrl = `https://site.com/app-link?app_user_id=${appUserId}`
// Or pass via app-to-web bridge
```

**Step 2: Web captures app user ID**

```javascript
// On web, capture the app user ID as custom data
const appUserId = new URL(window.location).searchParams.get('app_user_id')

edgetag('data', {
  email: 'user@example.com',
  appUserId: appUserId, // Custom key
})
```

**Step 3: Match offline app events**

```javascript
// Send app events (purchases, actions) with appUserId
fetch('https://d.mysite.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    EdgeTagUserId: 'user@example.com', // Or appUserId if stored
  },
  body: JSON.stringify({
    email: 'user@example.com',
    appEvent: 'Purchase',
    appValue: 99.99,
  }),
})
```
