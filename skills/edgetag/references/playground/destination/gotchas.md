# Destination Playground — Gotchas

Common mistakes when writing custom Destination code, and how to avoid them.

## 1. Don't mutate `params.payload` directly

Stage files receive a shared input object. Mutating it can cause subtle bugs in downstream channels. If you need to transform an event before forwarding, copy first:

```js
const payload = structuredClone(params.payload)
payload.data.source = 'website'
await params.requestHandler(url, { body: JSON.stringify(payload) })
```

Most `edge/tag` Destinations don't return anything — they're fire-and-forget. You only need `structuredClone` when you specifically need a mutable copy.

## 2. Browser code can break the site

`browser/init`, `browser/tag`, and `browser/user` run on your real website. An uncaught exception in browser code can break page functionality. Always:

- Test thoroughly in Simulation **and** with the live page open
- Wrap risky logic in `try/catch`
- Guard for missing globals: `if (window.fbq) { ... }`

## 3. Don't expose private secrets to the browser

Variables flagged **"also include on client"** are shipped to every visitor's browser and are effectively public. Only mark:

- Public pixel IDs (`PIXEL_ID`, `GTM_ID`)
- Feature flags
- Public URLs

Never mark private API keys, signing secrets, or auth tokens as client-side. If you accidentally do, treat them as compromised and rotate.

## 4. Variables vs. Infrastructure are different tabs

- **Variables** tab → `params.secrets.NAME` (key/value pairs)
- **Infrastructure** tab → `params.infra.BINDING_NAME` (D1, KV, R2, Analytics Engine)

Adding a binding in the Infrastructure tab does not make it appear in `params.secrets`, and vice versa. Add bindings before you reference them in code.

## 5. Browser variables use a different access path

| File                            | Access path                      |
| ------------------------------- | -------------------------------- |
| `edge/*`, CDN APIs, Server APIs | `params.secrets.NAME`            |
| `browser/init`                  | `params.manifest.variables.NAME` |
| `browser/tag`, `browser/user`   | `params.manifestVariables.NAME`  |

If `params.manifestVariables.MY_VAR` is `undefined`, the most likely cause is that **"also include on client"** is unticked in the Variables tab.

## 6. Infrastructure mocks in Simulation are in-memory only

When you click Simulate:

- D1 queries are **captured but not executed**
- KV and R2 use an in-memory `Map` — nothing persists between runs
- Analytics Engine writes are logged

Don't rely on Simulation to verify that data actually persists in production — the only thing it verifies is that your code runs and returns the shape you expect. For end-to-end persistence checks, deploy and inspect the real binding.

## 7. Redaction patterns

Header or body keys matching `authorization`, `token`, `api-key`, `api_key`, `secret`, `password`, or `cookie` are replaced with `[REDACTED]` in the Simulation output. This is display-only — the real request still carries the real value. If your debugging is being obscured by redaction, log a hash or prefix instead of the raw value:

```js
params.logger.log('token prefix', params.secrets.API_KEY.slice(0, 4))
```

## 8. Returning vs. not returning

- `edge/*` files: returning nothing is fine; nothing else is acted upon for these stages.
- `browser/*` files: return `{ skipEvent: true }` to stop EdgeTag from continuing the event pipeline for this destination. Returning `undefined`, `{}`, or anything else is a no-op.
- **CDN APIs and Server APIs** must return a `Response`. If you don't return one, the request will fail.

## 9. Web API surface is the Workers runtime, not Node

In edge files you have `crypto.subtle`, `crypto.randomUUID`, `URL`, `URLSearchParams`, `TextEncoder/Decoder`, `atob/btoa`, and `structuredClone`. You do **not** have Node-style `crypto`, `Buffer`, `process.env`, or `fs`. Use the Workers/Web equivalents:

```js
// SHA-256 in the Workers runtime
const bytes = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(value),
)
const hex = Array.from(new Uint8Array(bytes))
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')
```

## 10. Throwing doesn't break the rest of the pipeline

If your code throws, EdgeTag captures the error and surfaces it in Simulation output and your logs, but other channels continue to fire normally. Don't rely on a throw to "stop" event delivery to other destinations — use a Transformation with `{ skipEvent: true }` for that.
