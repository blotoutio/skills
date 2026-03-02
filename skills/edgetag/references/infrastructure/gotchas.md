# EdgeTag Infrastructure Gotchas

Common pitfalls to avoid during EdgeTag deployment and operation.

## DNS Setup Pitfalls

### DNS Propagation Delays

**Problem:** DNS records aren't immediately available globally

- Propagation can take minutes to hours
- Some regions slower than others
- Verification fails immediately

**Solution:**

- Set TTL to 3600 (1 hour) for faster updates if needed to change later
- Plan setup during non-critical hours
- Use `nslookup` to verify propagation (use the exact names from your EdgeTag dashboard):
  ```bash
  nslookup -type=TXT _cf-custom-hostname.<subdomain>.yourdomain.com  # Check TXT record (use name from dashboard)
  nslookup <subdomain>.yourdomain.com                                 # Check CNAME record (your tracking subdomain)
  ```
- Wait up to 24 hours if in doubt
- Don't panic if verification takes a few hours

### Wrong TXT Record Format

**Problem:** TXT record is rejected because format is incorrect

- Some providers require domain appended to the record name
- Some providers want different TTL values
- Value might need escaping for special characters

**Solution:**

- The exact TXT record name and value are provided in the EdgeTag dashboard -- always copy them directly
- Check your specific provider's DNS documentation for how record names are entered
- Common mistake: forgetting domain suffix on TXT record name when the provider requires it
- Cloudflare: Use just the short name (e.g. `_cf-custom-hostname.<subdomain>`), they auto-append the domain
- Namecheap: Use the full name including domain (e.g. `_cf-custom-hostname.<subdomain>.yourdomain.com`)
- GoDaddy: Use just the short name, they auto-append domain
- Copy the value exactly from the EdgeTag dashboard without modification

### CNAME Not Pointing Correctly

**Problem:** CNAME record points to wrong endpoint

- Traffic doesn't route to EdgeTag workers
- Events appear to disappear
- Tracking code loads but events don't arrive

**Solution:**

- Verify CNAME value matches the EdgeTag dashboard exactly
- Should point to the value shown in the dashboard (e.g. `<subdomain>.customers.edgetag.io`)
- Not your subdomain itself -- the value must point to EdgeTag's infrastructure
- On Cloudflare, disable the Proxied option (use gray cloud / DNS-only) for the CNAME record
- Check for trailing dots or spaces
- Use CNAME flattening if your DNS provider supports it for root domain

### Root Domain CNAME Issue

**Problem:** Trying to point root domain (`yourdomain.com`) with CNAME

- DNS specification doesn't allow CNAME at root
- Configuration is rejected
- Root domain tracking doesn't work

**Solution:**

- Always use subdomain (e.g., `d.yourdomain.com`, `track.yourdomain.com`)
- If root domain tracking needed, use CNAME flattening (available on some providers)
- Or use A record + routing if provider supports it
- Most implementations use `d.yourdomain.com` or similar subdomain

### Registering a Subdomain Instead of Root Domain

**Problem:** Customer registers `app.yourdomain.com` as the EdgeTag domain instead of `yourdomain.com`

- EdgeTag requires the root domain, even when tracking subdomains
- Subdomain registration breaks first-party cookie scope
- Identity stitching across subdomains fails
- Cannot be easily corrected after setup

**Solution:**

- Always register the **root domain** (`yourdomain.com`) in EdgeTag
- All subdomains (app, blog, shop, etc.) should track via the root domain's CNAME (e.g., `d.yourdomain.com`)
- If separate analytics are needed per subdomain, add a **separate root domain instance** in EdgeTag — but still use the root domain, not the subdomain

## Hosting Decision Pitfalls

### Cannot Migrate Between Hosting Options

**Problem:** Chose "Managed" but later need "Self-Hosted" (or vice versa)

- No migration path exists
- Would require complete re-setup
- All configurations and history would be lost
- Channels would need to be re-connected

**Solution:**

