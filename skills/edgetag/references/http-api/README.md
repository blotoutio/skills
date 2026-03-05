# EdgeTag HTTP API Reference

## Overview

The EdgeTag HTTP API allows you to send events and user data from systems outside the browser context. This is essential for offline events, backend systems, CRM integrations, etc.

## When to Use HTTP API

- **Offline Events**: Track purchases, sign-ups, or actions that occur in offline channels
- **Backend Systems**: Forward events from your server-side infrastructure
- **CRM Integrations**: Connect customer data platforms or CRM systems to EdgeTag
- **Mobile Apps**: Send events from native mobile applications
- **Batch Processing**: Process historical or bulk data
- **Backend Event Pipeline**: Integrate EdgeTag into your data pipeline
- **Audience Uploads**: Upload customer segments for ad platform targeting

## Two User Identification Methods

EdgeTag supports two ways to identify users in HTTP API requests:

### Method 1: EdgeTag ID (via header)

```
EdgeTagUserId: user-123-abc
```

- Use `getUserId()` from the browser SDK to get the EdgeTag user ID
- **Save it against your own user identifier** (e.g., store it in your database alongside your internal user/customer ID). This is critical — when you later send server-side events, you need to retrieve the EdgeTag ID for that user
- Pass it as the `EdgeTagUserId` header in requests
- If no browser connection exists, use method 2

### Method 2: Email (via payload)

```json
{
  "data": {
    "userEmail": "user@example.com"
  }
}
```

- Include `userEmail` in the payload data
- EdgeTag searches the ID graph and automatically connects the user
- Useful when you don't have the EdgeTag ID
- Works best with established users in your system

## API Endpoints

Four endpoints for different purposes:

| Endpoint            | Method | Purpose                                            |
| ------------------- | ------ | -------------------------------------------------- |
| `/tag`              | GET    | Send events (page views, purchases, etc.)          |
| `/data`             | POST   | Enrich ID graph with user information              |
| `/getInstancesData` | GET    | Look up user instances by email or EdgeTag user ID |
| `/audience`         | POST   | Upload customer segments to advertising channels   |

## Key Concepts

- **EventId**: Should be unique per event. EdgeTag forwards every event to channels — it does not deduplicate. Channels that support deduplication (e.g., Meta) use eventId to avoid double-counting. Send each event only once
- **Timestamp**: Always include milliseconds since epoch for accurate attribution
- **Consent**: When consent management is enabled, always include it in the `storage.edgeTag.consentCategories` field
- **Providers**: Specify which attribution providers should receive the event

## Next Steps

- See [API Reference](./api-reference.md) for detailed endpoint specifications and curl examples
- See [Gotchas](./gotchas.md) for common implementation mistakes
- See [Patterns](./patterns.md) for real-world integration examples
