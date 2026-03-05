# EdgeTag Debugging Patterns

Best practices, workflows, and checklists for effective EdgeTag implementation QA and debugging.

## Implementation QA Checklist

Complete checklist to validate EdgeTag before deployment.

### Pre-Implementation

- Understand EdgeTag architecture (read infrastructure README)
- Plan tracking events (what to track, what data)
- Design PII strategy (when/how to capture email, phone, etc.)
- Plan consent flow (how/when to collect consent)
- List all channels to integrate (Meta, Google, etc.)
- Set up staging environment
- Brief team on debugging approach

### DNS and Infrastructure

- DNS records created (TXT and CNAME)
- DNS propagation verified globally (nslookup)
- SSL certificate issued (wait 24-48 hours)
- SSL certificate verified in browser (no warnings)
- Subdomain is first-party (e.g., d.yourdomain.com)
- Subdomain loads tracking script (browser Network tab)
- Tracking script loads without errors (Console tab)
- Self-hosted: Cloudflare token generated and tested
- Self-hosted: Workers deployed successfully

### Tracking Code Implementation

- Consent manager loads FIRST in HTML
- EdgeTag script loads SECOND in HTML
- Page tracking code added to all pages
- PageView events fire on page load, for headless on every page navigation
- PageView includes correct page URL
- Custom events fire on correct triggers
- Events not firing before required PII data available
- Error handling implemented (graceful degradation)
- Events queue if network unavailable

### Event Structure

- All required fields present
- Event names consistent (no typos, naming convention)
- User IDs stable (same user = same ID)
- PII formatted correctly (lowercase email, digits-only phone)
- No sensitive financial data in events (only totals)

### Payload Validator Testing

- Payload Validator channel added to Dashboard
- 50+ events sent through Payload Validator
- All validation warnings reviewed
- All validation errors fixed
- PII correctly formatted per warnings
- Required fields all present
- Event transforms tested if used
- Custom plugin transforms tested
- Payload Validator channel removed (not left in prod)

### Consent Testing

- Consent banner appears on page
- User can accept all consent
- User can reject all consent
- User can accept partial consent
- Consent state persisted in cookie
- Consent checkbox for each category
- Consent category mapped to channels correctly
- Events blocked when consent rejected
- Events sent when consent granted
- Marketing events only if marketing consent
- Analytics events only if analytics consent

### Channel Integration Testing

- Channel credentials entered and tested
- Test event sent to each channel
- Channel received event
- Event visible in provider dashboard
- Event payload visible in provider dashboard
- PII matching attempted by provider
- Multiple event types tested per channel
- High and low value events tested

### Identity Testing

- Anonymous user gets unique ID
- Same anonymous user has same ID on return
- Authenticated user has email captured
- Same user maintains email across pages
- User ID consistent across channels
- Cross-domain user tracking tested (if applicable)
- User profile stitching working
- Event validator shows correct user matching

### Performance Testing

- Event send doesn't block page load
- Multiple events don't slow down page
- Core Web Vitals not impacted
- Mobile performance acceptable
- Slow network (3G) handled gracefully
- Offline mode doesn't break page

### Data Quality Testing

- EMQ score tracked (Meta specific)
- Event volume metrics established
- Baseline traffic patterns documented
- Anomaly detection configured
- Channel delivery rate > 95%
- Error rate < 5% across channels

### Security Testing

- All traffic HTTPS (Network tab)
- No mixed content warnings
- No sensitive data in URLs
- No credentials exposed in console
- Rate limiting handled properly
- CORS headers correct
- DNS records secured (TXT value protected)

### Monitoring and Alerting

- Dashboard metrics reviewed
- Email alerts going to correct people
- Runbook documented for common issues
- Team trained on alert responses
- Critical contacts listed

### Documentation

- Event tracking map documented
- Data flow diagram completed
- PII handling policy documented
- Consent mapping documented
- Troubleshooting guide reviewed
- Deployment checklist completed
- Runbook created for team
- Architecture diagram updated

### Pre-Launch Sign-Off

- All above checklist items complete
- No critical issues remaining
- EMQ scores acceptable
- Performance metrics acceptable
- Team reviewed and approved
- Product owner sign-off obtained
- Compliance review completed
- Customer/stakeholder notified

## Pre-Launch Validation Workflow

Systematic approach to validate EdgeTag before production deployment.

### Phase 1: Setup Validation (Day 1)

