# EdgeTag npm SDK - Common Gotchas & Pitfalls

Common mistakes developers make when integrating EdgeTag via npm, and how to avoid them.

---

## 1. Using Google Tag Manager (GTM) to Load EdgeTag

See [browser-sdk/gotchas.md § Using Google Tag Manager (GTM) to Load EdgeTag](../browser-sdk/gotchas.md).

---

## 2. Passing a String URL to init() Instead of an Object

See [browser-sdk/gotchas.md § Passing a String URL to init() Instead of an Object](../browser-sdk/gotchas.md).

---

## 3. Using Wrong Import Names or Default Import

### The Problem

```javascript
// WRONG - Default import
import edgetag from "@blotoutio/edgetag-sdk-js";
edgetag.init({ edgeURL: "https://d.mysite.com" });

// WRONG - Importing non-existent "edgeTag" export (the function is called "tag", NOT "edgeTag")
import { edgeTag } from "@blotoutio/edgetag-sdk-js";
import type { edgeTag as EdgeTagInstance } from "@blotoutio/edgetag-sdk-js";
```

The npm package exports named functions, NOT a default export. There is also **no export called `edgeTag`** — the event tracking function is simply called **`tag`**. Common mistakes:

- Using default import → returns `undefined`
- Importing `edgeTag` instead of `tag` → does not exist
- Inventing type names like `EdgeTagInstance` or `EventOptions` → do not exist

### The Correct Exports

The **only** exports from `@blotoutio/edgetag-sdk-js` are:

**Functions:** `init`, `tag`, `user`, `data`, `consent`, `getConsent`, `getData`, `getUserId`, `setConfig`, `ready`

**Types (TypeScript):** `InitConfig`, `TagOptions`, `ReadyState`, `UserOptions`, `DataOptions`, `ConsentOptions`, `GetConsentOptions`, `GetDataOptions`, `ConfigSettings`

### The Solution

```javascript
// CORRECT - Named imports (functions)
import { init, tag, user, data, consent } from "@blotoutio/edgetag-sdk-js";

// CORRECT - Named type imports (TypeScript)
import type { TagOptions, InitConfig } from "@blotoutio/edgetag-sdk-js";

init({ edgeURL: "https://d.mysite.com" });
tag("PageView");
user("email", "user@example.com");
```

---

## 4. Not Installing Provider npm Packages

### The Problem

```javascript
// WRONG - No providers, browser pixels won't work
import { init, tag } from "@blotoutio/edgetag-sdk-js";

init({ edgeURL: "https://d.mysite.com" });
tag("Purchase", { value: 100 }); // Facebook pixel won't fire — no provider packages installed
```

With the npm approach, browser pixels are **not** loaded automatically. Without provider packages:

- Browser pixels don't load
- Events don't fire to third-party platforms
- No errors in console (silent failure)

### The Solution

```bash
npm install @blotoutio/providers-facebook-sdk
```

```javascript
import { init, tag } from "@blotoutio/edgetag-sdk-js";
import facebook from "@blotoutio/providers-facebook-sdk";

init({
  edgeURL: "https://d.mysite.com",
  providers: [facebook],
});

tag("Purchase", { value: 100 }); // Now works — pixels fire to all consented channels
```

For the full list of available provider packages, see [Channel Reference](../channels/channel-reference.md).

### When Do You Need Providers?

- **Script tag**: Browser pixels load automatically via `/load` CDN
- **npm/Headless**: Must manually install and pass provider packages
- **Server-side only**: Don't need providers (EdgeTag handles server-side conversion APIs)

---

## 5. Firing Events Before Consent is Granted

See [consent/gotchas.md § Events Silently Blocked Without Consent](../consent/gotchas.md).

---

## 6. Not Calling init() Before Other Functions

See [browser-sdk/gotchas.md § Not Calling init() Before Other Functions](../browser-sdk/gotchas.md).

---

## 7. Using Wrong Provider Package Names

### The Problem

```bash
# WRONG - These packages don't exist
npm install @blotoutio/providers-meta
npm install @blotoutio/providers-google-ads
npm install @blotoutio/providers-fb-sdk
```

### The Solution

```bash
# CORRECT package names
npm install @blotoutio/providers-facebook-sdk
npm install @blotoutio/providers-google-ads-clicks-sdk
npm install @blotoutio/providers-tiktok-sdk
```

```javascript
import facebook from "@blotoutio/providers-facebook-sdk";
import googleAds from "@blotoutio/providers-google-ads-clicks-sdk";
import tiktok from "@blotoutio/providers-tiktok-sdk";

init({
  edgeURL: "https://d.mysite.com",
  providers: [facebook, googleAds, tiktok],
});
```

For the full list of available provider packages, see [Channel Reference](../channels/channel-reference.md).

---

## 9. Re-initializing on SPA Navigation

See [browser-sdk/gotchas.md § Re-initializing on SPA Navigation](../browser-sdk/gotchas.md).

---

## 10. Standard Key Format Errors

See [identity/gotchas.md § Wrong Standard Key Formats](../identity/gotchas.md).

---

## Quick Checklist

Before deploying EdgeTag, verify:

- Loading EdgeTag directly via npm, NOT through GTM
- Passing object to `init()`, not string: `{ edgeURL: '...' }`
- Using named imports: `import { init, tag } from '...'` (not default import, not `edgeTag`)
- Installing provider packages: `@blotoutio/providers-*-sdk`
- Passing providers to `init()`: `providers: [facebook, googleAds]`
- Waiting for consent before critical events
- Using `getUserId()` for tag_user_id, not URL parameter et_uid
- Calling `init()` before other functions
- Using correct package names (`providers-facebook-sdk`, not `providers-meta`)
- Only initializing once (not on every route change)
- User data in correct formats (email lowercase, phone E.164, etc.)

---

## Debugging Tips

### Check Initialization

```javascript
import { ready } from "@blotoutio/edgetag-sdk-js";

ready((state) => {
  console.log("EdgeTag initialized:", state);
  console.log("User ID:", state.userId);
  console.log("Consent:", state.consent);
});
```

### Check Consent

```javascript
import { getConsent } from "@blotoutio/edgetag-sdk-js";

getConsent((consent, error, categories) => {
  console.log("Provider consent:", consent);
  console.log("Category consent:", categories);
});
```

### Verify User Data

```javascript
import { getData } from "@blotoutio/edgetag-sdk-js";

getData(["email", "phone", "firstName"], (data) => {
  console.log("Current user data:", data);
});
```

### Browser DevTools

- **Application → Cookies**: Look for `tag_user_id` first-party cookie
- **Network tab**: Filter by your edge domain (e.g., `d.mysite.com`) to see requests
- **Console**: Check for any EdgeTag errors or warnings

