// Cloudflare Worker for Push Notifications
// Uses Cloudflare's native Web Crypto for VAPID authentication

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
            // Check if VAPID_PRIVATE_KEY is set
            if (!env.VAPID_PRIVATE_KEY) {
              throw new Error('VAPID_PRIVATE_KEY not configured');
            }
            
            // Send push notification
            await sendPushNotification(subscription, {
              title: title || 'Yamli Mobile',
              body: body || 'New notification',
              icon: icon || './images/favicon/ms-icon-144x144.png'
            }, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
            
            results.push({ id: key.name, status: 'sent' });
          } catch (err) {
            console.error(`Failed to send to ${key.name}:`, err.message);
            results.push({ id: key.name, status: 'failed', error: err.message });
            // Remove expired subscriptions
            if (err.message.includes('410') || err.message.includes('404') || 
                err.message.includes('NotRegistered') || err.message.includes('InvalidRegistration')) {
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

// Send Web Push notification using Web Crypto API
async function sendPushNotification(subscription, payload, vapidPublicKey, vapidPrivateKey) {
  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  
  if (!p256dh || !auth) {
    throw new Error('Invalid subscription keys');
  }

  // Create Authorization header with VAPID JWT
  const vapidHeaders = await createVapidAuth(
    'mailto:admin@yamlimobile.com',
    vapidPublicKey,
    vapidPrivateKey,
    endpoint
  );

  // Send the push notification
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '60',
      'Urgency': 'normal',
      ...vapidHeaders
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Push failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response;
}

// Create VAPID Authorization header
async function createVapidAuth(subject, publicKey, privateKey, endpoint) {
  const origin = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 43200; // 12 hours
  
  // JWT header
  const header = { typ: 'JWT', alg: 'ES256' };
  
  // JWT payload
  const payload = {
    sub: subject,
    aud: origin,
    exp: exp
  };
  
  // Encode
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  // Sign with private key
  const signature = await signES256(signingInput, privateKey);
  const jwt = `${signingInput}.${signature}`;
  
  return {
    'Authorization': `WebPush ${jwt}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`
  };
}

// Sign data with ES256 (ECDSA using P-256 and SHA-256)
async function signES256(data, privateKeyBase64) {
  try {
    // Import the private key
    const keyBuffer = base64UrlToUint8Array(privateKeyBase64);
    
    // Create a JWK from the private key
    // For Web Push, we need to use the private key with the corresponding public key
    const jwk = await createJWKFromPrivateKey(privateKeyBase64);
    
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    
    // Sign the data
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      encoder.encode(data)
    );
    
    // Convert to base64url
    return arrayBufferToBase64Url(signature);
  } catch (err) {
    console.error('Signing failed:', err);
    throw new Error(`Failed to sign JWT: ${err.message}`);
  }
}

// Create JWK from VAPID private key
async function createJWKFromPrivateKey(privateKeyBase64) {
  // The VAPID private key from web-push is a raw EC private key
  // We need to derive the public key from it
  
  // For P-256, we can compute the public key point from the private key
  // But this requires elliptic curve math that's complex in pure JS
  
  // Instead, we'll use a workaround: the VAPID keys are generated as a pair
  // So we can use the known public key coordinates
  
  // Decode the public key to get x and y
  const publicKeyBase64 = 'BL6iSz-YuFdNzbBS7rVLzmJDw0mNiNX-uKXDuPTuPoDXI6qAZiErTQ04FmuD_zoZRXGCaFKrj74OIqcclUgs6Vk';
  const publicKeyBytes = base64UrlToUint8Array(publicKeyBase64);
  
  // Uncompressed format: 0x04 || x (32 bytes) || y (32 bytes)
  if (publicKeyBytes[0] !== 0x04) {
    throw new Error('Unexpected public key format');
  }
  
  const x = arrayBufferToBase64Url(publicKeyBytes.slice(1, 33));
  const y = arrayBufferToBase64Url(publicKeyBytes.slice(33, 65));
  
  return {
    kty: 'EC',
    crv: 'P-256',
    d: privateKeyBase64,
    x: x,
    y: y,
    ext: true
  };
}

// Utility functions
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToUint8Array(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const base64Padded = base64 + padding;
  const binary = atob(base64Padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
