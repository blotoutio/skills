# EdgeTag Consent: Implementation Patterns

## Recommended: Use `all: false` as the Base

When setting both provider and category consent, always start with `all: false` and selectively enable. This ensures new providers/categories default to blocked rather than allowed.

```javascript
const edgeTagConsent = {
  all: false,
  // Then selectively enable based on user's consent choices
  facebook: allowedMarketing,
  googleAdsClicks: allowedMarketing,
  klaviyo: allowedMarketing,
  googleAnalytics4: allowedAnalytics,
};

const edgeTagConsentCategories = {
  all: false,
  necessary: true,
  advertising: allowedMarketing,
  analytics: allowedAnalytics,
};

edgetag('consent', edgeTagConsent, edgeTagConsentCategories);
```

**Why**: Without `all: false`, any provider or category not explicitly listed may inherit a previous consent state or default to allowed. Setting `all: false` first creates a deny-by-default baseline, then you opt in only what the user consented to.

---

## Pattern 1: Shopify Native Consent

**When to use**: Using Shopify's built-in Customer Privacy API (no third-party CMP)

**Goal**: Wire Shopify's native consent to EdgeTag

```javascript
function checkConsent(consent) {
  const saleOfDataRegion = window.Shopify.customerPrivacy.saleOfDataRegion();
  let allowedMarketing = consent.marketing;
  let allowedAnalytics = consent.analytics;

  // In sale-of-data regions (e.g. CCPA), fall back to saleOfData consent
  // if marketing or analytics were not explicitly granted
  if (saleOfDataRegion) {
    if (!allowedMarketing) {
      allowedMarketing = consent.saleOfData;
    }
    if (!allowedAnalytics) {
      allowedAnalytics = consent.saleOfData;
    }
  }

  const edgeTagConsent = {
    all: false,
    facebook: allowedMarketing,
    googleAdsClicks: allowedMarketing,
    klaviyo: allowedMarketing,
    googleAnalytics4: allowedAnalytics,
  };

  const edgeTagConsentCategories = {
    all: false,
    necessary: true,
    advertising: allowedMarketing,
    analytics: allowedAnalytics,
  };

  edgetag('consent', edgeTagConsent, edgeTagConsentCategories);
}

// Apply stored consent on page load
if (window.Shopify.customerPrivacy) {
  checkConsent({
    analytics: window.Shopify.customerPrivacy.analyticsProcessingAllowed(),
    marketing: window.Shopify.customerPrivacy.marketingAllowed(),
    saleOfData: window.Shopify.customerPrivacy.saleOfDataAllowed()
  });
}

// Update when user changes consent via Shopify banner
document.addEventListener('visitorConsentCollected', (event) => {
  checkConsent({
    analytics: event.detail.analyticsAllowed,
    marketing: event.detail.marketingAllowed,
    saleOfData: event.detail.saleOfDataAllowed
  });
});
```

**Shopify Consent API**:

- `window.Shopify.customerPrivacy.marketingAllowed()` — marketing/advertising consent
- `window.Shopify.customerPrivacy.analyticsProcessingAllowed()` — analytics consent
- `window.Shopify.customerPrivacy.saleOfDataAllowed()` — sale of data consent (CCPA)
- `window.Shopify.customerPrivacy.saleOfDataRegion()` — whether user is in a sale-of-data region

**Sale of Data Fallback**: In CCPA regions, if marketing or analytics consent is not explicitly granted, the implementation falls back to `saleOfData` consent. This handles the case where Shopify only surfaces a "Do Not Sell My Data" toggle instead of granular marketing/analytics options.

---

## Pattern 2: OneTrust Integration

**When to use**: Using OneTrust as your CMP

**Goal**: Wire OneTrust consent decisions to EdgeTag

