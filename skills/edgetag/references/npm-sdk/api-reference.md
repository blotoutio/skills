# EdgeTag npm SDK - API Reference

All functions are named exports from `@blotoutio/edgetag-sdk-js`. There is **no default export** and **no `edgeTag` export** — the event tracking function is called `tag`.

## Function Overview

| Function       | Purpose                                     | Context                             |
| -------------- | ------------------------------------------- | ----------------------------------- |
| `init()`       | Initialize EdgeTag with configuration       | Required — call once at app startup |
| `tag()`        | Track events and user behavior              | Core tracking function              |
| `user()`       | Set single standard user attribute          | Identity management                 |
| `data()`       | Set multiple/custom user attributes         | Identity management                 |
| `consent()`    | Grant user consent for providers/categories | Privacy compliance                  |
| `getConsent()` | Retrieve current consent status             | Check consent state                 |
| `getData()`    | Retrieve multiple user attributes           | Data retrieval                      |
| `getUserId()`  | Get the current user ID                     | Session management                  |
| `setConfig()`  | Update runtime configuration                | Page/session settings               |
| `ready()`      | Execute callback when SDK is ready          | Lifecycle management                |

---

## init()

Initialize EdgeTag with required and optional configuration.

### Signature

```typescript
import { init } from '@blotoutio/edgetag-sdk-js';

init(config: InitConfig): void
```

### InitConfig Object

| Parameter             | Type       | Required | Default        | Description                                                                                                                                                          |
| --------------------- | ---------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edgeURL`             | String     | Yes      | —              | The EdgeTag CNAME endpoint (e.g., `https://d.mysite.com`)                                                                                                            |
| `disableConsentCheck` | Boolean    | —        | `false`        | If `true`, events are sent immediately without waiting for consent                                                                                                   |
| `userId`              | String     | —        | auto-generated | Pre-set user ID. Only needed in cookieless environments where EdgeTag cannot use cookies. EdgeTag generates this automatically on all standard browser environments. |
| `providers`           | Provider[] | —        | `[]`           | Array of provider instances for browser pixels                                                                                                                       |

### Examples

```javascript
import { init } from '@blotoutio/edgetag-sdk-js'

// Basic initialization
init({
  edgeURL: 'https://d.mysite.com',
})
```

```javascript
import { init } from '@blotoutio/edgetag-sdk-js'
import facebook from '@blotoutio/providers-facebook-sdk'
import googleAds from '@blotoutio/providers-google-ads-clicks-sdk'
import tiktok from '@blotoutio/providers-tiktok-sdk'

// With providers (required for browser pixels)
init({
  edgeURL: 'https://d.mysite.com',
  providers: [facebook, googleAds, tiktok],
})
```

```javascript
// With pre-set user ID (cookieless environments only)
// EdgeTag generates userId automatically in all browser environments.
// Only pass this in environments where cookies are not available.
init({
  edgeURL: 'https://d.mysite.com',
  userId: 'user-123-abc',
})
```

```javascript
// With consent disabled (not recommended for GDPR/CCPA sites)
init({
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true,
})
```

### Notes

- Must be called once per app lifecycle. Calling multiple times resets state.
- `edgeURL` should be your CNAME endpoint, not the EdgeTag default domain.
- Events are queued before `init()` is called and processed afterward.
- By default, events are blocked until consent is granted (unless `disableConsentCheck: true`).

---

## tag()

Track user events and interactions.

### Signature

```typescript
import { tag } from '@blotoutio/edgetag-sdk-js';

tag(name: string, data?: object, providers?: Record<string, boolean>, options?: TagOptions): void
```

### Parameters

| Parameter   | Type                    | Required | Description                                                  |
| ----------- | ----------------------- | -------- | ------------------------------------------------------------ |
| `name`      | String                  | Yes      | Event name (e.g., `'PageView'`, `'Purchase'`, `'AddToCart'`) |
| `data`      | Object                  | —        | Event payload with custom or standard event data             |
| `providers` | Record<string, boolean> | —        | Provider names with boolean values                           |
| `options`   | TagOptions              | —        | Advanced options for this event                              |

### TagOptions

| Option        | Type       | Default   | Description                                                                                                                    |
| ------------- | ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `method`      | `'beacon'` | `'fetch'` | Use `'beacon'` for unload/navigation events                                                                                    |
| `sync`        | Boolean    | `false`   | If `true`, server waits for all channel responses before returning (useful for debugging channel errors; significantly slower) |
| `destination` | String     | —         | Override default endpoint for this event                                                                                       |

### Common Event Names

See **events/README.md** for the complete list of standard event names.

### Examples

```javascript
import { tag } from '@blotoutio/edgetag-sdk-js'

// Basic page view
tag('PageView')

// With event data
tag('Purchase', {
  orderId: 'order-456',
  value: 150.0,
  currency: 'USD',
})

// Send custom event to a specific channel
tag(
  'NewsletterSignup',
  {
    category: 'footer-form',
  },
  { klaviyo: true },
)

// Beacon for unload events
tag(
  'SessionEnd',
  {
    sessionDuration: Date.now() - sessionStart,
  },
  {},
  { method: 'beacon' },
)

// Sync mode to debug channel errors (server collects all channel responses before returning)
tag(
  'Purchase',
  {
    orderId: order.id,
    value: order.total,
  },
  null,
  { sync: true },
)

// Custom event
tag('VideoPlay', {
  videoId: 'video-123',
  duration: 120,
})
```

