# Transformation Playground — API Reference

Every Transformation file is an `async` function that receives a single `params` object and **returns an object** describing what EdgeTag should do with the event. You write only the function body — Playground supplies the wrapper, imports, and exports on save.

All files are optional. Leaving a file empty skips that level entirely.

---

## The return shape

Every file returns a plain object. Any combination of these fields is valid:

```js
return {}                                     // no-op (pass through)
return { payload }                            // modify the event
return { skipEvent: true }                    // drop the event for this level
return { additionalEvents: [event1, ...] }    // fan out extra events (root only)
return { user }                               // update user data (edge only)
return { payload, additionalEvents }          // combine any of the above
```

Returning nothing at all is equivalent to `return {}`.

| Field              | Type                   | Effect                                                               |
| ------------------ | ---------------------- | -------------------------------------------------------------------- |
| `payload`          | event object           | Replace the event payload for this level.                            |
| `user`             | user object or `null`  | Replace user data for this level. **Edge only.**                     |
| `additionalEvents` | array of event objects | Emit extra events. **Root-level only** (`tagRoot`, `clientTagRoot`). |
| `skipEvent`        | `boolean`              | `true` drops the event at this level.                                |

---

## `tagRoot`

Runs on the edge **once per event**, before any channel routing. Use for global rules — drop everywhere, enrich every payload, emit additional events based on attribution.

```ts
params.payload          // { eventName, eventId, sdkVersion, locale, search, referrer, data }
params.user             // hashable PII { email, phone, firstName, lastName, zip, ... } | null
params.variables        // Secrets, as plain object (all secrets, edge-side)
params.configuration    // configuration attached to the event
params.platform         // e.g. SHOPIFY, CUSTOM
params.userCustomData   // custom tags attached via the SDK
params.hostData         // { userAgent, ip, country, city, region, timezone, ... }
params.logger.log(...)
params.logger.error(...)
params.userKey.getFirstClick()  // paid-media attribution helper (returns provider ID or null)
params.userKey.getLastClick()
params.providerData     // raw click IDs and UTMs captured for this user
```

## `tagChannel`

Runs on the edge **once per provider channel**. Same params as `tagRoot`, plus:

```ts
params.providerId // 'facebook' | 'google' | 'tiktok' | 'klaviyo' | ...
```

Use for provider-specific rules.

## `tagInstance`

Runs on the edge **once per provider instance** (e.g. `facebook||pixel1`). Same params as `tagChannel`, including `providerId`. Use when you have multiple pixels or accounts inside a provider and need different behavior for each.

## `clientTagRoot`

Runs in the browser **once per event**, before any provider tag fires.

```ts
params.payload // { eventName, eventId, data }
params.user // reserved for browser user data (currently empty)
params.settings // { userId, sessionId, geoCountry, geoRegion, isEURequest, ip, consent, consentCategories, userProperties }
params.variables // only Secrets flagged as client-side
```

## `clientTagChannel`

Same as `clientTagRoot`, plus:

```ts
params.providerId
```

## `clientTagInstance`

Same as `clientTagChannel`, plus instance scope. Same `providerId` field.

---

## Paid-media attribution helpers (edge only)

Two helpers on edge `params` make paid-media attribution easy. Both are easy to misuse — read carefully.

### `params.userKey.getFirstClick()` and `getLastClick()`

Returns a **provider ID string** or `null`. The provider ID tells you which paid channel drove this user; it is **not** a click ID, a URL, or a query string.

```js
const firstClickProvider = await params.userKey.getFirstClick()
const lastClickProvider = await params.userKey.getLastClick()

if (firstClickProvider === 'facebook') {
  // user's first paid-media touch was a Facebook click
}
if (lastClickProvider === null) {
  // organic/direct — no paid-media click on record
}
```

Valid return values are literal strings from a fixed set:

```
'facebook' | 'googleAdsClicks' | 'bing' | 'snapchat' | 'tiktok' |
'twitter'  | 'linkedIn'        | 'pinterest' | 'reddit' |
'appLovin' | 'taboola' | 'outbrain' | 'trybe' | null
```

### `params.providerData`

The raw click IDs and UTM values captured for this user, keyed by provider and then by the original query-parameter name:

```js
params.providerData.facebook?.fbclid // Meta click ID, if present
params.providerData.facebook?.fbc // Facebook cookie
params.providerData.googleAdsClicks?.gclid // Google Ads click ID
params.providerData.utm?.utm_source // 'google', 'newsletter', etc.
params.providerData.utm?.utm_medium
params.providerData.utm?.utm_campaign
params.providerData.utm?.utm_term
params.providerData.utm?.utm_content
```

An empty `providerData` means no paid-media clicks or UTMs were ever captured for this user.

> ⚠️ `getFirstClick()` and `getLastClick()` return a provider ID like `'facebook'`, not the `fbclid`. Don't try to parse it with `new URL(...)` or `URLSearchParams` — just compare it to a literal provider ID or to `null`.

---

## Secrets

| File                                                     | Access path             | Available secrets                  |
| -------------------------------------------------------- | ----------------------- | ---------------------------------- |
| `tagRoot`, `tagChannel`, `tagInstance`                   | `params.variables.NAME` | All secrets                        |
| `clientTagRoot`, `clientTagChannel`, `clientTagInstance` | `params.variables.NAME` | Only secrets flagged as **client** |

Secret names are used verbatim. Tick **client** in the Secrets tab to expose a Secret to browser plugin files.

---

## What's not available

Transformations are pure event transforms — by design, they do **not** have:

- `params.requestHandler` (no outbound HTTP)
- `params.userSave`, `params.userGet`, `params.providerSave` (no identity-graph writes)
- `params.infra` (no D1, KV, R2, Analytics Engine bindings)

If you need any of these, use a [Destination](../destination/api-reference.md) instead.

## Throwing

Throwing inside a Transformation file does not break the event pipeline for other levels or channels. The error is captured and surfaced in Simulation output and your EdgeTag logs.
