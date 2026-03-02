# EdgeTag HTTP API: Integration Patterns

Real-world examples of HTTP API integration across different use cases.

---

## Pattern 1: CRM Webhook Integration

**Scenario**: Your CRM (Salesforce, HubSpot, Pipedrive) generates leads, sales, and customer updates. Send these events to EdgeTag to track customer journey.

### Architecture

```
CRM System → Webhook → Your API Server → EdgeTag HTTP API
```

### Implementation

**Step 1: Set up webhook listener on your server**

```javascript
// Express.js example
app.post('/webhooks/crm', express.json(), async (req, res) => {
  const crmEvent = req.body;

  // Map CRM event to EdgeTag event
  const edgeTagEvent = {
    eventId: `crm_${crmEvent.id}_${Date.now()}`,
    eventName: mapCrmToEdgeTag(crmEvent.type),  // "Lead", "SalesWon", etc.
    timestamp: Date.now(),
    pageUrl: crmEvent.source_url,
    data: {
      userEmail: crmEvent.contact_email,
      value: crmEvent.deal_value,
      currency: crmEvent.currency || "USD"
    }
  };

  // Send to EdgeTag
  await sendToEdgeTag(edgeTagEvent);
  res.json({ success: true });
});
```

**Step 2: Send to EdgeTag**

```javascript
async function sendToEdgeTag(event) {
  const response = await fetch(
    'https://abc.domain.com/tag',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }
  );

  if (!response.ok) {
    console.error('EdgeTag error:', await response.json());
  }
}
```

**Step 3: Map CRM events to EdgeTag event names**

```javascript
function mapCrmToEdgeTag(crmEventType) {
  const map = {
    "lead_created": "Lead",
    "opportunity_won": "Purchase",
    "opportunity_lost": "LeadLost",
    "contact_updated": "Update",
    "deal_stage_changed": "UpdateCart"
  };
  return map[crmEventType] || "Custom";
}
```

### Benefits

- Track entire customer lifecycle
- Attribute CRM conversions to marketing channels
- Understand which campaigns drive most valuable leads
- Connect offline sales to online touchpoints

---

## Pattern 2: Offline Purchase Tracking

**Scenario**: You have in-store purchases, phone orders, or manual transactions that don't go through your website. Track them in EdgeTag.

### Architecture

```
POS System / Phone Order → Backend Database → Batch Process → EdgeTag API
```

### Implementation

**Step 1: Log purchase in your system**

```sql
-- Your purchase table
INSERT INTO offline_purchases (
  purchase_id, customer_email, amount, currency, timestamp
) VALUES (
  'offline_20260226_001',
  'customer@example.com',
  199.99,
  'USD',
  1707302400000
);
```

**Step 2: Process and send to EdgeTag**

```javascript
async function sendOfflinePurchases() {
  // Get purchases from last 24 hours
  const purchases = await db.query(
    'SELECT * FROM offline_purchases WHERE created_at > NOW() - 1 day'
  );

  for (const purchase of purchases) {
    const event = {
      eventId: `offline_${purchase.purchase_id}`,
      eventName: "Purchase",
      timestamp: purchase.timestamp,
      pageUrl: "https://mystore.com/offline-checkout",
      pageTitle: "Offline Purchase",
      data: {
        userEmail: purchase.customer_email,
        value: purchase.amount,
        currency: purchase.currency,
        contents: purchase.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      },
      storage: {
        edgeTag: {
          consentCategories: {
            marketing: true,
            analytics: true,
            sale_of_data: false,
            preferences: true
          }
        }
      },
      providers: ["facebook", "klaviyo"]
    };

    await sendToEdgeTag(event);
  }
}

// Run daily
schedule.every().day().at("02:00").do(sendOfflinePurchases);
```

**Step 3: Match user to EdgeTag ID**

```javascript
// Option A: Use email (must exist in ID graph)
// Shown above with userEmail

// Option B: Use known EdgeTagUserId
const event = {
  // ... other fields
  headers: {
    'EdgeTagUserId': purchase.edgeTag_id  // If you have it stored
  }
};

// Option C: First populate user in ID graph
// Get user into system first via /data endpoint
await fetch('https://d.mysite.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'EdgeTagUserId': purchase.edgeTag_id
  },
  body: JSON.stringify({
    data: {
      email: purchase.customer_email,
      firstName: purchase.first_name,
      lastName: purchase.last_name
    }
  })
});
```

### Benefits

- Unify online + offline attribution
- Track full customer value across channels
- See which online touchpoints drive store visits
- Accurate ROAS across all sales channels

---

## Pattern 3: Mobile App Event Tracking

**Scenario**: Native iOS/Android app users perform actions. Use HTTP API to send events server-side.

### Architecture

```
Mobile App → Your Backend → EdgeTag HTTP API
```

