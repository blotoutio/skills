# EdgeTag Troubleshooting Guide

Complete step-by-step troubleshooting for every common issue.

## Events Not Firing

### Checklist: Events Not Appearing in Browser Network Tab

If events aren't being sent to EdgeTag at all:

1. **Verify tracking code is on page**

- Check page source for tracking script
- Verify script URL is correct: `https://d.yourdomain.com/load`
- Ensure no 404 error in Network tab
- Confirm JavaScript is enabled in browser

2. **Check DNS is propagated**

```bash
 nslookup d.yourdomain.com
 # Should return EdgeTag IP address
 # If NXDOMAIN, DNS not yet propagated - wait 24 hours
```

3. **Verify CNAME points correctly**

```bash
 nslookup -type=CNAME <subdomain>.yourdomain.com
 # Should show the CNAME target from your EdgeTag dashboard (e.g. <subdomain>.customers.edgetag.io)
 # If empty or wrong, check your DNS provider
 # On Cloudflare, ensure the CNAME is set to DNS-only (gray cloud, not proxied)
```

4. **Check browser console for errors**

- Open DevTools: F12 or Right-click → Inspect
- Go to Console tab
- Look for red errors about tracking script
- Common: "Failed to fetch", "CORS error"

5. **Verify consent is granted**

- Check if consent banner appears
- Grant consent to all categories
- Reload page
- Events should now fire

6. **Confirm tracking code initialization order**

- Consent manager must load FIRST
- EdgeTag script must load SECOND
- Events must fire AFTER both loaded

7. **Check SDK is loaded**

- In Console, type: `window.edgetag`
- Should return the stub function or SDK
- If undefined, script didn't load
- Check for errors in Network tab

### Checklist: Events Appear in Network but Don't Arrive at EdgeTag

If events are being sent but not received:

1. **Check request status code**

- Network tab → Find edgetag requests
- Status should be 200 or 202
- 4xx = request error (auth, format)
- 5xx = server error
- Check response body for error message

2. **Verify request headers**

- Content-Type should be `application/json`
- Should have Authorization header if required
- Check for missing or malformed headers

3. **Inspect request payload**

- Network tab → request → Payload tab
- Verify JSON is valid (use online JSON validator)
- Check for required fields (event, user_id)
- Verify no sensitive data accidentally included

4. **Check CORS headers**

- Look for CORS error in Console
- Verify EdgeTag CORS configuration allows your domain
- Use OPTIONS request to test
- May require DNS propagation time

5. **Test with direct API call**

```bash
 curl -X GET "https://d.yourdomain.com/tag" \
   -H "Content-Type: application/json" \
   --data '{"eventId":"test_001","eventName":"PageView","timestamp":1707302400000}'
```

If this fails, DNS or endpoint issue.

## Identity Not Stitching

### Checklist: Users Not Being Identified Correctly

If user identity isn't persisting across sessions or channels:

1. **Verify PII is being captured**

- In tracking code, are you sending email or phone?
- Check Network tab → event payload
- Look for `user.email` or `user.phone` fields
- If missing, add to tracking code:

2. **Check PII capture timing**

- Is PII available before events fire?
- Are you capturing in the upper funnel and not waiting for final event?
- Example issue: sending events before getting email

3. **Verify user ID consistency**

- Same user should have same user_id
- Check Network tab across multiple events
- user_id should not change per page
- If changing, update tracking code to use stable ID

4. **Inspect Identity Stitching Metrics**

- Dashboard → Identity metrics
- Shows % of events with email/phone
- Low % = increase PII capture

5. **Test in Event Validator**

- Search for specific user email
- Review all events for that user
- Should see same user_id across events
- Check email is consistent

6. **Review channel-specific requirements**

- Each channel has minimum PII requirements
- Meta: requires email, phone, or GAID
- Google: requires email for conversion tracking
- Add more fields if delivery rate low

7. **Check for cross-domain issues**

- Different domain = different user_id
- Subdomain = same user_id
- Use first-party subdomain to preserve cookies
- If subdomain tracking, first-party must be used

## DNS Issues

### Checklist: DNS Records Not Verifying

If EdgeTag won't verify your DNS:

1. **Check TXT record exists**

```bash
 nslookup -type=TXT _cf-custom-hostname.<subdomain>.yourdomain.com
 # Use the exact TXT record name from your EdgeTag dashboard
 # Should return the verification value exactly as provided
```

2. **Verify TXT record format**

- Name and value should match the EdgeTag dashboard exactly
- No spaces before/after
- Some providers require the full domain in the name, others auto-append it
- Cloudflare: use just the short name (they auto-append domain)
- Namecheap: use the full name including domain
- Check provider documentation

