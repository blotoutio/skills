# EdgeTag npm SDK - Patterns & Best Practices

Proven patterns for implementing EdgeTag with npm, React, and modern JavaScript frameworks.

---

## Channel Discovery (REQUIRED before writing code)

**This is the most commonly missed step.** Without browser provider packages, channels that use browser pixels (Meta, Google Ads, TikTok, etc.) will silently fail — the implementation is incomplete.

### Step 1: Identify the Domain

Ask the user which domain they are implementing EdgeTag for (e.g., `mysite.com`). If they have already mentioned it, use that.

### Step 2: Discover Configured Channels via MCP

**If EdgeTag MCP is available** (tools like `domains`, `channel`, etc. are accessible):

1. Call the `domains` MCP tool to list all domains and their channels
2. Find the domain being implemented
3. For each channel, check its `providerId` against the browser package mapping table below
4. Automatically install all required npm provider packages
5. Add all provider imports to the `init()` call

**If EdgeTag MCP is NOT available:**

1. Suggest the user set up EdgeTag MCP for the best experience. See [mcp/setup.md](../mcp/setup.md) for setup instructions.
2. Ask the user which channels are configured on their domain (e.g., "Which advertising/analytics channels do you have enabled in EdgeTag? For example: Meta/Facebook, Google Ads, TikTok, Pinterest, Snapchat, GA4?")
3. Install the corresponding npm provider packages based on their answer

### Step 3: Ask About Additional Channels

After installing packages for existing channels, ask the user if they plan to add any additional channels that need browser pixels. Show them the available options:

| Channel            | SDK Name           | NPM Package                                   |
| ------------------ | ------------------ | --------------------------------------------- |
| Meta/Facebook      | `facebook`         | `@blotoutio/providers-facebook-sdk`           |
| Google Ads         | `googleAdsClicks`  | `@blotoutio/providers-google-ads-clicks-sdk`  |
| TikTok             | `tiktok`           | `@blotoutio/providers-tiktok-sdk`             |
| Pinterest          | `pinterest`        | `@blotoutio/providers-pinterest-sdk`          |
| Snapchat           | `snapchat`         | `@blotoutio/providers-snapchat-sdk`           |
| Google Analytics 4 | `googleAnalytics4` | `@blotoutio/providers-google-analytics-4-sdk` |

Channels like Klaviyo, LinkedIn, Reddit, Bing, Event Sink, and Webhook are **server-side only** and do NOT need npm packages.

### Step 4: Verify Completeness

Before declaring the implementation complete, verify:

- Every channel with a browser pixel has its npm package installed
- Every provider is imported and passed to `init({ providers: [...] })`
- Consent arrays include all channel names

**An implementation without the correct browser provider packages is INCOMPLETE. Never skip this step.**

---

## Pattern 1: npm/Headless with Providers

The standard pattern for modern SPAs using npm and module bundlers.

### Installation

```bash
npm install @blotoutio/edgetag-sdk-js
npm install @blotoutio/providers-facebook-sdk
```

### Basic Implementation

```javascript
// src/edgetag.js
import { init, tag, user, data, consent } from '@blotoutio/edgetag-sdk-js'
import facebook from '@blotoutio/providers-facebook-sdk'

export function initializeEdgeTag() {
  init({
    edgeURL: 'https://d.mysite.com',
    providers: [facebook],
  })
}

export { tag, user, data, consent }
```

### Usage

```javascript
// src/main.js
import { initializeEdgeTag, tag, user } from './edgetag.js'

initializeEdgeTag()
tag('PageView')
user('email', 'user@example.com')
```

### Advantages

- Full control over initialization
- Clean module exports
- Tree-shakeable (remove unused functions)
- TypeScript support
- Easier testing

### Disadvantages

- More setup code

---

## Pattern 2: React Integration

See [platforms/patterns.md § React Hook Pattern](../platforms/patterns.md).

---

## Pattern 3: Consent Management Integration

See [consent/patterns.md](../consent/patterns.md). Use the named import syntax (`import { consent } from '@blotoutio/edgetag-sdk-js'`) with the patterns shown there.

---

## Pattern 4: Progressive Identity Capture

