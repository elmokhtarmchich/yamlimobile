

// Register service worker to control making site work offline
let swRegistrationPromise = null;

if ('serviceWorker' in navigator) {
  swRegistrationPromise = navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => { 
      console.log('Service Worker Registered');
      return reg;
    });
}


// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', () => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Check if notifications are supported
const notificationsSupported = 'Notification' in window && 'serviceWorker' in navigator;

// Function to request notification permission
function requestNotificationPermission() {
  if (!notificationsSupported) {
    console.log('Notifications not supported');
    alert('إشعارات غير مدعومة في هذا المتصفح');
    return;
  }
  
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted');
      subscribeUserToPush();
    } else {
      console.log('Notification permission denied');
      alert('تم رفض الإذن للإشعارات');
    }
  });
}

// Subscribe user to push notifications
async function subscribeUserToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BEl62iTM0R5R4gF9U6F1D1Q1H1L1T1N1P1R1T1V1X1Z1a1c1e1g1i1k1m1o1q1s1u1w1y1'
      )
    });
    
    console.log('Push subscription:', subscription);
    // Here you would normally send subscription to your server
    alert('تم تفعيل الإشعارات بنجاح!');
    
    // Send a test notification
    showTestNotification();
    
  } catch (err) {
    console.error('Failed to subscribe to push:', err);
  }
}

// Show a test notification
function showTestNotification() {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('Yamli Mobile', {
        body: 'تم تفعيل الإشعارات بنجاح!',
        icon: './images/favicon/ms-icon-144x144.png',
        badge: './images/favicon/favicon-32x32.png',
        tag: 'test-notification'
      });
    });
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Main notification function - called by the bell button
async function notifyMe() {
  if (!notificationsSupported) {
    alert('إشعارات غير مدعومة في هذا المتصفح');
    return;
  }
  
  // Check current permission
  if (Notification.permission === 'granted') {
    // Already granted, subscribe to Cloudflare and show test notification
    console.log('Permission granted, subscribing to Cloudflare...');
    await subscribeForPush();
    showTestNotification();
  } else if (Notification.permission === 'denied') {
    // Denied, ask user to enable in settings
    alert('الإشعارات معطلة. يرجى تفعيلها من إعدادات المتصفح');
  } else {
    // Not decided yet, request permission
    await requestNotificationPermission();
  }
}

// Make notifyMe globally available
window.notifyMe = notifyMe;

// ============================================
// PUSH SUBSCRIPTION FOR MULTI-DEVICE
// ============================================

// Cloudflare Worker URL - Update this after deploying your worker
const CLOUDFLARE_WORKER_URL = 'https://yamli-push-notifications.elmokhtar-mchich.workers.dev';

// VAPID public key for push subscriptions
const VAPID_PUBLIC_KEY = 'BL6iSz-YuFdNzbBS7rVLzmJDw0mNiNX-uKXDuPTuPoDXI6qAZiErTQ04FmuD_zoZRXGCaFKrj74OIqcclUgs6Vk';

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe this device for push notifications and sync to Cloudflare
async function subscribeForPush() {
  try {
    // Wait for service worker registration with retry
    let registration = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!registration && attempts < maxAttempts) {
      if (swRegistrationPromise) {
        try {
          registration = await Promise.race([
            swRegistrationPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
          ]);
        } catch (e) {
          // Timeout, will retry
        }
      }
      
      if (!registration) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registration = registrations.find(r => r.scope.includes('yamlimobile')) || registrations[0];
      }
      
      if (!registration) {
        attempts++;
        console.log(`Waiting for service worker... attempt ${attempts}/${maxAttempts}`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    if (!registration) {
      console.error('No service worker found after waiting');
      alert('Service Worker not ready yet. Please wait a moment and try again.');
      return null;
    }
    
    console.log('Using service worker registration:', registration.scope);
    console.log('SW state - installing:', !!registration.installing, 'waiting:', !!registration.waiting, 'active:', !!registration.active);
    
    // Force the service worker to activate immediately
    if (registration.waiting) {
      registration.waiting.postMessage({type: 'SKIP_WAITING'});
    }
    
    // Wait for active service worker with timeout
    let sw = registration.active;
    if (!sw) {
      console.log('Waiting for service worker to become active...');
      sw = await Promise.race([
        new Promise(resolve => {
          const check = () => {
            if (registration.active) {
              resolve(registration.active);
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
    }
    
    if (!sw) {
      console.error('Service worker not active');
      alert('Service Worker not ready. Try again in a few seconds.');
      return null;
    }
    
    console.log('Service worker is active, subscribing...');
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('Subscribed to push:', subscription);
    }
    
    // Also store locally as backup
    const subscriptions = JSON.parse(localStorage.getItem('pushSubscriptions') || '[]');
    const subData = JSON.stringify(subscription);
    
    if (!subscriptions.includes(subData)) {
      subscriptions.push(subData);
      localStorage.setItem('pushSubscriptions', JSON.stringify(subscriptions));
    }
    
    // Sync to Cloudflare Worker
    await syncSubscriptionToCloudflare(subscription);
    
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

// Sync subscription to Cloudflare Worker
async function syncSubscriptionToCloudflare(subscription) {
  try {
    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Synced to Cloudflare:', result);
      // Store Cloudflare ID locally
      if (result.id) {
        localStorage.setItem('cloudflareSubId', result.id);
      }
    } else {
      console.warn('Cloudflare sync failed:', response.status);
    }
  } catch (err) {
    console.warn('Could not sync to Cloudflare:', err);
    // Continue anyway - local subscription still works
  }
}

// Auto-subscribe when permission is granted
async function requestNotificationPermission() {
  if (!notificationsSupported) {
    alert('إشعارات غير مدعومة في هذا المتصفح');
    return;
  }
  
  Notification.requestPermission().then(async (permission) => {
    if (permission === 'granted') {
      await subscribeForPush();
      showTestNotification();
    }
  });
}

// Subscribe on page load if already granted
if (Notification.permission === 'granted') {
  subscribeForPush();
}
