# Channel Integration Patterns

Real-world patterns for common channel setup scenarios.

---

## Pattern 1: Adding a New Channel

### Scenario

You want to add a new advertising channel (e.g., Pinterest, Snapchat, LinkedIn) to your existing setup.

### Steps

**1. Check channel requirements**

- Does channel have browser pixel? If yes, what's the npm package?
- Is channel server-side only?
- Is channel hybrid (browser + server)?

Example: Pinterest

- Channel name: `pinterest`
- NPM package: None (server-side only)
- Requires API key: Yes

**2. Install npm packages (if browser pixel and not using** `/load`**to load JS)**

```bash
npm install @blotoutio/providers-pinterest-sdk  # if browser pixel exists
```

**3. Add to channel list in dashboard**

- Go to EdgeTag dashboard
- Domain settings → Channels
- Click "Add Channel"
- Select `pinterest` from list
- Enter credentials (API key, account ID, etc.)
- Configure options (if any)
- Save

**4. Update consent/providers in code (if not using** `/load` )

```javascript
import { init } from '@blotoutio/edgetag-sdk-js'
import facebook from '@blotoutio/providers-facebook-sdk'
import googleAdsClicks from '@blotoutio/providers-google-ads-clicks-sdk'
import tiktok from '@blotoutio/providers-tiktok-sdk'
import pinterest from '@blotoutio/providers-pinterest-sdk'

init({
  edgeURL: 'https://d.mysite.com',
  providers: [facebook, googleAdsClicks, tiktok, pinterest], // New channel
  consent: {
    facebook: true,
    googleAdsClicks: true,
    tiktok: true,
    pinterest: true, // New channel
  },
})
```

**5. Test in staging**

- Generate test events
- Verify data appears in Pinterest dashboard
- Check event payload format

**6. Monitor in production**

- Check conversion counts on day 1
- Monitor for errors in EdgeTag logs
- Validate data matches expected range

**7. Troubleshoot if needed**

- Missing events? Check channel name in SDK
- Wrong data format? Review channel requirements
- Auth errors? Verify credentials in dashboard

### Checklist

- npm packages installed (if browser pixel)
- Channel added to dashboard
- Credentials configured and tested
- Consent/providers arrays updated in code
- Code deployed to staging
- Test events validated in platform
- Code deployed to production
- Production monitoring active

---

## Pattern 2: Event Sink for Custom Backend

### Scenario

You want to forward all EdgeTag events to your own backend for custom processing, data warehouse ingestion, or API integration.

### Setup

**1. Configure Event Sink in dashboard**

- Channels → Event Sink
- Destination URL: `https://your-api.com/webhooks/edgetag`
- Custom headers:
  - `Authorization: Bearer YOUR_SECRET_TOKEN`
  - `X-Source: EdgeTag`
- Save

**2. Create receiving endpoint**

```javascript
// Node.js/Express
app.post('/webhooks/edgetag', (req, res) => {
  // Verify auth header
  const token = req.headers.authorization?.split(' ')[1]
  if (token !== process.env.EDGETAG_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const event = req.body

  // Log for debugging
  console.log(`Received ${event.eventName} event from user ${event.userId}`)

  // Process event
  switch (event.eventName) {
    case 'Purchase':
      logToPurchaseDB(event)
      updateUserLTVCache(event.userId)
      triggerOrderConfirmationEmail(event)
      break

    case 'ViewContent':
      logToAnalytics(event)
      updateProductPopularity(event.payload.productId)
      break

    case 'AddToCart':
      logToAnalytics(event)
      triggerAbandonmentFlow(event)
      break
  }

  // Respond quickly (EdgeTag has 5-10s timeout)
  res.json({ success: true, eventId: event.eventId })
})
```

**3. Store in data warehouse (optional)**

```javascript
async function logToPurchaseDB(event) {
  await db.orders.insert({
    orderId: event.payload.orderId,
    userId: event.userId,
    value: event.payload.value,
    currency: event.payload.currency,
    items: event.payload.items,
    timestamp: event.eventTimestamp,
    source: 'edgetag',
  })
}
```