```
09:00 - DNS Setup
       - Create TXT record
       - Create CNAME record
       - Note time of change
       - ✓ Created

9:30 - Wait for Propagation
       - Verify TXT with nslookup every 15 min
       - Check global propagation on dnschecker.org
       - ✓ Global propagation complete

10:00 - SSL Certificate Check
       - Check certificate status in dashboard
       - Verify no warnings in browser
       - ✓ Certificate issued and valid

10:30 - Tracking Code Deploy
       - Add tracking script to all pages
       - Add consent manager first
       - Add EdgeTag script second
       - ✓ Code deployed to staging

11:00 - Smoke Test
       - Load homepage
       - Check Network tab for tracking requests
       - Verify no console errors
       - ✓ Events reaching EdgeTag
```

### Phase 2: Event Validation (Day 1-2)

```
Day 2 09:00 - Event Firing Tests
       - Add Payload Validator channel
       - Fire PageView event
       - Check Payload Validator output
       - Fire AddToCart event
       - Fire Purchase event
       - ✓ All events validate

10:00 - Data Quality Tests
       - Verify PII present (email, phone)
       - Check data formatting
       - Review Payload Validator warnings
       - Fix any format issues
       - ✓ No validation errors

11:00 - Volume Test
       - Fire 100 events rapidly
       - Check event processing time
       - Verify no drops or delays
       - ✓ All events processed

12:00 - Channel Delivery Test (use B pixel for Meta)
       - For Meta: add a TEST/B pixel — do NOT use the main pixel yet
       - This avoids polluting the main pixel's data during testing
       - Fire test events against the B pixel
       - Check Meta Events Manager for the B pixel
       - Verify events received with correct parameters
       - ✓ Events visible in Meta B pixel dashboard
```

### Phase 3: Full Integration (Day 2)

```
Day 2 13:00 - Consent Testing
       - Grant all consent
       - Fire event
       - Verify sent to all channels
       - Reject all consent
       - Fire event
       - Verify not sent to any channel
       - ✓ Consent enforcing correctly

14:00 - Channel Integration
       - Enable all channels
       - Fire test event
       - Check each channel dashboard
       - Verify all received event
       - ✓ All channels operational

15:00 - EMQ Optimization (Meta)
       - Check current EMQ score
       - Send more PII (phone, name, location)
       - Retest after 24 hours
       - ✓ EMQ > 10% after optimization
```

### Phase 4: Performance and Monitoring (Day 3-6)

```
Day 3 09:00 - Performance Check
       - Run speed test
       - Measure script load time (< 500ms)
       - Measure event send latency (< 1s)
       - Check Core Web Vitals
       - ✓ Performance acceptable

10:00 - Dashboard Review
       - Check real-time event volume
       - Check channel delivery rates
       - Check error rates
       - Verify anomaly detection
       - ✓ All metrics normal

11:00 - Alerts Configuration
       - Set volume drop alert (> 10%)
       - Set delivery failure alert (> 5%)
       - Set error rate alert (> 5%)
       - Test alert triggering
       - ✓ Alerts working

Day 3-6 - Monitor B Pixel
       - Let the B pixel run for several days with real traffic
       - Review event volume, delivery rates, and EMQ daily
       - Verify consent enforcement is working correctly
       - Confirm PII quality and identity stitching
       - Fix any issues found during this period
       - ✓ B pixel stable and data quality confirmed
```

### Phase 5: Migration to Main Pixel (Day 7)

```
Day 7 09:00 - Pre-Migration Review
       - Review B pixel data from the past 7 days
       - Confirm event volume matches expectations
       - Confirm EMQ scores are healthy
       - Confirm no delivery errors or consent issues
       - Compare B pixel data against existing main pixel (if active)
       - ✓ All metrics validated, ready to migrate

10:00 - Migrate to Main Pixel
       - Swap the B/test pixel ID for the main/production pixel ID
       - Keep all other configuration identical
       - ✓ Main pixel configured

10:30 - Post-Migration Validation
       - Fire test events and confirm they appear in the main pixel
       - Verify EMQ score on the main pixel
       - Check channel delivery rates
       - Monitor for 1 hour
       - ✓ Main pixel receiving events correctly

11:30 - Cleanup
       - Remove the B/test pixel channel
       - Review all documentation
       - Brief team on launch
       - Establish on-call rotation
       - ✓ Migration complete, ready for production
```

## Payload Validator Setup and Teardown

Recommended process for using Payload Validator.

### Setup (Before QA)

1. Go to Dashboard → Channels
2. Click "Add Channel"
3. Select "Payload Validator" from provider list
4. Configure:

- Name: "QA - Payload Validator"
- Enabled: ON
- Save validation logs: ON

5. Verify it appears in channel list
6. Fire test event
7. Confirm event appears in Payload Validator

