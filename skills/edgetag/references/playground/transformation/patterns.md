# Transformation Playground — Patterns

Worked examples for the most common Transformation Playground use cases. All snippets are function bodies — Playground supplies the wrapper on save.

## 1. Enrich every Purchase with `source` and a USD-converted value

```js
// tagRoot
if (params.payload.eventName === 'Purchase') {
  const payload = structuredClone(params.payload)
  payload.data = {
    ...payload.data,
    source: 'website',
    valueUSD:
      payload.data.currency === 'USD'
        ? payload.data.value
        : payload.data.value * 1.08,
  }
  return { payload }
}
return {}
```

## 2. Drop `PageView` events everywhere

```js
// tagRoot
if (params.payload.eventName === 'PageView') {
  return { skipEvent: true }
}
return {}
```

## 3. Skip Facebook's browser pixel for EU traffic

```js
// clientTagChannel
if (params.providerId === 'facebook' && params.settings.isEURequest) {
  return { skipEvent: true }
}
return {}
```

## 4. Add a custom field only for Facebook

```js
// tagChannel
if (params.providerId === 'facebook') {
  const payload = structuredClone(params.payload)
  payload.data = { ...payload.data, fb_custom_field: 'my_value' }
  return { payload }
}
return {}
```

## 5. Emit `Purchase_Facebook` for Facebook-attributed purchases

```js
// tagRoot
if (params.payload.eventName === 'Purchase') {
  const firstClick = await params.userKey.getFirstClick()
  const lastClick = await params.userKey.getLastClick()
  if (firstClick === 'facebook' || lastClick === 'facebook') {
    const extra = structuredClone(params.payload)
    extra.eventName = 'Purchase_Facebook'
    return { additionalEvents: [extra] }
  }
}
return {}
```

`additionalEvents` is honored from `tagRoot` on the edge and `clientTagRoot` in the browser. Each additional event then goes through channel routing like any other event.

## 6. Combine enrichment and fan-out in one return

```js
// tagRoot
if (params.payload.eventName === 'Purchase') {
  const payload = structuredClone(params.payload)
  payload.data = { ...payload.data, source: 'website' }

  const lastClick = await params.userKey.getLastClick()
  if (lastClick === 'facebook') {
    const extra = structuredClone(payload)
    extra.eventName = 'Purchase_Facebook'
    return { payload, additionalEvents: [extra] }
  }

  return { payload }
}
return {}
```

## 7. Hash PII uniformly across every channel

```js
// tagRoot
if (params.user?.email) {
  const user = structuredClone(params.user)
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(user.email.toLowerCase().trim()),
  )
  user.email = Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return { user }
}
return {}
```

## 8. Add browser-only data (screen width)

```js
// clientTagRoot
return {
  payload: {
    ...params.payload,
    data: { ...params.payload.data, screenWidth: window.innerWidth },
  },
}
```

## 9. Drop PageViews only when going to paid-media channels

```js
// tagChannel
const PAID_MEDIA = new Set([
  'facebook',
  'googleAdsClicks',
  'tiktok',
  'snapchat',
  'pinterest',
  'linkedIn',
  'bing',
  'twitter',
])

if (
  params.payload.eventName === 'PageView' &&
  PAID_MEDIA.has(params.providerId)
) {
  return { skipEvent: true }
}
return {}
```

## 10. Provider-specific behavior using `providerData` (raw click IDs)

```js
// tagChannel
if (params.providerId === 'facebook') {
  const fbclid = params.providerData.facebook?.fbclid
  if (fbclid) {
    const payload = structuredClone(params.payload)
    payload.data = { ...payload.data, fbclid }
    return { payload }
  }
}
return {}
```

## 11. UTM-aware enrichment

```js
// tagRoot
const utm = params.providerData.utm
if (utm?.utm_source) {
  const payload = structuredClone(params.payload)
  payload.data = {
    ...payload.data,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
  }
  return { payload }
}
return {}
```
