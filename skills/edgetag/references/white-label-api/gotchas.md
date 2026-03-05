# White-Label API — Common Mistakes & Pitfalls

## Critical Issues

### 1. Client Secret Not Saved After OAuth App Creation (OAuth Only)

**Problem:** The `client_secret` is shown **only once** when the OAuth app is created. It cannot be retrieved later.

**Impact:** You lose the ability to exchange tokens and must roll the secret, invalidating all existing integrations.

**Solution:** Save both `client_id` and `client_secret` to a secure secrets manager immediately on creation. Never store them in client-side code or version control.

### 2. Sending code_challenge Instead of code_verifier on Token Exchange (OAuth Only)

**Problem:** The authorization redirect uses the **hashed** `code_challenge`, but the token exchange requires the **plain-text** `code_verifier`.

```javascript
// WRONG — sending the hash again
const body = new URLSearchParams({
  code,
  code_verifier: codeChallenge, // This is the hash!
  grant_type: 'authorization_code',
})

// RIGHT — sending the original plain-text verifier
const body = new URLSearchParams({
  code,
  code_verifier: verifier, // Original unhashed string
  grant_type: 'authorization_code',
})
```

**Impact:** Token exchange fails silently or returns an auth error.

**Solution:** Store the plain-text verifier in session storage during redirect, retrieve it on callback.

### 3. Access Token Expiry Not Handled (OAuth Only)

**Problem:** OAuth access tokens expire every **2 hours** (7200 seconds). Code that stores the token without tracking expiry will start failing after 2 hours. Personal access tokens do not expire.

**Impact:** All API calls return 401 after token expires. If your app doesn't handle this, the customer's dashboard breaks.

**Solution:** Track `expires_in` on every token response. Refresh proactively (e.g., at 80% of TTL) rather than waiting for a 401. If using a personal access token, this is not an issue.

```javascript
// WRONG — fire and forget
const { access_token } = await getToken()
// Use access_token forever...

// RIGHT — track expiry and refresh proactively
const { access_token, refresh_token, expires_in } = await getToken()
const expiresAt = Date.now() + expires_in * 800 // 80% of TTL
// Before each API call, check if refresh is needed
if (Date.now() > expiresAt) {
  await refreshAccessToken(refresh_token)
}
```

### 4. Secrets Sent Unencrypted

**Problem:** Channel secrets (API keys, tokens) must be encrypted client-side with the RSA public key from `/user/me`. Sending plain-text values fails or is rejected.

**Impact:** Channel creation fails, or credentials are exposed in transit.

**Solution:** Always encrypt using the hybrid AES + RSA pattern. See [api-reference.md](api-reference.md) § Secret Encryption.

### 5. Using the Wrong Public Key for Environment

**Problem:** Sandbox and production have **different RSA public keys**. Using the sandbox key to encrypt a production secret (or vice versa) results in decryption failures.

**Impact:** Channel creation succeeds but the channel cannot authenticate with the provider — events silently fail.

**Solution:** Always fetch the public key from `/user/me` for the environment you're targeting. Never hardcode it.

### 6. Hosting Model Cannot Be Changed

**Problem:** Once a tag is created as `managed: true` or `managed: false` (self-hosted), it **cannot be migrated** to the other model.

**Impact:** Customer must delete the tag and recreate it, losing all historical data and channel configurations.

**Solution:** Choose the hosting model carefully during onboarding. For white-label apps, `managed: true` is almost always the right choice unless your customers specifically require self-hosted.

---

## Common Mistakes

### 7. Missing Team-Id Header

**Problem:** Every API call requires both `Authorization` and `Team-Id` headers. Omitting `Team-Id` returns a confusing error.

```bash
# WRONG
curl --url https://api.edgetag.io/v1/tag \
  --header 'Authorization: Bearer {token}'

# RIGHT
curl --url https://api.edgetag.io/v1/tag \
  --header 'Authorization: Bearer {token}' \
  --header 'Team-Id: {team_id}'
```

### 8. Creating Tag with rootDomain Including Protocol

**Problem:** `rootDomain` must be the bare domain without `https://`, `www.`, or trailing slashes.

```javascript
// WRONG
{ "rootDomain": "https://www.mystore.com/" }

// RIGHT
{ "rootDomain": "mystore.com" }
```

### 9. Not Polling DNS Verification

**Problem:** DNS propagation takes time. Calling `GET /tag/verify/mapping/{tagId}` once and giving up when `valid: false` is returned.

**Impact:** Customer is stuck in setup with no feedback.

**Solution:** Implement polling (e.g., every 60 seconds for up to 10 minutes) or a manual "Check DNS" button in your UI. The endpoint is safe to call repeatedly — already-validated records are omitted from the response.

### 10. Setting shouldDeploy Without Understanding the Delay

**Problem:** When `shouldDeploy: true`, the API call **blocks until deployment completes** — it does not return until the infrastructure is live. First deployments can take up to **45 seconds**; subsequent deployments are faster.

**Impact:** If your UI doesn't account for the long response time, users may see timeouts, spinners that seem stuck, or assume the request failed.

**Solution:** Show a "deploying..." loading state in your UI **before** making the API call. Set HTTP client timeouts to at least 60 seconds. Consider using `shouldDeploy: false` for intermediate channel additions and triggering a single deployment via `GET /tag/deploy/{tagId}` after all channels are configured.

### 11. Forgetting to Add the SDK Snippet

**Problem:** The API creates the tag and channels server-side, but events won't flow until the **EdgeTag SDK snippet** is added to the customer's website.

**Impact:** Everything looks configured correctly in your dashboard but no data comes through.

**Solution:** After completing the API setup, display the SDK snippet for the customer to install:

```html
<script src="https://{domain}/load" async></script>
<script>
  window.edgetag =
    window.edgetag ||
    function () {
      ;(edgetag.stubs = edgetag.stubs || []).push(arguments)
    }
  edgetag('init', { edgeURL: 'https://{domain}' })
</script>
```

Where `{domain}` is the first-party subdomain returned by `POST /tag` (e.g., `d.mystore.com`).

### 12. Self-Hosted: Creating Tag Before Host

**Problem:** For self-hosted (`managed: false`), you must create a host in the EdgeTag dashboard first and use the `hostId` in `POST /tag`.

```javascript
// WRONG — creating tag without host
await fetch('/tag', { body: JSON.stringify({ managed: false, hostId: '' }) })

// RIGHT — get hostId from dashboard first
const hostId = '...' // copied from EdgeTag dashboard → Hosts
await fetch('/tag', { body: JSON.stringify({ managed: false, hostId }) })
```

---

## Debugging Checklist

1. **Auth failing?** → Check both `Authorization` and `Team-Id` headers are present and correct
2. **Token expired?** → If using OAuth, check `expires_in` from the last token response. Refresh if > 2 hours old. Personal access tokens do not expire
3. **Tag creation fails?** → Verify `rootDomain` is bare (no protocol, no www, no trailing slash)
4. **DNS not validating?** → DNS propagation can take up to 48 hours. Check records with `dig` or `nslookup` first
5. **Channel not working?** → Verify secrets were encrypted with the correct environment's public key
6. **No events flowing?** → Confirm the SDK snippet is installed on the website with the correct `domain`
7. **OAuth redirect fails?** → Verify `redirect_uri` exactly matches one registered in the OAuth app (OAuth only)
