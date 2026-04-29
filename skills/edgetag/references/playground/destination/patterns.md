# Destination Playground — Patterns

Worked examples for the most common Destination Playground use cases. All snippets are function bodies — Playground supplies the wrapper on save.

## 1. Forward `Purchase` to a third-party API with SHA-256-hashed email

```js
// edge/tag
if (params.payload.eventName !== 'Purchase') {
  return
}

const email = params.user?.email?.toLowerCase().trim()
let hashedEmail
if (email) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(email),
  )
  hashedEmail = Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

await params.requestHandler('https://api.example.com/conversions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${params.secrets.API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: params.payload.data.orderId,
    value: params.payload.data.value,
    currency: params.payload.data.currency,
    hashedEmail,
    country: params.hostData.country,
  }),
})

params.logger.log('Forwarded Purchase', params.payload.data.orderId)
```

## 2. Detect new users in `edge/init` and sync to a CRM

```js
// edge/init
if (params.isNewUser) {
  params.logger.log('New user detected', params.userId)

  await params.requestHandler('https://crm.example.com/identify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.secrets.CRM_TOKEN}` },
    body: JSON.stringify({ userId: params.userId }),
  })
}
```

## 3. Sync identity to CRM on `edge/user`

```js
// edge/user
await params.requestHandler('https://crm.example.com/identify', {
  method: 'POST',
  headers: { Authorization: `Bearer ${params.secrets.CRM_TOKEN}` },
  body: JSON.stringify({ userId: params.userId, ...params.payload }),
})
```

## 4. First-party `/api/subscribe` endpoint backed by D1

CDN APIs (browser-callable, no auth) live under `apis/cdn/` in the Playground UI. Add a D1 binding named `SUBSCRIBERS_DB` in the Infrastructure tab first.

```js
// apis/cdn/subscribe
const body = await params.request.json()

await params.infra.SUBSCRIBERS_DB.prepare(
  'INSERT INTO subscribers (email, created_at) VALUES (?, ?)',
)
  .bind(body.email, new Date().toISOString())
  .run()

return new Response(JSON.stringify({ status: 'ok' }), {
  headers: { 'Content-Type': 'application/json' },
})
```

The endpoint is reachable at `https://<your-edgetag-domain>/providers/playground/subscribe`.

## 5. Load a third-party pixel in the browser, gated by consent

```js
// browser/init
if (!params.consentData.categories.advertising) return

const script = document.createElement('script')
script.src = `https://cdn.example.com/pixel.js?id=${params.manifest.variables.PIXEL_ID}`
script.async = true
document.head.appendChild(script)
```

## 6. Call a pixel SDK on every event

```js
// browser/tag
if (window.fbq) {
  window.fbq('track', params.eventName, {
    value: params.data.value,
    currency: params.data.currency,
  })
}
```

## 7. Initialize a pixel with a client-side variable

```js
// browser/tag
if (window.fbq) {
  window.fbq('init', params.manifestVariables.PIXEL_ID)
  window.fbq('track', params.eventName, { value: params.data.value })
}
```

## 8. Nightly export to R2 via `edge/scheduled`

Add an R2 binding named `EXPORTS` in the Infrastructure tab. `edge/scheduled` runs on a cron — use `params.scheduledTime` to compute your window.

```js
// edge/scheduled
const since = new Date(params.scheduledTime.getTime() - 24 * 60 * 60 * 1000)
const rows = await params.reporting.getFromDatabase(
  'SELECT order_id, value FROM orders WHERE created_at > ?',
  [since.toISOString()],
)

const csvString =
  'order_id,value\n' +
  (rows?.results ?? []).map((r) => `${r.order_id},${r.value}`).join('\n')

await params.infra.EXPORTS.put(
  `orders/${since.toISOString().split('T')[0]}.csv`,
  csvString,
  { httpMetadata: { contentType: 'text/csv' } },
)

params.logger.log(`Exported ${rows?.results.length ?? 0} rows`)
```

## 9. Deduplicate events with KV

```js
// edge/tag
const orderId = params.payload.data?.orderId
if (!orderId) return

const seen = await params.infra.CACHE.get(`dedupe:${orderId}`)
if (seen) {
  params.logger.log('Duplicate Purchase skipped', orderId)
  return
}
await params.infra.CACHE.put(`dedupe:${orderId}`, '1', { expirationTtl: 86400 })

// ...forward the event
```

## 10. Authenticated server API with `currentUser`

Server APIs live under `apis/server/`. They receive `params.currentUser` with the authenticated user's identity.

```js
// apis/server/teams
if (params.method !== 'GET') {
  return new Response('Method Not Allowed', { status: 405 })
}

const teams = await params.infra.TEAMS_DB.prepare(
  'SELECT id, name FROM teams WHERE owner_id = ?',
)
  .bind(params.currentUser.userId)
  .all()

return new Response(JSON.stringify(teams.results ?? []), {
  headers: { 'Content-Type': 'application/json' },
})
```

The endpoint is reachable at `https://<your-edgetag-domain>/providers/playground/server-api/teams` (callers must be authenticated).
