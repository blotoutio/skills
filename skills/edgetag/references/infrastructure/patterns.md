# EdgeTag Infrastructure Patterns

Common configurations, DNS patterns for popular providers, and advanced setups.

## DNS Setup Patterns by Provider

### Cloudflare DNS

Best scenario: Cloudflare is already your DNS provider.

**TXT Record (Verification):**

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>]
Type: TXT
Value: [copy exact value from EdgeTag dashboard — typically a UUID]
TTL: 3600
```

**CNAME Record (Tracking):**

```
Name: [your chosen subdomain, e.g. d]
Type: CNAME
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 3600
```

**Notes:**

- Cloudflare automatically appends domain to record names
- CNAME flattening available if using root domain
- **Disable the Proxied option (use gray cloud / DNS-only) for the CNAME record**
- Copy all record names and values exactly from the EdgeTag dashboard — they vary per domain
- Test DNS with: `nslookup -type=TXT _cf-custom-hostname.<subdomain>.yourdomain.com` (use the name shown in the dashboard)

### GoDaddy DNS

GoDaddy-specific DNS configuration.

**TXT Record (Verification):**

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>]
Type: TXT
Value: [copy exact value from EdgeTag dashboard — typically a UUID]
TTL: 600 or default
```

**CNAME Record (Tracking):**

```
Name: [your chosen subdomain, e.g. d]
Type: CNAME (or Alias)
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 600 or default
```

**Notes:**

- GoDaddy automatically appends domain
- Copy all record names and values exactly from the EdgeTag dashboard
- Use "Alias" type if CNAME not available
- Root domain can use A record + forwarding
- Root domain cannot use CNAME

### Namecheap DNS

Namecheap requires full domain paths in record names.

**TXT Record (Verification):**

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>.yourdomain.com]
Type: TXT
Value: [copy exact value from EdgeTag dashboard — typically a UUID]
TTL: 3600
```

**CNAME Record (Tracking):**

```
Name: [your chosen subdomain].yourdomain.com
Type: CNAME
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 3600
```

**Notes:**

- **Must** include full domain in TXT name (e.g. the full name shown in the dashboard)
- **Must** include full domain in CNAME name (not just the subdomain)
- Copy all record names and values exactly from the EdgeTag dashboard
- Root domain cannot use CNAME (use forwarding instead)
- Root domain tracking requires URL redirect

### AWS Route 53

Route 53 DNS configuration.

**TXT Record (Verification):**

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>.yourdomain.com]
Type: TXT
Value: "[copy exact value from EdgeTag dashboard — typically a UUID]"
TTL: 3600
```

**CNAME Record (Tracking):**

```
Name: [your chosen subdomain].yourdomain.com
Type: CNAME
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 3600
```

**Notes:**

- TXT values need quotes in JSON API
- Copy all record names and values exactly from the EdgeTag dashboard
- Root domain cannot use CNAME
- Use Route 53 alias records for root domain
- CloudFront integration available for additional caching

### Domain.com

Domain.com-specific setup.

**TXT Record (Verification):**

```
Name: [copy exact name from EdgeTag dashboard, e.g. _cf-custom-hostname.<subdomain>] (system appends domain)
Type: TXT
Value: [copy exact value from EdgeTag dashboard — typically a UUID]
TTL: 3600
```

**CNAME Record (Tracking):**

```
Name: [your chosen subdomain, e.g. d]
Type: CNAME
Value: [copy from EdgeTag dashboard, e.g. <subdomain>.customers.edgetag.io]
TTL: 3600
```

**Notes:**

- Domain.com automatically appends domain to names
- Copy all record names and values exactly from the EdgeTag dashboard
- Use just the short name from the dashboard (without the domain suffix) since the system appends it
- Root domain cannot use CNAME

## Multi-Tenant / Multi-Domain Patterns

### Multi-Domain Single Tenant

Track multiple domains with single EdgeTag customer account.

**Setup Approach:**

1. Create separate EdgeTag instance for each domain
2. Each domain → separate onboarding
3. Each domain → separate DNS setup
4. Each domain → separate tracking subdomain

**DNS Pattern (Two Domains):**

Domain 1 (`site1.com`):

```
<subdomain>.site1.com CNAME → <subdomain>.customers.edgetag.io  (exact value from dashboard)
```

Domain 2 (`site2.com`):

```
<subdomain>.site2.com CNAME → <subdomain>.customers.edgetag.io  (exact value from dashboard)
```

The subdomain name (e.g., `d`, `bssql`, etc.) is chosen during setup and may differ per domain. Always copy the exact CNAME value from the EdgeTag dashboard.

**Benefits:**

- Separate analytics per domain
- Independent channel delivery
- Better compliance isolation
- Cleaner reporting

**Costs:**

- Each domain = additional cost (if not on contract)
- More complex operations

### Subdomain Tracking

> **Important**: Always register the **root domain** in EdgeTag, even when tracking subdomains. Never register a subdomain (e.g., `app.yourdomain.com`) as the domain in EdgeTag — always use the root domain (`yourdomain.com`).

**Default (recommended): Single root domain for all subdomains**

All subdomains share the same EdgeTag root domain and tracking CNAME:

```
EdgeTag domain: yourdomain.com
Tracking CNAME: d.yourdomain.com

Main site:      yourdomain.com       → tracks via d.yourdomain.com
App subdomain:  app.yourdomain.com   → tracks via d.yourdomain.com
Blog subdomain: blog.yourdomain.com  → tracks via d.yourdomain.com
```

