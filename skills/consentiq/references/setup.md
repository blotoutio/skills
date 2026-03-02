# ConsentIQ Setup & Installation

## Overview

ConsentIQ is a consent analytics channel that must be added to your EdgeTag domain before you can collect consent data or view analytics. There are two ways to add it:

1. **Shopify App** — Install from the Shopify App Store (Shopify stores only)
2. **Manual Setup** — Contact Blotout support to add the channel, then integrate via the EdgeTag API or SDK

## Method 1: Shopify App (Shopify Stores)

Install the ConsentIQ Shopify app from the App Store:

**https://apps.shopify.com/blotout-consentiq**

The app:

- Adds the ConsentIQ channel to your EdgeTag domain automatically
- Installs a Shopify app embed block that handles consent collection
- Reads consent from Shopify's Customer Privacy API (`window.Shopify.customerPrivacy`)
- Also detects consent from OneTrust and Osano if present
- Sends consent data to ConsentIQ on each new session and on consent changes

After installing, enable the app embed in your Shopify theme (Online Store → Themes → Customize → App embeds → enable "Blotout ConsentIQ").

No additional code is needed — the app embed handles everything.

## Method 2: Manual Setup (Non-Shopify or Custom Integration)

For non-Shopify sites or when you want full control:

### Step 1: Request ConsentIQ Channel

Contact Blotout support (`support@blotout.io`) to add a ConsentIQ channel to your EdgeTag domain. They will configure the channel and provide the `scriptId`.

Alternatively, if you have white-label API access, add the channel via the API:

```bash
curl --request POST \
  --url https://api.edgetag.io/v1/script \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {token}' \
  --header 'Team-Id: {team_id}' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "ConsentIQ",
    "providerId": "consentIQ",
    "tagId": "{tagId}",
    "shouldDeploy": true,
    "consentCategory": "necessary"
  }'
```

### Step 2: Integrate Consent Collection

Once the ConsentIQ channel is active, you need to send consent data from the browser. ConsentIQ collects consent via a POST request to your EdgeTag first-party domain:

```
POST https://{your-edgetag-domain}/providers/consentIQ/save-data
Content-Type: application/json
credentials: include  (important — sends the EdgeTag cookie)
```

#### Request Body

```json
{
  "analyticsAllowed": "1",
  "marketingAllowed": "0",
  "saleOfDataAllowed": "unknown",
  "preferencesAllowed": "1",
  "saleOfDataRegion": "0"
}
```

| Field                | Values                    | Description                                        |
| -------------------- | ------------------------- | -------------------------------------------------- |
| `analyticsAllowed`   | `"1"`, `"0"`, `"unknown"` | Analytics consent status                           |
| `marketingAllowed`   | `"1"`, `"0"`, `"unknown"` | Marketing/advertising consent status               |
| `saleOfDataAllowed`  | `"1"`, `"0"`, `"unknown"` | Sale of data consent (CCPA)                        |
| `preferencesAllowed` | `"1"`, `"0"`, `"unknown"` | Preferences/functional consent                     |
| `saleOfDataRegion`   | `"1"`, `"0"`, `"unknown"` | Whether user is in a sale-of-data regulated region |

Values: `"1"` = allowed, `"0"` = disallowed, `"unknown"` = not yet determined.

#### When to Send

- **On new session**: Send the current consent state when a user first arrives
- **On consent change**: Send updated consent whenever the user updates their preferences (e.g., via your CMP or consent banner)

### Step 3: Implementation Example

Complete browser-side integration that works with any CMP:

