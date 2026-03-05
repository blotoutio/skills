# Edge Lake SQL Reference

## Table: `lake.events`

All queries run against a single table: `lake.events`.

## Column Reference

### Event Columns

| Column            | Type    | Required | Description                                                                                  |
| ----------------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `event_sessionId` | string  | ✓        | Session identifier                                                                           |
| `event_timestamp` | integer | ✓        | Event timestamp in milliseconds since epoch                                                  |
| `event_id`        | string  | ✓        | Unique event identifier                                                                      |
| `event_name`      | string  | ✓        | Event type: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Search` |
| `event_pageUrl`   | string  | —        | Full page URL where event occurred                                                           |
| `event_pageTitle` | string  | —        | Page title                                                                                   |
| `event_referrer`  | string  | —        | Referrer URL                                                                                 |
| `event_origin`    | string  | —        | Origin URL                                                                                   |

### Payload Columns (Purchase/Cart Data)

| Column                | Type   | Description                        |
| --------------------- | ------ | ---------------------------------- |
| `payload_checkoutUrl` | string | Checkout URL                       |
| `payload_currency`    | string | Currency code (e.g., `USD`, `EUR`) |
| `payload_value`       | number | Transaction value                  |
| `payload_orderId`     | string | Order identifier                   |
| `payload_sourceId`    | string | Source identifier                  |
| `payload_search`      | string | Search query string                |

### User Columns

| Column             | Type    | Required | Description                  |
| ------------------ | ------- | -------- | ---------------------------- |
| `user_id`          | string  | ✓        | Unique user identifier       |
| `user_email`       | string  | —        | User email                   |
| `user_phone`       | string  | —        | User phone number            |
| `user_firstName`   | string  | —        | First name                   |
| `user_lastName`    | string  | —        | Last name                    |
| `user_gender`      | string  | —        | Gender                       |
| `user_dateOfBirth` | string  | —        | Date of birth                |
| `user_country`     | string  | —        | Country                      |
| `user_state`       | string  | —        | State/province               |
| `user_city`        | string  | —        | City                         |
| `user_zip`         | string  | —        | Postal code                  |
| `user_ip`          | string  | —        | IP address                   |
| `user_createdAt`   | integer | —        | User creation timestamp (ms) |

### Geo Columns

| Column            | Type    | Required | Description           |
| ----------------- | ------- | -------- | --------------------- |
| `geo_ip`          | string  | ✓        | IP address            |
| `geo_country`     | string  | ✓        | Country code          |
| `geo_timezone`    | string  | ✓        | IANA timezone         |
| `geo_continent`   | string  | ✓        | Continent code        |
| `geo_isEUCountry` | boolean | ✓        | Whether user is in EU |
| `geo_userAgent`   | string  | —        | User agent string     |
| `geo_city`        | string  | —        | City name             |
| `geo_region`      | string  | —        | Region name           |
| `geo_regionCode`  | string  | —        | Region code           |
| `geo_postalCode`  | string  | —        | Postal code           |
| `geo_ja4`         | string  | —        | JA4 fingerprint       |
| `geo_ja3`         | string  | —        | JA3 fingerprint       |

### Attribution Columns

| Column                             | Type          | Required | Description                              |
| ---------------------------------- | ------------- | -------- | ---------------------------------------- |
| `attribution_isNewCustomer`        | string        | ✓        | `"true"` or `"false"`                    |
| `attribution_providers`            | array[string] | ✓        | List of attribution providers            |
| `attribution_session_fc`           | string        | ✓        | Session first-click attribution channel  |
| `attribution_session_lc`           | string        | ✓        | Session last-click attribution channel   |
| `attribution_session_utm_source`   | string        | —        | Session UTM source                       |
| `attribution_session_utm_medium`   | string        | —        | Session UTM medium                       |
| `attribution_session_utm_campaign` | string        | —        | Session UTM campaign                     |
| `attribution_allTime_fc`           | string        | ✓        | All-time first-click attribution channel |
| `attribution_allTime_utm_source`   | string        | —        | All-time UTM source                      |
| `attribution_allTime_utm_medium`   | string        | —        | All-time UTM medium                      |
| `attribution_allTime_utm_campaign` | string        | —        | All-time UTM campaign                    |

### Consent Columns

| Column                           | Type    | Required | Description                           |
| -------------------------------- | ------- | -------- | ------------------------------------- |
| `consent_providers`              | string  | ✓        | JSON string of consent per provider   |
| `consent_enabled`                | boolean | ✓        | Whether consent management is enabled |
| `consent_settings`               | string  | ✓        | JSON string of consent settings       |
| `consent_categories_all`         | boolean | —        | All consent categories granted        |
| `consent_categories_necessary`   | boolean | —        | Necessary consent                     |
| `consent_categories_advertising` | boolean | —        | Advertising consent                   |
| `consent_categories_analytics`   | boolean | —        | Analytics consent                     |
| `consent_categories_functional`  | boolean | —        | Functional consent                    |
| `consent_categories_share_pii`   | boolean | —        | Share PII consent                     |

### Other

| Column       | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `customData` | string | JSON string of custom developer-set data |

---

## R2 SQL Syntax

Full R2 SQL documentation: https://developers.cloudflare.com/r2-sql/

### Supported

```sql
-- Basic query
SELECT event_name, COUNT(*)
FROM lake.events
WHERE event_timestamp >= 1706745600000
  AND event_timestamp < 1709424000000
