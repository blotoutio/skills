# ConsentIQ Provider API

REST API for programmatic access to ConsentIQ consent analytics data.

## Base URL

```
https://api.edgetag.io/v1/provider/consentIQ/{scriptId}
```

`scriptId` is the ConsentIQ channel's `scriptId` (UUID). Find it in the EdgeTag dashboard or via the MCP `domains` tool (look for `providerId: "consentIQ"`).

## Authentication

All endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer {accessToken}
```

---

## Endpoints

### GET `/{scriptId}/analytics/overview`

Total profiles, marketing opt-in/opt-out overall and by region, plus last 24 hours changes.

**Response:**

```json
{
  "totalProfiles": 125000,
  "totalMarketing": { "optIn": 85000, "optOut": 40000 },
  "euOverview": { "optIn": 30000, "optOut": 25000 },
  "ukOverview": { "optIn": 12000, "optOut": 5000 },
  "caOverview": { "optIn": 8000, "optOut": 3000 },
  "last24HoursMarketing": { "optIn": 1200, "optOut": 300 }
}
```

---

### GET `/{scriptId}/analytics/categories-chart`

Per-category consent breakdown by region.

**Query Parameters:**

| Param   | Type                       | Required | Description                               |
| ------- | -------------------------- | -------- | ----------------------------------------- |
| `range` | `day` \| `week` \| `month` | Yes      | Time window: last 24h, 7 days, or 30 days |

**Response:**

```json
{
  "marketing": [
    { "filter": "all", "allowed": "1", "count": "85000" },
    { "filter": "eu", "allowed": "1", "count": "30000" }
  ],
  "analytics": [{ "filter": "all", "allowed": "1", "count": "90000" }],
  "saleOfData": [{ "filter": "all", "allowed": "1", "count": "60000" }],
  "preferences": [{ "filter": "all", "allowed": "1", "count": "95000" }],
  "table": [
    {
      "filter": "all",
      "marketing": "85000",
      "analytics": "90000",
      "saleOfData": "60000",
      "preferences": "95000"
    },
    {
      "filter": "eu",
      "marketing": "30000",
      "analytics": "35000",
      "saleOfData": "20000",
      "preferences": "38000"
    },
    {
      "filter": "uk",
      "marketing": "12000",
      "analytics": "13000",
      "saleOfData": "9000",
      "preferences": "14000"
    },
    {
      "filter": "ca",
      "marketing": "8000",
      "analytics": "9000",
      "saleOfData": "6000",
      "preferences": "9500"
    }
  ]
}
```

---

### GET `/{scriptId}/analytics/marketing-chart`

Marketing opt-in/opt-out totals with top 10 regions.

**Query Parameters:**

| Param   | Type                       | Required | Description |
| ------- | -------------------------- | -------- | ----------- |
| `range` | `day` \| `week` \| `month` | Yes      | Time window |

**Response:**

```json
{
  "totalOptIn": 85000,
  "totalOptOut": 40000,
  "filter": [
    ["EU", 30000],
    ["US", 20000],
    ["UK", 12000]
  ]
}
```

---

### GET `/{scriptId}/analytics/marketing-table`

Marketing opt-in counts per region, aggregated across day/week/month windows.

**Response:**

```json
{
  "filter": {
    "EU": { "total": 30000, "day": 500, "week": 3200, "month": 12000 },
    "UK": { "total": 12000, "day": 200, "week": 1400, "month": 5000 },
    "CA": { "total": 8000, "day": 150, "week": 900, "month": 3500 }
  }
}
```

---

### GET `/{scriptId}/analytics/marketing-trending`

Marketing consent opt-in/opt-out trends over time.

**Query Parameters:**

| Param   | Type                       | Required | Description                                                                    |
| ------- | -------------------------- | -------- | ------------------------------------------------------------------------------ |
| `range` | `day` \| `week` \| `month` | Yes      | Time window. `day` returns hourly buckets, `week`/`month` return daily buckets |

**Response:**

```json
{
  "trending": {
    "2025-02-01": { "optIn": 1200, "optOut": 300 },
    "2025-02-02": { "optIn": 1150, "optOut": 280 }
  },
  "filter": {
    "EU": [
      { "date": "2025-02-01", "count": 500 },
      { "date": "2025-02-02", "count": 480 }
    ]
  }
}
```

For `range: "day"`, dates use hourly format (`2025-02-01 14:00`). For `range: "week"` or `"month"`, dates use daily format (`2025-02-01`).

---

### GET `/{scriptId}/analytics/saleofdata-chart`

Sale of data opt-in/opt-out totals with top 10 regions.

**Query Parameters:**

| Param   | Type                       | Required | Description |
| ------- | -------------------------- | -------- | ----------- |
| `range` | `day` \| `week` \| `month` | Yes      | Time window |

**Response:** Same shape as marketing-chart.

---

### GET `/{scriptId}/analytics/saleofdata-table`

Sale of data opt-in counts per region, aggregated across day/week/month windows.

**Response:** Same shape as marketing-table.

---

### GET `/{scriptId}/analytics/saleofdata-trending`

Sale of data consent trends over time.

**Query Parameters:**

| Param   | Type                       | Required | Description |
| ------- | -------------------------- | -------- | ----------- |
| `range` | `day` \| `week` \| `month` | Yes      | Time window |

**Response:** Same shape as marketing-trending.

---

### GET `/{scriptId}/analytics/dnt-trending`

Do Not Track (GPC) signal trends compared with marketing consent trends.

**Query Parameters:**

| Param   | Type                       | Required | Description |
| ------- | -------------------------- | -------- | ----------- |
| `range` | `day` \| `week` \| `month` | Yes      | Time window |

**Response:**

```json
{
  "trending": {
    "2025-02-01": {
      "marketing": { "optIn": 1200, "optOut": 300 },
      "dnt": { "optIn": 50, "optOut": 1450 }
    }
  }
}
```

---

### GET `/{scriptId}/analytics/dnt-table`

DNT/GPC signal counts per region, aggregated across day/week/month windows.

**Response:** Same shape as marketing-table.

---

## Usage Example

```typescript
const CONSENTIQ_API = 'https://api.edgetag.io/v1/provider/consentIQ'

async function getConsentOverview(scriptId: string, token: string) {
  const response = await fetch(
    `${CONSENTIQ_API}/${scriptId}/analytics/overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`ConsentIQ request failed: ${response.status}`)
  }

  return response.json()
}

// Example: get marketing consent trends for the last week
async function getMarketingTrends(scriptId: string, token: string) {
  const response = await fetch(
    `${CONSENTIQ_API}/${scriptId}/analytics/marketing-trending?range=week`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.json()
}
```

## Data Characteristics

- **Processing delay:** 15–30 minutes for new consent events to appear
- **Region filters:** `all`, `eu` (GDPR), `uk` (UK GDPR), `ca` (CCPA/CPRA)
- **Consent values:** `"1"` (opted in), `"0"` (opted out), `"unknown"` (no decision)
- **DNT/GPC:** `"1"` if `Sec-GPC` header is present, `"0"` otherwise
