# Edge Lake Provider API

REST API for programmatic access to Edge Lake data from application code.

## Base URL

```
https://api.edgetag.io/v1/provider/edgeLake/{scriptId}
```

`scriptId` is the Edge Lake channel's `scriptId` (UUID). Find it in the EdgeTag dashboard or via the MCP `domains` tool (look for `providerId: "edgeLake"`).

## Authentication

All endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer {accessToken}
```

---

## Endpoints

### POST `/{scriptId}/query`

Execute a SQL query against the `lake.events` table.

**Request:**

```json
{
  "sql": "SELECT event_name, COUNT(*) FROM lake.events WHERE event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY event_name LIMIT 100"
}
```

**Response:**

```json
{
  "rows": [
    { "event_name": "PageView", "COUNT(*)": 15234 },
    { "event_name": "Purchase", "COUNT(*)": 892 }
  ],
  "meta": {
    "storageCount": 5,
    "filesScanned": 12,
    "bytesScanned": 1048576
  }
}
```

All R2 SQL limitations apply — see [sql-reference.md](sql-reference.md) for supported syntax.

---

### POST `/{scriptId}/funnel`

Conversion funnel analysis across standard event types: PageView → ViewContent → AddToCart → InitiateCheckout → Purchase.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York"
}
```

| Field           | Type                        | Required | Description               |
| --------------- | --------------------------- | -------- | ------------------------- |
| `startDateTime` | string (ISO 8601)           | Yes      | Start of the time range   |
| `endDateTime`   | string (ISO 8601)           | Yes      | End of the time range     |
| `granularity`   | `DAY` \| `HOUR` \| `MINUTE` | No       | Defaults to `DAY`         |
| `timezone`      | string (IANA)               | No       | Timezone for the analysis |

**Response:**

```json
{
  "steps": [
    { "name": "PageView", "value": 50000 },
    { "name": "ViewContent", "value": 12000 },
    { "name": "AddToCart", "value": 3500 },
    { "name": "InitiateCheckout", "value": 1200 },
    { "name": "Purchase", "value": 800 }
  ]
}
```

Values are approximate distinct session counts for each funnel step.

---

### POST `/{scriptId}/traffic-analysis`

Traffic breakdown by browser, OS, device type, and country. Uses Cloudflare zone-level analytics.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York"
}
```

Same fields as funnel endpoint.

**Response:**

```json
{
  "chartData": { "2025-02-01T00:00:00Z": 1234, "2025-02-02T00:00:00Z": 1456 },
  "topBrowsers": { "Chrome": 5000, "Safari": 3200 },
  "topOSs": { "Windows": 4000, "macOS": 2800 },
  "topDeviceTypes": { "desktop": 6000, "mobile": 3500 },
  "topCountries": { "United States": 4500, "Germany": 1200 }
}
```

---

### POST `/{scriptId}/bot-score`

Bot detection analysis using Cloudflare bot scores (0–100). Requires the domain to have a Cloudflare Zone ID configured.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York"
}
```

**Response:**

```json
{
  "overview": { "0": 500, "1": 120, "2-9": 300, "90-100": 45000 },
  "chartData": {
    "2025-02-01T00:00:00Z": { "0": 15, "90-100": 1500 }
  }
}
```

**Bot score ranges:** `0` (confirmed bot), `1` (highly likely bot), `2-9`, `10-19`, `20-29` (likely bot), `30-39`, `40-49`, `50-59` (uncertain), `60-69`, `70-79`, `80-89` (likely human), `90-100` (confirmed human).

---

### POST `/{scriptId}/attack-analysis`

WAF attack classification analysis using Cloudflare attack scores.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York"
}
```

**Response:**

```json
{
  "overview": {
    "clean": 45000,
    "likely_clean": 3000,
    "likely_attack": 200,
    "attack": 50,
    "not_scored": 1000
  },
  "chartData": {
    "2025-02-01T00:00:00Z": { "clean": 1500, "attack": 2 }
  }
}
```

**Attack classes:** `attack` (confirmed malicious), `likely_attack` (probably malicious), `likely_clean` (probably safe), `clean` (confirmed safe), `not_scored` (not evaluated).

---

### POST `/{scriptId}/bot-categories`

Bot traffic grouped by Cloudflare verified bot category. Requires Zone ID.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York"
}
```

**Response:**

```json
{
  "overview": { "Search Engine Crawler": 5000, "Feed Fetcher": 1200 },
  "chartData": {
    "2025-02-01T00:00:00Z": { "Search Engine Crawler": 180 }
  }
}
```

---

### POST `/{scriptId}/bot-category-detail`

User agents for a specific bot category. Requires Zone ID.

**Request:**

```json
{
  "startDateTime": "2025-02-01T00:00:00.000Z",
  "endDateTime": "2025-02-28T23:59:59.999Z",
  "granularity": "DAY",
  "timezone": "America/New_York",
  "category": "Search Engine Crawler"
}
```

| Field      | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| `category` | string | Yes      | Bot category name from `bot-categories` |

**Response:**

```json
{
  "userAgents": [
    { "name": "Googlebot (Linux)", "count": 3200 },
    { "name": "Bingbot (Linux)", "count": 1800 }
  ]
}
```

---

## Usage Example

```typescript
const EDGETAG_API = 'https://api.edgetag.io/v1/provider/edgeLake'

async function queryEdgeLake(scriptId: string, sql: string, token: string) {
  const response = await fetch(`${EDGETAG_API}/${scriptId}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    throw new Error(`Edge Lake query failed: ${response.status}`)
  }

  return response.json()
}

// Example: get purchase count by UTM source
const result = await queryEdgeLake(
  scriptId,
  `SELECT attribution_session_utm_source, COUNT(*), SUM(payload_value)
   FROM lake.events
   WHERE event_name = 'Purchase'
     AND event_timestamp >= ${Date.now() - 7 * 24 * 60 * 60 * 1000}
     AND event_timestamp < ${Date.now()}
   GROUP BY attribution_session_utm_source
   LIMIT 100`,
  accessToken,
)
```