- Make hosting decision carefully during onboarding
- Think about your compliance, control, and infrastructure requirements upfront
- For most companies: Managed is fine unless you have strict requirements
- For enterprises: Self-hosted usually preferred for control
- Once live, you're committed to that choice

### Self-Hosted Without Proper Token

**Problem:** Cloudflare token is insufficient or revoked

- Deployment fails
- Workers can't be updated
- No error messages until you try to deploy

**Solution:**

- Generate API token with all required permissions:
  - Account.Workers Scripts: Edit
  - Account.Workers KV Storage: Edit
  - Account.Workers R2 Storage: Edit
  - Account.Workers Agents Configuration: Edit
  - Account.Workers Builds Configuration: Edit
  - Account.Workers Observability: Edit
  - Account.Workers Tail: Read
  - Account.Cloudflare Pages: Edit
  - Account.D1: Edit
  - Account.Account Analytics: Read
  - Zone.Workers Routes: Edit
  - Zone.DNS: Edit
- Store token securely (use 1Password, LastPass, etc.)
- Rotate token every 90 days
- Never commit token to version control
- Test token immediately after generation

## Performance and Monitoring Pitfalls

### Ignoring Anomaly Detections

**Problem:** Dashboard shows anomaly alerts but ignored

- Could indicate data collection issue
- Might be compliance problem (consent not enforced)
- Could be infrastructure issue starting

**Solution:**

- Always investigate anomalies
- Check if legitimate (campaign launch, traffic spike, etc.)
- Review channel delivery logs
- Check consent enforcement is working
- Monitor dashboard daily first week, then weekly

### Not Having the Right People on the Team Account

**Problem:** EdgeTag sends automatic alerts (OAuth errors, event drops, etc.) but no one sees them

- EdgeTag automatically detects and alerts on OAuth errors, event drops, and other issues
- Alerts are sent to team members on the EdgeTag account
- If the right people aren't added to the team, alerts go unnoticed
- Issues escalate until customers complain

**Solution:**

- Add all relevant team members to your EdgeTag team account (engineering, marketing ops, etc.)
- Verify team members have correct email addresses
- Review team membership when people change roles or leave
- EdgeTag automatically alerts on:
  - OAuth token expiry or errors
  - Event volume drops
  - Channel delivery failures

## Compliance and Security Pitfalls

### DNS Records Pointing to Untrusted Endpoint

**Problem:** CNAME points to wrong domain or typo

- Traffic could be routed to attacker
- Data exfiltration risk
- Customer data exposed

**Solution:**

- Copy CNAME value directly from EdgeTag dashboard
- Never type manually
- Verify with `nslookup` after setup
- Only accept EdgeTag-provided endpoints
- Use HTTPS for all connections

### SSL Certificate Issues

**Problem:** Custom hostname SSL certificate not issued

- Browser shows security warning
- Tracking code doesn't load
- Connections fail

**Solution:**

- Wait 24-48 hours after DNS setup for cert issuance
- Verify CNAME is correctly pointing to EdgeTag
- Check certificate status in dashboard
- If still failing after 48 hours, contact support
- Don't accept browser certificate warnings

## Recap: Critical Gotchas


| Gotcha                        | Impact                      | Solution                                  |
| ----------------------------- | --------------------------- | ----------------------------------------- |
| DNS propagation delay         | Setup fails immediately     | Wait up to 24 hours                       |
| Wrong TXT format              | Verification rejected       | Check provider documentation              |
| Missing first-party subdomain | ITP blocks tracking         | Use subdomain like d.yourdomain.com       |
| Cannot migrate hosting        | Infrastructure locked in    | Decide before going live                  |
| CNAME pointing wrong          | Events lost                 | Copy from dashboard, verify with nslookup |
| Root domain CNAME             | Configuration rejected      | Use subdomain instead                     |
| Ignoring anomalies            | Silent failures             | Monitor daily, set up alerts              |
| Insufficient API token        | Self-hosted fails to deploy | Generate with proper permissions          |



