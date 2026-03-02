# ConsentIQ Analytics Reference

## Overview Metrics

The `consentIQOverview` MCP tool (or `GET /{scriptId}/analytics/overview` API) returns:

| Metric | Description |
|--------|-------------|
| Total Profiles | Count of all user profiles with consent data |
| Marketing Opt-In (Overall) | Users who consented to marketing |
| Marketing Opt-Out (Overall) | Users who declined marketing |
| Marketing Opt-In (EU) | EU users who consented (GDPR) |
| Marketing Opt-Out (EU) | EU users who declined |
| Marketing Opt-In (UK) | UK users who consented (UK GDPR) |
| Marketing Opt-Out (UK) | UK users who declined |
| Marketing Opt-In (CA) | Canadian users who consented (CCPA/CPRA) |
| Marketing Opt-Out (CA) | Canadian users who declined |
| 24h Marketing Changes | Consent changes in the last 24 hours |

### Usage

```
Tool: consentIQOverview
Parameters:
  channelId: <ConsentIQ channel ID from domains tool>
  teamId: <team ID>
```

---

## Category Breakdown

The `consentIQCategories` MCP tool (or `GET /{scriptId}/analytics/categories-chart` API) returns per-category consent broken down by geo region:

### Categories Tracked

| Category | Description |
|----------|-------------|
| `marketing` | Marketing and advertising consent |
| `analytics` | Analytics and performance measurement consent |
| `saleOfData` | Sale of personal data consent (CCPA/CPRA) |
| `preferences` | Preferences and functional consent |

### Response Shape

```typescript
{
  marketing: Array<{ filter: string, allowed: boolean, count: number }>,
  analytics: Array<{ filter: string, allowed: boolean, count: number }>,
  saleOfData: Array<{ filter: string, allowed: boolean, count: number }>,
  preferences: Array<{ filter: string, allowed: boolean, count: number }>,
  table: Array<{
    filter: string,        // "all", "eu", "uk", "ca"
    marketing: number,     // opt-in count
    analytics: number,
    saleOfData: number,
    preferences: number
  }>
}
```

### Usage

```
Tool: consentIQCategories
Parameters:
  channelId: <ConsentIQ channel ID>
  teamId: <team ID>
  range: "day" | "week" | "month"
```

### Range Options

| Range | Period |
|-------|--------|
| `day` | Last 24 hours |
| `week` | Last 7 days |
| `month` | Last 30 days |

---

## Regional Breakdown

ConsentIQ segments consent data by geographic region for compliance reporting:

| Filter | Region | Regulation |
|--------|--------|------------|
| `all` | All regions combined | — |
| `eu` | European Union | GDPR |
| `uk` | United Kingdom | UK GDPR |
| `ca` | Canada | CPRA/PIPEDA |

---

## Consent Trends

To track consent trends over time:

1. Call `consentIQCategories` with `range: "day"` for daily snapshots
2. Call `consentIQCategories` with `range: "week"` for weekly trends
3. Call `consentIQCategories` with `range: "month"` for monthly trends

Compare the summary table across time periods to identify:
- Increasing/decreasing opt-in rates
- Regional differences in consent behavior
- Impact of CMP changes on consent rates

---

## Typical Workflow

### Via MCP

1. **Get domain info**: Call `domains` MCP tool to find your domain
2. **Find ConsentIQ channel**: Look for channel with `providerId: "consentIQ"`
3. **Get overview**: Call `consentIQOverview` with the channelId and teamId
4. **Get category details**: Call `consentIQCategories` with range = `month` for overall picture
5. **Compare regions**: Look at the `table` array in the categories response to compare EU vs UK vs CA opt-in rates

### Via Provider API

1. **Find ConsentIQ channel**: Get the `scriptId` from the EdgeTag dashboard (channel with `providerId: "consentIQ"`)
2. **Get overview**: `GET https://api.edgetag.io/v1/provider/consentIQ/{scriptId}/analytics/overview`
3. **Get category details**: `GET https://api.edgetag.io/v1/provider/consentIQ/{scriptId}/analytics/categories-chart?range=month`
4. **Track trends**: `GET https://api.edgetag.io/v1/provider/consentIQ/{scriptId}/analytics/marketing-trending?range=week`

See [provider-api.md](provider-api.md) for full endpoint reference.