---

## user()

Set a single standard user attribute (identity field).

### Signature

```typescript
import { user } from '@blotoutio/edgetag-sdk-js';

user(key: string, value: string, providers?: Record<string, boolean>, options?: UserOptions): void
```

### UserOptions

| Option        | Type       | Description                                             |
| ------------- | ---------- | ------------------------------------------------------- |
| `method`      | `'beacon'` | Use Beacon API instead of fetch (for unload/navigation) |
| `destination` | String     | Target a specific EdgeTag instance when multiple exist  |

### Standard User Keys

See **identity/api-reference.md § Standard Keys Reference** for the complete keys table with format requirements.

### Examples

```javascript
import { user } from '@blotoutio/edgetag-sdk-js'

user('email', 'user@example.com')
user('firstName', 'john')
user('lastName', 'doe')
user('phone', '+14155552671')
```

---

## data()

Set multiple user attributes (standard or custom) in a single call.

### Signature

```typescript
import { data } from '@blotoutio/edgetag-sdk-js';

data(attributes: Record<string, string>, providers?: Record<string, boolean>, options?: DataOptions): void
```

### DataOptions

| Option        | Type       | Description                                             |
| ------------- | ---------- | ------------------------------------------------------- |
| `method`      | `'beacon'` | Use Beacon API instead of fetch (for unload/navigation) |
| `destination` | String     | Target a specific EdgeTag instance when multiple exist  |