### Implementation

**Step 1: Mobile app sends to your backend**

```swift
// iOS example
let event = [
    "eventId": "app_purchase_\(UUID().uuidString)",
    "eventName": "Purchase",
    "timestamp": Int(Date().timeIntervalSince1970 * 1000),
    "data": [
        "value": 99.99,
        "currency": "USD"
    ]
] as [String : Any]

URLSession.shared.dataTask(with: URLRequest(
    url: URL(string: "https://myapp.com/api/events")!
)) { data, response, error in
    // ... handle response
}.resume()
```

**Step 2: Backend forwards to EdgeTag with user ID**

```javascript
app.post('/api/events', express.json(), async (req, res) => {
  const { userId, ...eventData } = req.body;

  // Get EdgeTag ID from your user database
  const user = await db.getUser(userId);

  const edgeTagEvent = {
    ...eventData,
    eventId: `mobile_${eventData.eventId}`,
    timestamp: Date.now(),
    userAgent: req.headers['user-agent']
  };

  try {
    const response = await fetch('https://abc.domain.com/tag', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'EdgeTagUserId': user.edgeTag_id
      },
      body: JSON.stringify(edgeTagEvent)
    });

    res.json({ success: response.ok });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Step 3: Create/maintain EdgeTag ID for app users**

```javascript
// When user signs up in mobile app
app.post('/api/auth/signup', async (req, res) => {
  const user = await createUser(req.body);

  // Generate unique app user ID
  const edgeTagId = `app_${user.id}`;

  // Enrich ID graph
  await fetch('https://abc.domain.com/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EdgeTagUserId': edgeTagId
    },
    body: JSON.stringify({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
  });

  // Store in user record
  await db.updateUser(user.id, { edgeTag_id: edgeTagId });

  res.json({ userId: user.id });
});
```

### Benefits

- Unified tracking across web + mobile
- Understand mobile-first users
- Track in-app purchases and conversions
- Mobile attribution to marketing channels

---

## Pattern 4: Backend Event Pipeline

**Scenario**: Your backend processes user actions (emails sent, courses completed, subscriptions cancelled). Send to EdgeTag for complete user view.

### Architecture

```
Your Services → Event Broker (Kafka/Redis) → Worker → EdgeTag API
```

### Implementation

**Step 1: Publish events from your services**

```javascript
// Any service that processes user actions
const { EventBus } = require('./events');

class SubscriptionService {
  async handleUpgrade(userId, planId) {
    await this.database.update('users', { plan_id: planId });

    // Publish event for EdgeTag
    EventBus.publish('user:plan:upgraded', {
      userId,
      planId,
      timestamp: Date.now()
    });
  }

  async handleCancel(userId) {
    await this.database.update('users', { plan_id: null });

    EventBus.publish('user:subscription:cancelled', {
      userId,
      timestamp: Date.now()
    });
  }
}
```

**Step 2: Worker processes and sends to EdgeTag**

```javascript
const { EventBus } = require('./events');

// Subscribe to events
EventBus.subscribe('user:*', async (event) => {
  const user = await db.getUser(event.userId);

  const edgeTagEvent = {
    eventId: `be_${event.type}_${user.id}_${event.timestamp}`,
    eventName: mapEventName(event.type),
    timestamp: event.timestamp,
    data: {
      ...event.data
    }
  };

  // If user has EdgeTag ID, use it
  if (user.edgeTag_id) {
    edgeTagEvent.headers = {
      'EdgeTagUserId': user.edgeTag_id
    };
  }

  // Send to EdgeTag
  await sendToEdgeTag(edgeTagEvent);
});

function mapEventName(eventType) {
  const map = {
    'user:plan:upgraded': 'Purchase',
    'user:subscription:cancelled': 'Refund',
    'email:sent': 'Send',
    'course:completed': 'ViewContent'
  };
  return map[eventType] || 'Custom';
}
```

**Step 3: Batch failures gracefully**

```javascript
const maxRetries = 3;

