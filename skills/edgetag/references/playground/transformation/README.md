# Transformation Playground

A Transformation is an engine that sits in front of every channel. It sees every event you send to EdgeTag and can reshape it, drop it, or fan out additional events before the event reaches any individual channel.

Use a Transformation when you want to modify events already flowing through the channels EdgeTag ships with — for example, dropping `PageView` from paid-media channels, enriching every Purchase with a server-side `source` field, hashing PII uniformly across channels, or emitting a `Purchase_Facebook` event when the user's last paid-media click was Facebook.

> A [Destination](../destination/README.md) sends events to a new integration you're building from scratch. A Transformation reshapes events that are already going to existing channels. If you need outbound HTTP requests, storage, or identity-graph writes, use a Destination — Transformations are pure event transforms.

## File structure

A Transformation consists of six files — three on the edge and three in the browser. Each file is optional; only the ones you fill in are invoked.

```
playground/
├── edge/
│   ├── tagRoot        runs on the CDN edge once per event
│   ├── tagChannel     runs on the CDN edge per provider
│   └── tagInstance    runs on the CDN edge per provider instance
└── browser/
    ├── clientTagRoot      runs in the browser once per event
    ├── clientTagChannel   runs in the browser per provider
    └── clientTagInstance  runs in the browser per provider instance
```

### The six execution levels

| Level    | Edge file     | Browser file        | Runs                                                   |
| -------- | ------------- | ------------------- | ------------------------------------------------------ |
| Root     | `tagRoot`     | `clientTagRoot`     | Once per event, before channel routing                 |
| Channel  | `tagChannel`  | `clientTagChannel`  | Once per provider channel (e.g. `facebook`, `klaviyo`) |
| Instance | `tagInstance` | `clientTagInstance` | Once per provider instance (e.g. `facebook\|\|pixel1`) |

Rule of thumb:

- **Root** for rules that apply to every channel. You usually only need one root file.
- **Channel** for rules tied to a specific provider — check `params.providerId`.
- **Instance** for rules tied to a specific pixel/account inside a provider.

It's common to have only one of these files filled in. Fan out across multiple levels only when you genuinely need different rules at different granularities.

### Edge plugin levels

Edge files run on the EdgeTag CDN edge (Cloudflare Workers), before any channel receives the event. They have the full server-side context — PII on `params.user`, host data, paid-media attribution via `params.userKey`, and your Secrets.

- **`tagRoot`** — once per event, before any channel routing. Global rules: drop everywhere, enrich every payload, emit additional events based on attribution.
- **`tagChannel`** — once per provider channel. Receives `params.providerId` (e.g. `'facebook'`, `'klaviyo'`, `'tiktok'`).
- **`tagInstance`** — once per provider instance. Most granular edge level. Also receives `params.providerId`.

### Browser plugin levels

Browser files run in the visitor's browser before the channel's own browser tag fires. They can skip a provider's browser execution, enrich the payload with browser-only data (like `window.innerWidth` or `document.referrer`), or shape data before it reaches the channel.

- **`clientTagRoot`** — once per event in the browser. Global browser rules.
- **`clientTagChannel`** — once per provider channel in the browser. Receives `params.providerId`.
- **`clientTagInstance`** — once per provider instance in the browser. Also receives `params.providerId`.

## What a Transformation can do

Every file returns an object that tells EdgeTag how to handle the event. Any combination of these four is valid:

- **Modify the payload** — `return { payload: <modified> }`
- **Skip the event** — `return { skipEvent: true }` (drops the event for this level)
- **Emit additional events** — `return { additionalEvents: [<event>, ...] }` (root level only)
- **Update user data** — `return { user: <modified> }` (edge only)

Transformations are **pure event transforms** — they don't make HTTP requests, don't write to storage, and don't touch the identity graph. If you need any of that, use a [Destination](../destination/README.md).

## Secrets

Managed in the Secrets tab. Both **Variables** (non-sensitive) and **Secrets** (sensitive) are exposed at `params.variables.NAME`. Secrets are stored encrypted and are never logged.

| File                                                | Available secrets                  |
| --------------------------------------------------- | ---------------------------------- |
| Edge files (`tagRoot`, `tagChannel`, `tagInstance`) | All secrets                        |
| Browser files (`clientTagRoot`, etc.)               | Only secrets flagged as **client** |

Secret names are used verbatim — what you type in the UI is what you read in code.

> Client-flagged secrets are shipped to every visitor's browser and are effectively public. Only flag values that are safe to expose — public pixel IDs, feature flags, public URLs.

## Simulation

Click **Simulate** to run a single file in an isolated sandbox against a realistic sample event. Playground:

1. Takes the code from the file you selected.
2. Injects your Secrets into `params.variables` (scoped to edge vs. browser).
3. Runs the file against the current sample event.
4. Captures logs, the **return object**, and any thrown error.

Because Transformations don't make HTTP requests, the captured output is mostly about the **return object** — the thing that tells EdgeTag how to change the event.

Three pre-populated sample events are available:

- **Purchase** — full purchase with two line items, user PII, realistic `providerData` (`fbclid`, `gclid`, UTMs).
- **PageView** — page view with name and category.
- **AddToCart** — single-item add-to-cart.

The sample also includes `platform` (e.g. `SHOPIFY`), `userCustomData`, and `hostData`.

The simulation output has three sections: **Return** (the most important — `{ payload?, user?, additionalEvents?, skipEvent? }`), **Logs**, and **Error**.

Each level is simulated independently. `tagChannel` and `tagInstance` need `params.providerId` set, so test against a sample that includes that provider.

> Sensitive header/body keys (`authorization`, `token`, `api-key`, `api_key`, `secret`, `password`, `cookie`) are auto-redacted to `[REDACTED]` in the captured output.

## Execution order for a single event

`tagRoot` (edge) → `tagChannel` (edge, per provider) → `tagInstance` (edge, per instance) → channel's edge processing → `clientTagRoot` (browser) → `clientTagChannel` (browser, per provider) → `clientTagInstance` (browser, per instance) → channel's browser tag.

Empty files are skipped entirely — they aren't registered and don't add latency.

## See also

- [api-reference.md](./api-reference.md) — full `params.*` reference, return-shape contract, attribution helpers
- [gotchas.md](./gotchas.md) — common mistakes and how to avoid them
- [patterns.md](./patterns.md) — worked examples (enrichment, drop, fan-out, attribution, uniform PII hashing)