Standard attribute keys and their format requirements are the same as the [Standard User Keys](#standard-user-keys) listed in the `user()` function above. Any keys not in that table are treated as custom attributes.

### Examples

```javascript
import { data } from '@blotoutio/edgetag-sdk-js'

// Multiple standard attributes
data({
  email: 'user@example.com',
  phone: '+14155552671',
  firstName: 'john',
  lastName: 'doe',
  dateOfBirth: '19900115',
  country: 'us',
})

// Standard + custom attributes
data({
  email: 'user@example.com',
  customerId: 'cust-123',
  accountTier: 'premium',
})
```

---

## consent()

Grant user consent for specific providers and/or consent categories.

### Signature

```typescript
import { consent } from '@blotoutio/edgetag-sdk-js';

consent(providersObject?: object | null, categoriesObject?: object, options?: ConsentOptions): void
```

### ConsentOptions

| Option        | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| `destination` | String | Target a specific EdgeTag instance when multiple exist |

At least one of `providersObject` or `categoriesObject` must be provided.

### Consent Categories & Provider Names

See **consent/api-reference.md § Categories Reference** for available categories and **§ Providers Reference** for common provider names.

### Examples

```javascript
import { consent } from '@blotoutio/edgetag-sdk-js'

// All providers
consent({ all: true })

// Specific providers
consent({ facebook: true, googleAdsClicks: true, tiktok: true })

// Categories only (pass null as first argument)
consent(null, { advertising: true, analytics: true })

// Both
consent(
  { facebook: true, googleAdsClicks: true },
  { advertising: true, analytics: true },
)

// Allow all
consent(
  { facebook: true, googleAdsClicks: true, tiktok: true, linkedin: true },
  {
    necessary: true,
    advertising: true,
    analytics: true,
    functional: true,
    share_pii: true,
  },
)
```

### Notes

- Events are only sent to channels that have consent at the time they fire. If no consent has been granted, events reach zero channels. Always call `consent()` before `tag()` (unless `disableConsentCheck: true` in init).
- Consent can be updated multiple times as user preferences change.
- The `'necessary'` category is always granted.

---

## getConsent()

Retrieve the current consent status.

### Signature

```typescript
import { getConsent } from '@blotoutio/edgetag-sdk-js';

getConsent(callback: (consent: object | null, error?: string, consentCategories?: object) => void, options?: GetConsentOptions): void
```

### GetConsentOptions

| Option        | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| `destination` | String | Target a specific EdgeTag instance when multiple exist |

### Examples

```javascript
import { getConsent } from '@blotoutio/edgetag-sdk-js'

getConsent((consent, error, consentCategories) => {
  if (error) {
    console.error('Failed to get consent:', error)
    return
  }
  console.log('Provider consent:', consent)
  console.log('Category consent:', consentCategories)
})
```

---

## getData()

Retrieve multiple user attributes in a single call.

### Signature

```typescript
import { getData } from '@blotoutio/edgetag-sdk-js';

getData(keys: string[], callback: (data: Record<string, string | null>) => void, options?: GetDataOptions): void
```

### GetDataOptions

| Option        | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| `destination` | String | Target a specific EdgeTag instance when multiple exist |

### Notes

- Standard keys (email, phone, etc.) return boolean existence checks (e.g., `emailExists: true`), not the actual values
- Custom keys return their actual stored values

### Examples

```javascript
import { getData } from '@blotoutio/edgetag-sdk-js'

getData(['email', 'firstName', 'phone'], (data) => {
  console.log('User data:', data)
  // { email: 'user@example.com', firstName: 'john', phone: '+14155552671' }
})
```

---

## getUserId()

Get the current EdgeTag user ID (the value stored in the `tag_user_id` first-party cookie).

### Signature

```typescript
import { getUserId } from '@blotoutio/edgetag-sdk-js';

getUserId(): string | null
```

### Examples

```javascript
import { getUserId } from '@blotoutio/edgetag-sdk-js'

const userId = getUserId()
console.log('Current user ID:', userId)
```

### Notes

- Returns the value of the `tag_user_id` first-party cookie.
- `null` if no user has been identified yet.
- This is NOT the same as the URL parameter `et_uid` (which is for cross-domain linking only).

---

## setConfig()

Update runtime configuration for the page or session.

### Signature

```typescript
import { setConfig } from '@blotoutio/edgetag-sdk-js';

setConfig(settings: ConfigSettings): void
```

### Settings Object

| Parameter     | Type   | Description                                             |
| ------------- | ------ | ------------------------------------------------------- |
| `pageUrl`     | String | Override the page URL (useful for SPAs on route change) |
| `destination` | String | Override the default endpoint for all subsequent events |

### Examples

```javascript
import { setConfig, tag } from '@blotoutio/edgetag-sdk-js'

// On SPA route change
setConfig({ pageUrl: window.location.href })
tag('PageView')
```

---

## ready()

Execute a callback when the EdgeTag SDK is fully initialized. Unlike DOM events, this callback fires even if registered after initialization has already completed, guaranteeing it will always execute.

### Signature

```typescript
import { ready } from '@blotoutio/edgetag-sdk-js';

ready(callback: (state: ReadyState) => void): void
```

### ReadyState Response

```typescript
interface ReadyState {
  destination: string // EdgeTag endpoint
  userId: string | null // Current user ID
  sessionId: string // Session identifier
  isNewUser: boolean // True if first visit
  isNewSession: boolean // True if new session
  consent: Record<string, boolean> // Provider consent
  consentCategories: Record<string, boolean> // Category consent
  consentSettings: object // Raw consent settings
}
```

### Examples

```javascript
import { ready } from '@blotoutio/edgetag-sdk-js'

ready((state) => {
  console.log('EdgeTag ready')
  console.log('User ID:', state.userId)
  console.log('Is new user:', state.isNewUser)
})
```

---

## Return Values Summary

| Function       | Sync/Async       | Returns                   |
| -------------- | ---------------- | ------------------------- |
| `init()`       | Sync             | void                      |
| `tag()`        | Async (queued)   | void                      |
| `user()`       | Sync             | void                      |
| `data()`       | Sync             | void                      |
| `consent()`    | Sync             | void                      |
| `getConsent()` | Async (callback) | void (result in callback) |
| `getData()`    | Async (callback) | void (result in callback) |
| `getUserId()`  | Sync             | string \| null            |
| `setConfig()`  | Sync             | void                      |
| `ready()`      | Async (callback) | void (result in callback) |

---

## TypeScript Definitions

```typescript
export function init(config: InitConfig): void
export function tag(
  name: string,
  data?: object,
  providers?: Record<string, boolean>,
  options?: TagOptions,
): void
export function user(
  key: string,
  value: string,
  providers?: Record<string, boolean>,
  options?: UserOptions,
): void
export function data(
  attributes: Record<string, string>,
  providers?: Record<string, boolean>,
  options?: DataOptions,
): void
export function consent(
  providersObject?: object,
  categoriesObject?: object,
  options?: ConsentOptions,
): void
export function getConsent(
  callback: (
    consent: object | null,
    error?: string,
    consentCategories?: object,
  ) => void,
  options?: GetConsentOptions,
): void
export function getData(
  keys: string[],
  callback: (data: Record<string, string | null>) => void,
  options?: GetDataOptions,
): void
export function getUserId(): string | null
export function setConfig(settings: ConfigSettings): void
export function ready(callback: (state: ReadyState) => void): void

interface InitConfig {
  edgeURL: string
  disableConsentCheck?: boolean
  userId?: string // Only for cookieless environments; auto-generated in browsers
  providers?: Provider[]
}

interface TagOptions {
  method?: 'beacon' | 'fetch'
  sync?: boolean
  destination?: string
}

interface ReadyState {
  destination: string
  userId: string | null
  sessionId: string
  isNewUser: boolean
  isNewSession: boolean
  consent: Record<string, boolean>
  consentCategories: Record<string, boolean>
  consentSettings: object
}

interface UserOptions {
  method?: 'beacon'
  destination?: string
}

interface DataOptions {
  method?: 'beacon'
  destination?: string
}

interface ConsentOptions {
  destination?: string
}

interface GetConsentOptions {
  destination?: string
}

interface GetDataOptions {
  destination?: string
}

interface ConfigSettings {
  pageUrl?: string
  destination?: string
}
```
