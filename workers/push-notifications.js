// Cloudflare Worker for Push Notifications
// This worker handles subscription storage and broadcast messaging

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Subscribe endpoint - Store device subscription
      if (path === '/subscribe' && request.method === 'POST') {
        const subscription = await request.json();
        
        // Generate unique ID for this subscription
        const subId = crypto.randomUUID();
        
        // Store in KV
        await env.PUSH_SUBSCRIPTIONS.put(subId, JSON.stringify({
          ...subscription,
          createdAt: Date.now()
        }));
        
        return new Response(JSON.stringify({ 
          success: true, 
          id: subId,
          message: 'Subscribed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Unsubscribe endpoint - Remove device subscription
      if (path === '/unsubscribe' && request.method === 'POST') {
        const { id } = await request.json();
        await env.PUSH_SUBSCRIPTIONS.delete(id);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Unsubscribed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Broadcast endpoint - Send to all subscribers
      if (path === '/broadcast' && request.method === 'POST') {
        const { title, body, icon, adminPassword } = await request.json();
        
        // Verify admin password (should match config.js)
        if (adminPassword !== 'yamli2024') {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid admin password'
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get all subscriptions from KV
        const subscriptions = await env.PUSH_SUBSCRIPTIONS.list();
        const results = [];

        // Send to each subscriber
        for (const key of subscriptions.keys) {
          const subData = await env.PUSH_SUBSCRIPTIONS.get(key.name);
          if (!subData) continue;
          
          const subscription = JSON.parse(subData);
          
          try {
            // Send push notification
            await sendPushNotification(subscription, {
              title: title || 'Yamli Mobile',
              body: body || 'New notification',
              icon: icon || './images/favicon/ms-icon-144x144.png'
            }, env.VAPID_PRIVATE_KEY);
            
            results.push({ id: key.name, status: 'sent' });
          } catch (err) {
            results.push({ id: key.name, status: 'failed', error: err.message });
            // Remove failed subscription
            if (err.message.includes('unsubscribed') || err.message.includes('expired')) {
              await env.PUSH_SUBSCRIPTIONS.delete(key.name);
            }
          }
        }

        return new Response(JSON.stringify({
          success: true,
          sent: results.filter(r => r.status === 'sent').length,
          failed: results.filter(r => r.status === 'failed').length,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get subscription count
      if (path === '/subscribers' && request.method === 'GET') {
        const subscriptions = await env.PUSH_SUBSCRIPTIONS.list();
        
        return new Response(JSON.stringify({
          count: subscriptions.keys.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response('Yamli Push Notification API', { 
        status: 200,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Helper function to send Web Push notification
async function sendPushNotification(subscription, payload, vapidPrivateKey) {
  // Note: In production, you need to implement Web Push Protocol
  // This requires the web-push library or equivalent
  // For now, this is a placeholder - you'll need to add the web-push implementation
  
  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  
  if (!p256dh || !auth) {
    throw new Error('Invalid subscription keys');
  }

  // Create JWT for VAPID authentication
  const vapidHeaders = createVapidHeaders(
    'mailto:admin@yamlimobile.com',
    vapidPrivateKey,
    endpoint
  );

  // Send the push notification
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '60',
      ...vapidHeaders
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

// Create VAPID authentication headers
function createVapidHeaders(subject, privateKey, endpoint) {
  // This is a simplified version
  // In production, use a proper JWT library
  const origin = new URL(endpoint).origin;
  
  return {
    'Crypto-Key': `p256ecdsa=${privateKey}`,
    'Authorization': `WebPush ${btoa(JSON.stringify({
      sub: subject,
      aud: origin,
      exp: Math.floor(Date.now() / 1000) + 43200 // 12 hours
    }))}`
  };
}
