# EdgeTag MCP Setup

EdgeTag exposes a remote MCP server at `https://mcp.edgetag.io` that gives AI assistants access to domain management, event data queries (Edge Lake), user data queries (ID Graph), consent analytics (ConsentIQ), channel health (Meta EMQ), traffic analytics, bot detection, and more.

## Connection URL

```
https://mcp.edgetag.io/sse
```

## Authentication

The MCP server uses OAuth with PKCE. On first connection, the client redirects to the EdgeTag login page at `https://app.edgetag.io`. After authentication, access and refresh tokens are issued automatically.

- **Access token TTL:** 105 minutes
- **Token refresh:** Handled automatically by the MCP client
- **Token revocation:** Call the `revokeToken` tool, then restart the client to re-authenticate

## Client Setup

### Claude Desktop

Add to your Claude Desktop MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "edgetag": {
      "url": "https://mcp.edgetag.io/sse"
    }
  }
}
```

### Claude Code

Add the MCP server via CLI:

```bash
claude mcp add edgetag --transport sse https://mcp.edgetag.io/sse
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "edgetag": {
      "url": "https://mcp.edgetag.io/sse"
    }
  }
}
```

## First Connection Flow

1. Client connects to `https://mcp.edgetag.io/sse`
2. MCP server returns an OAuth authorization challenge
3. Browser opens the EdgeTag login page (`https://app.edgetag.io`)
4. User authenticates with their EdgeTag account
5. Callback returns tokens to the MCP client
6. Connection is established — all 22 tools are now available

## All Available Tools

### Account & Domain Management

| Tool        | Description                                                                                                                            | Input Params                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `me`        | Get current user info and team memberships                                                                                             | _(none)_                           |
| `domains`   | List all domains (tags) with their channels. Returns `domainId`, `teamId`, and channel list with `channelId` and `providerId` for each | _(none)_                           |
| `domainAdd` | Add a new domain to your team                                                                                                          | `domain` (string), `teamId` (uuid) |
| `dns`       | Verify DNS records for a domain and see which records still need to be added                                                           | `domainId` (uuid), `teamId` (uuid) |

### Channel & Analytics

| Tool                      | Description                                                                                                                                                                                                              | Input Params                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `channel`                 | Get channel configuration, consent category, and geo region restrictions                                                                                                                                                 | `channelId` (uuid), `teamId` (uuid)                                                                                                                                                             |
| `domainAnalytics`         | Traffic analytics for a domain, split by event status, event name, and channel                                                                                                                                           | `domainId` (uuid), `teamId` (uuid), `type` (enum: status/name/provider), `range` (number), `rangeType` (enum: MINUTE/HOUR/DAY), `status` (number: 1=success, 0=error), `timezone` (IANA string) |
| `domainAnalyticsProvider` | Event breakdown for a specific channel. Given a provider name (e.g. "facebook", "klaviyo"), returns event counts (PageView, Purchase, etc.) over time. Use after `domainAnalytics` with `type: "provider"` to drill down | `domainId` (uuid), `teamId` (uuid), `provider` (string), `range` (number), `rangeType` (enum: MINUTE/HOUR/DAY), `status` (number: 1=success, 0=error), `timezone` (IANA string)                 |
| `domainAnalyticsEvent`    | Channel breakdown for a specific event. Given an event name (e.g. "PageView", "Purchase"), returns counts per channel over time. Use after `domainAnalytics` with `type: "name"` to drill down                           | `domainId` (uuid), `teamId` (uuid), `event` (string), `range` (number), `rangeType` (enum: MINUTE/HOUR/DAY), `status` (number: 1=success, 0=error), `timezone` (IANA string)                    |
| `domainErrors`            | Error breakdown for a domain, grouped by channels and categories                                                                                                                                                         | `domainId` (uuid), `teamId` (uuid), `startDate` (ISO datetime), `endDate` (ISO datetime)                                                                                                        |
| `metaEMQ`                 | Facebook Event Match Quality (EMQ) score for the last 24 hours. Requires a channel with `providerId: "facebook"`                                                                                                         | `channelId` (uuid), `teamId` (uuid)                                                                                                                                                             |

### Edge Lake (Event Data)

