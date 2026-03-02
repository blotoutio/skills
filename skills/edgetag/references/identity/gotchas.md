# EdgeTag Identity: Common Gotchas

## 1. Wrong Standard Key Formats

**Problem**: Data rejected or not matched because keys don't conform to required formats.

**Common Mistakes**:

### Email

```javascript
// WRONG - has spaces or uppercase
edgetag('user', 'email', 'John Doe@Example.COM');

// RIGHT - lowercase, no spaces
edgetag('user', 'email', 'john.doe@example.com');
```

### Phone

```javascript
// WRONG - missing country code, spaces, or dashes
edgetag('user', 'phone', '(415) 555-2671');
edgetag('user', 'phone', '5552671');

// RIGHT - E.164 format: +{country}{number}
edgetag('user', 'phone', '+14155552671');
```

### Names

```javascript
// WRONG - uppercase, accents, special characters
edgetag('user', 'firstName', 'José');
edgetag('user', 'firstName', 'O\'Brien');

// RIGHT - lowercase, no accents or punctuation
edgetag('user', 'firstName', 'jose');
edgetag('user', 'firstName', 'obrien');
```

### Date of Birth

```javascript
// WRONG - separators or wrong format
edgetag('user', 'dateOfBirth', '03/15/1990');
edgetag('user', 'dateOfBirth', '1990-03-15');

// RIGHT - YYYYMMDD, 8 digits
edgetag('user', 'dateOfBirth', '19900315');
```

### State

```javascript
// WRONG - full name or uppercase
edgetag('user', 'state', 'Washington');
edgetag('user', 'state', 'WA');

// RIGHT - 2-char ANSI lowercase
edgetag('user', 'state', 'wa');
```

### Normalization Helper

```javascript
// Normalize PII before sending
const phone = rawPhone.replace(/\D/g, ''); // Remove non-digits
const normalizedPhone = `+1${phone}`; // Add country code

const email = rawEmail.toLowerCase().trim();

const firstName = rawName
  .toLowerCase()
  .normalize('NFD') // Remove accents
  .replace(/[\u0300-\u036f]/g, '') // Strip diacritics
  .replace(/[^a-z]/g, ''); // Remove punctuation

edgetag('data', { email, phone: normalizedPhone, firstName });
```

---

## 2. Waiting Too Long to Capture Identity

**Problem**: User leaves site before identity is captured; anonymous session is lost.

**Pattern**: Progressive identity capture

```javascript
// GOOD: Capture what you have, when you have it
edgetag('user', 'email', 'user@example.com'); // At sign-up

// Later, capture more
edgetag('data', {
  firstName: 'john',
  lastName: 'doe',
  phone: '+14155552671'
}); // At checkout

// Don't wait for complete profile before capturing
```

---

## 3. Not Creating Server-Side Cookie for Headless Sites

**Problem**: On headless sites, EdgeTag's `tag_user_id` cookie may not have full persistence across all browsers.

**Solution**: Create an additional server-side cookie (e.g., `truid`) on your backend for full browser coverage. This does **not** replace the EdgeTag user ID — it is an additional persistence optimization.

1. Create a long-lived first-party cookie (e.g., `truid`) on your backend, set in the document response headers:

```javascript
const crypto = require('crypto')

const cookieName = 'truid'
const value = `${crypto.randomUUID()}-${Date.now()}`
const expirationDate = new Date(2037, 11, 20).toUTCString()
const domainCookie = '.mysite.com'

const cookieString = `${cookieName}=${value}; SameSite=Lax; Expires=${expirationDate}; Domain=${domainCookie}; HttpOnly; Secure`

response.writeHead(200, { 'Set-Cookie': cookieString })
```

2. Only create the cookie if it doesn't already exist — returning visitors should keep their existing value.

3. Contact EdgeTag support ([support@edgetag.io](mailto:support@edgetag.io)) with:
   - Your domain name
   - The cookie name you created (e.g., `truid`)
   - Support will configure EdgeTag to read this cookie for additional persistence

For full implementation examples (Express middleware, Next.js), see [platforms/patterns.md § Pattern 3: Server-Side Cookie Creation Code](../platforms/patterns.md).

---

## 6. Using getUserId() Before EdgeTag Initializes

**Problem**: Calling `getUserId()` immediately after script tag—returns undefined.

**Wrong**:

```html
<script src="https://d.mysite.com/load"></script>
<script>
  // TOO EARLY - EdgeTag still initializing
  const id = edgetag('getUserId');
</script>
```

**Right**:

```html
<script src="https://d.mysite.com/load"></script>
<script>
  window.addEventListener('edgetag-initialized', () => {
    const id = edgetag('getUserId');
  });
</script>
```

---

## 7. Mixing user() and data() Incorrectly

**Problem**: Using `user()` for multiple keys or `data()` for single standard keys (inefficient).

**Fine but Verbose**:

```javascript
// Works, but multiple calls
edgetag('user', 'email', 'user@example.com');
edgetag('user', 'phone', '+14155552671');
edgetag('user', 'firstName', 'john');
```

**Better**:

```javascript
// Single call with data()
edgetag('data', {
  email: 'user@example.com',
  phone: '+14155552671',
  firstName: 'john'
});
```

---

## 8. Not Handling getData Errors

**Problem**: Silently failing when data retrieval has issues.

**Better**:

```javascript
edgetag('getData', ['email', 'phone'], (data, error, categories) => {
  if (error) {
    console.error('Failed to get identity data:', error);
    return;
  }
  console.log('Identity data:', data);
  console.log('Consent categories:', categories);
});
```

---

## 9. Cross-Domain Linking Without et_uid

**Problem**: Linking to another domain but forgetting to include the `et_uid` parameter, or not reading it on the receiving domain.

> **Important**: EdgeTag does NOT automatically capture `et_uid` from URL query parameters. You must read it yourself and pass it as `userId` to the SDK on the receiving domain. The only exception is the Shopify app, which handles `et_uid` automatically.

**Wrong (sending domain)**:

```javascript
// User is identified, but link doesn't transfer identity
window.location.href = 'https://other-domain.com/checkout';
```

**Wrong (receiving domain)**:

```javascript
// Assumes EdgeTag reads et_uid automatically — it does NOT
edgetag('init', { edgeURL: 'https://d.other-domain.com' });
```

**Right (sending domain)**:

```javascript
// Include et_uid to transfer identity
const userId = edgetag('getUserId');
window.location.href = `https://other-domain.com/checkout?et_uid=${userId}`;
```

**Right (receiving domain)**:

```javascript
// Manually read et_uid from URL and pass it to EdgeTag
const urlParams = new URLSearchParams(window.location.search);
const etUid = urlParams.get('et_uid');

edgetag('init', {
  edgeURL: 'https://d.other-domain.com',
  userId: etUid || undefined
});
```

