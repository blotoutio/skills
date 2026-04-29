# Playground

Playground lets you write custom code inside the EdgeTag ecosystem — either to build entirely new channels (Destinations) or to reshape events flowing through existing ones (Transformations) — directly from the Playground UI. Code runs at the EdgeTag edge (Cloudflare Workers) and in the browser, with a built-in simulation runtime that replays sample events through your code before you deploy.

EdgeTag ships with dozens of pre-built channels (Meta CAPI, Google Ads, Klaviyo, TikTok, etc.). Playground exists for the cases the catalog doesn't cover — an in-house analytics tool, a bespoke identity rule, a per-channel payload tweak, a first-party API endpoint on your own domain, or a nightly export to your warehouse.

## Two options

| Option                              | What it does                                                                                                                                                                                                                 | Use it when…                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [Destination](./destination/)       | Build a new integration from scratch. Send events to a third-party API, expose a custom first-party endpoint on your domain, persist data in D1/KV/R2, run cron jobs. HTTP requests, identity-graph access, scheduled tasks. | Creating a **new** endpoint or integration.      |
| [Transformation](./transformation/) | Reshape events already flowing through existing channels. Drop events, enrich payloads, rename events conditionally, fan out additional events. Pure event transforms — no HTTP, no storage, no identity-graph writes.       | Modifying events going to **existing** channels. |

**Rule of thumb:** new endpoint/integration → Destination. Modify events for existing channels → Transformation.

## What you can build

- A custom pixel for an in-house attribution tool
- A warehouse webhook that mirrors every Purchase into BigQuery via a forwarding service
- Cross-domain ID stitching that reads a cookie on one domain and writes it on another
- A SHA-256 PII hashing policy applied uniformly across every outgoing event
- Dropping `PageView` events from going to paid-media channels while keeping them in analytics
- Conditional event fan-out (e.g. emit `Purchase_Facebook` when the user's last paid-media click was Facebook)
- A first-party `/api/subscribe` endpoint backed by D1
- A nightly export that dumps yesterday's events to R2 as CSV

## How it works

1. **Describe what you want** — the Playground agent turns plain-English prompts into code for the relevant files.
2. **Edit in the code editor** — every file is editable directly; the agent's output is a starting point.
3. **Simulate** — pick a sample event (`Purchase`, `PageView`, `AddToCart`) and run your code in an isolated sandbox. Every HTTP request, log line, and return value is captured.
4. **Save** — saving deploys your code to your EdgeTag edge. There is no separate publish step.

## Folder index

| Folder                               | Contents                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [destination/](./destination/)       | [README](./destination/README.md), [api-reference](./destination/api-reference.md), [gotchas](./destination/gotchas.md), [patterns](./destination/patterns.md)             |
| [transformation/](./transformation/) | [README](./transformation/README.md), [api-reference](./transformation/api-reference.md), [gotchas](./transformation/gotchas.md), [patterns](./transformation/patterns.md) |

## Cross-references

- **Channels** — Destinations complement the built-in channels in [channels/](../channels/); Transformations modify events before channels receive them.
- **Events** — Both work with the events documented in [events/standard-events.md](../events/standard-events.md); Transformations can drop or fan out events.
- **Identity / user data** — Destinations can read/write the identity graph (see [identity/](../identity/)).
- **HTTP API** — Destinations can call out via `requestHandler` and expose Server APIs; see also [http-api/](../http-api/).
- **Consent** — Browser code can gate logic with `params.consentData.categories` (see [consent/](../consent/)).