```javascript
// 1. Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// 2. Helper function to parse OneTrust consent
function getConsentFromOneTrust() {
  // OneTrust stores consent as object with group IDs
  const groups = window.OnetrustActiveGroups;

  // Map OneTrust group IDs to EdgeTag providers
  // You need to map your OneTrust group IDs to provider names
  // Example mapping (adjust based on your OneTrust setup):
  const providerMap = {
    'C0001': 'necessary', // These are actually category names
    'C0002': 'performance_cookies', // Map to EdgeTag categories
    'C0003': 'functional_cookies',
    'C0004': 'targeting_cookies'
  };

  // For EdgeTag, use categories instead of provider IDs
  const categories = {
    necessary: groups && groups.includes('C0001'),
    analytics: groups && groups.includes('C0002'),
    functional: groups && groups.includes('C0003'),
    advertising: groups && groups.includes('C0004')
  };

  return { categories };
}

// 3. Set initial consent from OneTrust
function applyConsentFromOneTrust() {
  const consent = getConsentFromOneTrust();
  edgetag('consent', null, consent.categories);
}

// 4. Wire OneTrust callback
window.addEventListener('load', () => {
  // Apply consent on page load
  applyConsentFromOneTrust();

  // Update when user changes consent in OneTrust banner
  if (window.OneTrust && window.OneTrust.OnConsentChanged) {
    window.OneTrust.OnConsentChanged(function() {
      applyConsentFromOneTrust();
    });
  }
});
```

**OneTrust Setup Notes**:

- OneTrust stores active group IDs in `OnetrustActiveGroups`
- Group IDs depend on your OneTrust configuration
- Use OneTrust's API to map group IDs to categories
- Test by opening OneTrust banner and changing settings

---

## Pattern 3: Cookiebot Integration

**When to use**: Using Cookiebot as your CMP

**Goal**: Wire Cookiebot consent decisions to EdgeTag

```javascript
// 1. Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// 2. Helper function to parse Cookiebot consent
function getConsentFromCookiebot() {
  // Cookiebot stores consent in window.Cookiebot.consent
  const consent = window.Cookiebot ? window.Cookiebot.consent : {};

  // Map Cookiebot categories to EdgeTag categories
  const categories = {
    necessary: consent.necessary === true,
    analytics: consent.statistics === true, // Cookiebot calls this "statistics"
    functional: consent.preferences === true, // Cookiebot calls this "preferences"
    advertising: consent.marketing === true // Cookiebot calls this "marketing"
  };

  return { categories };
}

// 3. Set initial consent from Cookiebot
function applyConsentFromCookiebot() {
  const consent = getConsentFromCookiebot();
  edgetag('consent', null, consent.categories);
}

// 4. Wire Cookiebot events
window.addEventListener('load', () => {
  // Apply consent on page load (wait for Cookiebot to be ready)
  if (window.Cookiebot && window.Cookiebot.consent) {
    applyConsentFromCookiebot();
  } else {
    window.addEventListener('CookiebotOnConsentReady', () => {
      applyConsentFromCookiebot();
    });
  }

  // Update when user accepts or declines in Cookiebot banner
  window.addEventListener('CookiebotOnAccept', () => {
    applyConsentFromCookiebot();
  });
  window.addEventListener('CookiebotOnDecline', () => {
    applyConsentFromCookiebot();
  });
});
```

**Cookiebot Consent Object**:

```javascript
window.Cookiebot.consent = {
  necessary: true,      // Always true
  preferences: false,   // Functional/preferences
  statistics: true,     // Analytics/performance
  marketing: false      // Marketing/advertising
}
```

**Verification**:

```javascript
// In browser console
console.log('Cookiebot consent:', window.Cookiebot.consent);
```

---

## Pattern 4: TrustArc Integration

**When to use**: Using TrustArc as your CMP

**Goal**: Wire TrustArc consent decisions to EdgeTag

```javascript
// 1. Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// 2. Helper function to parse TrustArc consent
function getConsentFromTrustArc() {
  // TrustArc stores consent in window.truste object
  if (!window.truste) return {};

  // TrustArc uses a different API
  const preferences = window.truste.cma ? window.truste.cma.data : {};

  const categories = {
    necessary: true, // Always enabled
    analytics: preferences.analytics === true,
    functional: preferences.functional === true,
    advertising: preferences.marketing === true
  };

  return { categories };
}

// 3. Set initial consent
function applyConsentFromTrustArc() {
  const consent = getConsentFromTrustArc();
  edgetag('consent', null, consent.categories);
}

// 4. Wire TrustArc callback
window.addEventListener('load', () => {
  applyConsentFromTrustArc();

  // TrustArc uses different callback mechanism
  if (window.truste && window.truste.cma) {
    window.truste.cma.registerPrefCallback(function() {
      applyConsentFromTrustArc();
    });
  }
});
```

