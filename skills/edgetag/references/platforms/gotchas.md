# Platform Integration Gotchas

Common mistakes that break platform integrations.

---

## 1. Not Enabling App Embed for Shopify

**The Problem**:
You install the EdgeTag app but don't enable App Embed. The App Pixel (enabled by default) captures most events, but PageView, Lead, and upper-funnel PII capture are missing.

**What Happens**:

- App installed and authenticated
- App Pixel fires conversion events (ViewContent, AddToCart, Purchase, etc.)
- But no PageView or Lead events fire
- Upper-funnel PII (email, phone from forms) not captured
- Incomplete funnel data in analytics

**Why It Fails**:
Shopify requires explicit App Embed permission in the theme. The App Pixel handles conversion events automatically, but App Embed is needed for PageView, Lead, and PII capture on the upper funnel.

**Fix**:

1. Go to Shopify Admin → Themes
2. Click "Customize" on active theme
3. Find "App Embeds" section in sidebar
4. Toggle "EdgeTag" ON
5. Save theme
6. Verify PageView events appear in dashboard

**Prevention**:

- Add to Shopify setup checklist: "Enable App Embed"
- Take screenshot showing App Embed enabled
- Verify both App Pixel events (conversions) and App Embed events (PageView, Lead) are flowing
- Monitor Meta Events Manager on first day for complete funnel data

---

## 2. Re-initializing SDK on SPA Navigation

See [browser-sdk/gotchas.md § Re-initializing on SPA Navigation](../browser-sdk/gotchas.md).

---

## 3. Using Default Import Instead of Named Imports

See [npm-sdk/gotchas.md § Using Default Import Instead of Named Import](../npm-sdk/gotchas.md).

---

## 4. Loading SDK via Google Tag Manager (GTM)

See [browser-sdk/gotchas.md § Using Google Tag Manager (GTM) to Load EdgeTag](../browser-sdk/gotchas.md).

---

## 5. Not Setting Server-Side Cookie for Headless Sites

See [identity/gotchas.md § Not Creating Server-Side Cookie for Headless Sites](../identity/gotchas.md).

---

## 6. Missing npm Packages on Headless Platforms

See [npm-sdk/gotchas.md § Not Installing Provider npm Packages](../npm-sdk/gotchas.md).

---

## 7. Not Setting Up CRM Connection for No-Code Platforms

**The Problem**:  
You install Shopify/BigCommerce/SFCC app but don't set up CRM connection. Orders from other channels don't sync to CRM.

**Affected Platforms**:

- Shopify
- BigCommerce
- Salesforce Commerce Cloud

**What Happens**:

- Conversion tracking works (pixels fire)
- But orders from some channels don't appear in CRM
- CRM stays out of sync with ecommerce

**Why CRM Connection Matters**:  
Apps check orders every 15 minutes and sync to CRM (Salesforce, HubSpot, etc.). Without connection, some orders could be missed.

**Fix**:

1. Go to EdgeTag dashboard → Integrations → CRM
2. Select CRM type (Salesforce, HubSpot, etc.)
3. Authorize CRM (OAuth flow)
4. Save
5. Verify order appears in CRM within 15-30 min

**Prevention**:

- Add to setup checklist: "Configure CRM connection"
- Test with test order, verify appears in CRM
- Monitor CRM sync status in dashboard
- Alert team if sync fails

---

## 8. Theme Compatibility Issues (WordPress/WooCommerce)

**The Problem**:
WordPress/WooCommerce plugin installed, but theme doesn't load EdgeTag script due to incompatibility.

**What Happens**:

- Plugin installed and activated
- But script tag doesn't appear in HTML
- Some themes have custom header logic that conflicts
- Pixel never fires

**Why It Happens**:
Some WordPress themes override the standard script loading mechanism. Plugin can't inject script.

**Fix**:  
The EdgeTag WordPress plugin supports standard plugin hooks, so this issue has been resolved for themes that follow WordPress plugin standards. Update the EdgeTag plugin to the latest version from [https://wordpress.org/plugins/blotout-edgetag](https://wordpress.org/plugins/blotout-edgetag).

**Prevention**:

- Keep the EdgeTag plugin updated to the latest version
- Use a theme that supports standard WordPress plugin hooks
- Monitor browser dev tools to verify script tag present

---

## 9. Event Validation Not Removed from Production

See [channels/gotchas.md § Payload Validator Left in Production](../channels/gotchas.md).

---

## 10. CRM Connection API Key Expired

**The Problem**:
CRM connection was set up weeks ago, but the API key expired. Orders no longer sync to CRM. You don't notice until customers complain.

**What Happens**:

- Orders are generated normally
- Pixels fire correctly
- But CRM sync starts failing silently
- Orders stop appearing in CRM
- Sales team operates without data
- No alert fires

**Fix**:

1. Go to EdgeTag dashboard → Integrations → CRM
2. Click "Re-authorize" or "Refresh Token"
3. Complete OAuth flow again
4. Verify orders sync within 15 min

**Prevention**:

- Set calendar reminder: "Refresh CRM API keys" every 6 months
- Monitor CRM sync status in dashboard
- Alert if sync failures detected
- Document API key rotation process

---

## Quick Checklist Before Deployment

### Shopify

- App installed and authenticated
- App Pixel active (enabled by default — captures conversion events)
- App Embed enabled in theme (for PageView, Lead, and upper-funnel PII)
- Channels configured with credentials
- CRM connection tested (optional)

### BigCommerce/SFCC

- App installed
- Domain configured in EdgeTag
- Channels enabled with credentials

### WooCommerce/WordPress

- Plugin installed and activated
- Script tag present in HTML (verify with dev tools)
- Channels configured
- Test order created and validated

### React/Next.js/Vue

- All npm packages installed (`npm ls | grep @blotoutio`)
- SDK initialized once per app mount (not on route change)
- Using named imports (not default import)
- Server-side cookie set (if headless)
- Payload Validator disabled
- Event structure validated against channel requirements

### All Platforms

- Payload Validator disabled in production
- First test order/event tracked
- Data appears in channel dashboards within 5 min
- CRM sync working (if applicable)
- Monitoring/alerting configured

