// Cloudflare Worker for Push Notifications using web-push library
import webpush from 'web-push';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Initialize web-push with VAPID keys
function initWebPush(vapidPublicKey, vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@yamlimobile.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export default {
  async fetch(request, env, ctx) {
    // Initialize web-push on first request
    if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
      initWebPush(env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
    }
    
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
            // Check if VAPID_PRIVATE_KEY is set
            if (!env.VAPID_PRIVATE_KEY) {
              throw new Error('VAPID_PRIVATE_KEY not configured');
            }
            
            // Send push notification using web-push library
            const payload = JSON.stringify({
              title: title || 'Yamli Mobile',
              body: body || 'New notification',
              icon: icon || './images/favicon/ms-icon-144x144.png'
            });
            
            await webpush.sendNotification(subscription, payload);
            
            results.push({ id: key.name, status: 'sent' });
          } catch (err) {
            console.error(`Failed to send to ${key.name}:`, err.message);
            results.push({ id: key.name, status: 'failed', error: err.message });
            // Remove failed subscription
            if (err.statusCode === 410 || err.statusCode === 404 || 
                err.message.includes('unsubscribed') || err.message.includes('expired')) {
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