This gives you unified identity and analytics across all subdomains.

**Alternative: Separate root domains for different subdomains**

If you need separate analytics/isolation per subdomain, add each as a **separate root domain** in EdgeTag (each with its own onboarding and CNAME):

```
EdgeTag domain 1: yourdomain.com     → tracks via d.yourdomain.com
EdgeTag domain 2: yourdomain.com     → tracks via d2.yourdomain.com (separate EdgeTag instance)
```

Each separate domain = separate analytics, separate channels, and additional cost.

**Never do this:**

```
# WRONG — do not register subdomains as EdgeTag domains
EdgeTag domain: app.yourdomain.com   ← incorrect, always use root domain
```

## Self-Hosted Cloudflare Setup Patterns

### Cloudflare Token Generation Workflow

Complete process for self-hosted deployments.

**Step 1: Log into Cloudflare Account**

- Go to cloudflare.com
- Log in with account credentials
- Verify 2FA if enabled

**Step 2: Access API Tokens**

- Click Account Home (icon top left)
- Click "API Tokens" in sidebar
- Or navigate: My Profile → API Tokens

**Step 3: Create New Token**

- Click "Create Token" button
- Start with a template or create custom

**Step 4: Select Permissions**

For EdgeTag self-hosted, required permissions:

```
Account
  - Workers Scripts: Edit
  - Workers KV Storage: Edit
  - Workers R2 Storage: Edit
  - Workers Agents Configuration: Edit
  - Workers Builds Configuration: Edit
  - Workers Observability: Edit
  - Workers Tail: Read
  - Cloudflare Pages: Edit
  - D1: Edit
  - Account Analytics: Read

Zone
  - Workers Routes: Edit
  - DNS: Edit
```

**Step 5: Define Resources**

- **Account Resources**: Include all accounts (or specific accounts)
- **Zone Resources**: Include all zones (or specific domains)
- **User Permissions**: Not needed (account level only)

**Step 6: Set Token Lifetime**

- Start: Immediate
- Expiration: 90 days (recommended)
- Set calendar reminder to rotate

**Step 7: Copy Token**

- Token appears once after creation
- Copy immediately - cannot be recovered
- Store in secure password manager
- Never share or commit to git

**Step 8: Test Token**

```bash
curl -X POST https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Step 9: Provide to EdgeTag**

- Paste token during EdgeTag self-hosted onboarding
- EdgeTag validates immediately
- If fails, check permissions and try again

### Self-Hosted Workers Deployment

Each EdgeTag deployment is prefixed with a **Deployment ID** derived from the first-party subdomain with all special characters removed.

**Deployment ID Example:**

```
First-party subdomain: d.mysite.co.uk
Deployment ID:         dmysitecouk
```

All Cloudflare resources for that deployment use this prefix:

**Worker:**

```
dmysitecouk
```

**D1 Databases (Identity Graph):**

```
dmysitecouk-edgetag-id-graph-primary-1
dmysitecouk-edgetag-id-graph-primary-2
...
dmysitecouk-edgetag-id-graph-primary-5
```

D1 databases are sharded (typically 1-5 shards). Schema is automatically created by EdgeTag.

**KV Namespaces:**

```
dmysitecouk-KV_EDGETAG_DATA    → stores EdgeTag configuration and data
dmysitecouk-KV_USER_ROUTING    → user routing
```

**Analytics Engine Datasets:**

```
EDGETAG_ANALYTICS_ENGINE_dmysitecouk         → event analytics
EDGETAG_ANALYTICS_ENGINE_ERRORS_dmysitecouk   → error tracking
USER_STATE_ANALYTICS_dmysitecouk              → user state analytics
```

**Queue:**

```
dmysitecouk-edgetag-nc-rc    → new/returning customer processing
```

**Custom Hostname:**

```
Subdomain: <subdomain>.yourdomain.com  (chosen during setup)
SSL Custom Hostname: <subdomain>.yourdomain.com
Origin: [provided by EdgeTag]
```

### Monitoring Self-Hosted Deployment

Key metrics to track:

**Worker Performance:**

```
- Request duration (p50, p95, p99)
- Error rate (5xx responses)
- CPU time per request
- Memory usage per request
```

**Event Processing:**

```
- Events received per minute
- Events delivered to channels per minute
- Failed delivery attempts
- Payload validation failures
```

**Channel Delivery:**

```
- Delivery latency per provider
- Success rate per provider
- Queued events waiting delivery
- Retry attempts
```

**Billing:**

```
- Total API calls (monthly)
- CPU milliseconds consumed
- Storage usage (R2)
- Data transfer (GB)
```

Use Cloudflare dashboard: Workers Analytics → Your Worker Script

## Best Practices Summary

1. **Always use first-party subdomain** (e.g., d.yourdomain.com)
2. **Keep DNS TTL reasonable** (3600 = 1 hour)
3. **Test DNS propagation** with nslookup before deployment
4. **Verify SSL certificate** is issued (24-48 hours)
5. **Rotate API tokens** every 90 days (self-hosted)
6. **Monitor worker performance** in Cloudflare dashboard
7. **Document your DNS setup** for future reference
8. **Plan for multiple domains** in subscription tier upfront
9. **Test failover** if using high-availability pattern
10. **Keep backups** of critical configurations
