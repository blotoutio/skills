# EdgeTag Browser SDK - Common Gotchas & Pitfalls

Common mistakes developers make when integrating EdgeTag via script tag, and how to avoid them.

---

## 1. Using Google Tag Manager (GTM) to Load EdgeTag

### The Problem

```html
<!-- DON'T: Loading EdgeTag through GTM -->
<script src="https://d.mysite.com/load"></script>
<!-- inside GTM custom HTML tag -->
```

Loading EdgeTag through GTM defeats the entire purpose:

- **First-party becomes third-party**: GTM is `googletagmanager.com`, so EdgeTag loses first-party status
- **Cookies blocked**: Modern browsers block third-party cookies, breaking `tag_user_id`
- **iOS & GDPR issues**: Third-party scripts are blocked on iOS and in GDPR-compliant environments
- **Lower match rates**: Advertising platforms can't match users from third-party sources

### The Solution

```html
<!-- DO: Load EdgeTag directly in your HTML -->
<script src="https://d.mysite.com/load" async></script>
<script>
  window.edgetag =
    window.edgetag ||
    function () {
      (edgetag.stubs = edgetag.stubs || []).push(arguments);
    };
  edgetag("init", { edgeURL: "https://d.mysite.com" });
</script>
```

You can still use GTM for other tags (Google Analytics, etc.), but EdgeTag must load directly.

---

## 2. Passing a String URL to init() Instead of an Object

### The Problem

```javascript
// WRONG - String instead of object
edgetag("init", "https://d.mysite.com");
```

`init()` expects a configuration **object**, not a string. Passing a string causes:

- Initialization fails silently
- No user ID generated
- Events won't be tracked
- No errors in console (hard to debug)

### The Solution

```javascript
// CORRECT - Object with edgeURL property
edgetag("init", {
  edgeURL: "https://d.mysite.com",
});
```

### Debugging

```javascript
edgetag("ready", function (state) {
  if (!state.userId) {
    console.error(
      "init() may not have been called correctly. Check that you passed an object.",
    );
  }
});
```

---

## 3. Firing Events Before Consent is Granted

See [consent/gotchas.md § Events Silently Blocked Without Consent](../consent/gotchas.md).

---

## 4. Not Calling init() Before Other Functions

### The Problem

```javascript
// WRONG - Functions called before init
edgetag("tag", "PageView");
edgetag("user", "email", "user@example.com");

// Init called after
edgetag("init", { edgeURL: "https://d.mysite.com" });
```

While EdgeTag queues calls before initialization, it's bad practice and can cause:

- Timing problems in SPAs
- Unexpected initialization order
- Harder to debug

### The Solution

```javascript
// CORRECT - Always init first
edgetag("init", { edgeURL: "https://d.mysite.com" });

edgetag("user", "email", "user@example.com");
edgetag("tag", "PageView");
```

---

## 5. Re-initializing on SPA Navigation

### The Problem

```javascript
// WRONG - Re-initializing on every page/route change
function onPageChange() {
  edgetag("init", { edgeURL: "https://d.mysite.com" }); // Don't do this
  edgetag("tag", "PageView");
}
```

Calling `init()` multiple times:

- Resets user ID and session
- Clears queued events
- Breaks user tracking
- Loses consent state

### The Solution

```html
<script>
  window.edgetag =
    window.edgetag ||
    function () {
      (edgetag.stubs = edgetag.stubs || []).push(arguments);
    };

  // Initialize ONCE on page load
  edgetag("init", { edgeURL: "https://d.mysite.com" });

  // On SPA route changes, update page URL and track
  function onRouteChange() {
    edgetag("setConfig", { pageUrl: window.location.href });
    edgetag("tag", "PageView");
  }
</script>
```

---

## 6. Standard Key Format Errors

See [identity/gotchas.md § Wrong Standard Key Formats](../identity/gotchas.md).

---

## Quick Checklist

Before deploying EdgeTag, verify:

- Loading EdgeTag directly (script tag in HTML), NOT through GTM
- Passing object to `init()`, not string: `{ edgeURL: '...' }`
- Stub function defined before any `edgetag()` calls
- Calling `init()` before other functions
- Waiting for consent before critical events
- Using `getUserId()` for tag_user_id, not URL parameter et_uid
- Only initializing once (not on every route change)
- User data in correct formats (email lowercase, phone E.164, etc.)

---

## Debugging Tips

### Check Initialization

```javascript
edgetag("ready", function (state) {
  console.log("EdgeTag initialized:", state);
  console.log("User ID:", state.userId);
  console.log("Consent:", state.consent);
});
```

### Check Consent

```javascript
edgetag("getConsent", function (consent, error, categories) {
  console.log("Provider consent:", consent);
  console.log("Category consent:", categories);
});
```

### Verify User Data

```javascript
edgetag("getData", ["email", "phone", "firstName"], function (data) {
  console.log("Current user data:", data);
});
```

### Browser DevTools

- **Application → Cookies**: Look for `tag_user_id` first-party cookie
- **Network tab**: Filter by your edge domain (e.g., `d.mysite.com`) to see `/load` and `/tag` requests
- **Console**: Check for any EdgeTag errors or warnings
