# Destination Playground

A Destination is custom code that behaves like one of the built-in EdgeTag channels. It runs at event time on the EdgeTag edge, at page load in the browser, and optionally via a cron. It can call third-party APIs, read and write your identity graph, store data in D1/KV/R2, and expose HTTP endpoints on your domain.

Use a Destination when you need something that isn't covered by the channels EdgeTag ships with — forwarding events to an in-house analytics tool, building a warehouse webhook, exposing a first-party `/api/subscribe` endpoint backed by your own database, or running a nightly export.

> If you're modifying events flowing through **existing** channels (dropping, renaming, enriching), use a [Transformation](../transformation/README.md) instead. Destinations are for **new** integrations.

## File structure

A Destination is organized into a fixed set of stage files plus optional HTTP endpoints. Every file is optional — only the ones you fill in are invoked.

```
playground/
├── edge/
│   ├── init         runs on the CDN edge when a visitor session starts
│   ├── tag          runs on the CDN edge for every tracked event
│   ├── user         runs on the CDN edge when user identity changes
│   └── scheduled    runs on the CDN edge on a cron schedule
├── browser/
│   ├── init         runs in the browser once on page load
│   ├── tag          runs in the browser for every tracked event
│   └── user         runs in the browser when user identity changes
└── apis/
    ├── cdn/         browser-callable HTTP endpoints
    └── server/     authenticated server-only HTTP endpoints
```

### Edge files

Run on the EdgeTag CDN edge (Cloudflare Workers). They see the full request context, have access to your Variables and Infrastructure bindings, and can make outbound HTTP requests.

- **`edge/init`** — once per visitor session. Capture click IDs from URL parameters or cookies, detect new users, read from the identity graph before the first event fires.
- **`edge/tag`** — every tracked event (`Purchase`, `PageView`, `AddToCart`, `ViewContent`, `InitiateCheckout`, custom events). Where most Destination logic lives: forwarding events to third-party APIs, enriching payloads, hashing PII.
- **`edge/user`** — when user identity explicitly changes (login, signup, profile update). Sync identity to a CRM or resolve the user against an external system.
- **`edge/scheduled`** — periodically on a cron schedule (every 5 minutes by default). Batch exports, periodic syncs, cleanup jobs.

### Browser files

Run in the visitor's browser, loaded by the EdgeTag SDK. The right place for anything that needs to touch the page — loading third-party scripts, calling a pixel's browser SDK, reading values from the DOM.

- **`browser/init`** — once on page load. Load third-party scripts (`fbq`, `gtag`, `pintrk`), gated by consent.
- **`browser/tag`** — every tracked event. Call the third-party pixel's tracking API with the event data.
- **`browser/user`** — when user identity changes in the browser. Update the third-party pixel with user data.

> ⚠️ Browser code runs directly on your website. Errors in this code can break site functionality. Test thoroughly before deploying.

### API endpoints

A Destination can expose its own HTTP endpoints on your EdgeTag domain. Add them from the Playground UI, one file per endpoint.

- **CDN APIs** — browser-callable, no authentication. First-party endpoints your site/app needs to hit directly (e.g. `/api/subscribe`, `/api/consent-preferences`). Routed at `/providers/playground/{endpointName}`.
- **Server APIs** — authenticated server-only. Receive `params.currentUser` with the authenticated user. Admin-only or server-to-server integrations. Routed at `/providers/playground/server-api/{endpointName}`.

Both endpoint types have access to your Variables and Infrastructure bindings — but not to `requestHandler` or identity-graph helpers.

## Capabilities at a glance

From Destination code, you can:

- Make outbound HTTP requests through `params.requestHandler`
- Read and write the EdgeTag identity graph via `params.userSave`, `params.userGet`, and `params.providerSave`
- Persist state in a **D1** database, **KV** store, **R2** bucket, or **Analytics Engine** dataset (`params.infra.<BINDING>`)
- Run **scheduled** jobs on a cron (`edge/scheduled`)
- Load and initialize third-party scripts in the browser, with full consent awareness
- Expose **custom HTTP endpoints** (authenticated server APIs and browser-callable CDN APIs) on your EdgeTag domain

## Variables and Infrastructure

- **Variables** (non-sensitive) and **Secrets** (sensitive) are managed in the **Variables** tab. Both are exposed at `params.secrets.NAME` server-side. Tick **"also include on client"** to expose to the browser. Variable names are used verbatim — what you type in the UI is what you read in code.
- **Infrastructure** bindings (D1, KV, R2, Analytics Engine) are managed in the **Infrastructure** tab and exposed at `params.infra.<BINDING_NAME>` inside every edge file and API handler.

> Anything you flag as client-side is shipped to every visitor's browser and is effectively public. Only mark public pixel IDs, feature flags, or public URLs. Never expose private API keys or signing secrets.

See [api-reference.md](./api-reference.md) for the full `params.*` shape per file and [patterns.md](./patterns.md) for worked examples.

## Simulation

Click **Simulate** in the Playground UI to run your code in an isolated sandbox against a realistic sample event:

1. Playground takes the current code from every stage file.
2. Variables are injected as `params.secrets`.
3. Every Infrastructure binding is mocked in memory (D1 captured but not executed; KV/R2 in-memory `Map`; Analytics Engine writes logged).
4. The selected file (default `edge/tag`) runs against the current sample event.
5. All HTTP requests, logs, and thrown errors are captured.

**Nothing leaves the sandbox** — no real API calls, no D1 writes, no R2 uploads.

Three pre-populated sample events are available:

- **Purchase** — full purchase with two line items, value, order ID, and user PII.
- **PageView** — page view with name and category.
- **AddToCart** — single-item add-to-cart with value and currency.

The simulation output has three sections: **Captured requests** (URL, method, headers, body for every `requestHandler` call), **Logs** (everything written with `params.logger.log/error`), and **Error** (if your code threw).

Sensitive header/body keys (`authorization`, `token`, `api-key`, `api_key`, `secret`, `password`, `cookie`) are automatically replaced with `[REDACTED]` in the captured output.

## Lifecycle order

For a single visitor session, files run in this order: `edge/init` (once per session) → `edge/tag` (per event) → `browser/init` (once per page) → `browser/tag` (per event in browser) → `edge/user` and `browser/user` (when identity changes) → `edge/scheduled` (independently, on cron).

When you save, Playground wraps your edge code into a ServiceWorker module and your browser code into an ES module. You don't write the wrappers, imports, or exports yourself — only the function bodies.

## See also

- [api-reference.md](./api-reference.md) — full `params.*` reference for every file
- [gotchas.md](./gotchas.md) — common mistakes and how to avoid them
- [patterns.md](./patterns.md) — worked examples (HTTP forwarding, CDN API, browser pixel, cron export)
