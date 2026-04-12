

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(() => { console.log('Service Worker Registered'); });
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
function notifyMe() {
  if (!notificationsSupported) {
    alert('إشعارات غير مدعومة في هذا المتصفح');
    return;
  }
  
  // Check current permission
  if (Notification.permission === 'granted') {
    // Already granted, show test notification
    showTestNotification();
  } else if (Notification.permission === 'denied') {
    // Denied, ask user to enable in settings
    alert('الإشعارات معطلة. يرجى تفعيلها من إعدادات المتصفح');
  } else {
    // Not decided yet, request permission
    requestNotificationPermission();
  }
}

// Make notifyMe globally available
window.notifyMe = notifyMe;

// ============================================
// PUSH SUBSCRIPTION FOR MULTI-DEVICE
// ============================================

// VAPID public key for push subscriptions
const VAPID_PUBLIC_KEY = 'BEl62iTM0R5R4gF9U6F1D1Q1H1L1T1N1P1R1T1V1X1Z1a1c1e1g1i1k1m1o1q1s1u1w1y1';

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

// Subscribe this device for push notifications
async function subscribeForPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('Subscribed to push:', subscription);
    }
    
    // Store subscription locally (in production, send to backend)
    const subscriptions = JSON.parse(localStorage.getItem('pushSubscriptions') || '[]');
    const subData = JSON.stringify(subscription);
    
    if (!subscriptions.includes(subData)) {
      subscriptions.push(subData);
      localStorage.setItem('pushSubscriptions', JSON.stringify(subscriptions));
      console.log('Device added to subscription list');
    }
    
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
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