---

## Pattern 5: Osano Integration

**When to use**: Using Osano as your CMP

**Goal**: Wire Osano consent decisions to EdgeTag

```javascript
// 1. Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// 2. Helper function to parse Osano consent
function getConsentFromOsano() {
  // Osano stores preferences in window.osano.cm
  if (!window.osano || !window.osano.cm) return {};

  const preferences = window.osano.cm.getPreferences();

  const categories = {
    necessary: true, // Always enabled
    analytics: preferences.analytics === 'granted',
    functional: preferences.functional === 'granted',
    advertising: preferences.advertising === 'granted',
    share_pii: preferences.marketing === 'granted'
  };

  return { categories };
}

// 3. Set initial consent
function applyConsentFromOsano() {
  const consent = getConsentFromOsano();
  edgetag('consent', null, consent.categories);
}

// 4. Wire Osano callback
window.addEventListener('load', () => {
  applyConsentFromOsano();

  // Osano callback
  if (window.osano && window.osano.cm) {
    window.osano.cm.onPreferenceExpressed(function() {
      applyConsentFromOsano();
    });
  }
});
```

---

## Pattern 6: Simple Accept/Decline Banner

**When to use**: Custom consent banner without a full CMP

**Goal**: Show accept/decline buttons and wire to EdgeTag

```html
<!-- Simple HTML banner -->
<div id="consent-banner" style="position: fixed; bottom: 0; width: 100%; background: #333; color: white; padding: 20px;">
  <p>We use cookies and tracking technologies for analytics and marketing.</p>
  <button id="accept-all">Accept All</button>
  <button id="reject-all">Reject All</button>
  <button id="manage-consent">Manage Preferences</button>
</div>

<script>
// Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// Accept All button
document.getElementById('accept-all').addEventListener('click', () => {
  const consent = {
    all: true
  };

  edgetag('consent', null, consent);
  localStorage.setItem('edgetag-consent', JSON.stringify(consent));
  document.getElementById('consent-banner').style.display = 'none';
});

// Reject All button
document.getElementById('reject-all').addEventListener('click', () => {
  const consent = {
    all: false
  };

  edgetag('consent', null, consent);
  localStorage.setItem('edgetag-consent', JSON.stringify(consent));
  document.getElementById('consent-banner').style.display = 'none';
});

// Manage Preferences button
document.getElementById('manage-consent').addEventListener('click', () => {
  // Show detailed preferences modal
  showPreferencesModal();
});

// Load stored consent
function loadStoredConsent() {
  const stored = localStorage.getItem('edgetag-consent');
  if (stored) {
    const consent = JSON.parse(stored);
    edgetag('consent', null, consent);
    document.getElementById('consent-banner').style.display = 'none';
  }
}

// On page load
window.addEventListener('load', loadStoredConsent);
</script>
```

---

## Pattern 7: Granular Per-Provider Consent

**When to use**: Allowing users to opt in/out of individual providers (Facebook, Google, etc.)

**Goal**: Show checkboxes for each provider

