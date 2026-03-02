# EdgeTag Consent: Common Gotchas

## 1. Not Providing At Least One of Providers/Categories

**Problem**: Calling `edgetag('consent')` without providers or categories fails silently or throws an error.

**Rule**: At least one of `providers` or `categories` MUST be provided.

**Wrong**:

```javascript
// INVALID - Neither provided
edgetag('consent');

// INVALID - null passed but no categories
edgetag('consent', null);

// INVALID - Empty objects
edgetag('consent', {}, {});
```

**Right**:

```javascript
// Valid - Providers only
edgetag('consent', { facebook: true });

// Valid - Categories only
edgetag('consent', null, { advertising: true });

// Valid - Both
edgetag('consent', { facebook: true }, { advertising: true });
```

---

## 2. Events Silently Blocked Without Consent

**Problem**: Events fire but aren't sent; no error or warning.

**Reality**: Consent is **enabled by default**. Events stay blocked until you explicitly grant consent.

**Symptom**:

```javascript
edgetag('init', { edgeURL: 'https://d.mysite.com' });

// No consent set yet
edgetag('tag', 'Purchase', { value: 99.99 });

// This event is SILENTLY BLOCKED
// No console error, no warning
// Event never reaches providers

// Check in network tab: no requests to Facebook, Google, etc.
```

**Solution**:

```javascript
// Always set consent after init
edgetag('init', { edgeURL: 'https://d.mysite.com' });

// Set consent immediately
edgetag('consent', { facebook: true, googleAdsClicks: true });

// NOW events are sent
edgetag('tag', 'Purchase', { value: 99.99 });
```

---

## 3. Forgetting to Update Consent on User Changes

**Problem**: Setting consent once at init, then forgetting to update when user changes preferences.

**Pattern**: Consent needs updating every time user makes a choice.

**Wrong**:

```javascript
// Set on page load
edgetag('consent', { facebook: true });

// User later changes mind in settings
// But forgot to call consent() again
// Still sending data to Facebook despite user's choice
```

**Right**:

```javascript
// Initial consent (from CMP or storage)
edgetag('consent', getStoredConsent());

// User changes consent in settings
document.getElementById('fbCheckbox').addEventListener('change', (e) => {
  const updatedConsent = {
    facebook: e.target.checked,
    googleAdsClicks: /* current value */
  };

  // UPDATE EdgeTag
  edgetag('consent', updatedConsent);
});
```

---

## 5. Using disableConsentCheck Without Understanding It

**Problem**: Thinking `disableConsentCheck: true` means "privacy-safe" or "don't track".

**Reality**: `disableConsentCheck: true` **DISABLES all consent enforcement**. Events are sent regardless of consent.

**Wrong** (if privacy is required):

```javascript
// DANGEROUS if in GDPR/CCPA region
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true // All events sent, no consent required!
});

edgetag('tag', 'Purchase', { value: 99.99 }); // Sent immediately
```

**Right** (GDPR/CCPA):

```javascript
// Keep consent enabled (default)
edgetag('init', { edgeURL: 'https://d.mysite.com' });

// Wait for user consent
edgetag('consent', { facebook: true });
```

**Right** (non-GDPR/CCPA region):

```javascript
// Okay to disable consent check
edgetag('init', {
  edgeURL: 'https://d.mysite.com',
  disableConsentCheck: true
});
```

---

## 6. Not Handling getConsent Errors

**Problem**: Silently failing when consent retrieval has issues.

**Better**:

```javascript
edgetag('getConsent', (consent, error, categories) => {
  if (error) {
    console.error('Failed to get consent:', error);
    // Fall back to default (reject all)
    edgetag('consent', { all: false });
    return;
  }

  console.log('Current consent:', consent);
  console.log('Categories:', categories);
});
```

---

## 7. Mixing Provider and Category Consent Incorrectly

**Problem**: Thinking provider consent overrides category consent or vice versa.

**Reality**: They work **independently**. Both can be set and both gate events.

```javascript
// Set both
edgetag('consent', {
  facebook: true // Provider consent
}, {
  advertising: false // Category consent
});

// Result: Event to Facebook is blocked because advertising category is false
// Even though facebook provider is true
```

**Better**:

```javascript
// Set category-based consent (primary)
edgetag('consent', null, {
  necessary: true,
  advertising: true,
  analytics: true
});

// Then use provider consent only to override
edgetag('consent', {
  facebook: false // Opt out of Facebook specifically
});
```

---

## 8. Not Using 'all' Correctly for Accept/Reject

**Problem**: Manually setting each provider/category instead of using `all` flag.

**Verbose**:

