# EdgeTag Browser SDK - API Reference

All functions use the global `edgetag()` command pattern: `edgetag('command', ...args)`.

## Function Overview

| Function     | Purpose                                     | Context                           |
| ------------ | ------------------------------------------- | --------------------------------- |
| `init`       | Initialize EdgeTag with configuration       | Required — call once at page load |
| `tag`        | Track events and user behavior              | Core tracking function            |
| `user`       | Set single standard user attribute          | Identity management               |
| `data`       | Set multiple/custom user attributes         | Identity management               |
| `consent`    | Grant user consent for providers/categories | Privacy compliance                |
| `getConsent` | Retrieve current consent status             | Check consent state               |
| `getData`    | Retrieve multiple user attributes           | Data retrieval                    |
| `keys`       | Retrieve all stored user attribute keys     | Data retrieval                    |
| `getUserId`  | Get the current user ID                     | Session management                |
| `isNewUser`  | Check if the current user is new            | Session management                |
| `setConfig`  | Update runtime configuration                | Page/session settings             |
| `ready`      | Execute callback when SDK is ready          | Lifecycle management              |

---

## init

Initialize EdgeTag with required and optional configuration.

### Signature

```javascript
edgetag('init', config)
```

### Config Object

| Parameter             | Type    | Required | Default        | Description                                                                                                                                                          |
| --------------------- | ------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edgeURL`             | String  | Yes      | —              | The EdgeTag CNAME endpoint (e.g., `https://d.mysite.com`)                                                                                                            |
| `disableConsentCheck` | Boolean | —        | `false`        | If `true`, events are sent immediately without waiting for consent                                                                                                   |
| `userId`              | String  | —        | auto-generated | Pre-set user ID. Only needed in cookieless environments where EdgeTag cannot use cookies. EdgeTag generates this automatically in all standard browser environments. |

### Examples

```javascript
// Basic initialization
window.edgetag =
  window.edgetag ||
  function () {
    ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
  }

edgetag('init', {
  edgeURL: 'https://d.mysite.com',
})
```

```javascript
// With consent disabled (not recommended for GDPR/CCPA sites)
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true,
})
```

```javascript
// With pre-set user ID (cookieless environments only)
// EdgeTag generates userId automatically in all browser environments.
// Only pass this in environments where cookies are not available.
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  userId: 'user-123-abc',
})
```

### Notes

- Must be called once per page load. Calling multiple times resets state.
- `edgeURL` should be your CNAME endpoint, not the EdgeTag default domain.
- Events are queued before `init()` is called and processed afterward.
- By default, events are blocked until consent is granted (unless `disableConsentCheck: true`).

---

## tag

Track user events and interactions.

### Signature

```javascript
edgetag('tag', name, data?, providers?, options?)
```

### Parameters

| Parameter   | Type                    | Required | Description                                                     |
| ----------- | ----------------------- | -------- | --------------------------------------------------------------- |
| `name`      | String                  | Yes      | Event name (e.g., `'PageView'`, `'Purchase'`, `'AddToCart'`)    |
| `data`      | Object                  | —        | Event payload with custom or standard event data                |
| `providers` | Record<string, boolean> | —        | Provider names with boolean values (e.g., `{ facebook: true }`) |
| `options`   | TagOptions              | —        | Advanced options for this event                                 |

### TagOptions

| Option        | Type       | Default   | Description                                                                                                                    |
| ------------- | ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `method`      | `'beacon'` | `'fetch'` | `'fetch'`                                                                                                                      |
| `sync`        | Boolean    | `false`   | If `true`, server waits for all channel responses before returning (useful for debugging channel errors; significantly slower) |
| `destination` | String     | —         | Override default endpoint for this event                                                                                       |

### Common Event Names

See **events/README.md** for the complete list of standard event names.

### Examples

```javascript
// Basic page view
edgetag('tag', 'PageView')

// With event data
edgetag('tag', 'Purchase', {
  orderId: 'order-456',
  value: 150.0,
  currency: 'USD',
})

// Send custom event to a specific channel
edgetag(
  'tag',
  'NewsletterSignup',
  {
    category: 'footer-form',
  },
  { klaviyo: true },
)

// Using beacon for unload events
window.addEventListener('beforeunload', () => {
  edgetag('tag', 'SessionEnd', {}, null, { method: 'beacon' })
})

// Sync mode to debug channel errors (server collects all channel responses before returning)
edgetag(
  'tag',
  'Purchase',
  {
    value: order.total,
  },
  null,
  { sync: true },
)

// Custom event
edgetag('tag', 'VideoPlay', {
  videoId: 'video-123',
  duration: 120,
  autoplay: false,
})
```

