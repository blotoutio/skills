# ConsentIQ MCP Setup

EdgeTag's MCP server provides access to ConsentIQ analytics, Edge Lake queries, and more.

> For connection setup (URL, authentication, client config, troubleshooting), see **edgetag/references/mcp/setup.md**.

## Available ConsentIQ Tools

After connecting, these consent analytics tools are available:

| Tool                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `consentIQOverview`   | Total profiles, marketing opt-in/out by region, 24h changes |
| `consentIQCategories` | Per-category consent breakdown by region over time          |

The MCP server also exposes other tools (`me`, `domains`, `domainAnalytics`, etc.).

## ConsentIQ Workflow

1. Call `me` to verify identity and see which teams you belong to
2. Call `domains` to list all domains — find the channel with `providerId: "consentIQ"` for your domain
3. Use that channel's `channelId` and `teamId` with `consentIQOverview` or `consentIQCategories`
4. If no ConsentIQ channel is found, it must be enabled for the domain in the EdgeTag dashboard