async function sendToEdgeTagWithRetry(event, retries = 0) {
  try {
    const response = await fetch('https://abc.domain.com/tag', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...event.headers
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    if (retries < maxRetries) {
      // Exponential backoff
      await sleep(Math.pow(2, retries) * 1000);
      return sendToEdgeTagWithRetry(event, retries + 1);
    }

    // Log failure for manual review
    logger.error('EdgeTag event failed:', { event, error });
  }
}
```

### Benefits

- Comprehensive user event history
- Real-time attribution updates
- Better customer lifecycle understanding
- Connect product events to revenue

---

## Pattern 5: Audience Upload Workflow

**Scenario**: You have a customer segment (high-value customers, email list, etc.) and want to upload to all channels at once for retargeting or lookalike audiences.

### Architecture

```
CRM / Database → Your Backend → EdgeTag /audience API → Ad Platforms (Facebook, Google, TikTok)
```

### Implementation

**Step 1: Prepare audience data**

```javascript
// Gather segment from database or CRM
const segment = await db.users
  .find({
    totalLifetimeValue: { $gte: 1000 },
    status: 'active'
  })
  .select(['email', 'phone', 'firstName', 'lastName'])
  .toArray()

const audienceData = segment.map(user => ({
  email: user.email,
  phone: user.phone,
  firstName: user.firstName,
  lastName: user.lastName
}))
```

**Step 2: Call Audience API**

```javascript
const formData = new FormData()

formData.append('name', 'High Value Customers')
formData.append('type', 'custom') // or 'primary'
formData.append('batch', JSON.stringify({
  startTime: Math.floor(Date.now() / 1000),
  dataType: 'EMAIL_SHA256' // or PHONE_SHA256, EMAIL_PLAINTEXT
}))
formData.append('users', JSON.stringify(audienceData))

const response = await fetch('https://d.mysite.com/audience', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${EDGETAG_API_KEY}`
  },
  body: formData
})

const result = await response.json()
console.log(`Audience uploaded. ID: ${result.audienceId}`)
```

**Step 3: Select distribution channels**
Optional query parameters:

- `channels=facebook,googleAdsClicks,tiktok` (limit to specific channels)
- `sync=true` (enable bidirectional sync)
- `disablePrefix=true` (skip field name prefix)

```javascript
const response = await fetch('https://d.mysite.com/audience?channels=facebook,tiktok&sync=true', {
  method: 'POST',
  body: formData
})
```

**Step 4: Verify in platform dashboards**

- Facebook: Audiences → Custom Audiences (new audience appears in 24h)
- Google Ads: Audiences → Customer Match (new audience available for targeting)
- TikTok: Audiences → First Party (audience synced)

**Step 5: Use for retargeting campaigns**

- Create campaign in ad platform
- Select "High Value Customers" audience
- Target with promotional offer
- Monitor conversion rate vs other segments

### Error Handling

```javascript
try {
  const response = await fetch('https://d.mysite.com/audience', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Upload failed: ${error.message}`)
  }

  const result = await response.json()
  console.log(`Success. Audience ID: ${result.audienceId}`)
} catch (err) {
  console.error('Audience upload error:', err)
  // Alert team, log for investigation
}
```

### Best Practices

- Schedule uploads during off-peak hours
- Start with small segments to test
- Use hashed emails (SHA256) for privacy
- Monitor audience size across platforms
- Archive old audiences that are no longer used

---

## Common Headers Across Patterns

```javascript
// When user is known via EdgeTag ID
const headersWithId = {
  'Content-Type': 'application/json',
  'EdgeTagUserId': user.edgeTag_id
};

// When using email identification
const headersWithEmail = {
  'Content-Type': 'application/json'
};
// Include userEmail in data object instead
```

---

## Error Recovery Strategies

### Circuit Breaker Pattern

```javascript
class EdgeTagClient {
  constructor() {
    this.failureCount = 0;
    this.successCount = 0;
  }

  async send(event) {
    // If too many failures, stop trying temporarily
    if (this.failureCount > 10) {
      throw new Error('Circuit breaker open, retrying in 60s');
    }

    try {
      const response = await fetch('https://abc.domain.com/tag', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        this.successCount++;
        if (this.successCount > 5) {
          this.failureCount = Math.max(0, this.failureCount - 1);
          this.successCount = 0;
        }
      }

      return response;
    } catch (error) {
      this.failureCount++;
      throw error;
    }
  }
}
```

---

## Testing Your Integration

### Local Testing

```bash
# Test /tag endpoint
curl -X GET "https://abc.domain.com/tag" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: test_user_001" \
  --data '{
    "eventId": "test_'$(date +%s)'",
    "eventName": "Purchase",
    "timestamp": '$(date +%s)000',
    "data": {"value": 9.99}
  }'

# Test /data endpoint
curl -X POST "https://abc.domain.com/data" \
  -H "Content-Type: application/json" \
  -H "EdgeTagUserId: test_user_001" \
  --data '{
    "data": {
      "email": "test@example.com",
      "firstName": "Test"
    }
  }'
```

### Validation in Dashboard

1. Send test event via HTTP API
2. Check EdgeTag dashboard → Analytics
3. Verify event appears in real-time
4. Check event details match payload
5. Verify provider events delivered (if applicable)

### Monitoring

```javascript
// Track EdgeTag API health
const metrics = {
  eventsSent: 0,
  eventsFailed: 0,
  averageLatency: 0,
  lastError: null
};

// Alert if failure rate exceeds threshold
if (metrics.eventsFailed / metrics.eventsSent > 0.05) {
  alertOps('EdgeTag API failure rate above 5%');
}
```