```javascript
// Accept all providers (error-prone if new providers added)
edgetag('consent', {
  facebook: true,
  googleAdsClicks: true,
  klaviyo: true,
  linkedIn: true,
  tiktok: true
  // Forgot a provider?
});
```

**Better**:

```javascript
// Accept all, no worry about missing providers
edgetag('consent', {
  all: true
}, {
  all: true
});
```

**Reject all** (keep only necessary):

```javascript
edgetag('consent', {
  all: false
}, {
  necessary: true // Only this (cannot be disabled anyway)
});
```

---

## 9. Forgetting That necessary Category Can't Be Disabled

**Problem**: Setting `necessary: false` expecting to disable necessary cookies.

**Reality**: `necessary` category is **always enabled**, cannot be disabled.

```javascript
// This doesn't work
edgetag('consent', null, {
  necessary: false, // IGNORED - necessary is always true
  advertising: true
});

// Result: necessary is still true
```

**Correct**:

```javascript
// Don't try to disable necessary
edgetag('consent', null, {
  necessary: true, // Always true
  advertising: false
});
```

---

## 10. CMP Integration: Not Calling consent() on Initialization

**Problem**: User's stored consent exists in CMP, but EdgeTag not told about it.

**Symptom**:

```javascript
edgetag('init', { edgeURL: 'https://d.mysite.com' });

// User's consent is stored in OneTrust
// But EdgeTag not told
// Events blocked until user changes something
```

**Solution**:

```javascript
edgetag('init', { edgeURL: 'https://d.mysite.com' });

// Immediately read and apply stored consent
const storedConsent = getConsentFromCMP(); // OneTrust, Cookiebot, etc.
edgetag('consent', storedConsent.providers, storedConsent.categories);

// Events now flow if user previously consented
```

---

## 11. Not Updating Consent When CMP Changes

**Problem**: User makes changes in CMP (OneTrust), but EdgeTag not notified.

**Symptom**:

```javascript
// CMP integration wired once
OneTrust.OnConsentChanged(() => {
  // But callback not passed to EdgeTag
});

// User later changes consent in OneTrust
// EdgeTag still using old consent settings
```

**Solution**:

```javascript
// Wire CMP callback to EdgeTag
OneTrust.OnConsentChanged(() => {
  const consent = GetConsentFromOneTrust();
  edgetag('consent', consent.providers, consent.categories);
});
```

---

## 12. Confusing Provider Names

**Problem**: Using wrong provider names when setting consent.

**Edge Cases**:

- `google` ≠ `googleAds` ≠ `googleAdsClicks` — only `googleAdsClicks` is valid for Google Ads
- Provider names are case-sensitive
- There is no generic `google` provider — use the specific channel name

**Wrong**:

```javascript
edgetag('consent', {
  'Google': true, // Case-sensitive
  'google': true, // Not a valid provider name
  'Google Ads': true, // Wrong name
  'google-ads-clicks': true // Wrong format (kebab-case)
});
```

**Right**:

```javascript
edgetag('consent', {
  googleAdsClicks: true, // Google Ads
  googleAnalytics4: true, // Google Analytics
  facebook: true
});
```

Check your EdgeTag dashboard for exact provider names if unsure.

---

## 13. Not Testing Consent Gating

**Problem**: Assuming events are sent without verifying in network tab.

**Test Pattern**:

```javascript
// 1. Set consent
edgetag('consent', { facebook: true });

// 2. Fire event
edgetag('tag', 'Purchase', { value: 99.99 });

// 3. Check network tab in DevTools
// Should see request to Facebook pixel URL
// If not, consent gating is blocking it

// 4. Check browser console for warnings
edgetag('getConsent', (consent) => {
  console.log('Actual consent:', consent);
});
```

---

## 15. Multiple EdgeTag Instances Without destination

**Problem**: Without `destination`, consent is applied to **all** instances — not just one.

**Reality**: When you omit `destination`, the SDK iterates over every initialized instance and applies the same consent to all of them. This is by design, but can cause unintended consent if your instances need different settings.

**Wrong** (if instances need different consent):

```javascript
edgetag('init', { edgeURL: 'https://d.instance1.com', destination: 'site1' });
edgetag('init', { edgeURL: 'https://d.instance2.com', destination: 'site2' });

// Applies to BOTH site1 and site2
edgetag('consent', { facebook: true }); // No destination = all instances
```

**Right**:

```javascript
edgetag('init', { edgeURL: 'https://d.instance1.com', destination: 'site1' });
edgetag('init', { edgeURL: 'https://d.instance2.com', destination: 'site2' });

// Specify which instance
edgetag('consent', { facebook: true }, null, { destination: 'site1' });
edgetag('consent', { googleAdsClicks: true }, null, { destination: 'site2' });
```

