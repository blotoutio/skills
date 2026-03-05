# EdgeTag Setup Guide

Complete step-by-step guide to deploying EdgeTag infrastructure.

## Onboarding Flow

Follow this sequence during initial setup:

### Step 1: Select Platform

Choose where EdgeTag will be hosted:

- **Managed**: EdgeTag infrastructure on Blotout's Cloudflare account
- **Self-Hosted**: You provide Cloudflare account and token

Decision is **irreversible** - choose carefully.

### Step 2: Enter Domain

Provide your primary domain:

- Example: `mysite.com`
- Should not include `www.` or protocol
- This domain will host first-party tracking subdomain

### Step 3: Verify DNS

Add DNS records to your domain registrar:

1. Add TXT record for ownership verification
2. Add CNAME record for traffic routing
3. Wait for DNS propagation (can take minutes to hours)

See "DNS Setup" section below.

### Step 4: Consent Setup

Configure consent management:

- Choose consent provider (ConsentIQ, banner-based, etc.)
- Define consent categories (marketing, analytics, etc.)
- Set regional rules (GDPR, CCPA, etc.)
- Test consent enforcement

### Step 5: Add Channels

Connect marketing channels:

- Meta Business Account (Facebook, Instagram)
- Google Ads
- LinkedIn Campaign Manager
- TikTok Business
- Custom HTTP endpoints
- Others

Each channel requires provider-specific credentials.

### Step 6: Configure Billing

Set up billing:

- Plan: $49.99/month
- Includes: 1 domain + 100K API calls
- Trial: 30-day free trial available
- Payment method: Credit card

### Step 7: Deploy

Launch EdgeTag:

- Add tracking code to website
- Verify events in dashboard
- Enable channels one by one
- Monitor for 24-48 hours

## DNS Setup

### Understanding DNS Records

EdgeTag requires two DNS record types:

#### TXT Record (Verification)

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>]
Type: TXT
Value: [copy exact value from EdgeTag dashboard — typically a UUID]
TTL: 3600 or default
```

The TXT record proves you own the domain. The exact record name and value are provided in the EdgeTag dashboard and vary per domain.

#### CNAME Record (Traffic Routing)

```
Name: [your chosen subdomain — shown in EdgeTag dashboard]
Type: CNAME
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 3600 or default
```

The CNAME routes tracking requests to EdgeTag's edge network. The subdomain name (e.g., `d`, `bssql`, etc.) is chosen during setup.

**Important Notes:**

- Some DNS providers (like Namecheap) require you to append the domain to the record name. Check your provider's requirements.
- On Cloudflare, disable the Proxied option (use gray cloud / DNS-only) for the CNAME record.
- Always copy the exact record names and values from the EdgeTag dashboard -- do not type them manually.

### Generic Steps

1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Navigate to DNS settings
3. Add TXT record with EdgeTag verification code
4. Add CNAME record pointing to EdgeTag's CDN
5. Save changes
6. Return to EdgeTag dashboard and verify

### Self-Hosted: Cloudflare Token Generation

If self-hosting, you must provide a Cloudflare API token:

1. Log into Cloudflare account
2. Go to **Account Home** → **API Tokens**
3. Click **Create Token**
4. Select **Create Custom Token**
5. Name the token (e.g., "EdgeTag")
6. Add the following permissions:

- Account.Workers Scripts: Edit
- Account.Workers KV Storage: Edit
- Account.Workers R2 Storage: Edit
- Account.Workers Agents Configuration: Edit
- Account.Workers Builds Configuration: Edit
- Account.Workers Observability: Edit
- Account.Workers Tail: Read
- Account.Workers Pipelines: Edit
- Account.Queues: Edit
- Account.D1: Edit
- Account.Account Analytics: Read
- Zone.Workers Routes: Edit
- Zone.DNS: Edit

1. Include all zones (or specific zones as preferred)
2. Copy token and provide to EdgeTag during onboarding
3. Store token securely - never commit to version control

## Deployment Options

### Web Implementation (Script Tag)

Add the stub and script to `<head>`:

```html
<script>
  window.edgetag =
    window.edgetag ||
    function () {
      ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
    }
  edgetag('init', { edgeURL: 'https://d.yourdomain.com' })
</script>
<script src="https://d.yourdomain.com/load" async></script>
```

Then track events:

```javascript
edgetag('user', 'email', 'user@example.com')
edgetag('tag', 'PageView')
```

### Web Implementation (npm / Headless)

```bash
npm install @blotoutio/edgetag-sdk-js
```

```javascript
import { init, tag, user } from '@blotoutio/edgetag-sdk-js'

init({ edgeURL: 'https://d.yourdomain.com' })
user('email', 'user@example.com')
tag('PageView')
```

### Server-Side Implementation

Send events via HTTP API:

```bash
curl -X GET "https://d.yourdomain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: user-123-abc" \
  --data '{
    "eventId": "purchase_001",
    "eventName": "Purchase",
    "timestamp": 1707302400000,
    "data": {
      "userEmail": "user@example.com",
      "value": 99.99,
      "currency": "USD"
    }
  }'
```

## Hosting Comparison

| Feature                | Managed                  | Self-Hosted              |
| ---------------------- | ------------------------ | ------------------------ |
| Setup complexity       | Low                      | Medium                   |
| Infrastructure control | None                     | Full                     |
| Data residency         | Blotout managed          | Your control             |
| Maintenance burden     | None                     | You handle               |
| Cost                   | Included in subscription | Cloudflare charges apply |
| Feature parity         | 100%                     | 100%                     |
| Scalability            | Handled by EdgeTag       | Handled by EdgeTag       |

## Troubleshooting Setup

### DNS Not Verifying

- Wait 24 hours for propagation
- Check TXT record name and value match the EdgeTag dashboard exactly
- Verify CNAME points to correct endpoint (shown in dashboard)
- On Cloudflare, ensure the CNAME is set to DNS-only (gray cloud, not proxied)
- Use `nslookup` or `dig` to debug:
  ```bash
  nslookup -type=TXT _cf-custom-hostname.<subdomain>.yourdomain.com  # use name from dashboard
  nslookup <subdomain>.yourdomain.com                                 # use your tracking subdomain
  ```

### Events Not Appearing

- Verify tracking code is on all pages
- Check browser console for errors
- Confirm DNS is propagated
- Verify consent is granted for channels
- Check Payload Validator channel for errors

### Channels Not Delivering

- Verify provider credentials are correct
- Check EMQ score (for Meta) - should be > 10%
- Ensure required fields are being sent (email for Meta)
- Check rate limiting hasn't been triggered
- Review channel error logs

## Next Steps

1. Complete onboarding flow
2. Verify DNS setup is working
3. Review `debugging/troubleshooting-guide.md` for QA
4. Implement event tracking code
5. Monitor dashboards for first 48 hours
6. Optimize channel delivery based on EMQ scores

## Billing Details

- **Base Plan**: $49.99/month
- **Includes**: 1 primary domain + 100,000 API calls
- **Trial Period**: 30 days free
- **Additional Domains**: $30 per domain
- **Overage Pricing**: Available if exceeding call limits
- **Billing Cycle**: Monthly, auto-renew

Usage is tracked per calendar month. Overage charges apply if exceeding included call limit.
