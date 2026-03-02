# EdgeTag HTTP API Reference

## Base Configuration

All requests use your domain-specific URL from the EdgeTag dashboard:

```
https://abc.domain.com
```

Replace `abc.domain.com` with the domain configured in your EdgeTag dashboard.

---

## /tag Endpoint (Events)

Send events from offline systems or backend. For the full list of standard event names and the `data` payload parameters for each event, see **[Standard Events Reference](../events/standard-events.md)**.

### Request Specification


| Property     | Value                        |
| ------------ | ---------------------------- |
| Method       | GET                          |
| URL          | `https://abc.domain.com/tag` |
| Content-Type | `application/json`           |
| Body         | JSON via `--data` parameter  |


### Headers

```
Content-Type: application/json
EdgeTagUserId: [optional - user's EdgeTag ID from browser or your system]
```

### Payload Fields

```json
{
  "data": {
    "value": 99.99,
    "currency": "USD",
    "contents": [{"name": "Item 1", "quantity": 1}],
    "userEmail": "user@example.com",
    "customField": "custom value"
  },
  "eventId": "evt_12345_unique",
  "eventName": "Purchase",
  "pageTitle": "Order Confirmation",
  "pageUrl": "https://example.com/confirmation",
  "providers": ["facebook", "klaviyo"],
  "referrer": "https://google.com",
  "search": "search query if applicable",
  "timestamp": 1707302400000,
  "userAgent": "Mozilla/5.0...",
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

### Field Descriptions


| Field     | Type   | Required | Description                                                                                       |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| data      | Object | Yes      | Event data object. Can include: `value`, `currency`, `contents`, `userEmail`, and custom fields   |
| eventId   | String | Yes      | Unique identifier for this event. EdgeTag forwards every event to channels regardless of eventId — it does not deduplicate. Channels that support deduplication (e.g., Meta) use eventId to avoid double-counting. Send each event only once to prevent inflated numbers on channels without deduplication |
| eventName | String | Yes      | Event type (e.g., "Purchase", "PageView", "ViewContent", "AddToCart", "Search")                   |
| pageTitle | String | No       | Title of the page/context where event occurred                                                    |
| pageUrl   | String | No       | URL of the page/context                                                                           |
| providers | Array  | No       | List of provider IDs to receive this event (e.g., ["facebook", "klaviyo"])                        |
| referrer  | String | No       | Referrer URL if applicable                                                                        |
| search    | String | No       | Search query string if applicable                                                                 |
| timestamp | Number | Yes      | Event timestamp in milliseconds since epoch (ms not seconds)                                      |
| userAgent | String | No       | User agent string from client                                                                     |
| storage   | Object | No       | Storage object for consent and custom data. If consent enabled, include `storage.edgeTag.consentCategories` |


### Example: Event with EdgeTagUserId Header

```bash
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-123-abc" \
  --data '{
    "eventId": "purchase_20260226_001",
    "eventName": "Purchase",
    "timestamp": 1707302400000,
    "pageUrl": "https://store.example.com/checkout",
    "pageTitle": "Order Confirmation",
    "data": {
      "value": 149.99,
      "currency": "USD",
      "contents": [
        {
          "name": "Premium Widget",
          "quantity": 1
        }
      ]
    },
    "providers": ["facebook", "klaviyo"],
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
  }'
```

### Example: Event with Email Identification

```bash
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  --data '{
    "eventId": "offline_purchase_20260226_002",
    "eventName": "Purchase",
    "timestamp": 1707302400000,
    "pageUrl": "https://store.example.com/checkout",
    "pageTitle": "Order Confirmation",
    "data": {
      "userEmail": "customer@example.com",
      "value": 249.99,
      "currency": "USD",
      "contents": [
        {
          "name": "Standard Package",
          "quantity": 2
        }
      ]
    },
    "providers": ["facebook", "klaviyo"],
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
  }'