### Usage During QA

- Review Payload Validator results after each test
- Fix issues indicated by validator
- Re-test after each fix
- Document all validation issues found
- Keep Payload Validator active until confident

### Teardown (Before Production)

1. Go to Dashboard → Channels
2. Find "QA - Payload Validator"
3. Click "Delete" button
4. Confirm deletion
5. Verify Payload Validator no longer appears
6. Deploy to production
7. Verify production events NOT going to Payload Validator

### Verification Checklist

- Payload Validator not in channel list
- Live log doesn't show Payload Validator events
- Real events flowing to actual channels
- No performance degradation

## Browser Developer Tools Inspection Workflow

Step-by-step guide for inspecting events in browser DevTools.

### Network Tab Analysis

```
1. Open DevTools (F12)
2. Click Network tab
3. Filter by XHR requests (type: xhr)
4. Reload page
5. Look for edgetag requests (best to filter it by subdomain)

For each request:
- Click on request
- Review Headers:
  * URL should be https://d.yourdomain.com
  * Method should be POST
  * Status should be 200
- Review Payload:
  * Should contain event JSON
  * Should have event name
  * Should have user ID
  * Should have timestamp
- Review Response:
  * Should be small (usually empty)
  * No error messages
```

**IMPORTANT: Beacon requests** — Events sent with `method: 'beacon'` (AddToCart before redirect, Purchase before navigation, page unload) use `navigator.sendBeacon()` and will NOT appear when filtering by XHR/Fetch. To see them, filter by **All** or **Ping** type instead. If using Chrome MCP or automated tools, see **gotchas.md § Beacon Request Visibility** for how to intercept them.

### Console Tab Analysis

```
1. Click Console tab
2. Reload page
3. Look for error messages
4. Watch for edgetag-related logs

Common errors to look for:
- "Failed to fetch" (network issue)
- "CORS error" (DNS/CNAME issue)
- "Consent required" (consent not granted)
- "Invalid payload" (malformed event)

Test edgetag function:
edgetag  // Should be defined as a function
edgetag('tag', 'PageView')  // Fire test event
```

### Application Tab Analysis (Cookies)

```
1. Click Application tab
2. Left panel → Cookies
3. Find d.yourdomain.com
4. Look for edgetag-related cookies

Key cookie to inspect:
- tag_user_id: the first-party user ID set by EdgeTag

Verify:
- tag_user_id is present and has a value
- Cookie is set on your subdomain (d.yourdomain.com)
- Cookie persists across page navigations
```

### Request/Response Inspection

```
1. Network tab → Click specific edgetag request
2. Request Headers:
   - Content-Type: application/json
   - Authorization: (if required)
3. Request Payload:
   - Copy and paste into JSON formatter
   - Validate JSON is correct
   - Check all required fields
4. Response Headers:
   - Status: 200
   - Access-Control-Allow-Origin: should match your domain
5. Response Body:
   - Usually empty or small acknowledgment
```

## Key Metrics to Monitor

### Event Volume

- Baseline: understand your typical event rate
- Alert: > 10% drop could indicate implementation issue
- Check: Compare web events vs channel deliveries

### Channel Delivery Rate

- Target: 95%+ delivery success
- Issues: < 90% indicates provider or payload problems
- Review: Channel-specific error logs

### EMQ Score (Meta)

EMQ scores vary significantly by event type because user identification rates differ across the funnel:

- **PageView**: Lower EMQ is expected — most visitors are anonymous with no email/phone captured yet
- **AddToCart / InitiateCheckout**: Medium EMQ — some users are identified at this stage
- **Purchase**: Should approach ~100% — email is captured at checkout, so nearly every event should match

When evaluating EMQ, always filter by event type. A low overall score may be fine if it's driven by high-volume anonymous PageViews while Purchase EMQ is near 100%.

### User Identity Coverage

Identity coverage depends on how aggressively the site captures PII. If conversion rates are low, fewer users provide their email, which limits the entire identity graph.

- **Goal**: Capture all PII available on the site
- **Sources to wire**: checkout forms, account signup, newsletter popups, login, contact forms, loyalty programs, wishlists — any form where the user provides PII
- **Impact**: Low coverage = lower EMQ, poor attribution, fewer users matched across channels
- **Key insight**: EdgeTag can only stitch and enrich what it receives — maximizing PII capture at every touchpoint is the single biggest lever for improving match rates

### Consent Compliance

- Metric: % of events respecting consent
- Target: 100% (all events enforce consent)
- Monitor: No events sent to non-consented channels

