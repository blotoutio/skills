# EdgeTag Identity API Reference

## Core Functions

### getUserId()

Retrieve the current user's EdgeTag ID (the value of `tag_user_id` cookie).

```javascript
const userId = edgetag('getUserId');
```

**Returns**: String - The unique EdgeTag user ID for this user in this domain

---

### user(key, value, providers?, options?)

Set a **single standard key** for the user. Use this for one-at-a-time identity captures.

```javascript
edgetag('user', 'email', 'user@example.com');
edgetag('user', 'phone', '+14155552671');
edgetag('user', 'firstName', 'john');
```

**Parameters**:

- `key` (string): Standard key name (see table below)
- `value` (string): Value in the required format
- `providers` (array, optional): Providers to process user event
- `options` (object, optional): Additional options

---

### data(keys, providers?, options?)

Set **multiple keys at once** or include custom (non-standard) keys.

```javascript
// Multiple standard keys
edgetag('data', {
  email: 'user@example.com',
  phone: '+14155552671',
  firstName: 'john',
  lastName: 'doe'
});

// Mix standard and custom keys
edgetag('data', {
  email: 'user@example.com',
  phone: '+14155552671',
  customAttribute: 'custom-value',
  loyaltyTier: 'gold'
});
```

**Parameters**:

- `keys` (object): Key-value pairs to set
- `providers` (array, optional): Providers to process user event
- `options` (object, optional): Additional options

---

### getData(keys, callback, options?)

Retrieve identity data for the user.

```javascript
edgetag('getData', ['email', 'phone'], (data) => {
  console.log(data);
  // { email: true, phone: true }
});

edgetag('getData', ['email', 'customAttr'], (data) => {
  console.log(data);
  // { email: true, customAttr: 'custom-value' }
});
```

**Parameters**:

- `keys` (array): Keys to retrieve
- `callback` (function): Called with `(data, error?, consentCategories)` when ready
- `options` (object, optional): Additional options

**Return Behavior**:

- Standard keys: Return `boolean` (true if exists)
- Custom keys: Return actual value
- Errors: Passed to second callback parameter

---

## Standard Keys Reference


| Key           | Format                                | Example                      | Notes                                    |
| ------------- | ------------------------------------- | ---------------------------- | ---------------------------------------- |
| `email`       | Lowercase, no spaces                  | `john.doe@example.com`       | Must be valid email                      |
| `phone`       | E.164 format                          | `+14155552671`               | Country code + number, no spaces         |
| `firstName`   | Lowercase, no punctuation, UTF-8      | `john`                       | No accents, diacritics, or special chars |
| `lastName`    | Lowercase, no punctuation, UTF-8      | `doe`                        | No accents, diacritics, or special chars |
| `gender`      | Single character: f or m              | `f`                          | Female or male only                      |
| `dateOfBirth` | YYYYMMDD format                       | `19900315`                   | 8 digits, no separators                  |
| `city`        | Lowercase, no punctuation, UTF-8      | `seattle`                    | Remove accents and special chars         |
| `state`       | 2-char ANSI lowercase                 | `wa`                         | US/CA states: CA, TX, NY, etc.           |
| `zip`         | Lowercase, no spaces, no dash         | `98101`                      | Remove all separators                    |
| `country`     | 2-letter ISO 3166-1 Alpha 2 lowercase | `us`                         | ISO country code in lowercase            |
| `ip`          | IPv4 or IPv6                          | `192.0.2.1` or `2001:db8::1` | Valid IP address                         |


---

## HTTP API

### POST /data

Send identity data via server-side HTTP requests.

```bash
POST https://d.mysite.com/data

Headers:
  Content-Type: application/json
  EdgeTagUserId: {tag_user_id}

Body:
{
  "email": "user@example.com",
  "phone": "+14155552671",
  "firstName": "john",
  "lastName": "doe",
  "customKey": "custom-value"
}
```

**Headers**:

- `EdgeTagUserId`: The user's `tag_user_id` from their browser session

**Body**: JSON object with identity keys and values

**Use Case**: Match offline events to user profiles, update identity from backend systems

---

## Cross-Domain Identity Transfer

### Using et_uid Query Parameter

The `et_uid` is a URL query parameter that transfers the user's identity across domains.

```javascript
// On domain-a.com, construct a URL to domain-b.com
const userId = edgetag('getUserId');
const targetUrl = `https://domain-b.com/page?et_uid=${userId}`;

// Link to it
window.location.href = targetUrl;
```

**On domain-b.com**, you must manually read `et_uid` from the URL and pass it to EdgeTag. EdgeTag does **not** automatically capture `et_uid` from URL query parameters (except on the Shopify app).

```javascript
// On domain-b.com, read et_uid from URL
const urlParams = new URLSearchParams(window.location.search);
const etUid = urlParams.get('et_uid');

// Pass it as userId when initializing
edgetag('init', {
  edgeURL: 'https://d.domain-b.com',
  userId: etUid || undefined
});
```