---

## user

Set a single standard user attribute (identity field).

### Signature

```javascript
edgetag('user', key, value, providers?, options?)
```

### Parameters

| Parameter   | Type                    | Required | Description                                    |
| ----------- | ----------------------- | -------- | ---------------------------------------------- |
| `key`       | String                  | Yes      | Standard user key (see table below)            |
| `value`     | String                  | Yes      | Value for the key                              |
| `providers` | Record<string, boolean> | —        | Control PII distribution to specific providers |
| `options`   | UserOptions             | —        | Advanced options (`method`, `destination`)     |

### Standard User Keys

See **identity/api-reference.md § Standard Keys Reference** for the complete keys table with format requirements.

### Examples

```javascript
// Single attribute
edgetag('user', 'email', 'user@example.com')

// Multiple calls
edgetag('user', 'firstName', 'john')
edgetag('user', 'lastName', 'doe')
edgetag('user', 'email', 'john@example.com')
edgetag('user', 'phone', '+14155552671')

// Format requirements
edgetag('user', 'firstName', 'john') // CORRECT - lowercase
edgetag('user', 'phone', '+14155552671') // CORRECT - E.164
edgetag('user', 'dateOfBirth', '19900115') // CORRECT - YYYYMMDD
```

---

## data

Set multiple user attributes (standard or custom) in a single call.

### Signature

```javascript
edgetag('data', attributes, providers?, options?)
```

### Parameters

| Parameter    | Type                    | Required | Description                                    |
| ------------ | ----------------------- | -------- | ---------------------------------------------- |
| `attributes` | Object                  | Yes      | Key-value pairs of user attributes             |
| `providers`  | Record<string, boolean> | —        | Control PII distribution to specific providers |
| `options`    | DataOptions             | —        | Advanced options (`method`, `destination`)     |

