# Channel Integration Gotchas

Common mistakes that break channel integrations. Reference this before launching.

---

## 1. Missing NPM Packages for Browser Pixels

See [npm-sdk/gotchas.md § Not Installing Provider npm Packages](../npm-sdk/gotchas.md).

---

## 2. Wrong Channel Names in Consent/Providers Arrays

**The Problem**:
You use incorrect channel names in your providers array or consent settings. Events never reach those channels.

**Examples of Mistakes**:

```javascript
// WRONG
{ providers: ['facebook', 'google-ads', 'tiktok'] }

// CORRECT
{ providers: [facebook, googleAdsClicks, tiktok] }

// WRONG
consent: { 'google_ads': true }

// CORRECT
consent: { 'googleAdsClicks': true }
```

**What Happens**:

- Events generated successfully
- SDK initializes without error
- Dashboard shows channel enabled
- But events routed to wrong channel names
- Events silently lost or go to fallback

**Why Channel Names Matter**:
EdgeTag uses exact channel names to route events. A typo breaks the entire flow:

- `google-ads` ≠ `googleAdsClicks`
- `meta` ≠ `facebook`
- `tiktok` is correct, but lowercase variants fail

**Fix**:
Use exact names from SDK documentation:

- `facebook` (not `meta`, `facebook-ads`, `fb`)
- `googleAdsClicks` (not `google-ads`, `google_ads`, `google-ads-clicks`)
- `tiktok` (not `tiktok-pixel`, `tt`)
- `klaviyo` (not `klaviyo-api`)
- `googleAnalytics4` (not `ga4`, `google-analytics`)

**Prevention**:

- Copy-paste channel names from channel-reference.md
- Run a linter to catch typos: `grep -r "providers:" src/`
- Add TypeScript types for channel names (optional but recommended)
- Test event flow in staging before production

---

## 3. Payload Validator Left in Production

**The Problem**:
You enable the `payloadValidator` channel during implementation for debugging, then forget to disable it.

**What Happens**:

- `payloadValidator` validates every event payload and logs results
- It does **not** block event delivery or affect performance
- However, it adds noise to error logs and error tables
- Real issues become harder to spot among validation output

**Why It Matters**:
The `payloadValidator` channel is for implementation only. It serves no purpose in production. While it won't break anything, the extra noise in logs and error tables makes monitoring and debugging harder.

**Symptoms**:

- Error logs cluttered with validation entries
- Harder to identify real channel delivery issues
- Unnecessary entries in error dashboards

**Fix**:
Remove `payloadValidator` from channel list in EdgeTag dashboard immediately.

**Prevention**:

- Add validation step to deployment checklist: "Confirm payloadValidator is disabled"
- Add automated check in CI/CD: flag if payloadValidator appears in production config
- Use separate dashboard configurations for staging vs production
- Review channel list before every production deploy

---

## 4. Google Ads Missing Conversion Actions

**The Problem**:
You set up the `googleAdsClicks` channel but forget to define conversion actions in Google Ads. Events send successfully but go nowhere because conversion actions don't exist.

**What Happens**:

- `googleAdsClicks` channel enabled in EdgeTag
- Events sent to Google Ads API
- Google Ads rejects events: "Unknown conversion action"
- Conversion tracking fails silently
- No data appears in Google Ads dashboard

**Why Conversion Actions Required**:
Google Ads API requires a valid conversion action ID. Without it, the API rejects all events. EdgeTag cannot create conversion actions; you must do this manually in Google Ads.

**Fix**:

1. Go to Google Ads dashboard
2. Navigate to Tools & Settings → Conversions
3. Create conversion action (or find existing action ID)
4. Copy conversion action ID
5. Enter action ID in EdgeTag dashboard → Google Ads channel settings

**Prevention**:

- Create conversion actions BEFORE enabling the channel
- Verify conversion action ID in EdgeTag dashboard before deploying
- Test conversion action in staging with test events
- Check Google Ads Conversion Tracking Status page regularly

---

## 5. Browser Pixel Enabled But NPM Package Not Installed

See [npm-sdk/gotchas.md § Not Installing Provider npm Packages](../npm-sdk/gotchas.md).

---

## 6. Duplicate Events From Multiple Integrations to the Same Pixel

See [events/gotchas.md § Sending Duplicate Events](../events/gotchas.md).

---

## 7. Using Default Import Instead of Named Imports

See [npm-sdk/gotchas.md § Using Default Import Instead of Named Import](../npm-sdk/gotchas.md).

---

## Quick Checklist Before Production

- All required npm packages installed (`npm ls | grep @blotoutio/providers`)
- Channel names match exactly (copy from channel-reference.md)
- payloadValidator disabled in dashboard
- Google Ads conversion actions created and IDs verified
- Browser pixels enabled if needed and packages installed
- No other integrations sending same events to same pixel/source ID as EdgeTag
- Event Sink URL tested and responding
- Server-side cookie set for headless sites
- SPA app initializes SDK only once per page load
- Using named imports (not default imports)

