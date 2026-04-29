# Destination Playground — API Reference

Every stage file in a Destination is an `async` function that receives a single `params` object. You write only the function body — Playground supplies the wrapper, imports, and exports on save.

All files are optional. Leaving a file empty skips that stage entirely.

---

## `edge/tag`

Runs on the CDN edge for every tracked event. This is where most Destination logic lives.

```ts
params.payload          // { eventName, eventId, pageUrl, pageTitle, referrer, locale, data }
params.userId           // EdgeTag user ID for this visitor
params.user             // hashable PII { email, phone, firstName, lastName, city, state, zip, country, ... }
params.customData       // custom tags attached via the SDK
params.providerData     // click IDs / cookies per provider (fbp, fbc, gclid, ...)
params.hostData         // { userAgent, ip, country, city, region, timezone, postalCode }
params.origin           // origin URL
params.domain           // domain name
params.platform         // SHOPIFY | CUSTOM | ...
params.secrets          // Variables, as plain object
params.infra            // Infrastructure bindings { DB, CACHE, EXPORTS, ... }
params.requestHandler(url, config)            // outbound HTTP
params.userSave(userId, fields)               // write to identity graph
params.userGet(userId)                        // read from identity graph
params.providerSave(userId, providerId, data) // save provider-specific data
params.logger.log(...)                        // visible in Simulation output
params.logger.error(...)
```

`payload.data` carries the standard event fields (`currency`, `value`, `orderId`, `contents`, etc.).

## `edge/init`

Runs once when a visitor session starts. Use it to capture click IDs from URL parameters or cookies, detect new users, and read or write the identity graph before the first event fires.

```ts
params.userId
params.isNewUser // boolean
params.session // { isNewSession, sessionId } | null
params.cookies // raw cookie string from request
params.hostData
params.secrets
params.infra
params.requestHandler
params.userSave
params.userGet
params.providerSave
params.logger
```

## `edge/user`

Runs when user identity is sent (login, signup, profile update).

```ts
params.payload // user fields being saved { firstName, lastName, email, phone, ... }
params.userId
params.user // current hashable PII
params.customData
params.hostData
params.secrets
params.infra
params.requestHandler
params.userSave
params.userGet
params.providerSave
params.logger
```

## `edge/scheduled`

Runs periodically on a cron schedule (every 5 minutes by default). Use it for batch exports, periodic syncs, or cleanup jobs.

```ts
params.scheduledTime // Date for the scheduled run
params.secrets
params.infra
params.logger
params.requestHandler
params.reporting.saveInDatabase(sql, bindings) // insert a row
params.reporting.saveBatchInDatabase(sql, bindingsArray) // batch insert
params.reporting.getFromDatabase(sql, bindings) // read
params.userKey.byRouteKey(key) // look up users by email or user ID
```

## `browser/init`

Runs once in the browser on page load. Use it to load third-party scripts and initialize pixels, gated by consent.

```ts
params.userId
params.isNewUser
params.session
params.baseUrl                 // EdgeTag CDN base URL
params.manifest.variables      // client-side Variables (those flagged "also include on client")
params.manifest.package
params.manifest.tagName
params.manifest.geoRegions
params.keyName
params.destination
params.consentData.consent
params.consentData.categories  // { advertising, analytics, functional, share_pii, necessary }
params.consentData.consentSettings
params.sendTag(event)                          // forward event to your own browser/tag
params.sendEdgeData(data, providers, options?) // persist data through the edge
params.getEdgeData(keys, callback)             // read previously saved edge data
params.executionContext        // Map shared across calls in the same page load
```

## `browser/tag`

Runs in the browser for every tracked event.

```ts
params.userId
params.sessionId
params.eventId
params.eventName
params.data // event data { value, currency, orderId, contents, ... }
params.manifestVariables // client-side Variables
params.destination
params.sendTag
params.getEdgeData
params.executionContext
```

## `browser/user`

Runs in the browser when user identity changes.

