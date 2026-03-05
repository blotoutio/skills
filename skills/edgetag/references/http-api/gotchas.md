# EdgeTag HTTP API: Gotchas & Pitfalls

## Critical Issues

### 1. Sending the Same Event Multiple Times

**Problem**: Sending the same event more than once inflates numbers in channels that don't support deduplication.

**Why**: EdgeTag does **not** deduplicate multiple events (we deduplicate browser and server events) — it forwards every event to channels regardless of whether the same `eventId` was sent before. Channels that support deduplication (e.g., Meta) use `eventId` to avoid double-counting. Channels without deduplication will record every event, inflating conversion counts and revenue.

**Impact**:

- Inflated conversion numbers on channels without deduplication
- Incorrect revenue data
- Skewed attribution metrics

**Solution**:

```bash
# WRONG - Sending the same event twice
curl -X GET "https://abc.domain.com/tag" \
  --data '{"eventId": "purchase_001", ...}'

# Accidentally resending
curl -X GET "https://abc.domain.com/tag" \
  --data '{"eventId": "purchase_001", ...}'
# Both events are sent to channels — numbers may be inflated


# RIGHT - Send each event only once, with a unique ID
curl -X GET "https://abc.domain.com/tag" \
  --data '{"eventId": "purchase_20260226_15_30_45_001", ...}'

curl -X GET "https://abc.domain.com/tag" \
  --data '{"eventId": "purchase_20260226_15_30_46_001", ...}'
```

Best practices:

- Send each event only once — track what you've already sent in your database
- Use unique eventIds so channels that support deduplication can handle retries gracefully
- Use distributed ID generation if multiple servers

---

### 2. Missing Timestamp or Using Seconds Instead of Milliseconds

**Problem**: Timestamp field is required and must be in milliseconds, not seconds.

**Why**: EdgeTag attribution system requires precise timing. Timestamps in seconds are 1000x off, corrupting attribution windows.

**Impact**:

- Incorrect session attribution
- Events appear at wrong time in analytics
- Attribution windows don't align with user journey

**Solution**:

```javascript
// WRONG - Seconds
const timestamp = Math.floor(Date.now() / 1000);  // 1707302400
curl -X GET "https://abc.domain.com/tag" \
  --data "{\"timestamp\": ${timestamp}, ...}"

// RIGHT - Milliseconds
const timestamp = Date.now();  // 1707302400000
curl -X GET "https://abc.domain.com/tag" \
  --data "{\"timestamp\": ${timestamp}, ...}"

// If using Unix timestamp from external source
const unixSeconds = 1707302400;
const msTimestamp = unixSeconds * 1000;  // Convert to ms
```

Check in your code:

```javascript
// This is correct (13 digits)
1707302400000

// This is wrong (10 digits)
1707302400
```

---

### 3. Not Including Consent in Storage Object

**Problem**: When consent management is enabled, events sent without consent data may not trigger provider events.

**Why**: Providers like Facebook require consent signals. Missing consent blocks event delivery.

**Impact**:

- Provider events not received (Facebook, Klaviyo, etc.)
- No conversions tracked by advertising platforms
- Attribution data incomplete

**Solution**:

```json
// WRONG - No consent included
{
  "eventId": "purchase_001",
  "eventName": "Purchase",
  "timestamp": 1707302400000,
  "data": {"value": 99.99}
}

// RIGHT - Consent included
{
  "eventId": "purchase_001",
  "eventName": "Purchase",
  "timestamp": 1707302400000,
  "data": {"value": 99.99},
  "storage": {
    "edgeTag": {
      "consentCategories": {
        "marketing": true,
        "analytics": true,
        "sale_of_data": false,
        "preferences": true
      }
    }
  }
}
```

**Only include consent when**:

- Consent is enabled on your EdgeTag domain
- You have consent information from the user
- The event should trigger provider integrations

---

### 4. Trying /data Endpoint Without EdgeTagUserId

**Problem**: The `/data` endpoint REQUIRES the `EdgeTagUserId` header. Omitting it fails silently or with error.

**Why**: `/data` enriches existing user records in the ID graph. Without an ID, there's no user to enrich.

**Impact**:

- User data not stored
- ID graph not enriched
- CRM data sync fails

**Solution**:

```bash
# WRONG - Missing EdgeTagUserId header
curl -X POST "https://abc.domain.com/data" \
  -H "Content-Type: application/json" \
  --data '{
    "data": {"email": "user@example.com", "firstName": "John"}
  }'
# Returns error or silently fails


# RIGHT - EdgeTagUserId included
curl -X POST "https://abc.domain.com/data" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-123-abc" \
  --data '{
    "data": {"email": "user@example.com", "firstName": "John"}
  }'
```

