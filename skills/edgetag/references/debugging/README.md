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

### 5. Live Log Streaming

**When to use:** Real-time server-side event monitoring

- Watch events as they arrive at EdgeTag edge
- See which events reach which channels
- Monitor delivery status
- Check timestamp accuracy
- View error messages

**Best for:** Real-time troubleshooting, validating server-side setup

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

