# Edge Lake Setup Guide

Edge Lake is a singleton, API-only provider — one instance per domain, no client-side code. It automatically captures all events flowing through EdgeTag and stores them in a queryable R2 data lake.

## Adding via Shopify App

Install the Edge Lake Shopify app from the App Store:

**[https://apps.shopify.com/blotout-datanexus](https://apps.shopify.com/blotout-datanexus)**

The app adds Edge Lake to your EdgeTag domain automatically. No manual schema configuration needed — the default schema is applied, capturing all standard event fields.

## Adding via Blotout Support

Contact Blotout support (`support@blotout.io`) to have Edge Lake enabled on your domain. They will configure the channel with the default schema and deploy it.

## Adding via Script API

### Endpoint

```
POST https://api.edgetag.io/v1/script
```

### Request

```json
{
  "name": "Edge Lake",
  "providerId": "edgeLake",
  "tagId": "<domain-id>",
  "shouldDeploy": true,
  "secrets": [
    {
      "variable": "EDGE_LAKE_JSON_SCHEMA",
      "type": "TEXT",
      "optional": false,
      "data": "<encrypted-schema-json>",
      "iv": "<initialization-vector>",
      "key": "<encryption-key>"
    }
  ]
}
```

### Required Fields

| Field          | Type          | Description                                |
| -------------- | ------------- | ------------------------------------------ |
| `name`         | string        | Channel name, must be unique per domain    |
| `providerId`   | string        | Must be `"edgeLake"`                       |
| `tagId`        | string (UUID) | The domain/tag ID                          |
| `shouldDeploy` | boolean       | Auto-deploy after creation (default: true) |
| `secrets`      | array         | Must include `EDGE_LAKE_JSON_SCHEMA`       |

### Response

```json
{
  "scriptId": "<created-channel-id>"
}
```

### Error Codes

| Code | Cause                                                                     |
| ---- | ------------------------------------------------------------------------- |
| 400  | Invalid request (bad geo regions, duplicate name)                         |
| 403  | Provider not available for team                                           |
| 409  | Tag doesn't exist, or Edge Lake already exists on this domain (singleton) |

## Required Secret

Edge Lake needs one secret: `EDGE_LAKE_JSON_SCHEMA` — a JSON Schema defining the event data structure stored in R2.

The secret value is the full JSON schema as a string. The default schema covers all standard EdgeTag event fields (see Schema section below). You can customize it to add custom fields.

## Schema

The JSON schema defines which fields are captured and stored for each event. The default schema covers events, payloads, users, geo, attribution, consent, and custom data fields.

See **sql-reference.md § Column Reference** for the complete column reference with types and descriptions.

## Provider Characteristics

| Property         | Value                                             |
| ---------------- | ------------------------------------------------- |
| Provider ID      | `edgeLake`                                        |
| Singleton        | Yes — one per domain                              |
| API-only         | Yes — no client-side code                         |
| Consent category | `necessary` (no opt-in required)                  |
| Storage          | Cloudflare R2 with SQL catalog                    |
| Streaming        | Cloudflare Pipelines (flush every 5 min or 500MB) |

## Infrastructure (Managed Automatically)

When Edge Lake is created, the deployment system provisions:

- **R2 bucket** named "lake" with SQL catalog enabled for querying
- **Cloudflare Pipeline** that streams events from Workers to R2, flushing every 5 minutes or at 500MB

For self-managed deployments, the domain's host configuration must include:

- `accountId` — Cloudflare Account ID
- `accessToken` — Cloudflare API Token with R2 and Analytics permissions