```

### Standard Events

The `/tag` endpoint supports the same event types as the browser SDK:

- `PageView`: Page navigation
- `ViewContent`: User viewed product/content
- `AddToCart`: Item added to shopping cart
- `InitiateCheckout`: Checkout process started
- `Purchase`: Transaction completed
- `Search`: Search query performed
- Custom event names supported

---

## /data Endpoint (User Data)

Enrich the ID graph with user information. Requires EdgeTagUserId.

### Request Specification


| Property      | Value                         |
| ------------- | ----------------------------- |
| Method        | POST                          |
| URL           | `https://abc.domain.com/data` |
| Content-Type  | `application/json`            |
| EdgeTagUserId | **REQUIRED**                  |


### Headers

```
Content-Type: application/json
EdgeTagUserId: user-123-abc
```

### Payload

```json
{
  "data": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "gender": "male",
    "dateOfBirth": "1990-01-15",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "country": "US",
    "customField1": "custom value",
    "customField2": "another value"
  }
}
```

### Field Descriptions


| Field         | Type   | Description                  |
| ------------- | ------ | ---------------------------- |
| email         | String | User email address           |
| firstName     | String | First name                   |
| lastName      | String | Last name                    |
| phone         | String | Phone number                 |
| gender        | String | Gender                       |
| dateOfBirth   | String | Date of birth (ISO format)   |
| city          | String | City                         |
| state         | String | State/province               |
| zip           | String | Postal code                  |
| country       | String | Country code                 |
| Custom fields | Any    | Any additional custom fields |


### Example Request

```bash
curl -X POST "https://abc.domain.com/data" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-123-abc" \
  --data '{
    "data": {
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+14155552671",
      "gender": "male",
      "dateOfBirth": "1990-01-15",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "country": "US",
      "customerTier": "premium",
      "signupDate": "2024-01-01"
    }
  }'
```

---

## /getInstancesData Endpoint (User Lookup)

Look up user instances by email or EdgeTag user ID. Use this when you only have an email and need the EdgeTag user ID, or when you have a user ID and want to find all browser instances for that user.

### Request Specification


| Property | Value                                     |
| -------- | ----------------------------------------- |
| Method   | GET                                       |
| URL      | `https://abc.domain.com/getInstancesData` |


### Query Parameters


| Parameter | Required | Description                                                                                       |
| --------- | -------- | ------------------------------------------------------------------------------------------------- |
| email     | No       | User's email address. If provided, looks up all EdgeTag user instances associated with this email |


If `email` is not provided, the `EdgeTagUserId` header is used instead to find the user's email first, then returns all instances linked to that email.

### Headers

```
EdgeTagUserId: [required if email query param is not provided]
```

### Response

Returns a map of EdgeTag user IDs to their data (custom data, consent status, creation timestamp):

```json
{
  "result": {
    "user-abc-123": {
      "consent": { "facebook": true, "googleAdsClicks": true },
      "createdAt": 1707302400000,
      "customKey": "customValue"
    },
    "user-def-456": {
      "consent": { "facebook": true },
      "createdAt": 1708300000000
    }
  }
}
```

### Examples

```bash
# Look up all instances by email
curl -X GET "https://abc.domain.com/getInstancesData?email=user@example.com"

# Look up all instances by EdgeTag user ID
curl -X GET "https://abc.domain.com/getInstancesData" \
  -H "EdgeTagUserId: user-abc-123"
```

### Use Cases

- **Get EdgeTag user ID from email**: You have a customer email from your CRM/database and need the EdgeTag user ID to send server-side events via the `/tag` endpoint
- **Find all browser instances**: See all sessions/devices associated with a user to understand cross-device behavior
- **Verify user data**: Check what custom data and consent status is stored for a user

---

## /audience Endpoint (Audience Upload)

Upload customer segments to advertising channels for targeting, lookalike audiences, and retargeting.

### Request Specification


| Property     | Value                             |
| ------------ | --------------------------------- |
| Method       | POST                              |
| URL          | `https://abc.domain.com/audience` |
| Content-Type | `multipart/form-data`             |