```ts
params.userId
params.data // user fields { firstName, lastName, email, phone, ... }
params.manifestVariables
params.destination
```

## CDN API handlers

Browser-callable, no authentication. Routed at `/providers/playground/{endpointName}` on your EdgeTag domain. Use for first-party endpoints your site or app needs to hit directly (e.g. `/api/subscribe`, `/api/consent-preferences`).

```ts
params.endpoint // endpoint name
params.method // 'GET' | 'POST' | 'PUT' | 'DELETE'
params.request // standard Request object — call .json(), .text(), .formData()
params.secrets
params.infra
params.logger
// must return: new Response(body, { headers, status })
```

## Server API handlers

Authenticated, server-only. Routed at `/providers/playground/server-api/{endpointName}`. Receive everything CDN APIs do, plus `params.currentUser`.

```ts
params.endpoint
params.method
params.request
params.secrets
params.infra
params.currentUser // { userId, email, role, teamId, ... } — authenticated user
params.logger
// must return: Response
```

CDN and Server APIs do **not** have `requestHandler` or identity-graph helpers.

---

## Variables

Managed in the Variables tab. Two types: **Variables** (non-sensitive — URLs, pixel IDs) and **Secrets** (sensitive — access tokens, signing keys). Both surface at the same access path.

| File                                                                    | Access path                      |
| ----------------------------------------------------------------------- | -------------------------------- |
| All edge files (`edge/init`, `edge/tag`, `edge/user`, `edge/scheduled`) | `params.secrets.NAME`            |
| CDN and Server API handlers                                             | `params.secrets.NAME`            |
| `browser/init`                                                          | `params.manifest.variables.NAME` |
| `browser/tag`, `browser/user`                                           | `params.manifestVariables.NAME`  |

Variable names are used verbatim — what you type in the UI is what you read in code. Tick **"also include on client"** to expose a Variable to the browser.

## Infrastructure bindings

Managed in the Infrastructure tab. Each binding is exposed as `params.infra.<BINDING_NAME>` inside every edge file and every API handler.

| Service              | Good for                                                    |
| -------------------- | ----------------------------------------------------------- |
| **D1**               | SQL database — reporting, subscriber lists, relational data |
| **KV**               | Key-value store — fast reads, session caches, deduplication |
| **R2**               | Object storage — file exports, archives, large blobs        |
| **Analytics Engine** | Time-series writes, custom analytics                        |

Usage:

```js
// D1
const row = await params.infra.MY_DB.prepare(
  'SELECT * FROM subscribers WHERE email = ?',
)
  .bind(email)
  .first()

// KV
await params.infra.CACHE.put(`dedupe:${orderId}`, '1', { expirationTtl: 86400 })
const seen = await params.infra.CACHE.get(`dedupe:${orderId}`)

// R2
await params.infra.EXPORTS.put(`orders/${date}.csv`, csvString, {
  httpMetadata: { contentType: 'text/csv' },
})
```

## Available web APIs

Inside edge files, you have the Workers runtime:

- `crypto.subtle.digest(...)`, `crypto.randomUUID()`
- `URL`, `URLSearchParams`
- `TextEncoder`, `TextDecoder`
- `atob`, `btoa`
- `structuredClone`

Browser files have the full browser API surface (`window`, `document`, `fetch`, `localStorage`, `navigator`, etc.).

## Return values

- `edge/*` and `browser/*` — returning nothing is fine (fire-and-forget). Browser files can return `{ skipEvent: true }` to stop EdgeTag from continuing with this event.
- **CDN APIs and Server APIs** — must return a `Response`.

Throwing inside a stage file does not break the event pipeline for other channels. The error is captured and surfaced in Simulation output and in your EdgeTag logs.

## Redaction in Simulation

Header or body keys matching `authorization`, `token`, `api-key`, `api_key`, `secret`, `password`, or `cookie` are replaced with `[REDACTED]` in the captured Simulation output. The actual request still carries the real value — only the display is redacted.