Standard attribute keys and their format requirements are the same as the [Standard User Keys](#standard-user-keys) listed in the `user` function above. Any keys not in that table are treated as custom attributes.

### Examples

```javascript
// Multiple standard attributes
edgetag('data', {
  email: 'user@example.com',
  phone: '+14155552671',
  firstName: 'john',
  lastName: 'doe',
  dateOfBirth: '19900115',
  country: 'us',
})

// Standard + custom attributes
edgetag('data', {
  email: 'user@example.com',
  customerId: 'cust-123',
  accountTier: 'premium',
  signupDate: '2024-01-15',
})
```

---

## consent

Grant user consent for specific providers and/or consent categories.

### Signature

```javascript
edgetag('consent', providersObject?, categoriesObject?, options?)
```

### Parameters

| Parameter          | Type                              | Required | Description                                                          |
| ------------------ | --------------------------------- | -------- | -------------------------------------------------------------------- |
| `providersObject`  | Record\<string, boolean\> \| null | —        | Provider consent with boolean values (e.g., `{ facebook: true }`)    |
| `categoriesObject` | Record\<string, boolean\>         | —        | Category consent with boolean values (e.g., `{ advertising: true }`) |
| `options`          | ConsentOptions                    | —        | Advanced options (`localSave`, `destination`)                        |

### Consent Categories & Provider Names

See **consent/api-reference.md § Categories Reference** for available categories and **§ Providers Reference** for common provider names.

### Examples

```javascript
// Grant consent for specific providers
edgetag('consent', { facebook: true, googleAdsClicks: true, tiktok: true })

// Grant consent for categories
edgetag('consent', null, { advertising: true, analytics: true })

// Both providers and categories
edgetag(
  'consent',
  { facebook: true, googleAdsClicks: true },
  { advertising: true, analytics: true },
)

// Allow all
edgetag(
  'consent',
  { all: true },
  {
    necessary: true,
    advertising: true,
    analytics: true,
    functional: true,
    share_pii: true,
  },
)

// CMP integration
const cmpConsent = {
  providers: { facebook: true, googleAdsClicks: true },
  categories: { advertising: true, analytics: true },
}
edgetag('consent', cmpConsent.providers, cmpConsent.categories)
```

### Notes

- Events are only sent to channels that have consent at the time they fire. If no consent has been granted, events reach zero channels. Always call `consent()` before `tag()` (unless `disableConsentCheck: true` in init).
- Call after CMP loads and user makes a choice.
- Consent can be updated multiple times as user preferences change.
- The `'necessary'` category is always granted.

---

## getConsent

Retrieve the current consent status for providers and categories.

### Signature

```javascript
edgetag('getConsent', callback, options?)
```

### Callback Parameters

| Parameter           | Type   | Description                                                               |
| ------------------- | ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `consent`           | Object | null                                                                      | Provider consent status (e.g., `{ facebook: true, googleAdsClicks: false }`) |
| `error`             | String | undefined                                                                 | Error message if retrieval failed                                            |
| `consentCategories` | Object | Category consent status (e.g., `{ advertising: true, analytics: false }`) |

### Examples

```javascript
// Check current consent
edgetag('getConsent', (consent, error, consentCategories) => {
  if (error) {
    console.error('Failed to get consent:', error)
    return
  }
  console.log('Provider consent:', consent)
  console.log('Category consent:', consentCategories)
})

// Conditional event tracking
edgetag('getConsent', (consent, error, consentCategories) => {
  if (consentCategories.advertising) {
    edgetag('tag', 'CustomAdEvent', { campaignId: 'camp-123' })
  }
})
```

---

## getData

Retrieve multiple user attributes in a single call.

### Signature

```javascript
edgetag('getData', keys, callback, options?)
```

### Parameters

| Parameter  | Type           | Required | Description                            |
| ---------- | -------------- | -------- | -------------------------------------- |
| `keys`     | String[]       | Yes      | Array of attribute keys to retrieve    |
| `callback` | Function       | Yes      | Callback invoked with attribute values |
| `options`  | GetDataOptions | —        | Advanced options                       |

### Examples

```javascript
edgetag('getData', ['email', 'firstName', 'phone'], (data) => {
  console.log('User data:', data)
  // { email: 'user@example.com', firstName: 'john', phone: '+14155552671' }
})

// Use for event enrichment
edgetag('getData', ['email', 'phone', 'firstName'], (data) => {
  edgetag('tag', 'Purchase', {
    orderId: '12345',
    value: 150,
    ...data,
  })
})
```

---

## keys

Retrieve all stored user attribute keys.

### Signature

```javascript
edgetag('keys', callback, options?)
```

### Parameters

| Parameter  | Type        | Required | Description                                   |
| ---------- | ----------- | -------- | --------------------------------------------- |
| `callback` | Function    | Yes      | Callback invoked with an array of key strings |
| `options`  | KeysOptions | —        | Advanced options (`destination`)              |

### Examples

```javascript
edgetag('keys', (keys) => {
  console.log('Stored attribute keys:', keys)
  // e.g., ['email', 'firstName', 'customerId']
})
```

---

## getUserId

Get the current EdgeTag user ID (the value stored in the `tag_user_id` first-party cookie).

### Signature

```javascript
edgetag('getUserId', options?)
```

### Return Value

- **String** — The current user ID (from `tag_user_id` cookie or settings)
- Empty string if no user ID has been assigned yet

### Examples

```javascript
const userId = edgetag('getUserId')
console.log('Current user ID:', userId)

// Use for debugging
const userId = edgetag('getUserId')
if (!userId) {
  console.warn('No user ID assigned yet')
}
```

### Notes

- Returns the value of the `tag_user_id` first-party cookie or user ID from settings.

---

## isNewUser

Check if the current user is visiting for the first time.

### Signature

```javascript
edgetag('isNewUser', options?)
```

### Return Value

- **boolean** — `true` if first visit, `false` if returning
- **undefined** — if SDK has not initialized yet

### Examples

```javascript
const isNew = edgetag('isNewUser')
if (isNew) {
  console.log('Welcome, new visitor!')
}
```

---

## setConfig

Update runtime configuration for the page or session.

### Signature

```javascript
edgetag('setConfig', settings, options?)
```

### Settings Object

| Parameter | Type   | Description                                              |
| --------- | ------ | -------------------------------------------------------- |
| `pageUrl` | String | Override the page URL for this session (useful for SPAs) |

### Options

| Parameter     | Type   | Description                                             |
| ------------- | ------ | ------------------------------------------------------- |
| `destination` | String | Override the default endpoint for all subsequent events |

### Examples

```javascript
// Update page URL (e.g., on SPA navigation)
edgetag('setConfig', {
  pageUrl: window.location.href,
})
```

---

## ready

Execute a callback when the EdgeTag SDK is fully initialized and ready.

### Signature

```javascript
edgetag('ready', callback)
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
// Basic ready callback
edgetag('ready', (state) => {
  console.log('EdgeTag is ready')
  console.log('User ID:', state.userId)
  console.log('Is new user:', state.isNewUser)
})

// Conditional logic
edgetag('ready', (state) => {
  if (state.isNewUser) {
    showWelcomePopup()
    // EdgeTag skips non-consented channels automatically
    edgetag('tag', 'Welcome', { newUser: true })
  }
})
```

---

## Browser Events

The browser SDK dispatches custom DOM events that you can listen to:

### edgetag-initialized

Fired when the SDK finishes initializing.

```javascript
document.addEventListener('edgetag-initialized', (event) => {
  console.log('EdgeTag initialized')
})
```

### edgetag-consent

Fired when user consent changes.

```javascript
document.addEventListener('edgetag-consent', (event) => {
  console.log('Consent changed', event.detail)
})
```

---

## Return Values Summary

| Function     | Sync/Async       | Returns                               |
| ------------ | ---------------- | ------------------------------------- |
| `init`       | Sync             | void                                  |
| `tag`        | Async (queued)   | void                                  |
| `user`       | Sync             | void                                  |
| `data`       | Sync             | void                                  |
| `consent`    | Sync             | void                                  |
| `getConsent` | Async (callback) | void (result in callback)             |
| `getData`    | Async (callback) | void (result in callback)             |
| `keys`       | Async (callback) | void (result in callback)             |
| `getUserId`  | Sync             | string                                |
| `isNewUser`  | Sync             | boolean \| undefined                  |
| `setConfig`  | Sync             | void                                  |
| `ready`      | Async (callback) | void (result in callback, or Promise) |

---

## TypeScript Definitions

```typescript
type UserKey =
  | 'email'
  | 'phone'
  | 'firstName'
  | 'lastName'
  | 'gender'
  | 'dateOfBirth'
  | 'country'
  | 'state'
  | 'city'
  | 'zip'
  | 'address'

interface EdgeTagAPI {
  (command: 'init', config: InitConfig): void
  (
    command: 'tag',
    name: string,
    data?: Record<string, unknown>,
    providers?: Record<string, boolean>,
    options?: TagOptions,
  ): void
  (
    command: 'user',
    key: UserKey,
    value: string,
    providers?: Record<string, boolean>,
    options?: UserOptions,
  ): void
  (
    command: 'data',
    attributes: Record<string, string>,
    providers?: Record<string, boolean>,
    options?: UserOptions,
  ): void
  (
    command: 'consent',
    consentChannels?: Record<string, boolean> | null,
    consentCategories?: Record<string, boolean>,
    options?: ConsentOptions,
  ): void
  (
    command: 'getConsent',
    callback: GetConsentCallback,
    options?: GetConsentOptions,
  ): void
  (
    command: 'getData',
    keys: string[],
    callback: (data: Record<string, string>) => void,
    options?: GetDataOptions,
  ): void
  (
    command: 'keys',
    callback: (keys: string[]) => void,
    options?: KeysOptions,
  ): void
  (command: 'getUserId', options?: GetUserIdOptions): string
  (command: 'isNewUser', options?: IsNewUserOptions): boolean | undefined
  (
    command: 'setConfig',
    settings: ConfigSettings,
    options?: ConfigOptions,
  ): void
  (command: 'ready', callback: ReadyCallback): void
}

interface InitConfig {
  edgeURL: string
  disableConsentCheck?: boolean
  userId?: string // Only for cookieless environments; auto-generated in browsers
  fallbackUserId?: string
  storageId?: number
  sessionId?: string
  skipZeroPurchaseEvent?: boolean
}

interface TagOptions {
  method?: 'beacon'
  sync?: boolean
  destination?: string
}

interface UserOptions {
  method?: 'beacon'
  destination?: string
}

interface ConsentOptions {
  localSave?: boolean
  destination?: string
}

interface GetConsentOptions {
  destination?: string
}

interface GetDataOptions {
  destination?: string
}

interface KeysOptions {
  destination?: string
}

interface GetUserIdOptions {
  destination?: string
}

interface IsNewUserOptions {
  destination?: string
}

interface ConfigSettings {
  pageUrl?: string
}

interface ConfigOptions {
  destination?: string
}

type GetConsentCallback = (
  consent: Record<string, boolean | Record<string, boolean>> | null,
  error?: Error,
  consentCategories?: Record<string, boolean> | null,
) => void

interface ReadyCallbackData {
  destination: string
  userId: string | undefined
  sessionId: string | undefined
  isNewUser: boolean | undefined
  isNewSession: boolean
  consent: Record<string, boolean>
  consentCategories: Record<string, boolean>
  consentSetting: Record<string, unknown>
}

type ReadyCallback = (data: ReadyCallbackData) => unknown | Promise<unknown>

declare var edgetag: EdgeTagAPI
```