3. **Wait for propagation**

- DNS changes take minutes to hours
- Global propagation can take 24 hours
- Check multiple times before assuming failure
- Use [https://dnschecker.org](https://dnschecker.org) to check globally

4. **Check for typos**

- Copy value directly from EdgeTag
- Don't type manually
- Verify character-by-character
- Case sensitive

5. **Verify CNAME record**

```bash
 nslookup -type=CNAME <subdomain>.yourdomain.com
 # Should show the CNAME target from your EdgeTag dashboard (e.g. <subdomain>.customers.edgetag.io)
```

6. **Check zone file directly**

- Log into DNS provider
- View zone file
- Look for both TXT and CNAME records
- Verify exact values

7. **Test with different DNS server**

```bash
 nslookup -server=8.8.8.8 -type=TXT _cf-custom-hostname.<subdomain>.yourdomain.com
 # Use the exact TXT record name from your dashboard
 # Try Google's DNS to check global propagation
```

### Checklist: CNAME Not Pointing to EdgeTag

If DNS verifies but traffic doesn't route to EdgeTag:

1. **Verify CNAME record**

```bash
 nslookup d.yourdomain.com
 # Should resolve to EdgeTag IP
 # If still points to old value, DNS not updated
```

2. **Check CNAME value**

- Should point to the value shown in the EdgeTag dashboard (e.g. `<subdomain>.customers.edgetag.io`)
- Not your domain itself -- the value must point to EdgeTag's infrastructure
- Copy from EdgeTag dashboard
- On Cloudflare, ensure the CNAME is set to DNS-only (gray cloud, not proxied)

3. **Flush DNS cache**

```bash
 # Windows
 ipconfig /flushdns

 # Mac
 sudo dscacheutil -flushcache

 # Linux
 sudo systemctl restart systemd-resolved
```

4. **Test in incognito window**

- Browser might cache old DNS
- Incognito window bypasses cache
- If works in incognito, clear browser cache

5. **Check SSL certificate**

- CNAME must be set BEFORE SSL cert issued
- Wait 24-48 hours for cert issuance
- If CNAME wrong, cert not issued
- Fix CNAME first, wait for cert

## Channel Delivery Failures

### Checklist: Events Not Reaching Channels

If events fire but channels don't receive them:

1. **Check Payload Validator**

- Add Payload Validator as temporary channel
- Review validation errors
- Fix issues indicated
- Test with 10+ events

2. **Verify required fields for channel**

- Each channel needs specific fields
- Meta: email, phone, or GAID
- Google: email for conversion tracking
- TikTok: email or GAID
- Add missing fields to events

3. **Review channel credentials**

- Dashboard → Channels
- Verify credentials still valid
- Check if token expired
- Re-authenticate if needed
- Test connection

4. **Check channel-specific limits**

- Some channels rate-limit by IP or account
- Check provider dashboard for blocks
- Review channel error logs
- Look for "429 Too Many Requests"

5. **Inspect channel delivery logs**

- Dashboard → Channel Logs
- Filter by channel name
- Look for error messages
- Search for your test event
- Decode error response

6. **Verify consent for channel**

- If user didn't consent, event blocked
- Check Consent dashboard
- Verify consent mapping is correct
- Grant consent and retry

7. **Test with simple event**

- Remove custom fields
- Send minimal required fields only
- If simple event works, issue is extra fields
- Add fields back one by one

## Consent Issues

### Checklist: Consent Not Enforcing

If events are being sent to channels without consent:

1. **Verify consent configuration**

- Dashboard → Consent settings
- Each channel should map to consent category
- Meta should require "marketing" consent
- Google Analytics should require "analytics" consent

2. **Check consent initialization**

- Consent manager must load before EdgeTag
- Window object must have consent state
- EdgeTag checks before sending events
- Wrong order = consent not enforced

3. **Test consent state**

- Browser Console:

4. **Verify consent banner appears**

- User should see consent options
- Must be able to accept/reject
- Modal/banner should appear
- If not, consent manager not loaded

5. **Check cookie for consent state**

- Open DevTools → Application → Cookies
- Look for consent cookie
- Should show user's consent state
- If missing, consent not being saved

6. **Inspect actual consent state**

- Grant consent to all
- Check event is sent to channel
- Reject consent
- Verify event NOT sent to channel

7. **Review consent category mapping**

- Marketing consent → Meta, TikTok
- Analytics consent → Google Analytics
- Functional consent → All tracking
- Verify mapping is correct

For comprehensive QA test cases and checklists, see **patterns.md** → Implementation QA Checklist.