```html
<div id="provider-consent">
  <h3>Marketing Providers</h3>
  <label>
    <input type="checkbox" id="fb-consent" data-provider="facebook"> Facebook
  </label>
  <label>
    <input type="checkbox" id="ga-consent" data-provider="googleAdsClicks"> Google Ads
  </label>
  <label>
    <input type="checkbox" id="kl-consent" data-provider="klaviyo"> Klaviyo
  </label>
  <button id="save-consent">Save Preferences</button>
</div>

<script>
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// Load stored provider consent
function loadStoredProviderConsent() {
  const stored = localStorage.getItem('edgetag-provider-consent');
  if (stored) {
    const consent = JSON.parse(stored);
    edgetag('consent', consent); // Provider-based consent
    updateCheckboxes(consent);
  }
}

function updateCheckboxes(consent) {
  Object.entries(consent).forEach(([provider, enabled]) => {
    const checkbox = document.querySelector(`[data-provider="${provider}"]`);
    if (checkbox) checkbox.checked = enabled;
  });
}

// Save button
document.getElementById('save-consent').addEventListener('click', () => {
  const consent = {};

  document.querySelectorAll('[data-provider]').forEach(checkbox => {
    consent[checkbox.dataset.provider] = checkbox.checked;
  });

  edgetag('consent', consent);
  localStorage.setItem('edgetag-provider-consent', JSON.stringify(consent));
  alert('Preferences saved');
});

// On page load
window.addEventListener('load', loadStoredProviderConsent);
</script>
```

---

## Pattern 8: Category-Based Consent from CMP

**When to use**: User selects consent by category (analytics, marketing, etc.) instead of individual providers

**Goal**: Convert CMP categories to EdgeTag consent

```javascript
// Initialize EdgeTag
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// User selects categories from form
document.getElementById('category-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const categories = {
    necessary: true, // Always checked
    advertising: document.getElementById('ad-category').checked,
    analytics: document.getElementById('analytics-category').checked,
    functional: document.getElementById('functional-category').checked,
    share_pii: document.getElementById('pii-category').checked
  };

  // Set category-based consent
  edgetag('consent', null, categories);

  // Store for next visit
  localStorage.setItem('edgetag-categories', JSON.stringify(categories));

  alert('Consent preferences saved');
});

// Load stored categories
function loadStoredCategories() {
  const stored = localStorage.getItem('edgetag-categories');
  if (stored) {
    const categories = JSON.parse(stored);
    edgetag('consent', null, categories);
  }
}

window.addEventListener('load', loadStoredCategories);
```

---

## Pattern 9: disableConsentCheck for Non-GDPR Regions

**When to use**: Site only in non-GDPR/CCPA regions

**Goal**: Skip consent gating, send events immediately

```javascript
// US-only site: no GDPR/CCPA requirements
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true // Events sent without consent
});

// Events now sent immediately
edgetag('tag', 'Purchase', { value: 99.99 }); // Sent

// Still good to track consent for UI/CMP purposes
edgetag('getConsent', (consent) => {
  console.log('User consent for reporting:', consent);
});
```

---

## Pattern 10: Geo-Based Consent Logic

**When to use**: Different consent requirements by region (GDPR in EU, CCPA in CA, etc.)

**Goal**: Apply different consent rules based on user location

```javascript
// Detect user location (via IP or other means)
async function getUserCountry() {
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();
  return data.country_code;
}

// Initialize based on location
async function initEdgeTagWithLocation() {
  const country = await getUserCountry();

  const config = {
    edgeURL: 'https://d.mysite.com'
  };

  // GDPR region: require consent
  if (['DE', 'FR', 'IT', 'AT', 'BE', 'NL', 'ES', 'IE', 'PL', 'SE'].includes(country)) {
    // Don't set disableConsentCheck (keep default: consent required)
  }
  // CCPA region: require consent
  else if (country === 'US' && state === 'CA') {
    // Don't set disableConsentCheck
  }
  // Other regions: no consent required
  else {
    config.disableConsentCheck = true;
  }

  edgetag('init', config);
}

// Call on page load
initEdgeTagWithLocation();
```

---

## Pattern 11: Consent + Identity Integration

**When to use**: Setting both consent and identity together

**Goal**: Capture identity while respecting consent choices

```javascript
edgetag('init', {
  edgeURL: 'https://d.mysite.com'
});

// User submits signup form
document.getElementById('signup').addEventListener('submit', (e) => {
  const email = document.getElementById('email').value;
  const consentToMarketing = document.getElementById('marketing-consent').checked;

  // Set consent first — EdgeTag will skip non-consented channels automatically
  edgetag('consent', null, {
    necessary: true,
    advertising: consentToMarketing,
    analytics: true
  });

  // Then capture identity — sent to all consented channels
  edgetag('user', 'email', email.toLowerCase());
});
```

