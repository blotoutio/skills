# Edge Lake Query Gotchas

## 1. Forgetting event_timestamp Filter

**Problem**: Query scans all data, very slow or times out.

```sql
-- WRONG: No timestamp filter
SELECT event_name, COUNT(*) FROM lake.events GROUP BY event_name LIMIT 100
```

```sql
-- RIGHT: Always filter by timestamp
SELECT event_name, COUNT(*)
FROM lake.events
WHERE event_timestamp >= 1706745600000 AND event_timestamp < 1709424000000
GROUP BY event_name
LIMIT 100
```

---

## 2. R2 SQL Syntax Errors (IN, AS, COUNT, JOINs, LIKE)

Several common SQL patterns are **not supported** by R2 SQL. Quick fixes:

- **IN lists** → use `OR`: `WHERE col = 'a' OR col = 'b'`
- **Aliases (AS)** → omit; access aggregation columns by function name: `row['COUNT(*)']`
- **COUNT(column) / COUNT(DISTINCT)** → use `COUNT(*)` or `APPROX_DISTINCT(col)`
- **JOINs / subqueries** → use `edgeLakeCodeQuery` with multiple queries + JS processing
- **LIKE suffix/infix** (`'%value%'`) → only prefix patterns (`'value%'`) are supported

See **sql-reference.md § R2 SQL Syntax** for the complete list of supported and unsupported operations.

---

## 3. Timestamps in Seconds vs Milliseconds

**Problem**: Using Unix seconds instead of milliseconds.

```sql
-- WRONG: Seconds (10 digits)
WHERE event_timestamp >= 1706745600

-- RIGHT: Milliseconds (13 digits)
WHERE event_timestamp >= 1706745600000
```

---

## 4. Exceeding Result Size in Code Queries

**Problem**: `edgeLakeCodeQuery` returns error when result exceeds 100KB.

**Solution**: Aggregate or slice data before returning:

```javascript
// Aggregate in SQL with GROUP BY instead of returning raw rows
// Or slice in JS:
return results.slice(0, 50)
```

---

## 5. Accessing Aggregation Columns with Wrong Key

**Problem**: Aggregation columns use the exact SQL function as the key.

```javascript
// WRONG
row.count  // undefined
row.total  // undefined

// RIGHT
row['COUNT(*)']
row['SUM(payload_value)']

// Tip: discover keys
console.log('columns:', Object.keys(myQuery.rows[0]))
```
