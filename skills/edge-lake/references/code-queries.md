# Edge Lake Code Queries

Use `edgeLakeCodeQuery` when your analysis requires multiple queries, joins, aggregations, or any
data processing beyond what a single SQL query can handle.

**Note:** Code queries are only available via the EdgeTag MCP server (`edgeLakeCodeQuery` tool). There is no REST API endpoint for code queries.

## How It Works

1. Declare SQL queries in the `queries` parameter — each key becomes a JavaScript variable
2. Write processing code in `code` — all query results are pre-loaded before your code runs
3. All queries execute in parallel on the server
4. Your code MUST `return` the final result

## Constraints

- Maximum 20 queries per execution
- Maximum 30 second execution time
- Maximum 100KB result size
- Maximum 5MB total query data
- SQL is read-only: only SELECT, SHOW, DESCRIBE

## Available APIs in Code

- Each query variable: `{ rows: Record<string, unknown>[], meta: { storageCount, filesScanned, bytesScanned } }`
- `console.log()`, `console.error()`, `console.warn()` — captured and returned

---

## Pattern: Conversion Funnel by Referrer

```javascript
// queries:
{
  "pvByRef": "SELECT event_referrer, COUNT(*) FROM lake.events WHERE event_name = 'PageView' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY event_referrer LIMIT 100",
  "atcByRef": "SELECT event_referrer, COUNT(*) FROM lake.events WHERE event_name = 'AddToCart' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY event_referrer LIMIT 100",
  "purchByRef": "SELECT event_referrer, SUM(payload_value), COUNT(*) FROM lake.events WHERE event_name = 'Purchase' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY event_referrer LIMIT 100"
}

// code:
const referrers = new Map()
for (const row of pvByRef.rows) {
  referrers.set(row.event_referrer, {
    referrer: row.event_referrer,
    pageviews: row['COUNT(*)'],
    addToCarts: 0, purchases: 0, revenue: 0
  })
}
for (const row of atcByRef.rows) {
  const r = referrers.get(row.event_referrer)
  if (r) r.addToCarts = row['COUNT(*)']
}
for (const row of purchByRef.rows) {
  const r = referrers.get(row.event_referrer)
  if (r) { r.purchases = row['COUNT(*)']; r.revenue = row['SUM(payload_value)'] || 0 }
}

return [...referrers.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 20)
  .map(r => ({
    ...r,
    conversionRate: r.pageviews ? ((r.purchases / r.pageviews) * 100).toFixed(2) + '%' : '0%'
  }))
```

---

## Pattern: Daily Revenue Trend

```javascript
// queries:
{
  "data": "SELECT event_timestamp, payload_value FROM lake.events WHERE event_name = 'Purchase' AND event_timestamp >= 1704067200000 AND event_timestamp < 1706745600000 LIMIT 10000"
}

// code:
const DAY_MS = 86400000
const daily = {}
for (const row of data.rows) {
  const day = new Date(Math.floor(row.event_timestamp / DAY_MS) * DAY_MS).toISOString().split('T')[0]
  if (!daily[day]) daily[day] = { revenue: 0, orders: 0 }
  daily[day].revenue += row.payload_value || 0
  daily[day].orders++
}

return Object.entries(daily)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, d]) => ({
    date,
    revenue: d.revenue.toFixed(2),
    orders: d.orders,
    aov: (d.revenue / d.orders).toFixed(2)
  }))
```

---

## Pattern: Attribution Report (UTM Source × Revenue)

```javascript
// queries:
{
  "purchases": "SELECT attribution_session_utm_source, attribution_session_utm_medium, COUNT(*), SUM(payload_value) FROM lake.events WHERE event_name = 'Purchase' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY attribution_session_utm_source, attribution_session_utm_medium LIMIT 200"
}

// code:
return purchases.rows
  .map(row => ({
    source: row.attribution_session_utm_source || '(direct)',
    medium: row.attribution_session_utm_medium || '(none)',
    orders: row['COUNT(*)'],
    revenue: (row['SUM(payload_value)'] || 0).toFixed(2)
  }))
  .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
```

---

## Pattern: New vs Returning Customer Revenue

```javascript
// queries:
{
  "newCustomers": "SELECT COUNT(*), SUM(payload_value) FROM lake.events WHERE event_name = 'Purchase' AND attribution_isNewCustomer = 'true' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000",
  "returning": "SELECT COUNT(*), SUM(payload_value) FROM lake.events WHERE event_name = 'Purchase' AND attribution_isNewCustomer = 'false' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000"
}

// code:
const newRow = newCustomers.rows[0] || {}
const retRow = returning.rows[0] || {}

return {
  new: {
    orders: newRow['COUNT(*)'] || 0,
    revenue: (newRow['SUM(payload_value)'] || 0).toFixed(2)
  },
  returning: {
    orders: retRow['COUNT(*)'] || 0,
    revenue: (retRow['SUM(payload_value)'] || 0).toFixed(2)
  }
}
```

---

## Pattern: Top Products by Revenue

```javascript
// queries:
{
  "products": "SELECT event_pageUrl, event_pageTitle, COUNT(*), SUM(payload_value) FROM lake.events WHERE event_name = 'Purchase' AND event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000 GROUP BY event_pageUrl, event_pageTitle LIMIT 500"
}

// code:
return products.rows
  .map(row => ({
    url: row.event_pageUrl,
    title: row.event_pageTitle,
    orders: row['COUNT(*)'],
    revenue: (row['SUM(payload_value)'] || 0).toFixed(2)
  }))
  .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
  .slice(0, 20)
```

---

## Tips

- All queries run in parallel automatically — no need for Promise.all
- ALWAYS include `event_timestamp` filters for performance
- Use `GROUP BY` in SQL to reduce data before JavaScript processing
- If result exceeds 100KB, aggregate more aggressively or use `.slice()`
- If query data exceeds 5MB, add stricter WHERE/LIMIT/GROUP BY clauses
- Use `console.log()` for debugging — logs are returned with the result
- Check actual column names: `console.log('columns:', Object.keys(myQuery.rows[0]))`
