# Transformation Playground — Gotchas

Common mistakes when writing custom Transformation code, and how to avoid them.

## 1. Always `structuredClone` before mutating `payload` or `user`

Transformations are pure event transforms — never touch the input object. Always copy first:

```js
const payload = structuredClone(params.payload)
payload.data = { ...payload.data, source: 'website' }
return { payload }
```

If you mutate `params.payload` directly, downstream channels can see partial mutations and behavior becomes order-dependent.

## 2. `additionalEvents` only works at root level

Returning `additionalEvents` from `tagChannel` or `tagInstance` is silently ignored. Fan-out only happens from `tagRoot` (edge) and `clientTagRoot` (browser):

```js
// tagRoot — works
return { additionalEvents: [extraEvent] }

// tagChannel — silently ignored
return { additionalEvents: [extraEvent] }
```

## 3. `getFirstClick()` and `getLastClick()` return provider IDs, not click IDs

These helpers return strings like `'facebook'` or `'googleAdsClicks'`, **not** the raw `fbclid` or `gclid` value. Don't try to parse them with `new URL(...)` or `URLSearchParams`. Compare them to a literal provider ID or to `null`:

```js
const last = await params.userKey.getLastClick()
if (last === 'facebook') { ... }   // ✓ correct
if (last?.includes('fbclid')) { ... }  // ✗ wrong — last is 'facebook', not the click ID
```

The full set of return values is: `'facebook'`, `'googleAdsClicks'`, `'bing'`, `'snapchat'`, `'tiktok'`, `'twitter'`, `'linkedIn'`, `'pinterest'`, `'reddit'`, `'appLovin'`, `'taboola'`, `'outbrain'`, `'trybe'`, or `null`.

To access raw click IDs, use `params.providerData.facebook?.fbclid`, `params.providerData.googleAdsClicks?.gclid`, etc.

## 4. No `requestHandler`, no `infra`, no identity-graph helpers

Transformations are pure event transforms — they cannot:

- Make outbound HTTP requests (`params.requestHandler` is **not available**)
- Write to the identity graph (`params.userSave`, `params.userGet`, `params.providerSave` are **not available**)
- Access storage bindings (`params.infra` is **not available**)

If you need any of these, switch to a [Destination](../destination/README.md).

## 5. Browser secrets must be flagged as **client**

Browser plugin files (`clientTagRoot`, `clientTagChannel`, `clientTagInstance`) only see Secrets that have the **client** flag ticked in the Secrets tab. Edge files see every Secret.

```js
// clientTagRoot
const pixelId = params.variables.PIXEL_ID // ✓ defined (if flagged client)
const apiKey = params.variables.API_KEY // ✗ undefined (edge-only)
```

## 6. Don't expose private secrets to the browser

Anything you flag as **client** is shipped to every visitor's browser and is effectively public. Only flag values that are safe to expose — public pixel IDs, feature flags, public URLs. Never flag private API keys, signing secrets, or auth tokens.

## 7. `params.providerId` only exists at channel and instance levels

`tagRoot` and `clientTagRoot` run once per event, **before** channel routing — there's no `providerId` yet. Don't reference it in root files; use `tagChannel` or `tagInstance` if your rule depends on the destination provider.

## 8. Returning the wrong shape silently does nothing

Return values are typed: `{ payload?, user?, additionalEvents?, skipEvent? }`. Other keys are ignored, which can mask bugs:

```js
return { event: payload } // ✗ ignored (typo for `payload`)
return { skip: true } // ✗ ignored (typo for `skipEvent`)
return { payload: payload } // ✓ correct
return { skipEvent: true } // ✓ correct
```

If your Simulation result looks like `{}` when you expected a change, double-check the return key names.

## 9. Browser Transformations run before the channel's own browser tag

If you modify the payload in `clientTagRoot`, the channel's own `browser/tag` (whether built-in or a custom Destination) sees the modified payload. This is usually what you want — but be aware of the ordering when reasoning about which fields a channel actually receives.

## 10. Throwing doesn't drop the event

If your Transformation throws, EdgeTag captures the error and continues. Throwing is **not** a way to drop an event — use `return { skipEvent: true }` for that.

## 11. `user: null` vs. omitting `user`

`return { user: null }` replaces the user with `null` for this level. Omitting the `user` key (or returning `{}`) leaves the user unchanged. Only return `user` when you actually want to replace it.
