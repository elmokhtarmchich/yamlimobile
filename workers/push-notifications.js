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
            // Check if VAPID_PRIVATE_KEY is set
            if (!env.VAPID_PRIVATE_KEY) {
              throw new Error('VAPID_PRIVATE_KEY not configured');
            }
            
            // Send push notification
            await sendPushNotification(subscription, {
              title: title || 'Yamli Mobile',
              body: body || 'New notification',
              icon: icon || './images/favicon/ms-icon-144x144.png'
            }, env.VAPID_PRIVATE_KEY);
            
            results.push({ id: key.name, status: 'sent' });
          } catch (err) {
            console.error(`Failed to send to ${key.name}:`, err.message);
            results.push({ id: key.name, status: 'failed', error: err.message });
            // Remove failed subscription
            if (err.message.includes('unsubscribed') || err.message.includes('expired') || err.message.includes('not registered')) {
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

// Create VAPID authentication headers with proper JWT signing
async function createVapidHeaders(subject, privateKey, endpoint) {
  const origin = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 43200; // 12 hours
  
  // VAPID public key (hardcoded - matches the one in wrangler.toml)
  const vapidPublicKey = 'BL6iSz-YuFdNzbBS7rVLzmJDw0mNiNX-uKXDuPTuPoDXI6qAZiErTQ04FmuD_zoZRXGCaFKrj74OIqcclUgs6Vk';
  
  // JWT header
  const header = { typ: 'JWT', alg: 'ES256' };
  
  // JWT payload
  const payload = {
    sub: subject,
    aud: origin,
    exp: exp
  };
  
  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  // Sign with private key using Web Crypto API
  try {
    const signature = await signWithPrivateKey(signingInput, privateKey);
    const token = `${signingInput}.${signature}`;
    
    return {
      'Crypto-Key': `p256ecdsa=${vapidPublicKey}`,
      'Authorization': `vapid t=${token}, k=${vapidPublicKey}`
    };
  } catch (err) {
    console.error('VAPID signing failed:', err);
    // Fallback to unsigned (will fail, but we can see the error)
    return {
      'Crypto-Key': `p256ecdsa=${vapidPublicKey}`,
      'Authorization': `vapid t=${signingInput}, k=${vapidPublicKey}`
    };
  }
}

// Base64URL encoding
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Sign with private key using Web Crypto
async function signWithPrivateKey(data, privateKeyBase64) {
  try {
    // Derive the public key from the private key using P-256 curve
    // We need to compute x and y coordinates
    const privateKeyBytes = base64UrlToUint8Array(privateKeyBase64);
    
    // Compute public key point (x, y) = d * G where G is the generator point
    // For P-256, we need to do scalar multiplication on the curve
    // This is complex, so we'll use a pre-computed approach instead
    
    // Hardcoded x, y from our known public key
    // Public key: BL6iSz-YuFdNzbBS7rVLzmJDw0mNiNX-uKXDuPTuPoDXI6qAZiErTQ04FmuD_zoZRXGCaFKrj74OIqcclUgs6Vk
    // Decoded and split into x, y components
    const publicKeyBase64url = 'BL6iSz-YuFdNzbBS7rVLzmJDw0mNiNX-uKXDuPTuPoDXI6qAZiErTQ04FmuD_zoZRXGCaFKrj74OIqcclUgs6Vk';
    const publicKeyBytes = base64UrlToUint8Array(publicKeyBase64url);
    
    // Uncompressed P-256 key: 04 || x (32 bytes) || y (32 bytes) = 65 bytes total
    // Or compressed: 02/03 || x (33 bytes)
    let x, y;
    if (publicKeyBytes[0] === 0x04) {
      // Uncompressed format
      x = arrayBufferToBase64Url(publicKeyBytes.slice(1, 33));
      y = arrayBufferToBase64Url(publicKeyBytes.slice(33, 65));
    } else {
      // Compressed format - need to decompress
      // For now, throw error
      throw new Error('Compressed public key not supported');
    }
    
    // Create JWK for EC P-256
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: privateKeyBase64,
      x: x,
      y: y,
      ext: true
    };
    
    // Import the key
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
    
    // Convert signature to base64url
    return arrayBufferToBase64Url(signature);
  } catch (err) {
    console.error('Signing error:', err);
    throw err;
  }
}

// Convert base64url string to Uint8Array
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

// Convert ArrayBuffer to base64url string
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str) {
  str += new Array(5 - str.length % 4).join('=');
  return atob(str.replace(/\-/g, '+').replace(/\_/g, '/'));
}
