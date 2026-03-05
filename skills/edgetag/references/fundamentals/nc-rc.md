# NC/RC: New Customer vs Returning Customer

NC/RC is an EdgeTag plugin that automatically classifies every purchase as either a **New Customer (NC)** or **Returning Customer (RC)** based on the buyer's email history.

## How It Works

1. A `Purchase` event fires on the website
2. EdgeTag looks up the customer's email against the connected CRM (Shopify, WooCommerce, BigCommerce, or Salesforce)
3. If no previous purchase exists for that email, the customer is classified as **NC** (New Customer)
4. If at least one prior purchase exists, the customer is classified as **RC** (Returning Customer)
5. EdgeTag then sends an additional event with the appropriate suffix to all configured channels

## Events Generated

For every `Purchase` event, EdgeTag fires one additional event:


| Event         | Meaning                                                       |
| ------------- | ------------------------------------------------------------- |
| `Purchase_NC` | New Customer — first-time buyer, no previous purchase history |
| `Purchase_RC` | Returning Customer — has at least one prior purchase          |


**Key relationship:** `Purchase = Purchase_NC + Purchase_RC` (every purchase is exactly one or the other)

## Requirements

- A CRM integration must be connected (Shopify, WooCommerce, BigCommerce, or Salesforce)
- The NC/RC plugin must be enabled in the EdgeTag dashboard

## Channel-Specific Setup

- **Meta / Facebook:** `Purchase_NC` and `Purchase_RC` events are sent to your Pixel automatically — no extra setup needed
- **Google Ads:** You must manually map `Purchase_NC` and `Purchase_RC` as separate conversion actions in Google Ads

## Why NC/RC Matters

NC/RC enables brands to optimize ad spend for **new customer acquisition** rather than broad conversions. Without NC/RC, ad platforms optimize for all purchases equally — which often means retargeting existing customers who would have bought anyway. With NC/RC you can:

- Create campaigns optimized specifically for `Purchase_NC` events
- Measure true new customer acquisition cost (nCAC)
- Compare acquisition efficiency between campaigns targeting new vs all customers
- Track the ratio of new vs returning customers over time

## Analyzing NC/RC Data

When querying event data via MCP, these patterns are useful:

- **New customer rate:** `COUNT(Purchase_NC) / COUNT(Purchase)` — what percentage of purchases are first-time buyers
- **NC vs RC revenue:** Compare `SUM(value)` for `Purchase_NC` vs `Purchase_RC` to understand revenue mix
- **NC trend over time:** Track `Purchase_NC` count by day/week to see if acquisition campaigns are working
- **Channel NC attribution:** Break down `Purchase_NC` by channel to see which channels drive the most new customers

### Example: NC/RC Breakdown with MCP

Use `domainAnalyticsProvider` to get an overview of Purchase, Purchase_NC, and Purchase_RC event counts. For deeper analysis, use `edgeLakeQuery` to get details like revenue.

## Related Feature: First Click (FC)

The NC/RC plugin also supports **First Click (FC)** attribution, which identifies the first advertising channel that brought a customer to the site. When enabled, this generates events like `Purchase_FC_Meta` or `Purchase_FC_Google`, helping brands understand which channels drive initial awareness vs which close the sale.