# Conversion Lift

Conversion Lift is an EdgeTag feature for the **Meta channel** that sends custom purchase events categorized by traffic source. This enables Meta's Conversion Lift studies, which measure the true incremental impact of Facebook ads by comparing conversions from users who saw ads versus those who didn't.

## How It Works

1. A `Purchase` event fires on the website
2. EdgeTag analyzes the session's traffic source (click IDs, UTM parameters, referrer, search engine)
3. EdgeTag classifies the purchase into one of 20 origin-based categories
4. The corresponding custom event is sent to Meta alongside the standard `Purchase` event

This gives Meta the data it needs to run lift studies that isolate Facebook's true contribution to conversions versus purchases that would have happened anyway.

## Requirements

- The Meta channel must be connected in EdgeTag
- The Conversion Lift feature must be enabled — contact [support@blotout.io](mailto:support@blotout.io) to activate it
- For offline events (`Purchase_Retail`, `Purchase_Offline`), offline event ingestion must be configured

## Events Generated

EdgeTag sends up to 20 custom events to Meta based on purchase origin:

### Paid Channel Purchases

| Event                    | Rule                                                     |
| ------------------------ | -------------------------------------------------------- |
| `Purchase_Paid_Facebook` | In-session purchase with a Facebook click ID             |
| `Purchase_Paid_Google`   | In-session purchase with a Google click ID               |
| `Purchase_Paid_Bing`     | In-session purchase with a Bing click ID                 |
| `Purchase_Paid_TikTok`   | In-session purchase with a TikTok click ID               |
| `Purchase_Paid_Snap`     | In-session purchase with a Snapchat click ID             |
| `Purchase_Paid_Twitter`  | In-session purchase with a Twitter click ID              |
| `Purchase_Paid_Other`    | In-session purchase with a UTM parameter from a campaign |

### Organic & Direct Purchases

| Event                     | Rule                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `Purchase_Direct`         | In-session purchase made directly on-site without a referrer |
| `Purchase_Other_Referral` | In-session purchase with a referrer but no UTM parameter     |
| `Purchase_Organic_Google` | In-session purchase from a Google search                     |
| `Purchase_Organic_Bing`   | In-session purchase from a Bing search                       |
| `Purchase_Search_Other`   | In-session purchase from other well-known search providers   |
| `Purchase_Other`          | Purchase that does not match any of the above rules          |

### Offline Purchases

| Event              | Rule                        |
| ------------------ | --------------------------- |
| `Purchase_Retail`  | Retail offline purchases    |
| `Purchase_Offline` | All other offline purchases |

### Platform-Specific Events

| Event               | Rule                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `Purchase_AppLovin` | In-session purchase when referred by a site using an AppLovin pixel |

### Aggregate Events

| Event                   | Rule                                                      |
| ----------------------- | --------------------------------------------------------- |
| `Paid_Social_NonFB`     | Triggered when a TikTok or AppLovin event is generated    |
| `Purchase_Google`       | Triggered when a Google or Bing paid event is generated   |
| `Purchase_Organic`      | Triggered when a Google or Bing search event is generated |
| `Purchase_Custom_Other` | Triggered when other purchase events occur                |

## Why Conversion Lift Matters

Standard attribution models (last-click, multi-touch) tell you which channels were _present_ in the conversion path, but not whether they actually _caused_ the conversion. Meta's Conversion Lift studies use a randomized experiment design:

- A **test group** sees your Facebook ads as normal
- A **holdout group** is prevented from seeing your ads
- The difference in conversion rates between the two groups measures the **true incremental lift** from Facebook ads

By sending origin-categorized purchase events, EdgeTag gives Meta the granular data it needs to run these studies accurately and understand how Facebook ads perform relative to other traffic sources.

## Analyzing Conversion Lift Data

When querying event data via MCP, these patterns are useful:

- **Purchase origin mix:** Break down purchases by origin event to see where conversions come from
- **Facebook vs non-Facebook:** Compare `Purchase_Paid_Facebook` against all other paid events to understand Facebook's share
- **Organic vs paid split:** Compare aggregate `Purchase_Organic` against paid events to see how much revenue comes from organic traffic
- **Offline contribution:** Track `Purchase_Retail` and `Purchase_Offline` to understand the online-to-offline purchase ratio