**4. Monitor endpoint health**

```javascript
// Add status/health endpoint for EdgeTag to check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// Log Event Sink errors
app.post('/webhooks/edgetag', async (req, res, next) => {
  try {
    // ... process event
  } catch (err) {
    console.error('Event Sink processing error:', err)
    // Log to monitoring system
    sendAlertToSlack(`Event Sink failed: ${err.message}`)
    // Still respond OK so EdgeTag doesn't retry
    res.json({ success: false, error: err.message })
  }
})
```

### Error Handling

- Endpoint must respond within 5-10 seconds
- No automatic retries; if endpoint fails, event is lost
- Add alerting for endpoint downtime
- Monitor error rates in logs

---

## Pattern 3: Webhook Channel for Ingesting External Events

### Scenario

An external system (e.g., Shopify, Salesforce, your backend) sends events to EdgeTag via a webhook. The webhook channel receives the incoming request, processes the data, optionally enriches it in external systems (e.g., upsert a Salesforce lead), and forwards the event into EdgeTag's channel pipeline so all configured channels (Meta, Google Ads, TikTok, etc.) receive it.

### How Webhook Channels Work

1. External system sends HTTP request to your EdgeTag webhook endpoint
2. Your webhook script (`process(params)`) runs on EdgeTag servers
3. The script parses the incoming payload, builds an EdgeTag event, and optionally calls external APIs
4. The script calls `params.handleTag(payload, { userId, dbId })` to forward the event into EdgeTag's channel pipeline
5. All configured channels receive the event as if it came from the browser SDK

### Available `params` Helpers

| Helper                            | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| `params.request`                  | The incoming HTTP request object               |
| `params.secrets`                  | Key-value secrets configured in the dashboard  |
| `params.getUsersByEmail(email)`   | Look up EdgeTag users by email in the ID graph |
| `params.handleTag(payload, user)` | Forward event into EdgeTag's channel pipeline  |
| `params.writeError(label, error)` | Log an error to EdgeTag's error reporting      |

### Implementation: Salesforce + Shopify Order Webhook

**1. Set up webhook in EdgeTag dashboard**

- Channels → Webhook
- Add secrets: `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_REFRESH_TOKEN`
- Write the process script (runs on EdgeTag servers)

**2. Configure Shopify to send order webhooks to the EdgeTag webhook URL**

**3. Write webhook handler**

