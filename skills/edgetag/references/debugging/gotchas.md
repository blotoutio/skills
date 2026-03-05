# EdgeTag Debugging Gotchas

Common mistakes to avoid during EdgeTag implementation and troubleshooting.

## DNS Assumption Mistakes

### Assuming DNS Propagated Instantly

**Problem:** Testing immediately after updating DNS records. DNS needs global propagation time; local cache might not reflect changes.

**Impact:** Verification fails, events don't arrive, testing inconclusive.

**Fix:** Wait 5-10 minutes before first test, use [dnschecker.org](https://dnschecker.org) to verify globally, allow up to 24 hours. For DNS flush commands and step-by-step diagnosis, see **troubleshooting-guide.md** → DNS Issues.

### Not Checking DNS Propagation Before Debugging

**Problem:** Troubleshooting events not arriving before verifying DNS. Wastes time on wrong issues and leads to wrong conclusions.

**Fix:** Always verify DNS first before debugging anything else. For nslookup commands and full DNS troubleshooting steps, see **troubleshooting-guide.md** → DNS Issues.

## Consent State Mistakes

### Not Checking Consent Before Assuming Event Issue

**Problem:** Event not firing but cause is actually consent being blocked. Tracking code is correct but user rejected consent — events are silently blocked, looks like an implementation bug.

**Impact:** Time wasted debugging the wrong thing.

**Fix:** Always check consent state first:

```javascript
edgetag('getConsent', (consent, error, categories) => {
  console.log('Provider consent:', consent)
  console.log('Category consent:', categories)
})
```

Grant all consent and retest. If it works with consent, the issue is consent — not event handling.

### Initializing Consent After EdgeTag

**Problem:** EdgeTag script loads before consent manager. First events go out before consent is checked — GDPR/CCPA violation.

**Impact:** Data sent without consent, compliance issues, potential fines.

**Fix:** Load consent manager FIRST, EdgeTag SECOND. Verify the script ordering in your HTML. See the consent reference folder for integration examples.

### Not Formatting PII Correctly

**Problem:** Email has uppercase or spaces, phone has dashes. EdgeTag attempts to normalize PII but best-effort conversion can't fix everything.

**Impact:** Lower EMQ scores, degraded conversion matching, edge cases not fixable automatically.

**Recommended formats:** Email: lowercase, trimmed (`user@example.com`). Phone: E.164, digits only with country code (`+14155551234`). Names: lowercase, letters only (`john`). See the events reference for full formatting details and code examples.

## Beacon Request Visibility

### Beacon Requests Are Invisible to Standard Debugging Tools

**Problem:** Events sent with `method: 'beacon'` (e.g., AddToCart before redirect, Purchase before navigation, page unload events) use `navigator.sendBeacon()`, which does NOT appear in:

- Chrome DevTools Performance Resource Timing API
- Standard XHR/Fetch network filters
- Chrome MCP / Puppeteer resource timing captures
- Most automated testing and monitoring tools

This means an AI assistant using Chrome MCP, a developer filtering Network tab by XHR, or any tool relying on `performance.getEntriesByType('resource')` will **miss beacon requests entirely** and incorrectly conclude events aren't firing.

**Impact:** False negatives during debugging — events are actually firing but appear missing because the debugging tool can't see them.

**How to detect beacon requests:**

1. **Chrome DevTools Network tab** — beacon requests DO appear here, but only if you filter by **All** or **Ping** type (not XHR/Fetch). Look for requests with type "ping" to your edge domain.

2. **Intercept `navigator.sendBeacon`** — Override the function to log calls:

```javascript
const originalBeacon = navigator.sendBeacon.bind(navigator)
navigator.sendBeacon = function (url, data) {
  console.log('[EdgeTag Beacon]', url, JSON.parse(data))
  return originalBeacon(url, data)
}
```

3. **Chrome MCP / Puppeteer** — If using browser automation tools, you must intercept beacon calls via CDP (Chrome DevTools Protocol) network events or by injecting the override above before the page loads. The Performance Resource Timing API will not capture them.

4. **Server-side verification** — Check the EdgeTag dashboard or use `domainAnalytics` via MCP to verify the event was received, rather than relying on client-side network observation.

**When to suspect this issue:** If events that fire during navigation (AddToCart → redirect to cart, Purchase → redirect to confirmation, page unload) appear missing in debugging but other non-navigation events work fine, the missing events are likely using beacon and your debugging tool isn't capturing them.

---

## Debugging Methodology Mistakes

### Changing Multiple Things at Once

**Problem:** Changed DNS, consent, AND tracking code simultaneously. Now it works but you don't know why — can't reproduce or fix if it breaks again.

**Fix:** Change ONE thing at a time. Test after each change. Document what changed and why.

### Not Isolating the Problem

**Problem:** Testing entire system when only one layer is broken (e.g., events fire but don't deliver — issue is channel, not events).

**Fix:** Break into layers and test each separately: (1) Network: events reach EdgeTag, (2) Processing: Payload Validator passes, (3) Channel: channel receives events, (4) Attribution: provider processes events. Fix from bottom up.

## Provider-Specific Mistakes

### Missing npm Package for Headless Implementation

**Problem:** Using headless/server-side implementation without required browser SDK packages. Events fail silently.

**Impact:** Server-side events not delivered, conversion tracking fails.

**Fix:** Install provider packages for headless:

```bash
# For Meta browser pixel
npm install @blotoutio/providers-facebook-sdk

# For Google Ads browser pixel
npm install @blotoutio/providers-google-ads-clicks-sdk
```

Pass providers to `init()`: `init({ edgeURL: '...', providers: [facebook, googleAds] })`. Server-side delivery (Meta CAPI, Google) is handled by EdgeTag automatically — no extra packages needed. For the full list of available provider packages, see [Channel Reference](../channels/channel-reference.md).

### Not Testing Provider Credentials

**Problem:** Entered provider credentials but didn't verify they work. Won't be noticed until events fail at volume.

**Fix:** After entering credentials, test immediately — send a test event, verify it appears in the provider dashboard. Re-test credentials every 90 days for rotation.

### Assuming All Providers Need Same PII

**Problem:** Different providers have different minimum PII requirements. Some channels work, others silently fail.

**Fix:** Check each provider's requirements: Meta (email, phone, or GAID), Google (email for conversion tracking), TikTok (email or GAID), LinkedIn (email or LinkedIn ID). Test per provider.

## Real-Time Monitoring Mistakes

### Ignoring Anomalies in Dashboard

**Problem:** Dashboard shows anomaly (e.g., traffic spike at 3 AM) but it gets ignored. Could be bot traffic, a campaign launch, or an implementation bug.

**Fix:** Investigate all anomalies promptly. Document each with an explanation — they're either legitimate, a traffic issue, or an implementation issue.

### Testing with Real Customer Data

**Problem:** QA testing used real customer data — privacy violation, GDPR breach, test events polluting real analytics.

**Fix:** Always use test/staging environments with synthetic data. Never use real customer data for testing. Clean up test data after testing.

For the full pre-launch checklist, see **patterns.md** → Implementation QA Checklist and Pre-Launch Validation Workflow.