### Required Fields


| Field | Type       | Description                                       |
| ----- | ---------- | ------------------------------------------------- |
| name  | String     | Audience/segment name                             |
| type  | String     | `custom` or `primary`                             |
| batch | JSON       | Audience metadata (e.g., `startTime`, `dataType`) |
| users | JSON Array | Array of user objects with identifiers            |


### Optional Query Params


| Param         | Type    | Description                                                          |
| ------------- | ------- | -------------------------------------------------------------------- |
| channels      | String  | Comma-separated list of channels to target (e.g., `facebook,tiktok`) |
| disablePrefix | Boolean | Skip field name prefix                                               |
| sync          | Boolean | Enable bidirectional sync                                            |


### Example Request

```bash
curl -X POST "https://abc.domain.com/audience" \
  -H "Authorization: Bearer ${EDGETAG_API_KEY}" \
  -F "name=High Value Customers" \
  -F "type=custom" \
  -F 'batch={"startTime": 1707302400, "dataType": "EMAIL_SHA256"}' \
  -F 'users=[{"email": "user@example.com"}]'
```

### Example: Target Specific Channels

```bash
curl -X POST "https://abc.domain.com/audience?channels=facebook,tiktok&sync=true" \
  -H "Authorization: Bearer ${EDGETAG_API_KEY}" \
  -F "name=High Value Customers" \
  -F "type=custom" \
  -F 'batch={"startTime": 1707302400, "dataType": "EMAIL_SHA256"}' \
  -F 'users=[{"email": "user@example.com"}]'
```

### Use Cases

- Upload email lists for ad platform matching
- Sync CRM segments to ad platforms
- Lookalike audience creation
- Retargeting segment sync

---

## Error Handling

EdgeTag returns errors in a standard format:

### Error Response Format

```json
{
  "message": "Description of the error",
  "code": "400"
}
```

### Common Error Codes


| Code | Meaning      | Solution                                          |
| ---- | ------------ | ------------------------------------------------- |
| 400  | Bad Request  | Check payload format, required fields, data types |
| 401  | Unauthorized | Verify domain configuration in dashboard          |
| 403  | Forbidden    | Check domain/API key permissions                  |
| 404  | Not Found    | Verify endpoint URL matches dashboard domain      |
| 500  | Server Error | Try again, contact support if persists            |


### Error Example

```json
{
  "message": "Missing required field: eventName",
  "code": "400"
}
```

---

## Validation Tools

### Server Validation

1. Trigger events from your HTTP API
2. Check EdgeTag dashboard for events appearing in real-time analytics
3. Verify event data matches your payload

### Payload Validator Channel

During implementation, set up a test channel to validate payloads:

1. Create a "Payload Validator" channel in EdgeTag dashboard
2. Send events to this channel
3. Check dashboard for validation errors
4. Once validated, remove the test channel
5. Move events to production channels

---

## Request Examples by Event Type

### PageView Event

```bash
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-456-def" \
  --data '{
    "eventId": "pv_20260226_001",
    "eventName": "PageView",
    "timestamp": 1707302400000,
    "pageUrl": "https://example.com/products",
    "pageTitle": "Products"
  }'
```

### ViewContent Event

```bash
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-456-def" \
  --data '{
    "eventId": "vc_20260226_001",
    "eventName": "ViewContent",
    "timestamp": 1707302400000,
    "pageUrl": "https://example.com/product/widget-pro",
    "pageTitle": "Widget Pro",
    "data": {
      "contents": [
        {
          "name": "Widget Pro",
          "id": "widget-pro-001"
        }
      ]
    }
  }'
```

### Search Event

```bash
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  --data '{
    "eventId": "search_20260226_001",
    "eventName": "Search",
    "timestamp": 1707302400000,
    "pageUrl": "https://example.com/search",
    "pageTitle": "Search Results",
    "search": "wireless headphones",
    "data": {
      "userEmail": "user@example.com"
    }
  }'
```

