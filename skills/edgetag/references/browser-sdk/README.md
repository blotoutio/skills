# EdgeTag Browser SDK Reference

The browser SDK is the simplest way to add EdgeTag to any website. A single `<script>` tag loads the SDK from your first-party CNAME domain, and the stub pattern lets you call `edgetag()` immediately — before the script even finishes downloading.

## When to Use the Browser SDK

- Traditional server-rendered websites (PHP, Rails, Django, etc.)
- Static sites and landing pages
- CMS platforms (WordPress, Shopify themes, etc.)
- Quick integration without build tools
- Any project where you add code via HTML `<script>` tags

For React/Vue/Angular SPAs, npm/headless projects, or server-side implementations, see [npm-sdk/](../npm-sdk/README.md) instead.

## Installation

Add two snippets to your HTML `<head>`:

```html
<!-- 1. Stub + init -->
<script>
  window.edgetag =
    window.edgetag ||
    function () {
      ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
    }
  edgetag('init', { edgeURL: 'https://d.mysite.com' })
</script>

<!--2. Load EdgeTag from your first-party domain -->
<script src="https://d.mysite.com/load" async></script>
```

Replace `d.mysite.com` with your actual CNAME subdomain.

### What Each Part Does

| Part                          | Purpose                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `<script src="…/load" async>` | Downloads the SDK bundle (includes all configured channel pixels) without blocking page render |
| `window.edgetag = …`          | Creates a stub function that queues calls until the real SDK loads                             |
| `edgetag('init', { … })`      | Queues initialization so it runs as soon as the SDK is ready                                   |

## The Stub Pattern

The stub function is critical — it lets you call `edgetag()` anywhere on the page without waiting for the SDK to download:

```javascript
// These calls are queued in edgetag.stubs[]
edgetag('init', { edgeURL: 'https://d.mysite.com' })
edgetag('user', 'email', 'user@example.com')
edgetag('tag', 'PageView')

// Once the SDK loads, all queued calls are replayed in order
```

Always include the stub before any `edgetag()` calls. Without it, you'll get `edgetag is not a function` errors.

## Quick Start

```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      // Stub function (required before SDK loads)
      window.edgetag =
        window.edgetag ||
        function () {
          ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
        }

      // Initialize EdgeTag
      edgetag('init', {
        edgeURL: 'https://d.mysite.com',
      })

      // Track a page view
      edgetag('tag', 'PageView')
    </script>
    <script src="https://d.mysite.com/load" async></script>
  </head>
  <body>
    <script>
      // Set user identity (if known from server-side template)
      edgetag('user', 'email', 'user@example.com')
    </script>
  </body>
</html>
```

## Key Concepts

### First-Party Domain (CNAME)

EdgeTag loads from your own subdomain (e.g., `d.mysite.com`), not a third-party domain. This:

- Complies with third-party cookie restrictions (ITP, ETP)
- Sets a first-party `tag_user_id` cookie for persistent visitor identification
- Improves data matching with advertising platforms

### Async Loading

The `async` attribute on the script tag ensures EdgeTag never blocks page render. Combined with the stub pattern, your page loads at full speed while EdgeTag initializes in the background.

### Consent Management

By default, events are blocked until user consent is granted. Your CMP should call:

```javascript
edgetag(
  'consent',
  { facebook: true, googleAdsClicks: true },
  { advertising: true, analytics: true },
)
```

### Browser Pixels

With the script tag approach, browser pixels (Meta, Google Ads, TikTok, etc.) are loaded automatically via the `/load` endpoint — no extra installation needed. The EdgeTag dashboard controls which pixels are bundled.

## Documentation Structure

- **[README.md](README.md)** — This overview and quick start (you are here)
- **[api-reference.md](api-reference.md)** — All 11 functions with script tag signatures, browser events, TypeScript types
- **[patterns.md](patterns.md)** — Script tag patterns, beacon/sync mode, CMP integration, testing checklist
- **[gotchas.md](gotchas.md)** — Common mistakes with script tag installations and how to avoid them
