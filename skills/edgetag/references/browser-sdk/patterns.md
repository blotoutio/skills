# EdgeTag Browser SDK - Patterns & Best Practices

Proven patterns for implementing EdgeTag via the script tag approach.

---

## Pattern 1: Script Tag Snippet

The standard integration for traditional websites.

### Complete Implementation

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My Website</title>

    <!-- EdgeTag Script Tag (async load) -->
    <script src="https://d.mysite.com/load" async></script>
  </head>
  <body>
    <!-- Your website content -->

    <!-- EdgeTag Initialization Snippet -->
    <script>
      // Stub function - queues calls before SDK loads
      window.edgetag =
        window.edgetag ||
        function () {
          ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
        }

      // Initialize EdgeTag
      edgetag('init', {
        edgeURL: 'https://d.mysite.com',
      })

      // (Optional) Set user identity from page context
      // This might come from your backend template
      edgetag('user', 'email', '{{ user.email }}')

      // Track page view
      edgetag('tag', 'PageView')
    </script>
  </body>
</html>
```

### Key Points

- **Async loading**: `async` attribute prevents blocking page render
- **Stub pattern**: The stub function queues calls before SDK loads
- **Early initialization**: Initialize in `<script>` tag in body, not in an external file
- **Order matters**: Initialize before other function calls

### Advantages

- Minimal code
- No build tools required
- Automatic browser pixel loading via `/load` endpoint
- Works everywhere

### Disadvantages

- Less control over lifecycle
- Global `window.edgetag` namespace pollution
- Harder to unit test

---

## Pattern 2: CMP Integration (Script Tag)

For CMP integration patterns (OneTrust, Cookiebot, TrustArc, Osano, Shopify, etc.), see **consent/patterns.md**. Use the browser SDK syntax (`edgetag('consent', providers, categories)`) with the patterns shown there.

---

## Pattern 3: Beacon Method for Unload Events

See [events/patterns.md § Beacon for Pre-Navigation Events](../events/patterns.md).

---

## Pattern 4: Sync Mode for Debugging Channel Errors

See [events/patterns.md § Sync vs Async Event Execution](../events/patterns.md).

---

## Pattern 5: Manual Testing Checklist

Use these console commands to verify your script tag installation.

### Browser Console Tests

```javascript
// 1. Check user ID
var userId = edgetag('getUserId')
console.log('User ID:', userId)

// 2. Check first-party cookie
console.log('Cookies:', document.cookie)
// Look for tag_user_id=...

// 3. Test event tracking
edgetag('tag', 'TestEvent', { test: true })
// Check Network tab for request to your edgeURL

// 4. Test user identity
edgetag('user', 'email', 'test@example.com')
edgetag('getData', ['email'], function (data) {
  console.log('User data set:', data)
})

// 5. Test consent
edgetag('consent', { facebook: true }, { advertising: true })
edgetag('getConsent', function (consent, error, categories) {
  console.log('Consent status:', consent)
  console.log('Categories:', categories)
})

// 6. Check ready state
edgetag('ready', function (state) {
  console.log('Ready state:', state)
  console.log('Is new user:', state.isNewUser)
  console.log('Session ID:', state.sessionId)
})
```

### Network Tab Verification

1. Open DevTools → Network tab
2. Filter by your edge domain (e.g., `d.mysite.com`)
3. Check for `/load` request (SDK bundle download)
4. Verify `/tag` requests fire after consent is granted
5. Confirm `tag_user_id` cookie is set in Application → Cookies

---

## Quick Reference: Pattern Selection

| Scenario             | Pattern                | Notes                                       |
| -------------------- | ---------------------- | ------------------------------------------- |
| Standard website     | Pattern 1 (Script Tag) | Start here for any traditional site         |
| CMP integration      | Pattern 2 (CMP)        | Wire OneTrust, Cookiebot, or custom CMP     |
| Unload/exit tracking | Pattern 3 (Beacon)     | Use `method: 'beacon'` for reliability      |
| Debug channel errors | Pattern 4 (Sync)       | Use `sync: true` to verify channel delivery |
| QA / debugging       | Pattern 5 (Testing)    | Run checks in browser console               |

---

## Best Practices

1. **Load EdgeTag directly in `<head>`** — never via GTM or tag managers
2. **Always include the stub** before any `edgetag()` calls
3. **Initialize once per page** — don't re-initialize on SPA navigation
4. **Use `setConfig()` for page URL updates** on SPA route changes
5. **Format user data correctly** — email lowercase, phone E.164, etc.
6. **Wire your CMP early** — consent must be granted before events fire
7. **Use beacon for unload** — standard fetch may not complete on page close
8. **Use sync only for debugging** — verifies channel delivery but is significantly slower; do not use on pages that navigate away
