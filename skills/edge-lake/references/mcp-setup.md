# Edge Lake MCP Setup

EdgeTag's MCP server provides access to Edge Lake queries, traffic analysis, bot detection, and more.

> For connection setup (URL, authentication, client config, troubleshooting), see **edgetag/references/mcp/setup.md**.

## Available Edge Lake Tools

After connecting, these tools are available for querying Edge Lake data:

| Tool                      | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `edgeLakeQuery`           | Execute a single SQL query against `lake.events`                |
| `edgeLakeCodeQuery`       | Run multiple SQL queries with server-side JavaScript processing |
| `edgeLakeTrafficAnalysis` | Traffic breakdown by browser, OS, device type, country          |
| `edgeLakeBotScore`        | Bot detection analysis by Cloudflare bot scores                 |
| `edgeLakeAttackAnalysis`  | WAF attack classification analysis                              |

The MCP server also exposes non-Edge-Lake tools (`me`, `domains`, `domainAnalytics`, `domainErrors`, `channel`, `metaEMQ`, `domainIDGraph`, `consentIQOverview`, `consentIQCategories`, `domainAdd`, `dns`, `revokeToken`).

## Edge Lake Workflow

1. Call `me` to verify identity and see which teams you belong to
2. Call `domains` to list all domains — find the channel with `providerId: "edgeLake"` for your domain
3. Use that channel's `channelId` and `teamId` with any Edge Lake tool