See [identity/patterns.md § Progressive Identity Capture](../identity/patterns.md).

---

## Pattern 5: Beacon Method for Unload Events

See [events/patterns.md § Beacon for Pre-Navigation Events](../events/patterns.md).

---

## Pattern 6: Sync Mode for Critical Events

See [events/patterns.md § Sync vs Async Event Execution](../events/patterns.md).

---

## Pattern 7: Offline Events with Pre-set User ID

Queue events while offline, sync when back online.

### Browser-Based Offline Sync

```javascript
// src/services/offline-sync.js
import { init, tag } from '@blotoutio/edgetag-sdk-js'

class OfflineEventQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem('edgetag-queue') || '[]')
    this.listening = false
  }

  addEvent(eventName, eventData) {
    this.queue.push({ eventName, eventData, timestamp: Date.now() })
    this.saveQueue()
  }

  saveQueue() {
    localStorage.setItem('edgetag-queue', JSON.stringify(this.queue))
  }

  async syncQueue() {
    if (!navigator.onLine || this.queue.length === 0) return

    init({
      edgeURL: 'https://d.mysite.com',
      disableConsentCheck: true,
    })

    for (const event of this.queue) {
      tag(event.eventName, event.eventData)
    }

    this.queue = []
    this.saveQueue()
  }

  startListening() {
    if (this.listening) return
    window.addEventListener('online', () => this.syncQueue())
    if (navigator.onLine) this.syncQueue()
    this.listening = true
  }
}

export const offlineQueue = new OfflineEventQueue()
```

### Server-Side Event Tracking (HTTP API)

For Node.js/Express backends, use the HTTP API instead of the browser SDK:

```javascript
// server/services/tracking.js
import axios from 'axios'

export async function trackServerEvent(userId, eventName, eventData, edgeURL) {
  await axios.post(`${edgeURL}/tag`, {
    userId,
    event: eventName,
    data: eventData,
    timestamp: Date.now(),
  })
}

// Usage in route handlers
app.post('/api/checkout', async (req, res) => {
  const order = await processOrder(req.body)
  await trackServerEvent(
    res.locals.userId,
    'Purchase',
    {
      orderId: order.id,
      value: order.total,
      items: order.items,
    },
    process.env.EDGE_URL,
  )
  res.json({ success: true, orderId: order.id })
})
```

---

## Pattern 8: Server-Side First-Party Cookie Creation

On headless sites, create an additional server-side cookie (e.g., `truid`) on your backend for full browser coverage. This does not replace the EdgeTag user ID. Share the cookie name with EdgeTag support.

See [platforms/patterns.md § Pattern 3: Server-Side Cookie Creation Code](../platforms/patterns.md) for full implementation examples.

---

## Quick Reference: Pattern Selection

| Scenario             | Pattern                     | Complexity |
| -------------------- | --------------------------- | ---------- |
| Modern SPA setup     | Pattern 1 (npm + Providers) | Low        |
| React app            | Pattern 2 (React)           | Medium     |
| CMP integration      | Pattern 3 (Consent)         | Medium     |
| Progressive capture  | Pattern 4 (Identity)        | Medium     |
| Unload/exit tracking | Pattern 5 (Beacon)          | Low        |
| Purchase/redirect    | Pattern 6 (Sync)            | Low        |
| Offline support      | Pattern 7 (Offline)         | High       |
| Server-side cookies  | Pattern 8 (Cookie)          | High       |

---

## Best Practices

1. **Load EdgeTag directly via npm** — never via GTM or tag managers
2. **Use named imports** — `import { init } from '...'`, not default import
3. **Install provider packages** — browser pixels don't load without them
4. **Initialize once** at app startup, not on every route change
5. **Use `setConfig()` for page URL updates** on SPA route changes
6. **Format user data correctly** — email lowercase, phone E.164, etc.
7. **Wire your CMP early** — consent must be granted before events fire
8. **Use beacon for unload** — standard fetch may not complete on page close
9. **Use sync only for debugging** — verifies channel delivery but is significantly slower; do not use on pages that navigate away
10. **Wrap in error boundary** — EdgeTag errors shouldn't crash your app
