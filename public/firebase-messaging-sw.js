importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD2RXplEZ6cZCFJJL7LKOQUm-cG-R6FUjU",
  projectId: "astral-web-439103-g7",
  messagingSenderId: "664893075850",
  appId: "1:664893075850:web:334f48a8b03ac4265e9873"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || '✉️ Vantage AI: Gmail Draft Ready';
  const notificationOptions = {
    body: payload.notification?.body || 'An AI-generated reply draft is ready in Gmail for your review.',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    data: payload.data || { url: '/' },
    actions: [
      { action: 'open_gmail', title: '✉️ Open Gmail Draft' },
      { action: 'open_thread', title: '💬 View Lead Thread' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const draftUrl = data.gmailDraftUrl || data.webComposeUrl;
  const targetUrl = event.action === 'open_gmail' && draftUrl ? draftUrl : (data.smsUrl || data.url || '/');

  if (targetUrl && targetUrl.startsWith('sms:')) {
    event.waitUntil(
      clients.openWindow ? clients.openWindow(targetUrl) : Promise.resolve()
    );
    return;
  }

  if (targetUrl && (targetUrl.startsWith('https://mail.google.com') || targetUrl.startsWith('googlegmail:'))) {
    event.waitUntil(
      clients.openWindow ? clients.openWindow(targetUrl) : Promise.resolve()
    );
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl || '/');
      }
    })
  );
});
