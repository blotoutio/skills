# ConsentIQ Gotchas

## 1. Using Wrong Channel ID

**Problem**: Using the main EdgeTag channel ID instead of the ConsentIQ channel ID.

**Solution**: Call the `domains` MCP tool and find the channel with `providerId: "consentIQ"`. Use that channel's `scriptId`, not the main EdgeTag channel.

---

## 2. No ConsentIQ Channel Configured

**Problem**: `consentIQOverview` returns error because no ConsentIQ channel exists for the domain.

**Solution**: ConsentIQ must be added to the domain first. If the `domains` response doesn't include a channel with `providerId: "consentIQ"`, choose one of:

- **Shopify stores**: Install the app from [https://apps.shopify.com/blotout-consentiq](https://apps.shopify.com/blotout-consentiq)
- **All other sites**: Contact Blotout support (`support@blotout.io`) to add the channel, or add it via the white-label API (`POST /script` with `providerId: "consentIQ"`)

See [setup.md](setup.md) for full installation instructions.

---

## 3. Confusing ConsentIQ Categories with JS SDK Categories

**Problem**: ConsentIQ uses slightly different category names than the JS SDK consent API.

| ConsentIQ Analytics | JS SDK Consent API |
| ------------------- | ------------------ |
| `marketing`         | `advertising`      |
| `saleOfData`        | `share_pii`        |
| `preferences`       | `functional`       |
| `analytics`         | `analytics`        |

These represent the same consent concepts but use different labels. The JS SDK names are what you use in code; the ConsentIQ names are what appear in analytics.

---

## 4. Not Specifying Range for Categories

**Problem**: Forgetting the `range` parameter when calling `consentIQCategories`.

**Solution**: Always provide `range`: `"day"`, `"week"`, or `"month"`. Each gives a different time window of consent data.
