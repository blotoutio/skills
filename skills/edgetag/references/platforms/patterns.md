# Platform Integration Patterns

Real-world setup patterns for common platform scenarios.

---

## Pattern 1: Shopify Full Setup Flow

### Scenario

You're launching a new Shopify store with EdgeTag and want full tracking + CRM integration.

### Architecture

```
Storefront (Shopify)
    ↓
EdgeTag App (App Pixel + App Embed)
```

### Step-by-Step

**1. Install the App**

1. Visit [https://apps.shopify.com/edgetag](https://apps.shopify.com/edgetag)
2. Click "Install"
3. Accept any charges (ensure you have authorization)
4. Enter your preferred email address

**2. Create Account & Connect Store**

1. Click Register/Login (click on magic link send via email)
2. System automatically creates an account and connects to your Shopify store

**3. Configure Domain & DNS**

1. System auto-retrieves your store domain (enter manually if store isn't live yet)
2. EdgeTag generates a dedicated first-party subdomain
3. Add the two DNS records provided:

- **TXT record** — domain ownership verification
- **CNAME record** — traffic routing to EdgeTag infrastructure

4. If you lack DNS access, click "Email instructions" to share with IT/DevOps

**4. Enable App Embed**

1. Click "Theme customization" to open the Shopify theme editor
2. Locate the "Blotout EdgeTag" app embed
3. Toggle it ON
4. Save changes (top right)
5. Close the tab and click "Finish"
6. App Pixel already captures conversion events by default; App Embed adds PageView, Lead, and upper-funnel PII

**5. Add Channels**

```
Dashboard → Channels

Enable:
  ✓ Facebook (Meta Conversions API)
    - Enter Pixel ID
    - Enter Conversions API Token
    - Select "Browser + Server" delivery

  ✓ Klaviyo (email platform)
    - Enter Klaviyo API Key
```

**6. Test Everything**

1. Visit your storefront
2. Open browser Dev Tools → Network tab
3. Add product to cart
4. Watch for `tag?` and `data`requests
5. Complete test purchase
6. Check Meta Events Manager → "Test event" appears
7. Check Google Ads → Conversion recorded

**7. Go Live**

1. Review all settings one more time
2. Run through customer journey on live site
3. Verify data in all platforms

### Monitoring (Week 1)

- Check EdgeTag dashboard daily
- Monitor Meta Events Manager for event volume
- Monitor Google Ads for conversion data
- Monitor error rates (should be near 0%)

### Troubleshooting

**No PageView/Lead events**

- Check App Embed is enabled in Shopify theme
- Verify the "Blotout EdgeTag" toggle is ON and theme was saved

**No conversion events**

- Verify App Pixel is active (enabled by default on app install)
- Check channel credentials are correct

**DNS not verified**

- Confirm TXT and CNAME records are added in your DNS provider
- Allow up to 24 hours for DNS propagation

**Conversions not tracked in ad platforms**

- Check conversion action exists in Google Ads
- Verify Meta Conversions API token is valid
- Confirm Payload Validator is disabled

### Timeline

- App install + account setup: 2 min
- DNS setup: 5 min
- App Embed: 1 min
- Channel setup: 5 min
- Testing: 5 min
- **Total: ~20 minutes**

---

## Pattern 2: React Hook Pattern

### Scenario

You have a React app and want a reusable hook for EdgeTag tracking.

**Implementation**:

```javascript
// hooks/useEdgeTag.ts
import { useEffect, useCallback, useRef } from 'react'
import { init, tag, user, data, consent } from '@blotoutio/edgetag-sdk-js'
import facebook from '@blotoutio/providers-facebook-sdk'
import googleAds from '@blotoutio/providers-google-ads-clicks-sdk'

type EventPayload = {
  [key: string]: any
}

type TrackEventParams = {
  eventName: string
  payload?: EventPayload
  providers?: any[]
  options?: any
}

export function useEdgeTag() {
  const initRef = useRef(false)

  // Initialize once on mount
  useEffect(() => {
    if (initRef.current) return

    try {
      init({
        edgeURL: 'https://d.mysite.com',
        providers: [facebook, googleAds]
      })
      initRef.current = true
    } catch (err) {
      console.error('EdgeTag init failed:', err)
    }
  }, [])

  // Track event
  const track = useCallback(
    ({ eventName, payload, providers, options }: TrackEventParams) => {
      try {
        tag(eventName, payload, providers, options)
      } catch (err) {
        console.error(`Failed to track ${eventName}:`, err)
      }
    },
    []
  )

  // Set user PII (email, phone, name, etc.)
  const setUser = useCallback(
    (userData: Record<string, string>) => {
      try {
        user(userData)
      } catch (err) {
        console.error('Failed to set user data:', err)
      }
    },
    []
  )

  // Set custom key-value data
  const setData = useCallback(
    (customData: Record<string, string>) => {
      try {
        data(customData)
      } catch (err) {
        console.error('Failed to set custom data:', err)
      }
    },
    []
  )

  // Set consent (per-provider or per-category)
  const setConsent = useCallback(
    (consentData: Record<string, boolean>) => {
      try {
        consent(consentData)
      } catch (err) {
        console.error('Failed to set consent:', err)
      }
    },
    []
  )

  return { track, setUser, setData, setConsent }
}
```

**Usage in Components**:

```javascript
// components/ProductPage.tsx
import { useEdgeTag } from '@/hooks/useEdgeTag'

interface Product {
  id: string
  name: string
  price: number
}

export function ProductPage({ product }: { product: Product }) {
  const { track, setUser, setConsent } = useEdgeTag()

  useEffect(() => {
    track({
      eventName: 'ViewContent',
      payload: {
        productId: product.id,
        productName: product.name,
        price: product.price
      }
    })
  }, [product.id, track])

  const handleAddToCart = () => {
    track({
      eventName: 'AddToCart',
      payload: {
        productId: product.id,
        productName: product.name,
        value: product.price,
        currency: 'USD'
      }
    })

    // Add to cart logic...
  }

  const handleLogin = (email: string, phone: string) => {
    // Capture PII for identity stitching
    setUser({ email, phone })
  }

  const handleConsentAccept = () => {
    // Set consent for all providers
    setConsent({ all: true })
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
```

**Benefits**:

- Reusable across all components
- Type-safe (TypeScript)
- Exposes `track`, `setUser`, `setData`, and `setConsent`
- Consistent error handling
- Single initialization

---

## Pattern 3: Server-Side Cookie Creation Code

### Scenario

You're running a custom/headless site. We recommend creating an additional server-side cookie (e.g., `truid`) on your backend for full browser coverage. This does not replace the EdgeTag user ID — it is an additional persistence optimization.

The cookie must be set as a response header in the document response.

**Implementation**:

_Node.js/Express_:

```javascript
// middleware/edgetag.js
const crypto = require('crypto')

const COOKIE_NAME = 'truid'
const COOKIE_DOMAIN = '.mysite.com'
const COOKIE_EXPIRY = new Date(2037, 11, 20).toUTCString()

function edgetagUserMiddleware(req, res, next) {
  // Check for existing user ID cookie
  const existingUserId = req.cookies?.[COOKIE_NAME]

  if (existingUserId) {
    // User already has a tracking ID
    res.locals.edgetagUserId = existingUserId
  } else {
    // Create new user ID (UUID + timestamp)
    const newUserId = `${crypto.randomUUID()}-${Date.now()}`

    // Set persistent cookie in document response headers
    res.setHeader('Set-Cookie', [
      `${COOKIE_NAME}=${newUserId}; SameSite=Lax; Expires=${COOKIE_EXPIRY}; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure`,
    ])

    res.locals.edgetagUserId = newUserId
  }

  next()
}

module.exports = edgetagUserMiddleware
```

_Use in Express app_:

```javascript
const express = require('express')
const cookieParser = require('cookie-parser')
const edgetagUserMiddleware = require('./middleware/edgetag')

const app = express()

app.use(cookieParser())
app.use(edgetagUserMiddleware) // Sets truid cookie in response headers
```

_Alternative: Next.js middleware_:

```javascript
// middleware.js
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const COOKIE_NAME = 'truid'
const COOKIE_DOMAIN = '.mysite.com'
const COOKIE_EXPIRY = new Date(2037, 11, 20).toUTCString()

export function middleware(request) {
  const response = NextResponse.next()
  const existing = request.cookies.get(COOKIE_NAME)

  if (!existing) {
    const newId = `${uuidv4()}-${Date.now()}`
    response.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${newId}; SameSite=Lax; Expires=${COOKIE_EXPIRY}; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure`,
    )
  }

  return response
}
```

The frontend SDK initializes normally — the `truid` cookie is not passed to `init()`. EdgeTag reads the `truid` cookie server-side after support configures it.

```javascript
// Frontend: initialize EdgeTag as usual
import { init, consent } from '@blotoutio/edgetag-sdk-js'
import facebook from '@blotoutio/providers-facebook-sdk'

init({
  edgeURL: 'https://d.mysite.com',
  providers: [facebook],
})

consent({ all: true })
```

**Link to EdgeTag**: Contact EdgeTag support ([support@edgetag.io](mailto:support@edgetag.io)) with your domain name and the cookie name (e.g., `truid`). Support will configure EdgeTag to read this cookie for additional persistence.

**Important**: The `truid` cookie is **not** the EdgeTag user ID. It is an additional persistence optimization for full browser coverage.

**Cookie Requirements**:

- Must be set in document response headers
- Value format: `UUID-timestamp` (e.g., `a1b2c3d4-...-1234567890`)
- Only create if cookie doesn't already exist
- `SameSite=Lax`: protects against CSRF
- `HttpOnly; Secure`: only accessible server-side, only sent over HTTPS
- `Domain`: set to your root domain (e.g., `.mysite.com`) for cross-subdomain tracking

**Verification**:

```javascript
// Dev Tools → Application → Cookies
// Should see: truid = [UUID-timestamp]
// Same value on reload = working correctly
```