```javascript
// EdgeTag Webhook Script
// Receives Shopify order webhook, upserts Salesforce lead + opportunity,
// then forwards the Purchase event to all EdgeTag channels

async process(params) {
  const SF_CLIENT_ID = params.secrets.SF_CLIENT_ID
  const SF_CLIENT_SECRET = params.secrets.SF_CLIENT_SECRET
  const SF_REFRESH_TOKEN = params.secrets.SF_REFRESH_TOKEN

  // Authenticate with Salesforce via OAuth refresh token
  async function getSalesforceAccessToken(clientId, clientSecret, refreshToken) {
    const resp = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      })
    })
    const json = await resp.json()
    if (!json.access_token) throw new Error('Failed to authenticate to Salesforce')
    return { token: json.access_token, instanceUrl: json.instance_url }
  }

  // Find, update, or create a Salesforce Lead
  async function upsertLeadAndReturnId(sf, user) {
    const query = `SELECT Id FROM Lead WHERE Email = '${user.userEmail}' LIMIT 1`
    const url = `${sf.instanceUrl}/services/data/v60.0/query/?q=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${sf.token}` }
    })
    const data = await response.json()
    const existingLead = data.records.length ? data.records[0] : null

    if (existingLead) {
      // Update existing lead
      await fetch(`${sf.instanceUrl}/services/data/v60.0/sobjects/Lead/${existingLead.Id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${sf.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          FirstName: user.userFirstName,
          LastName: user.userLastName,
          Phone: user.userPhone
        })
      })
      return existingLead.Id
    } else {
      // Create new lead
      const resp = await fetch(`${sf.instanceUrl}/services/data/v60.0/sobjects/Lead`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sf.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: user.userEmail,
          FirstName: user.userFirstName,
          LastName: user.userLastName,
          Phone: user.userPhone,
          Company: user.userCompany
        })
      })
      const newLead = await resp.json()
      return newLead.id
    }
  }

  // Create Salesforce Opportunity linked to Lead
  async function createOpportunity(sf, leadId, body) {
    const resp = await fetch(`${sf.instanceUrl}/services/data/v60.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sf.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: `Order ${body.id}`,
        CloseDate: new Date().toISOString().split('T')[0],
        StageName: 'Prospecting',
        Amount: body.current_total_price,
        LeadReference__c: leadId
      })
    })
    const json = await resp.json()
    if (!json.id) throw new Error(`Opportunity create failed: ${JSON.stringify(json)}`)
    return json.id
  }

  try {
    // Parse incoming Shopify order webhook
    const body = await params.request.clone().json()

    // Build user object from Shopify payload
    const user = {
      userEmail: body.customer.email,
      userFirstName: body.customer.first_name,
      userLastName: body.customer.last_name,
      userPhone: body.customer.phone,
      userCompany: 'EdgeTag'
    }

    // Look up existing EdgeTag user by email
    let userId = null
    let dbId = null

    if (user.userEmail) {
      const found = await params.getUsersByEmail(user.userEmail.toLowerCase())
      if (found?.length) {
        userId = found[0].userId
        dbId = found[0].dbId
      }
    }

    if (!userId) {
      userId = body.customer.id.toString()
    }

    // Authenticate with Salesforce
    const sf = await getSalesforceAccessToken(SF_CLIENT_ID, SF_CLIENT_SECRET, SF_REFRESH_TOKEN)

    // Upsert Lead in Salesforce
    let salesforceLeadId
    try {
      salesforceLeadId = await upsertLeadAndReturnId(sf, user)
    } catch (err) {
      params.writeError('Lead Upsert Error', err)
    }

    // Create Opportunity linked to Lead
    let salesforceOppId
    try {
      if (salesforceLeadId) {
        salesforceOppId = await createOpportunity(sf, salesforceLeadId, body)
      }
    } catch (err) {
      params.writeError('Opportunity Creation Error', err)
    }

    // Build EdgeTag event payload
    const payload = {
      referrer: '',
      search: '',
      eventName: 'Purchase',
      eventId: body.id.toString(),
      timestamp: new Date(body.created_at).getTime(),
      data: {
        ...user,
        orderId: body.id.toString(),
        currency: body.currency,
        value: parseFloat(body.current_total_price),
        contents: body.line_items.map((item) => ({
          id: item.product_id,
          variantId: item.variant_id,
          sku: item.sku,
          quantity: item.quantity,
          item_price: parseFloat(item.price),
          title: item.title,
          type: 'product'
        })),
        salesforceLeadId,
        salesforceOpportunityId: salesforceOppId
      },
      providerData: {},
      providers: {},
      storage: {
        edgeTag: {
          consent: { all: true },
          consentCategories: { all: true },
          storageId: null
        }
      }
    }

    if (dbId != null) payload.storage.edgeTag.storageId = dbId

    // Forward event into EdgeTag's channel pipeline
    // All configured channels (Meta, Google Ads, TikTok, etc.) will receive this event
    return await params.handleTag(payload, { userId, dbId })
  } catch (err) {
    params.writeError('error', err)
  }
}
```

### Testing

- Send a test Shopify order webhook to the EdgeTag webhook URL
- Check Salesforce for new/updated lead and opportunity
- Verify the Purchase event appears in EdgeTag analytics
- Confirm channels (Meta, Google Ads, etc.) received the event

### Error Handling

- Use `params.writeError()` to log errors — they appear in the EdgeTag dashboard under domain errors
- Wrap external API calls (Salesforce, etc.) in try/catch so one failure doesn't block the event from reaching channels
- The webhook script runs on EdgeTag servers with a timeout — keep external API calls fast