**How to get EdgeTagUserId**:

- From browser SDK: `edgetag('getUserId', (userId) => { /* save against your user ID */ })`
- Save it in your database against your own user/customer identifier so you can retrieve it when sending server-side events
- From your mobile app user ID or your own system ID (if no browser connection exists)

---

### 5. UserEmail Not Found in ID Graph

**Problem**: Including `userEmail` in payload assumes the user exists in the ID graph. If they don't, the connection fails.

**Why**: EdgeTag must find the user by email to establish the connection.

**Impact**:

- User not identified
- Events not attributed to correct user
- User data orphaned

**Solution**:

```bash
# Scenario 1: Email exists in ID graph - use email method
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  --data '{
    "eventId": "purchase_001",
    "eventName": "Purchase",
    "timestamp": 1707302400000,
    "data": {
      "userEmail": "existing.customer@example.com",
      "value": 99.99
    }
  }'

# Scenario 2: Email NOT in graph - use EdgeTagUserId instead
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-123-abc" \
  --data '{
    "eventId": "purchase_001",
    "eventName": "Purchase",
    "timestamp": 1707302400000,
    "data": {"value": 99.99}
  }'

# Scenario 3: New user - use email AND populate via /data endpoint
# First, send event with email
curl -X GET "https://abc.domain.com/tag" \
  --data '{
    "eventId": "signup_001",
    "eventName": "Lead",
    "timestamp": 1707302400000,
    "data": {
      "userEmail": "newuser@example.com"
    }
  }'

# Then enrich with /data (get EdgeTagUserId from response or use email method first)
```

**Best practice**:

- Use `EdgeTagUserId` when available (most reliable)
- Use `userEmail` for existing customers
- For new users, EdgeTag will automatically create a new user

---

## Common Mistakes

### Missing Required Fields

**Problem**: Omitting `eventId`, `eventName`, or `timestamp`.

**Solution**:

```json
{
  "eventId": "unique-id-here",        // Required - must be unique
  "eventName": "Purchase",             // Required - event type
  "timestamp": 1707302400000,          // Required - milliseconds
  "data": {...},                       // Recommended
  "pageUrl": "https://...",            // Recommended
  "pageTitle": "..."                   // Recommended
}
```

---

### Malformed JSON

**Problem**: Invalid JSON syntax in curl `--data` parameter.

**Solution**:

```bash
# WRONG - Unescaped quotes break JSON
curl --data '{"data": {"name": "John's Item"}}'

# RIGHT - Escape inner quotes
curl --data '{"data": {"name": "John'\''s Item"}}'

# OR - Use different quote style
curl --data "{\"data\": {\"name\": \"John's Item\"}}"

# BEST - Use stdin for complex data
curl --data @- << 'EOF'
{
  "eventId": "purchase_001",
  "eventName": "Purchase",
  "timestamp": 1707302400000,
  "data": {
    "name": "John's Item"
  }
}
EOF
```

---

### Incorrect Endpoint URL

**Problem**: Using wrong domain in API URL.

**Solution**:

```bash
# WRONG - Generic URL
curl -X GET "https://edgetag.io/tag" ...
curl -X GET "https://d.mysite.com/tag" ...

# RIGHT - Use YOUR domain from dashboard
curl -X GET "https://abc.domain.com/tag" ...
# Replace 'abc.domain.com' with actual domain
```

---

### Using POST Instead of GET for /tag

**Problem**: The `/tag` endpoint is GET, but with body via `--data`.

**Solution**:

```bash
# WRONG - POST method
curl -X POST "https://abc.domain.com/tag" \
  --data '{...}'

# RIGHT - GET method with data
curl -X GET "https://abc.domain.com/tag" \
  --data '{...}'

# Also correct - Omit -X (defaults to GET with --data)
curl "https://abc.domain.com/tag" \
  --data '{...}'
```

---

## Debugging Checklist

- EventId is unique (avoid sending the same event twice)
- Timestamp is in milliseconds (13 digits)
- EventName is valid (PageView, Purchase, Search, etc.)
- Content-Type header is `application/json`
- JSON is valid (use online validator if unsure)
- Domain URL matches dashboard configuration
- For /data endpoint: EdgeTagUserId header is present
- For /tag endpoint with email: User exists in ID graph
- Consent object included if consent is enabled
- All required fields present
- No sensitive data in eventId or pageUrl