GROUP BY event_name
LIMIT 100

-- Aggregations
COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col)

-- Approximate aggregations
APPROX_DISTINCT(col), APPROX_PERCENTILE_CONT(col, percentile),
APPROX_MEDIAN(col), APPROX_TOP_K(col, k)

-- WHERE operators
=, !=, <, <=, >, >=, BETWEEN, LIKE 'prefix%', AND, OR, IS NULL, IS NOT NULL

-- Other
GROUP BY, HAVING, ORDER BY, LIMIT (1-10000)

-- Schema discovery
SHOW DATABASES
SHOW TABLES IN lake
DESCRIBE lake.events
```

### NOT Supported

- **NO JOINs** of any kind
- **NO subqueries** (`SELECT ... FROM (SELECT ...)`)
- **NO aliases** (`AS` keyword)
- **NO CTEs** (`WITH` clause)
- **NO UNION, INTERSECT, EXCEPT**
- **NO window functions** (ROW_NUMBER, RANK, LAG, LEAD)
- **NO IN lists** — use multiple `OR` conditions instead
- **NO column-to-column comparisons** in WHERE
- **NO functions** in WHERE clauses
- **NO arithmetic** operators (+, -, \*, /)
- **NO OFFSET** or pagination
- **NO COUNT(column)** or COUNT(DISTINCT) — only `COUNT(*)` works
- **NO LIKE** with suffix/infix patterns (`LIKE '%value'`)
- **NO JSON** field access or filtering
- **NO INSERT, UPDATE, DELETE** (read-only)

### Aggregation Column Names

R2 SQL returns aggregation columns with the exact function call as the key name:

```
SELECT COUNT(*)           → row key is "COUNT(*)"
SELECT SUM(payload_value) → row key is "SUM(payload_value)"
```

---

## Common Query Patterns

### Event counts by type

```sql
SELECT event_name, COUNT(*)
FROM lake.events
WHERE event_timestamp >= 1706745600000
  AND event_timestamp < 1709424000000
GROUP BY event_name
LIMIT 100
```

### Revenue by UTM source

```sql
SELECT attribution_session_utm_source, COUNT(*), SUM(payload_value)
FROM lake.events
WHERE event_name = 'Purchase'
  AND event_timestamp >= 1706745600000
  AND event_timestamp < 1709424000000
GROUP BY attribution_session_utm_source
LIMIT 100
```

### Unique users by country

```sql
SELECT geo_country, APPROX_DISTINCT(user_id)
FROM lake.events
WHERE event_timestamp >= 1706745600000
  AND event_timestamp < 1709424000000
GROUP BY geo_country
LIMIT 100
```

### Top pages by views

```sql
SELECT event_pageUrl, COUNT(*)
FROM lake.events
WHERE event_name = 'PageView'
  AND event_timestamp >= 1706745600000
  AND event_timestamp < 1709424000000
GROUP BY event_pageUrl
ORDER BY COUNT(*) DESC
LIMIT 20
```

## Performance Tips

- **ALWAYS** include `event_timestamp` range filters (enables R2 file pruning)
- Use specific column names instead of `SELECT *` to reduce data scanned
- Use `GROUP BY` with aggregation functions to reduce result set size
- Use `LIMIT` to cap results (max 10,000)
- For multiple OR conditions instead of IN: `WHERE col = 'a' OR col = 'b'`