| Tool                      | Description                                                                                                                                                                                                                                 | Input Params                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edgeLakeQuery`           | Execute a single SQL query against the `lake.events` R2 data lake                                                                                                                                                                           | `channelId` (uuid, edgeLake), `teamId` (uuid), `sql` (string)                                                                                                              |
| `edgeLakeCodeQuery`       | Execute a JavaScript program server-side against Edge Lake. Write all queries using `codemode.query(sql)` and all processing in a single `code` block. Use `Promise.all()` for parallel queries. Max 20 queries, 80s timeout, 100KB result. | `channelId` (uuid, edgeLake), `teamId` (uuid), `code` (string)                                                                                                             |
| `edgeLakeTrafficAnalysis` | HTTP traffic breakdown by browser, OS, device type, country                                                                                                                                                                                 | `channelId` (uuid, edgeLake), `teamId` (uuid), `startDateTime` (ISO string), `endDateTime` (ISO string), `granularity?` (enum: DAY/HOUR/MINUTE), `timezone?` (IANA string) |
| `edgeLakeBotScore`        | Bot detection analysis by Cloudflare bot scores (0-100)                                                                                                                                                                                     | `channelId` (uuid, edgeLake), `teamId` (uuid), `startDateTime` (ISO string), `endDateTime` (ISO string), `granularity?` (enum: DAY/HOUR/MINUTE), `timezone?` (IANA string) |
| `edgeLakeAttackAnalysis`  | WAF attack classification (attack, likely_attack, likely_clean, clean, not_scored)                                                                                                                                                          | `channelId` (uuid, edgeLake), `teamId` (uuid), `startDateTime` (ISO string), `endDateTime` (ISO string), `granularity?` (enum: DAY/HOUR/MINUTE), `timezone?` (IANA string) |

### ID Graph (User Data)

| Tool            | Description                                                                                                                                                                                        | Input Params                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `domainIDGraph` | Query the per-domain user database (D1) via SQL. Tables: `main` (user PII, consent), `cookie` (browser cookies), `custom` (developer-set data), `provider` (channel-specific data like UTM params) | `domainId` (uuid), `teamId` (uuid), `query` (SQL string) |

### ConsentIQ (Consent Analytics)

| Tool                  | Description                                                                                                                    | Input Params                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `consentIQOverview`   | Total profiles, marketing opt-in/out by region (EU, UK, CA), last 24h changes. Requires channel with `providerId: "consentIQ"` | `channelId` (uuid, consentIQ), `teamId` (uuid)                                 |
| `consentIQCategories` | Per-category consent breakdown (marketing, analytics, sale of data, preferences) by region                                     | `channelId` (uuid, consentIQ), `teamId` (uuid), `range` (enum: day/week/month) |

### Real-Time Logger

| Tool             | Description                                                                                                                                                                | Input Params                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loggerStart`    | Start a real-time logger session. Connects to the Cloudflare Worker tail WebSocket and buffers parsed log messages. Auto-closes after 5 minutes — call again to reconnect. | `domainId` (uuid), `teamId` (uuid), `status?` (enum: ok/exception), `events?` (string[], e.g. ["Purchase","AddToCart"]), `path?` (enum: init/tag/data/user/audience/consent/load/providers/webhook), `method?` (enum: POST/GET) |
| `loggerMessages` | Read buffered messages from an active logger session. Returns structured entries with eventName, channels, meta, outcome, and exceptions. Call repeatedly to poll.         | `maxMessages?` (int 1-1000, default 50)                                                                                                                                                                                         |
| `loggerStop`     | Stop an active logger session. Closes the WebSocket and clears the buffer.                                                                                                 | _(none)_                                                                                                                                                                                                                        |

### Token Management

| Tool          | Description                                                               | Input Params |
| ------------- | ------------------------------------------------------------------------- | ------------ |
| `revokeToken` | Revoke auth tokens. After revoking, restart the client to re-authenticate | _(none)_     |

## Typical Workflow

1. **Verify identity:** Call `me` to confirm your user and teams
2. **List domains:** Call `domains` to see all tracked websites with their channels
3. **Find the right channel:** Each tool needs a specific channel type:

- Edge Lake tools → channel with `providerId: "edgeLake"`
- ConsentIQ tools → channel with `providerId: "consentIQ"`
- Meta EMQ → channel with `providerId: "facebook"`

4. **Query data:** Use the channel's `channelId` and `teamId` with the relevant tool

## Complementary MCP: Chrome DevTools

For debugging EdgeTag implementations, add the Chrome DevTools MCP server alongside EdgeTag MCP. This lets the AI agent inspect browser network requests, JavaScript console errors, and verify events are firing — without manual DevTools inspection.

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--no-usage-statistics",
        "--no-performance-crux"
      ]
    }
  }
}
```

With both MCP servers connected, the agent can verify events client-side (Chrome DevTools) and server-side (EdgeTag MCP `edgeLakeQuery`).

## Recommended Debugging Workflow

When debugging event issues, use all three layers together for full visibility:

1. **Chrome DevTools MCP** (client-side) — See network requests, console errors, browser state. Confirms events are leaving the browser. Note: beacon requests need special handling (see debugging/gotchas.md).
2. **Real-Time Logger** (`loggerStart` → `loggerMessages` → `loggerStop`) (server-side real-time) — See events as EdgeTag processes them: event parsing, channel delivery, errors, and per-channel request/response details. Filter by event name, status, path, or method.
3. **Analytics & Edge Lake** (`domainAnalytics`, `domainAnalyticsProvider`, `domainAnalyticsEvent`, `domainErrors`, `edgeLakeQuery`) (historical) — Verify events were stored correctly, query patterns over time, check error rates and channel delivery.

This three-layer approach catches issues at every stage: client → edge processing → data storage.

See [debugging/README.md](../debugging/README.md) for full debugging tool recommendations.

## Troubleshooting

| Problem                              | Solution                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| "Invalid token" error                | Call `revokeToken`, then restart the client to re-authenticate                                   |
| Tools not appearing                  | Verify the MCP connection is active in your client's MCP panel                                   |
| Missing teamId/channelId             | Call `domains` first to get the IDs for your domain                                              |
| No channel of expected type          | The feature (Edge Lake, ConsentIQ, etc.) must be enabled for the domain in the EdgeTag dashboard |
| "Action not permitted!" on Edge Lake | Contact [support@blotout.io](mailto:support@blotout.io) to enable the Edge Lake Querying feature |
| "Action not permitted!" on ID Graph  | Contact [support@blotout.io](mailto:support@blotout.io) to enable the ID Graph Querying feature  |