## Monitoring Dashboards Setup

Recommended dashboard configuration for production monitoring.

### Real-Time Event Dashboard

**Purpose:** Track event volume and trends

**Widgets to include:**

1. Event Volume (last 24 hours)

- X-axis: time
- Y-axis: event count
- Alert threshold: 10% drop

2. Event Type Breakdown

- Line chart: % of each event type
- Watch for unexpected distributions

3. Error Rate

- Line graph: % of events with errors
- Alert threshold: > 5%

4. Channel Delivery Rate

- Bar chart: delivery rate per channel
- Alert threshold: < 95%

### Channel Performance Dashboard

**Purpose:** Track channel-specific metrics

**Widgets to include:**

1. EMQ Score (Meta specific)

- Gauge: current score
- Trend: 7-day history

2. Event Volume per Channel

- Bar chart: events delivered per channel
- Compare to expectations

3. Channel Errors

- Table: error rate and messages per channel
- Identifies problematic channels

### Data Quality Dashboard

**Purpose:** Monitor data quality metrics

**Widgets to include:**

1. PII Coverage

- Metric: % of events with email
- Metric: % of events with phone

2. User Identity Metrics

- Metric: % of events with valid user_id
- Metric: % of events with email/phone combo
- Target: 100% valid user_id

3. Consent Compliance

- Metric: % of events respecting consent
- Metric: % of users with consent granted
- Target: 100% compliance

## Runbook Template

Template for creating team runbook for common issues.

```
# EdgeTag Runbook

## Quick Links
- Dashboard: [URL]
- Alert System: [URL]
- Provider Dashboards: [URLs]
- On-Call: [Contact Info]

## Critical Metrics
- Event Volume: Should be ~[X] events/day
- Channel Delivery: Should be > 95%
- EMQ Score (Meta): Should be > 10%
- Error Rate: Should be < 5%

## Common Issues and Fixes

### Issue: Event Volume Drops 20%+
**Alert:** Volume Drop Alert - RED
**Severity:** HIGH
**Response Time:** 15 minutes

Diagnosis:
1. Check dashboard for volume graph
2. Check if drop started suddenly or gradual
3. Check channel delivery rates
4. Check error logs for messages

Quick Fixes:
- Check DNS is still working (nslookup test)
- Check SSL certificate is valid
- Check consent enforcement isn't blocking all events
- Check if major bug in tracking code
- Review recent code changes

If not resolved:
- Escalate to on-call engineer
- Contact EdgeTag support
- [Support contact info]

### Issue: Channel Delivery < 95%
**Alert:** Delivery Failure - ORANGE
**Severity:** MEDIUM
**Response Time:** 30 minutes

Diagnosis:
1. Check which channel is failing
2. Check provider dashboard for their status
3. Check channel credentials
4. Check error logs for specific errors

Quick Fixes:
- Re-authenticate provider credentials
- Check rate limits on provider side
- Check PII quality (add more fields)
- Check if provider account suspended
- Test with simple event

If not resolved:
- Contact provider support
- Ask EdgeTag support
- Consider fallback channels

### Issue: EMQ Score < 10% (Meta)
**Alert:** Low EMQ - YELLOW
**Severity:** LOW
**Response Time:** 1 day

Diagnosis:
1. Check current EMQ score
2. Review PII in events (email, phone)
3. Check data formatting (lowercase, digits-only)
4. Check if enough events sent (need 100+)

Fix:
- Add more fields (phone, name, location)
- Fix email formatting (lowercase)
- Wait 24 hours for EMQ to update
- Verify events reaching Meta dashboard
- Review Meta's recommendations

## Contact Information
- Engineering Lead: [name, phone, email]
- On-Call Engineer: [current person, phone, email]
- EdgeTag Support: support@blotout.io
- Provider Support: [Meta: fbsupport@support.fb.com, Google: support.google.com]

## Escalation Chain
Level 1: On-call engineer
Level 2: Engineering manager
Level 3: VP of Engineering
Level 4: [CEO/CTO if critical business impact]
```

## Best Practices Summary

1. **Always test in staging first** - Never test in production
2. **Change one thing at a time** - Can't debug if changing multiple things
3. **Document everything** - Write down what changed and why
4. **Test end-to-end** - From browser to provider dashboard
5. **Monitor proactively** - Set up alerts before issues occur
6. **Keep dashboards updated** - Actual metrics, not guesses
7. **Brief team regularly** - Daily first week, weekly after
8. **Maintain runbook** - Keep procedures current
9. **Test disaster recovery** - What if key component fails?
10. **Review metrics weekly** - Catch issues early
