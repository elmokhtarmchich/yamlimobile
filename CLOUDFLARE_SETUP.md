# Cloudflare Workers Setup for Push Notifications

## Overview
This setup enables cross-device push notifications using Cloudflare Workers (free tier).

## Prerequisites
1. Cloudflare account (free)
2. Wrangler CLI installed: `npm install -g wrangler`
3. VAPID keys generated

## Step 1: Generate VAPID Keys

```bash
# Install web-push if not already installed
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Save the output - you'll need:
- `Public Key` → Update in `wrangler.toml` and frontend code
- `Private Key` → Will be set as secret in Step 4

## Step 2: Update Configuration

Edit `wrangler.toml`:
```toml
name = "yamli-push-notifications"
```

Update `index.js` and `admin.html`:
```javascript
const CLOUDFLARE_WORKER_URL = 'https://yamli-push-notifications.YOUR-ACCOUNT.workers.dev';
```

## Step 3: Create KV Namespace

```bash
wrangler kv:namespace create "PUSH_SUBSCRIPTIONS"
```

Copy the ID from output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "PUSH_SUBSCRIPTIONS"
id = "paste-id-here"
```

## Step 4: Deploy Worker

```bash
# Login to Cloudflare
wrangler login

# Set VAPID private key as secret
wrangler secret put VAPID_PRIVATE_KEY
# Enter your private key when prompted

# Deploy the worker
wrangler deploy
```

## Step 5: Test

1. Open your app on multiple devices
2. Click the bell icon to subscribe each device
3. Open `admin.html`
4. Send a notification - it should reach all subscribed devices!

## API Endpoints

- `POST /subscribe` - Register a device
- `POST /unsubscribe` - Unregister a device
- `POST /broadcast` - Send to all devices (requires admin password)
- `GET /subscribers` - Get subscriber count

## Free Tier Limits

- **Workers**: 100,000 requests/day
- **KV**: 1GB storage, 100,000 reads/day, 1,000 writes/day

## Troubleshooting

### Worker not receiving subscriptions?
- Check CORS headers in browser console
- Verify Worker URL in frontend code
- Check KV namespace ID in wrangler.toml

### Notifications not sending?
- Verify VAPID keys match
- Check private key is set as wrangler secret
- Look at Worker logs: `wrangler tail`

## Security Note

The current setup uses a simple password (`yamli2024`) for the broadcast endpoint. For production:
1. Use a stronger password
2. Consider adding IP whitelisting
3. Implement proper authentication (JWT, API keys)
