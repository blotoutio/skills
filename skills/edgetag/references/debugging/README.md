# EdgeTag Debugging Reference

Complete reference for validating, testing, and troubleshooting EdgeTag implementations.

## Debugging Tools Overview

EdgeTag provides multiple tools and methods to validate your implementation at different stages:

### 1. Browser Developer Tools

**When to use:** Immediate client-side validation

- Check Network tab for event requests
- Verify event payloads in request body
- Check response status codes
- Monitor Console for errors
- Inspect Cookies for tracking identifier

**Best for:** Developers during implementation, QA during testing

### 2. Chrome DevTools MCP (AI-Assisted Debugging)

**When to use:** Letting an AI agent (Claude, Cursor, etc.) inspect the browser directly during debugging

Add the Chrome DevTools MCP server so the AI agent can see network requests, JavaScript console errors, and page state in real time — without you having to copy-paste from DevTools.

**Setup** — Add to your MCP config:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--no-usage-statistics",
        "--no-performance-crux"
      ]
    }
  }
}
```

**What the agent can do:**
- See EdgeTag network requests to your edge domain (e.g., `d.mysite.com`)
- Read JavaScript console errors and warnings
- Verify event payloads are being sent correctly
- Check if consent is blocking events
- Confirm browser pixels are firing

**Note on beacon requests:** Events sent with `method: 'beacon'` use `navigator.sendBeacon()` and may not appear in standard resource timing captures. See **gotchas.md § Beacon Request Visibility** for how to intercept them.

**Best for:** AI-assisted debugging sessions, automated QA with an AI agent, quickly diagnosing issues without manual DevTools inspection

### 3. Browser Extensions for Channel Validation

**When to use:** Verifying that browser-side signals reach ad platforms correctly

- Install provider-specific extensions to confirm events are firing and payloads are correct
- Useful alongside Network tab — extensions show the provider's interpretation of the signal

**Recommended extensions:**

- **Meta Pixel Helper** (Chrome) — shows Facebook Pixel events, parameters, and errors on each page
- **Google Tag Assistant** (Chrome) — validates Google Ads, GA4, and GTM tags
- **TikTok Pixel Helper** (Chrome) — shows TikTok pixel events and parameters
- **Pinterest Tag Helper** (Chrome) — validates Pinterest tag events
- **Snapchat Pixel Helper** (Chrome) — validates Snap pixel events

**Best for:** Confirming browser-side signals are received by the ad platform, catching parameter mismatches between what EdgeTag sends and what the platform sees

### 4. Payload Validator Channel

**When to use:** Automated payload validation during QA

- Add as temporary channel during testing
- Validates every event payload
- Shows validation errors/warnings
- Displays before channel delivery
- **Remove after testing** — leaving it in production has no performance impact, but it adds noise to error logs and error tables, making real issues harder to spot

**Best for:** Catching payload issues before production, testing transforms

### 5. Live Log Streaming (MCP Logger)

**When to use:** Real-time server-side event monitoring

Use the EdgeTag MCP logger tools for real-time visibility into how EdgeTag processes events on the server side:

1. **`loggerStart`** — Start a session with optional filters: `status` (ok/exception), `events` (e.g. ["Purchase","AddToCart"]), `path` (API endpoint), `method` (POST/GET). Session auto-closes after 5 minutes.
2. **`loggerMessages`** — Poll buffered messages. Each message includes: eventName, method, path, timestamp, outcome, exceptions, per-channel requests (URL, headers, request/response body), meta (payload, userProps, hostData, consent), and uncategorized logs.
3. **`loggerStop`** — End session early and clear buffer.

**What you can see:**
- Events as they arrive at the EdgeTag edge
- Per-channel outbound requests (what EdgeTag sends to Meta, Google, etc.)
- Channel response bodies (success/error from each provider)
- Event metadata: payload, user props, host data, consent state
- Exceptions and error details

**Best for:** Real-time troubleshooting, validating server-side delivery, debugging channel-specific errors

### 6. Live Dashboards

**When to use:** High-level metrics and anomaly detection

- Real-time event volume graph
- Channel delivery status
- User identity stitching metrics
- Consent enforcement metrics
- Traffic patterns and anomalies

**Best for:** Monitoring production health, spotting issues

### 7. EMQ Score Monitoring

**When to use:** Evaluating Meta channel delivery quality

- Metric: Event Match Quality (EMQ)
- Shows percentage of events Meta can match
- Indicates data quality to Meta
- Drives conversion attribution accuracy
- Target: > 10% is good, > 20% is excellent

**Best for:** Meta-specific troubleshooting, optimization

### 8. Event Validator Dashboard

**When to use:** Inspecting individual event details

- Search events by user_id or email
- View complete event payload
- Check timestamp and processing status
- Verify channel delivery
- See transformation applied

**Best for:** Debugging specific user/event issues, consent validation

## Recommended AI-Assisted Debugging Workflow

When debugging event issues with an AI agent, combine all three layers for full visibility across the stack:

| Layer | Tool | What It Shows |
| --- | --- | --- |
| **Client-side** | Chrome DevTools MCP | Network requests leaving the browser, console errors, page state. Note: beacon requests need interception (see gotchas.md). |
| **Server-side (real-time)** | EdgeTag MCP Logger (`loggerStart` → `loggerMessages`) | Event processing, per-channel delivery requests/responses, payload parsing, consent enforcement, exceptions. |
| **Historical** | EdgeTag MCP Analytics (`domainAnalytics`, `domainErrors`, `edgeLakeQuery`) | Event storage verification, error rates over time, channel delivery patterns. |

**Typical flow:**
1. Start the logger with relevant filters (e.g. `events: ["Purchase"]`, `status: "exception"`)
2. Use Chrome DevTools MCP to trigger the action in the browser and confirm the request left
3. Poll `loggerMessages` to see how EdgeTag processed it and what it sent to each channel
4. If the event should have been stored, query Edge Lake or analytics to verify

See [mcp/setup.md](../mcp/setup.md) for MCP setup and tool details.

## Common Issues at a Glance


| Symptom                                  | Likely Cause                                                         | Where to Check                                              |
| ---------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Events not appearing in network tab      | DNS not propagated, wrong subdomain, consent blocked                 | Network tab, DNS check, consent settings                    |
| Events arrive but channels don't deliver | Missing required fields (email), consent not granted, provider error | Payload Validator, consent dashboard, channel logs          |
| EMQ score very low (< 5%)                | Missing PII (email, phone), wrong user ID format, data quality issue | EMQ score, Payload Validator, user profile                  |
| Identity not stitching                   | PII captured too late, different user IDs per session, missing email | Event Validator, user identity metrics, tracking code order |
| DNS verification fails                   | Wrong TXT format, propagation delay, typo in value                   | nslookup, DNS provider UI, EdgeTag dashboard                |
| SSL certificate not issued               | CNAME not pointing correctly, DNS not propagated, waited < 24 hours  | Certificate status, DNS check, nslookup                     |
| Consent not enforcing                    | Consent not initialized before tracking, provider misconfigured      | Consent dashboard, event payloads, tracking code order      |


For detailed monitoring metrics and thresholds, see **patterns.md** → Monitoring Dashboards and Key Metrics sections.

For validation workflows and QA checklists, see **patterns.md** → Pre-Launch Validation Workflow.

For step-by-step troubleshooting, see **troubleshooting-guide.md**.

For common mistakes to avoid, see **gotchas.md**.