```html
<script>
  // After EdgeTag SDK is initialized and your CMP has loaded:

  async function sendConsentToConsentIQ(consentData) {
    const body = {
      analyticsAllowed: "unknown",
      marketingAllowed: "unknown",
      saleOfDataAllowed: "unknown",
      preferencesAllowed: "unknown",
      ...consentData,
    };

    await fetch("https://d.yoursite.com/providers/consentIQ/save-data", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  }

  // On new session — read consent from your CMP and send
  window.addEventListener("edgetag-initialized", async (e) => {
    if (!e.detail.session.isNewSession) return;

    sendConsentToConsentIQ({
      analyticsAllowed: getAnalyticsConsent(), // your CMP logic
      marketingAllowed: getMarketingConsent(),
      saleOfDataAllowed: getSaleOfDataConsent(),
      preferencesAllowed: getPreferencesConsent(),
    });
  });

  // On consent change — send updated values
  // Hook into your CMP's consent-change callback:
  yourCMP.onConsentChange((consent) => {
    sendConsentToConsentIQ({
      analyticsAllowed: consent.analytics ? "1" : "0",
      marketingAllowed: consent.marketing ? "1" : "0",
      saleOfDataAllowed: consent.saleOfData ? "1" : "0",
      preferencesAllowed: consent.preferences ? "1" : "0",
    });
  });
</script>
```

Replace `d.yoursite.com` with your EdgeTag first-party subdomain.

## CMP-Specific Integrations

The Shopify app embed includes built-in support for reading consent from these CMPs:

### Shopify Customer Privacy API

```javascript
const consent = {
  analyticsAllowed: window.Shopify.customerPrivacy.analyticsProcessingAllowed()
    ? "1"
    : "0",
  marketingAllowed: window.Shopify.customerPrivacy.marketingAllowed()
    ? "1"
    : "0",
  saleOfDataAllowed: window.Shopify.customerPrivacy.saleOfDataAllowed()
    ? "1"
    : "0",
  preferencesAllowed:
    window.Shopify.customerPrivacy.preferencesProcessingAllowed() ? "1" : "0",
  saleOfDataRegion: window.Shopify.customerPrivacy.saleOfDataRegion()
    ? "1"
    : "0",
};
```

Listen for changes via the `visitorConsentCollected` event:

```javascript
document.addEventListener("visitorConsentCollected", (event) => {
  sendConsentToConsentIQ({
    analyticsAllowed: event.detail.analyticsAllowed ? "1" : "0",
    marketingAllowed: event.detail.marketingAllowed ? "1" : "0",
    saleOfDataAllowed: event.detail.saleOfDataAllowed ? "1" : "0",
    preferencesAllowed: event.detail.preferencesAllowed ? "1" : "0",
  });
});
```

### OneTrust

Read consent from the `OptanonConsent` cookie:

```javascript
function getOnetrustConsent() {
  const cookie = document.cookie.match(/(^| )OptanonConsent=([^;]+)/);
  if (!cookie || cookie.length < 3) return null;

  const match = decodeURIComponent(cookie[2]).match(/&groups=([^&]+)/);
  if (!match || match.length < 2) return null;

  const groups = match[1].split(",");
  return {
    analyticsAllowed:
      groups.includes("C0002") || groups.includes("2") ? "1" : "0",
    marketingAllowed:
      groups.includes("C0004") ||
      groups.includes("4") ||
      groups.includes("C0005") ||
      groups.includes("5")
        ? "1"
        : "0",
    preferencesAllowed:
      groups.includes("C0003") || groups.includes("3") ? "1" : "0",
  };
}
```

### Osano

```javascript
function getOsanoConsent() {
  return {
    analyticsAllowed: Osano.cm.analytics ? "1" : "0",
    marketingAllowed: Osano.cm.marketing ? "1" : "0",
    preferencesAllowed: Osano.cm.personalization ? "1" : "0",
    saleOfDataAllowed: Osano.cm.optOut ? "0" : "1",
  };
}
```

## Verifying Setup

After integration, verify ConsentIQ is working:

1. **Check channel exists**: Call the `domains` MCP tool or `GET /user/overview` API. Look for a channel with `providerId: "consentIQ"` under your domain
2. **Visit the site**: Open the website and interact with the consent banner
3. **Check analytics after 15–30 min**: Use `consentIQOverview` MCP tool or `GET /{scriptId}/analytics/overview` API to see if profiles are being tracked
4. **Verify categories**: Use `consentIQCategories` with `range: "day"` to see the category breakdown
